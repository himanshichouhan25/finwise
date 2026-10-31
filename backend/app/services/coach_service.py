"""AI Financial Coach Service.

Orchestrates live financial context injection, conversational history,
multi-round tool calling, SEBI guardrails, and DB persistence.
"""

import json
import logging
import time
from collections import defaultdict
from typing import Any

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.ai.client import get_llm_client
from app.ai.guardrails import sanitize_ai_response
from app.ai.prompts import build_system_prompt
from app.ai.tools import FINANCIAL_TOOLS, execute_tool
from app.core.errors import AIUnavailableError, NotFoundError, ValidationFailure
from app.models.chat import ChatMessage, ChatSession
from app.models.user import User
from app.schemas.chat import (
    ChatMessageItem,
    ChatRequest,
    ChatResponse,
    ChatSessionDetail,
    ChatSessionSummary,
)
from app.services.snapshot_service import build_financial_snapshot

logger = logging.getLogger("finwise.ai.coach_service")

# In-memory sliding-window rate limiter: max 20 requests per 60 seconds per user
_user_request_timestamps: dict[int, list[float]] = defaultdict(list)
RATE_LIMIT_MAX_REQUESTS = 20
RATE_LIMIT_WINDOW_SECONDS = 60.0


def _generate_deterministic_fallback_reply(
    db: Session,
    user_id: int,
    snapshot: Any,
    user_message: str,
    persona_name: str,
) -> tuple[str, list[dict[str, Any]]]:
    """Provide a reliable, snapshot-aware financial response when LLM APIs are offline."""
    import re
    from decimal import Decimal

    recorded_tools: list[dict[str, Any]] = []
    msg_lower = user_message.lower()

    # 1. Check for spend / impulse / purchase amount
    amount: Decimal | None = None
    k_match = re.search(r"(\d+(?:\.\d+)?)\s*k\b", msg_lower)
    if k_match:
        amount = Decimal(k_match.group(1)) * Decimal("1000")
    else:
        num_match = re.search(r"(?:₹|rs\.?|inr)?\s*(\d+[,\d]*)", msg_lower)
        if num_match:
            clean_num = num_match.group(1).replace(",", "")
            if clean_num and clean_num.isdigit():
                parsed_val = Decimal(clean_num)
                if parsed_val >= Decimal("100"):
                    amount = parsed_val

    # If asking about purchase or spend
    if amount and any(w in msg_lower for w in ["buy", "purchase", "spend", "cost", "afford", "can i", "delay"]):
        tool_res = execute_tool(
            name="goal_days_delayed",
            arguments={"spend_amount": float(amount)},
            user_id=user_id,
            db=db,
        )
        recorded_tools.append({
            "name": "goal_days_delayed",
            "arguments": {"spend_amount": float(amount)},
            "result": tool_res,
        })
        days = tool_res.get("days_delayed", 0)
        goal_name = tool_res.get("goal_name", "top priority goal")
        rem_budget = getattr(snapshot.budget_summary, "remaining_budget", Decimal("0"))
        reply = (
            f"Hello {persona_name}! Let's look at the real opportunity cost for spending ₹{amount:,.0f}.\n\n"
            f"Based on your savings rate, spending ₹{amount:,.0f} will delay your **'{goal_name}'** by **{days} days**.\n\n"
            f"• Net Monthly Income: ₹{snapshot.net_income:,.0f}\n"
            f"• Remaining Discretionary Budget: ₹{rem_budget:,.0f}\n\n"
            f"💡 **Recommendation:** If this is a non-essential 'want', try logging it in our Decision Journal with a 24-hour cooling-off timer before making the purchase."
        )
        return reply, recorded_tools

    # 2. If asking about SIP / wealth compounding
    if any(w in msg_lower for w in ["sip", "invest", "compounding", "return", "mutual fund", "wealth"]):
        rec_sip = max(Decimal("1000.00"), getattr(snapshot.budget_summary, "savings_target", Decimal("5000.00")))
        tool_res = execute_tool(
            name="run_sip_simulation",
            arguments={
                "monthly_investment": float(rec_sip),
                "duration_years": 10,
                "annual_return_pct": 12.5,
            },
            user_id=user_id,
            db=db,
        )
        recorded_tools.append({
            "name": "run_sip_simulation",
            "arguments": {"monthly_investment": float(rec_sip), "duration_years": 10, "annual_return_pct": 12.5},
            "result": tool_res,
        })
        est_val = tool_res.get("estimated_value", 0)
        tot_inv = tool_res.get("total_invested", 0)
        gain = est_val - tot_inv if est_val > tot_inv else 0
        reply = (
            f"Hello {persona_name}! Here is your personalized wealth compounding roadmap:\n\n"
            f"Based on your monthly surplus, your recommended SIP allocation is **₹{rec_sip:,.0f}/month**.\n\n"
            f"• 10-Year Out-of-Pocket Invested: ₹{tot_inv:,.0f}\n"
            f"• Estimated Wealth at 12.5% p.a. (NIFTY 50 Historical): **₹{est_val:,.0f}**\n"
            f"• Estimated Compound Wealth Gained: **+₹{gain:,.0f}**\n\n"
            f"💡 **Next Step:** You can model salary step-up percentages and inflation purchasing power in the SIP Simulator tab."
        )
        return reply, recorded_tools

    # 3. Default comprehensive snapshot analysis
    goals_txt = ""
    if snapshot.goals_with_plans:
        g_lines = [
            f"• {g.goal.name}: ₹{g.goal.current_saved:,.0f} / ₹{g.goal.target_amount:,.0f} ({g.plan.progress_pct:.0f}%)"
            for g in snapshot.goals_with_plans[:3]
        ]
        goals_txt = "\n**Active Goals Progress:**\n" + "\n".join(g_lines)

    bs = snapshot.budget_summary
    hs = snapshot.health_score
    reply = (
        f"Hello {persona_name}! Here is your live financial snapshot & diagnostic review:\n\n"
        f"**Cash Flow & 50/30/20 Budgeting:**\n"
        f"• Monthly Net Income: ₹{snapshot.net_income:,.0f}\n"
        f"• Total Spent: ₹{bs.total_spent:,.0f} (Remaining: ₹{bs.remaining_budget:,.0f})\n"
        f"• Needs: {bs.needs_status.pct_of_income:.1f}% (Target: 50%)\n"
        f"• Wants: {bs.wants_status.pct_of_income:.1f}% (Target: 30%)\n"
        f"• Savings: {bs.savings_status.pct_of_income:.1f}% (Target: 20%)\n\n"
        f"**Health Score Diagnostic:**\n"
        f"• Financial Health Score: **{hs.overall_score}/100**\n"
        f"• Emergency Runway: **{hs.emergency_pillar.runway_months:.1f} months**\n"
        f"{goals_txt}\n\n"
        f"How can I help you optimize your finances today? Feel free to ask about affordability, loans, SIP projections, or investment claims."
    )
    return reply, recorded_tools


def _check_rate_limit(user_id: int) -> None:
    """Enforce per-user in-memory sliding-window request throttling."""
    now = time.time()
    cutoff = now - RATE_LIMIT_WINDOW_SECONDS
    timestamps = [t for t in _user_request_timestamps[user_id] if t > cutoff]
    if len(timestamps) >= RATE_LIMIT_MAX_REQUESTS:
        logger.warning("User %d exceeded AI chat rate limit (%d/min)", user_id, RATE_LIMIT_MAX_REQUESTS)
        raise ValidationFailure(
            message=f"You are sending messages too quickly. Limit is {RATE_LIMIT_MAX_REQUESTS} requests per minute."
        )
    timestamps.append(now)
    _user_request_timestamps[user_id] = timestamps


def _get_user_or_raise(db: Session, user_id: int) -> User:
    """Ensure user record exists in database."""
    user = db.scalar(select(User).where(User.id == user_id))
    if not user:
        raise NotFoundError(f"User with ID {user_id} not found")
    return user


def send_coach_message(
    db: Session,
    user_id: int,
    request: ChatRequest,
) -> ChatResponse:
    """Process a user message through the FinWise AI Coach pipeline."""
    _check_rate_limit(user_id)
    user = _get_user_or_raise(db, user_id)

    # 1. Resolve or create chat session
    if request.session_id:
        session = db.scalar(
            select(ChatSession).where(
                ChatSession.id == request.session_id,
                ChatSession.user_id == user.id,
            )
        )
        if not session:
            raise NotFoundError(f"Chat session #{request.session_id} not found.")
    else:
        title_snippet = request.message.strip()
        if len(title_snippet) > 40:
            title_snippet = title_snippet[:37] + "..."
        session = ChatSession(
            user_id=user.id,
            title=title_snippet or "Financial Consultation",
        )
        db.add(session)
        db.flush()

    # 2. Persist incoming user message
    user_message_record = ChatMessage(
        session_id=session.id,
        role="user",
        content=request.message.strip(),
    )
    db.add(user_message_record)
    db.flush()

    # 3. Retrieve past 10 messages for conversational context
    past_messages = (
        db.scalars(
            select(ChatMessage)
            .where(
                ChatMessage.session_id == session.id,
                ChatMessage.id != user_message_record.id,
            )
            .order_by(ChatMessage.created_at.desc())
            .limit(10)
        )
        .all()
    )
    past_messages = list(reversed(past_messages))

    # 4. Ingest authoritative financial snapshot
    snapshot = build_financial_snapshot(db=db, user_id=user_id)
    persona_name = user.name
    system_prompt = build_system_prompt(
        snapshot=snapshot,
        persona_name=persona_name,
        language_pref=user.language_pref,
    )

    # 5. Build prompt message structure for LLM
    llm_messages: list[dict[str, Any]] = [
        {"role": "system", "content": system_prompt},
    ]
    for msg in past_messages:
        llm_messages.append({"role": msg.role, "content": msg.content})
    llm_messages.append({"role": "user", "content": request.message.strip()})

    # 6. Multi-round tool calling loop (max 3 rounds) with deterministic fallback
    client = get_llm_client()
    if not client.keys:
        raise AIUnavailableError(
            message="AI Coach is temporarily overloaded or unavailable. Please try again shortly.",
            fallback_data={"error_type": "llm_exhausted", "detail": "No Groq API keys configured"},
        )

    recorded_tools: list[dict[str, Any]] = []
    final_reply: str | None = None
    model_used = ""

    try:
        for _ in range(3):
            ai_resp = client.complete(
                messages=llm_messages,
                tools=FINANCIAL_TOOLS,
                temperature=0.2,
            )
            model_used = ai_resp.model_used

            if not ai_resp.tool_calls:
                final_reply = ai_resp.content
                break

            # Process tool calls
            tool_call_dicts = [
                {
                    "id": tc.id,
                    "type": "function",
                    "function": {
                        "name": tc.name,
                        "arguments": json.dumps(tc.arguments),
                    },
                }
                for tc in ai_resp.tool_calls
            ]
            llm_messages.append({
                "role": "assistant",
                "content": ai_resp.content or "",
                "tool_calls": tool_call_dicts,
            })

            for tc in ai_resp.tool_calls:
                tool_result = execute_tool(
                    name=tc.name,
                    arguments=tc.arguments,
                    user_id=user_id,
                    db=db,
                )
                recorded_tools.append({
                    "name": tc.name,
                    "arguments": tc.arguments,
                    "result": tool_result,
                })
                llm_messages.append({
                    "role": "tool",
                    "tool_call_id": tc.id,
                    "name": tc.name,
                    "content": json.dumps(tool_result),
                })
    except Exception as exc:
        logger.warning(
            "AI Coach external completion unavailable (%s). Activating deterministic fallback engine.",
            str(exc),
        )
        final_reply, fb_tools = _generate_deterministic_fallback_reply(
            db=db,
            user_id=user_id,
            snapshot=snapshot,
            user_message=request.message.strip(),
            persona_name=persona_name,
        )
        recorded_tools.extend(fb_tools)
        model_used = "finwise-deterministic-engine-v1"

    # 7. Apply SEBI compliance guardrails
    sanitized_content = sanitize_ai_response(final_reply)

    # 8. Persist assistant reply
    tools_json = json.dumps(recorded_tools) if recorded_tools else None
    assistant_record = ChatMessage(
        session_id=session.id,
        role="assistant",
        content=sanitized_content,
        tools_used_json=tools_json,
    )
    db.add(assistant_record)
    db.commit()
    db.refresh(assistant_record)

    return ChatResponse(
        session_id=session.id,
        message=ChatMessageItem(
            id=assistant_record.id,
            role=assistant_record.role,
            content=assistant_record.content,
            tools_used=recorded_tools if recorded_tools else None,
            created_at=assistant_record.created_at,
        ),
        model_used=model_used,
    )


def list_user_sessions(db: Session, user_id: int) -> list[ChatSessionSummary]:
    """Retrieve all chat sessions for the active persona."""
    user = _get_user_or_raise(db, user_id)
    sessions = (
        db.query(
            ChatSession.id,
            ChatSession.title,
            ChatSession.created_at,
            func.count(ChatMessage.id).label("message_count"),
        )
        .outerjoin(ChatMessage, ChatMessage.session_id == ChatSession.id)
        .filter(ChatSession.user_id == user.id)
        .group_by(ChatSession.id)
        .order_by(ChatSession.created_at.desc())
        .all()
    )

    return [
        ChatSessionSummary(
            id=s.id,
            title=s.title,
            created_at=s.created_at,
            message_count=s.message_count,
        )
        for s in sessions
    ]


def get_session_detail(db: Session, user_id: int, session_id: int) -> ChatSessionDetail:
    """Retrieve complete message history for a specific conversation session."""
    user = _get_user_or_raise(db, user_id)
    session = db.scalar(
        select(ChatSession).where(
            ChatSession.id == session_id,
            ChatSession.user_id == user.id,
        )
    )
    if not session:
        raise NotFoundError(f"Chat session #{session_id} not found.")

    messages_data: list[ChatMessageItem] = []
    for msg in session.messages:
        tools_parsed = None
        if msg.tools_used_json:
            try:
                tools_parsed = json.loads(msg.tools_used_json)
            except json.JSONDecodeError:
                tools_parsed = None

        messages_data.append(
            ChatMessageItem(
                id=msg.id,
                role=msg.role,
                content=msg.content,
                tools_used=tools_parsed,
                created_at=msg.created_at,
            )
        )

    return ChatSessionDetail(
        id=session.id,
        title=session.title,
        created_at=session.created_at,
        messages=messages_data,
    )

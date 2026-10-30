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
from app.core.errors import NotFoundError, ValidationFailure
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
_user_request_timestamps: dict[str, list[float]] = defaultdict(list)
RATE_LIMIT_MAX_REQUESTS = 20
RATE_LIMIT_WINDOW_SECONDS = 60.0


def _check_rate_limit(user_id: str) -> None:
    """Enforce per-user in-memory sliding-window request throttling."""
    now = time.time()
    cutoff = now - RATE_LIMIT_WINDOW_SECONDS
    timestamps = [t for t in _user_request_timestamps[user_id] if t > cutoff]
    if len(timestamps) >= RATE_LIMIT_MAX_REQUESTS:
        logger.warning("User '%s' exceeded AI chat rate limit (%d/min)", user_id, RATE_LIMIT_MAX_REQUESTS)
        raise ValidationFailure(
            message=f"You are sending messages too quickly. Limit is {RATE_LIMIT_MAX_REQUESTS} requests per minute."
        )
    timestamps.append(now)
    _user_request_timestamps[user_id] = timestamps


def _get_or_create_user(db: Session, username: str) -> User:
    """Ensure user record exists in database."""
    user = db.scalar(select(User).where(User.username == username))
    if not user:
        user = User(username=username, email=f"{username}@example.com")
        db.add(user)
        db.flush()
    return user


def send_coach_message(
    db: Session,
    user_id: str,
    request: ChatRequest,
) -> ChatResponse:
    """Process a user message through the FinWise AI Coach pipeline."""
    _check_rate_limit(user_id)
    user = _get_or_create_user(db, user_id)

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
        # Title snippet from first message
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
    snapshot = build_financial_snapshot(user_id, db)
    persona_name = user.profile.full_name if user.profile else user.username
    system_prompt = build_system_prompt(snapshot=snapshot, persona_name=persona_name)

    # 5. Build prompt message structure for LLM
    llm_messages: list[dict[str, Any]] = [
        {"role": "system", "content": system_prompt},
    ]
    for msg in past_messages:
        llm_messages.append({"role": msg.role, "content": msg.content})
    llm_messages.append({"role": "user", "content": request.message.strip()})

    # 6. Multi-round tool calling loop (max 3 rounds)
    client = get_llm_client()
    recorded_tools: list[dict[str, Any]] = []
    final_reply: str | None = None
    model_used = ""

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
        # Append assistant tool call message
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


def list_user_sessions(db: Session, user_id: str) -> list[ChatSessionSummary]:
    """Retrieve all chat sessions for the active persona."""
    user = _get_or_create_user(db, user_id)
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


def get_session_detail(db: Session, user_id: str, session_id: int) -> ChatSessionDetail:
    """Retrieve complete message history for a specific conversation session."""
    user = _get_or_create_user(db, user_id)
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

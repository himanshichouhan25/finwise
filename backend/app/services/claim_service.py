"""Finfluencer Claim Analysis Service.

Orchestrates parameter extraction, CAGR mathematical computation,
rule-based red flag scanning, and persistence to ClaimCheck records.
"""

import json
import logging
from datetime import UTC, datetime
from decimal import Decimal
from typing import Any

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.ai.claim_extractor import extract_claim_parameters
from app.engine.claim_math import evaluate_claim_math
from app.engine.red_flags import detect_red_flags
from app.models.claim import ClaimCheck
from app.models.user import User
from app.schemas.claim import (
    BenchmarkComparisonSchema,
    ClaimAnalyzeRequest,
    ClaimAnalyzeResponse,
    ClaimHistoryItem,
    RedFlagItemSchema,
)

logger = logging.getLogger("finwise.services.claim_service")


def _sanitize_for_json(val: Any) -> Any:
    """Helper to convert Decimal and datetime instances for clean JSON dumps."""
    if isinstance(val, Decimal):
        return float(val)
    if isinstance(val, datetime):
        return val.isoformat()
    if isinstance(val, dict):
        return {k: _sanitize_for_json(v) for k, v in val.items()}
    if isinstance(val, list):
        return [_sanitize_for_json(v) for v in val]
    return val


def _build_educational_explanation(
    claim_text: str,
    annualized_cagr: Decimal,
    risk_level: str,
    verdict: str,
    doubling_time: Decimal | None,
    red_flags_count: int,
) -> str:
    """Compose clear, digestible explanation for first-time investors."""
    lines = [verdict]

    if annualized_cagr > Decimal("15.0"):
        lines.append(
            f"\nAt an implied {annualized_cagr}% annualized return, your money would double every "
            f"{doubling_time if doubling_time else 'N/A'} years."
        )

    if red_flags_count > 0:
        lines.append(
            f"\nFinWise detected {red_flags_count} critical red flag(s) in this claim. "
            "Never invest money through unofficial Telegram channels, WhatsApp groups, or promises of guaranteed returns."
        )
    else:
        lines.append("\nAlways verify if the advisor or product is registered with SEBI or RBI.")

    return "\n".join(lines)


def analyze_claim(
    db: Session,
    user_id: int,
    payload: ClaimAnalyzeRequest,
) -> ClaimAnalyzeResponse:
    """Analyze a financial claim, compute math, detect red flags, and record audit log."""
    claim_text = payload.claim_text.strip()
    logger.info("Analyzing claim for user %d: '%s'", user_id, claim_text[:50])

    # 1. Parameter extraction (LLM or regex)
    extracted = extract_claim_parameters(claim_text)

    # 2. Pure math evaluation (CAGR, doubling time, benchmark multipliers)
    math_result = evaluate_claim_math(
        initial_amount=extracted.initial_amount,
        claimed_amount=extracted.claimed_amount,
        timeframe_months=extracted.timeframe_months,
        claimed_return_pct=extracted.claimed_return_pct,
        is_guaranteed=extracted.is_guaranteed,
    )

    # 3. Rule-based red-flag detection
    red_flags = detect_red_flags(
        claim_text=claim_text,
        annualized_cagr_pct=math_result.annualized_cagr_pct,
        is_guaranteed=extracted.is_guaranteed,
    )

    final_risk_level = math_result.risk_level
    final_verdict = math_result.verdict
    if any(rf.severity == "extreme" for rf in red_flags):
        final_risk_level = "extreme"
        if math_result.risk_level != "extreme":
            final_verdict = f"SCAM & REGULATORY VIOLATION ALERT: {red_flags[0].title}. {red_flags[0].description}"

    # 4. Generate structured explanation
    explanation = _build_educational_explanation(
        claim_text=claim_text,
        annualized_cagr=math_result.annualized_cagr_pct,
        risk_level=final_risk_level,
        verdict=final_verdict,
        doubling_time=math_result.doubling_time_years,
        red_flags_count=len(red_flags),
    )

    # 5. Persist to database
    extracted_dict = {
        "initial_amount": _sanitize_for_json(extracted.initial_amount),
        "claimed_amount": _sanitize_for_json(extracted.claimed_amount),
        "claimed_return_pct": _sanitize_for_json(extracted.claimed_return_pct),
        "timeframe_months": _sanitize_for_json(extracted.timeframe_months),
        "is_guaranteed": extracted.is_guaranteed,
        "asset_class": extracted.asset_class,
    }

    computed_dict = {
        "annualized_cagr_pct": float(math_result.annualized_cagr_pct),
        "timeframe_years": float(math_result.timeframe_years),
        "doubling_time_years": float(math_result.doubling_time_years) if math_result.doubling_time_years else None,
        "verdict": math_result.verdict,
        "benchmarks": [
            {
                "name": b.benchmark_name,
                "cagr_pct": float(b.benchmark_cagr_pct),
                "multiplier": float(b.multiplier_vs_benchmark),
            }
            for b in math_result.benchmarks
        ],
        "red_flags": [{"code": rf.code, "title": rf.title, "severity": rf.severity} for rf in red_flags],
    }

    # Ensure user exists
    user = db.scalar(select(User).where(User.id == user_id))
    if not user:
        user = User(id=user_id, name="Young Investor", persona="first_job", language_pref="en")
        db.add(user)
        db.flush()

    claim_record = ClaimCheck(
        user_id=user.id,
        claim_text=claim_text,
        extracted_json=json.dumps(extracted_dict),
        computed_json=json.dumps(computed_dict),
        risk_level=final_risk_level,
        explanation=explanation,
    )
    db.add(claim_record)
    db.commit()
    db.refresh(claim_record)

    benchmark_schemas = [
        BenchmarkComparisonSchema(
            benchmark_name=b.benchmark_name,
            benchmark_cagr_pct=b.benchmark_cagr_pct,
            multiplier_vs_benchmark=b.multiplier_vs_benchmark,
        )
        for b in math_result.benchmarks
    ]

    red_flag_schemas = [
        RedFlagItemSchema(
            code=rf.code,
            title=rf.title,
            description=rf.description,
            severity=rf.severity,
        )
        for rf in red_flags
    ]

    return ClaimAnalyzeResponse(
        id=claim_record.id,
        claim_text=claim_record.claim_text,
        risk_level=final_risk_level,
        verdict=final_verdict,
        annualized_cagr_pct=math_result.annualized_cagr_pct,
        claimed_return_pct=math_result.claimed_return_pct,
        timeframe_years=math_result.timeframe_years,
        doubling_time_years=math_result.doubling_time_years,
        is_guaranteed=extracted.is_guaranteed,
        asset_class=extracted.asset_class,
        benchmarks=benchmark_schemas,
        red_flags=red_flag_schemas,
        explanation=explanation,
        created_at=claim_record.created_at or datetime.now(UTC),
    )


def get_claim_history(db: Session, user_id: int) -> list[ClaimHistoryItem]:
    """Retrieve historical audits submitted by the user."""
    records = (
        db.scalars(
            select(ClaimCheck)
            .where(ClaimCheck.user_id == user_id)
            .order_by(ClaimCheck.created_at.desc())
            .limit(20)
        )
        .all()
    )

    return [
        ClaimHistoryItem(
            id=r.id,
            claim_text=r.claim_text,
            risk_level=r.risk_level,
            created_at=r.created_at,
        )
        for r in records
    ]

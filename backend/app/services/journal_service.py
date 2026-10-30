"""Impulse Decision Journal Service.

Manages emotional impulse journaling, cooling-off countdown timers (24h/48h),
delayed gratification tracking, and impact on long-term financial goals.
"""

import logging
from datetime import UTC, datetime, timedelta
from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.errors import NotFoundError, ValidationFailure
from app.engine.goal_delay import calculate_goal_days_delayed
from app.models.goal import Goal
from app.models.journal import JournalEntry
from app.models.user import User
from app.schemas.journal import (
    JournalDecisionRequest,
    JournalEntryCreate,
    JournalEntryResponse,
    JournalSummaryResponse,
)

logger = logging.getLogger("finwise.services.journal_service")


def _calculate_delay_for_entry(
    db: Session,
    user_id: int,
    amount: Decimal | None,
) -> tuple[int | None, str | None]:
    """Calculate timeline setback against user's highest priority goal if amount is present."""
    if not amount or amount <= Decimal("0.00"):
        return None, None

    # Find earliest active goal
    goal = db.scalar(
        select(Goal)
        .where(Goal.user_id == user_id, Goal.is_completed == False)  # noqa: E712
        .order_by(Goal.target_date.asc())
    )

    if not goal:
        return None, None

    monthly_contrib = goal.planned_monthly_contribution or Decimal("5000.00")
    delay_res = calculate_goal_days_delayed(
        unnecessary_spend=amount,
        monthly_goal_contribution=monthly_contrib,
        goal_name=goal.name,
    )
    return delay_res.days_delayed, delay_res.message


def _map_entry_to_response(
    db: Session,
    entry: JournalEntry,
) -> JournalEntryResponse:
    """Map DB model to rich response schema with live cooling-off status calculation."""
    now = datetime.now(UTC)
    is_cooling_active = False
    cooling_remaining = 0

    if entry.cooling_off_until:
        # Normalize timezone-naive SQLite timestamp to UTC
        until_utc = entry.cooling_off_until
        if until_utc.tzinfo is None:
            until_utc = until_utc.replace(tzinfo=UTC)

        if entry.status == "pending_review" and now < until_utc:
            is_cooling_active = True
            cooling_remaining = max(0, int((until_utc - now).total_seconds()))

    days_delayed, delay_msg = _calculate_delay_for_entry(db, entry.user_id, entry.amount)

    return JournalEntryResponse(
        id=entry.id,
        title=entry.title,
        decision_type=entry.decision_type,
        amount=entry.amount,
        rationale=entry.rationale,
        emotional_state=entry.emotional_state,
        is_urgent=entry.is_urgent,
        cooling_off_until=entry.cooling_off_until,
        is_cooling_active=is_cooling_active,
        cooling_remaining_seconds=cooling_remaining,
        status=entry.status,
        outcome_note=entry.outcome_note or "",
        goal_days_delayed=days_delayed,
        delay_insight_message=delay_msg,
        created_at=entry.created_at,
    )


def create_journal_entry(
    db: Session,
    user_id: int,
    payload: JournalEntryCreate,
) -> JournalEntryResponse:
    """Record a prospective purchase or financial decision with an active cooling-off timer."""
    # Ensure user exists
    user = db.scalar(select(User).where(User.id == user_id))
    if not user:
        user = User(id=user_id, name="Young Investor", persona="first_job", language_pref="en")
        db.add(user)
        db.flush()

    now = datetime.now(UTC)
    cooling_until = now + timedelta(hours=payload.cooling_off_hours) if payload.cooling_off_hours > 0 else None

    entry = JournalEntry(
        user_id=user.id,
        title=payload.title.strip(),
        decision_type=payload.decision_type,
        amount=payload.amount,
        rationale=payload.rationale.strip(),
        emotional_state=payload.emotional_state,
        is_urgent=payload.is_urgent,
        cooling_off_until=cooling_until,
        status="pending_review",
        outcome_note="",
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)

    logger.info("Created decision journal entry #%d for user %d (cooling: %dh)", entry.id, user.id, payload.cooling_off_hours)
    return _map_entry_to_response(db, entry)


def list_journal_entries(
    db: Session,
    user_id: int,
    status_filter: str | None = None,
) -> list[JournalEntryResponse]:
    """Retrieve decision journal entries for the active persona."""
    stmt = select(JournalEntry).where(JournalEntry.user_id == user_id).order_by(JournalEntry.created_at.desc())
    if status_filter and status_filter in ("pending_review", "proceeded", "dropped"):
        stmt = stmt.where(JournalEntry.status == status_filter)

    entries = db.scalars(stmt).all()
    return [_map_entry_to_response(db, e) for e in entries]


def get_journal_entry(
    db: Session,
    user_id: int,
    entry_id: int,
) -> JournalEntryResponse:
    """Retrieve a single journal entry by ID."""
    entry = db.scalar(
        select(JournalEntry).where(JournalEntry.id == entry_id, JournalEntry.user_id == user_id)
    )
    if not entry:
        raise NotFoundError(f"Journal entry #{entry_id} not found.")

    return _map_entry_to_response(db, entry)


def record_journal_decision(
    db: Session,
    user_id: int,
    entry_id: int,
    payload: JournalDecisionRequest,
) -> JournalEntryResponse:
    """Finalize decision once cooling-off period has passed (proceeded vs dropped)."""
    entry = db.scalar(
        select(JournalEntry).where(JournalEntry.id == entry_id, JournalEntry.user_id == user_id)
    )
    if not entry:
        raise NotFoundError(f"Journal entry #{entry_id} not found.")

    if payload.decision not in ("proceeded", "dropped"):
        raise ValidationFailure("Decision must be either 'proceeded' or 'dropped'")

    now = datetime.now(UTC)
    if entry.cooling_off_until:
        until_utc = entry.cooling_off_until
        if until_utc.tzinfo is None:
            until_utc = until_utc.replace(tzinfo=UTC)

        if now < until_utc:
            remaining_minutes = int((until_utc - now).total_seconds() / 60)
            raise ValidationFailure(
                f"Cooling-off period is still active. Please wait {remaining_minutes} more minutes to finalize your decision."
            )

    entry.status = payload.decision
    if payload.outcome_note:
        entry.outcome_note = payload.outcome_note.strip()

    db.commit()
    db.refresh(entry)

    logger.info("Finalized journal entry #%d decision: %s", entry.id, entry.status)
    return _map_entry_to_response(db, entry)


def get_journal_summary(
    db: Session,
    user_id: int,
) -> JournalSummaryResponse:
    """Compute aggregate stats: entries in cooling off, ready for review, and total money saved."""
    entries = db.scalars(select(JournalEntry).where(JournalEntry.user_id == user_id)).all()
    now = datetime.now(UTC)

    active_cooling = 0
    ready_for_review = 0
    avoided_count = 0
    total_saved = Decimal("0.00")

    for e in entries:
        if e.status == "dropped":
            avoided_count += 1
            if e.amount:
                total_saved += e.amount
        elif e.status == "pending_review":
            until_utc = e.cooling_off_until
            if until_utc and until_utc.tzinfo is None:
                until_utc = until_utc.replace(tzinfo=UTC)

            if until_utc and now < until_utc:
                active_cooling += 1
            else:
                ready_for_review += 1

    return JournalSummaryResponse(
        total_entries=len(entries),
        active_cooling_count=active_cooling,
        ready_for_review_count=ready_for_review,
        avoided_count=avoided_count,
        total_saved_amount=total_saved,
    )

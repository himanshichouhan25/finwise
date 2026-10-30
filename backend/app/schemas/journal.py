"""Pydantic schemas for Impulse Decision Journal and cooling-off timers."""

from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class JournalEntryCreate(BaseModel):
    """Payload for logging a new decision or potential impulse spend."""

    title: str = Field(
        ...,
        min_length=2,
        max_length=150,
        description="Name of the item or financial decision (e.g. 'iPhone 16 Pro', 'Crypto Course')",
    )
    decision_type: str = Field(
        default="purchase",
        description="Type: 'purchase' | 'investment' | 'loan' | 'career'",
    )
    amount: Decimal | None = Field(
        default=None,
        ge=Decimal("0.00"),
        description="Monetary amount involved in INR",
    )
    rationale: str = Field(
        ...,
        min_length=3,
        description="Why do you want to make this purchase/decision right now?",
    )
    emotional_state: str = Field(
        default="neutral",
        description="Current emotional trigger: 'excited' | 'stressed' | 'fomo' | 'neutral' | 'bored'",
    )
    cooling_off_hours: int = Field(
        default=24,
        ge=0,
        le=720,
        description="Cooling-off delay before you can finalize decision (standard is 24 or 48 hours)",
    )
    is_urgent: bool = Field(
        default=False,
        description="Flag whether this purchase feels time-sensitive (often a FOMO trap)",
    )


class JournalDecisionRequest(BaseModel):
    """Payload for resolving a journal entry after cooling off expires."""

    decision: str = Field(
        ...,
        description="Final action: 'proceeded' (bought it) or 'dropped' (avoided impulse spend)",
    )
    outcome_note: str = Field(
        default="",
        max_length=1000,
        description="Retrospective reflection: how did you feel after cooling off?",
    )


class JournalEntryResponse(BaseModel):
    """Complete decision journal entry with live cooling-off and delay status."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    decision_type: str
    amount: Decimal | None = None
    rationale: str
    emotional_state: str | None = None
    is_urgent: bool
    cooling_off_until: datetime | None = None
    is_cooling_active: bool = False
    cooling_remaining_seconds: int = 0
    status: str  # pending_review | proceeded | dropped
    outcome_note: str = ""
    goal_days_delayed: int | None = None
    delay_insight_message: str | None = None
    created_at: datetime


class JournalSummaryResponse(BaseModel):
    """High-level metrics for user decision journal behavior."""

    total_entries: int = 0
    active_cooling_count: int = 0
    ready_for_review_count: int = 0
    avoided_count: int = 0
    total_saved_amount: Decimal = Decimal("0.00")

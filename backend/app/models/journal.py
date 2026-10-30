"""JournalEntry ORM model for Decision Journal."""

from datetime import datetime
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, DateTime, ForeignKey, Numeric, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.user import User


class JournalEntry(Base):
    """Decision journal entry incorporating emotional tracking and cooling-off timers."""

    __tablename__ = "journal_entries"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    title: Mapped[str] = mapped_column(String(150), nullable=False)
    decision_type: Mapped[str] = mapped_column(String(50), nullable=False)  # purchase | investment | loan | career
    amount: Mapped[Decimal | None] = mapped_column(Numeric(12, 2), nullable=True)
    rationale: Mapped[str] = mapped_column(Text, nullable=False)
    emotional_state: Mapped[str | None] = mapped_column(String(50), nullable=True)  # excited | stressed | fomo | neutral | bored
    is_urgent: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    cooling_off_until: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="pending_review", nullable=False)  # pending_review | proceeded | dropped
    outcome_note: Mapped[str] = mapped_column(Text, default="", nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    user: Mapped["User"] = relationship("User", back_populates="journal_entries")

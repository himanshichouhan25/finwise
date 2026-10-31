"""User ORM model."""

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, DateTime, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.chat import ChatSession
    from app.models.claim import ClaimCheck
    from app.models.expense import ExpenseRecord
    from app.models.goal import Goal
    from app.models.health_score import HealthScoreSnapshot
    from app.models.income import IncomeRecord
    from app.models.journal import JournalEntry
    from app.models.loan import Loan
    from app.models.profile import FinancialProfile
    from app.models.watchlist import WatchlistItem


class User(Base):
    """User entity supporting persona-based demo profiles and full authentication."""

    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    email: Mapped[str | None] = mapped_column(String(255), unique=True, index=True, nullable=True)
    hashed_password: Mapped[str | None] = mapped_column(String(255), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    persona: Mapped[str] = mapped_column(String(50), default="student", nullable=False)  # student | first_job | gig_worker
    language_pref: Mapped[str] = mapped_column(String(10), default="en", nullable=False)  # en | hi | hinglish
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships (Cascade delete from user downward)
    profile: Mapped["FinancialProfile"] = relationship(
        "FinancialProfile",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan",
    )
    income_records: Mapped[list["IncomeRecord"]] = relationship(
        "IncomeRecord",
        back_populates="user",
        cascade="all, delete-orphan",
    )
    expenses: Mapped[list["ExpenseRecord"]] = relationship(
        "ExpenseRecord",
        back_populates="user",
        cascade="all, delete-orphan",
    )
    goals: Mapped[list["Goal"]] = relationship(
        "Goal",
        back_populates="user",
        cascade="all, delete-orphan",
    )
    chat_sessions: Mapped[list["ChatSession"]] = relationship(
        "ChatSession",
        back_populates="user",
        cascade="all, delete-orphan",
    )
    claim_checks: Mapped[list["ClaimCheck"]] = relationship(
        "ClaimCheck",
        back_populates="user",
        cascade="all, delete-orphan",
    )
    journal_entries: Mapped[list["JournalEntry"]] = relationship(
        "JournalEntry",
        back_populates="user",
        cascade="all, delete-orphan",
    )
    health_score_snapshots: Mapped[list["HealthScoreSnapshot"]] = relationship(
        "HealthScoreSnapshot",
        back_populates="user",
        cascade="all, delete-orphan",
    )
    watchlist_items: Mapped[list["WatchlistItem"]] = relationship(
        "WatchlistItem",
        back_populates="user",
        cascade="all, delete-orphan",
    )
    loans: Mapped[list["Loan"]] = relationship(
        "Loan",
        back_populates="user",
        cascade="all, delete-orphan",
    )

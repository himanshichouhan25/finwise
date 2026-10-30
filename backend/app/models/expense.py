"""ExpenseRecord ORM model."""

from datetime import date, datetime
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, Date, DateTime, ForeignKey, Index, Numeric, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.user import User


class ExpenseRecord(Base):
    """Recorded expense entries categorized into 50/30/20 buckets."""

    __tablename__ = "expense_records"
    __table_args__ = (
        Index("ix_expense_records_user_spent_on", "user_id", "spent_on"),
    )

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    category: Mapped[str] = mapped_column(String(100), nullable=False)
    bucket: Mapped[str] = mapped_column(String(50), nullable=False)  # needs | wants | savings
    description: Mapped[str] = mapped_column(String(255), default="", nullable=False)
    spent_on: Mapped[date] = mapped_column(Date, nullable=False)
    is_impulsive: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    user: Mapped["User"] = relationship("User", back_populates="expenses")

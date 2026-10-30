"""FinancialProfile ORM model."""

from datetime import datetime
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, Numeric, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.user import User


class FinancialProfile(Base):
    """User financial profile containing baseline income and emergency buffer."""

    __tablename__ = "financial_profiles"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        index=True,
        nullable=False,
    )
    monthly_income: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    income_type: Mapped[str] = mapped_column(String(50), default="fixed", nullable=False)  # fixed | irregular
    emergency_fund_saved: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=Decimal("0.00"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    user: Mapped["User"] = relationship("User", back_populates="profile")

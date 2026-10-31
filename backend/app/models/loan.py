"""Loan and LoanRepayment ORM models."""

from datetime import date, datetime
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, Date, DateTime, ForeignKey, Integer, Numeric, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.user import User


class Loan(Base):
    """User loan entity supporting multiple loan types, reducing/flat interest, and tracking."""

    __tablename__ = "loans"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    lender: Mapped[str] = mapped_column(String(100), nullable=False)
    loan_type: Mapped[str] = mapped_column(
        String(50), default="personal", nullable=False
    )  # education | personal | home | vehicle | credit | other
    principal_amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    interest_rate_pct: Mapped[Decimal] = mapped_column(Numeric(5, 2), nullable=False)
    interest_type: Mapped[str] = mapped_column(
        String(30), default="reducing_balance", nullable=False
    )  # reducing_balance | flat
    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    tenure_months: Mapped[int] = mapped_column(Integer, nullable=False)
    emi_amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    installments_paid: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="active", nullable=False)  # active | closed
    next_emi_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="loans")
    repayments: Mapped[list["LoanRepayment"]] = relationship(
        "LoanRepayment",
        back_populates="loan",
        cascade="all, delete-orphan",
        order_by="LoanRepayment.installment_number",
    )


class LoanRepayment(Base):
    """Historical or logged repayment record for an EMI or prepayment."""

    __tablename__ = "loan_repayments"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    loan_id: Mapped[int] = mapped_column(
        ForeignKey("loans.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    installment_number: Mapped[int] = mapped_column(Integer, nullable=False)
    payment_date: Mapped[date] = mapped_column(Date, nullable=False)
    amount_paid: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    principal_component: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=Decimal("0.00"), nullable=False)
    interest_component: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=Decimal("0.00"), nullable=False)
    extra_payment: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=Decimal("0.00"), nullable=False)
    is_missed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    payment_type: Mapped[str] = mapped_column(String(20), default="emi", nullable=False)  # emi | prepayment | missed
    notes: Mapped[str | None] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    loan: Mapped["Loan"] = relationship("Loan", back_populates="repayments")


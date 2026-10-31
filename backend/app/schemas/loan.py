"""Loan management request and response schemas."""

from datetime import date, datetime
from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, Field


class LoanCreate(BaseModel):
    """Schema for adding a new loan."""

    name: str = Field(min_length=1, max_length=100, description="Loan name, e.g. HDFC Education Loan")
    lender: str = Field(min_length=1, max_length=100, description="Bank or lender name, e.g. HDFC Bank")
    loan_type: Literal["education", "personal", "home", "vehicle", "credit", "other"] = "personal"
    principal_amount: Decimal = Field(gt=Decimal("0.00"), le=Decimal("100000000.00"), description="Sanctioned principal amount")
    interest_rate_pct: Decimal = Field(ge=Decimal("0.00"), le=Decimal("60.00"), description="Annual interest percentage")
    interest_type: Literal["reducing_balance", "flat"] = "reducing_balance"
    start_date: date = Field(description="Loan disbursement/start date")
    tenure_months: int = Field(gt=0, le=480, description="Total tenure in months")
    custom_emi: Decimal | None = Field(default=None, gt=Decimal("0.00"), description="Optional override for EMI")


class LoanUpdate(BaseModel):
    """Schema for updating loan details."""

    name: str | None = Field(default=None, min_length=1, max_length=100)
    lender: str | None = Field(default=None, min_length=1, max_length=100)
    installments_paid: int | None = Field(default=None, ge=0)
    status: Literal["active", "closed"] | None = None
    next_emi_date: date | None = None


class LoanRepaymentCreate(BaseModel):
    """Schema for logging an EMI or prepayment."""

    installment_number: int | None = Field(default=None, ge=1)
    payment_date: date = Field(default_factory=date.today)
    amount_paid: Decimal = Field(gt=Decimal("0.00"), description="Total amount paid")
    extra_payment: Decimal = Field(default=Decimal("0.00"), ge=Decimal("0.00"), description="Additional prepayment component")
    payment_type: Literal["emi", "prepayment", "missed"] = "emi"
    notes: str | None = Field(default=None, max_length=255)


class LoanRepaymentResponse(BaseModel):
    """Repayment record details."""

    id: int
    loan_id: int
    installment_number: int
    payment_date: date
    amount_paid: Decimal
    principal_component: Decimal
    interest_component: Decimal
    extra_payment: Decimal
    is_missed: bool
    payment_type: str
    notes: str | None
    created_at: datetime

    model_config = {"from_attributes": True}


class LoanResponse(BaseModel):
    """Complete loan summary response with calculated live metrics."""

    id: int
    user_id: int
    name: str
    lender: str
    loan_type: str
    principal_amount: Decimal
    interest_rate_pct: Decimal
    interest_type: str
    start_date: date
    tenure_months: int
    emi_amount: Decimal
    installments_paid: int
    remaining_installments: int
    outstanding_principal: Decimal
    total_interest_paid: Decimal
    remaining_interest: Decimal
    total_repayment_estimated: Decimal
    total_interest_estimated: Decimal
    next_emi_date: date | None
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}


class AmortizationScheduleRowSchema(BaseModel):
    """One row of an amortization schedule."""

    month: int
    opening_balance: Decimal
    emi: Decimal
    principal_paid: Decimal
    interest_paid: Decimal
    closing_balance: Decimal


class LoanDetailResponse(LoanResponse):
    """Detailed loan view including amortization schedule and repayment history."""

    schedule: list[AmortizationScheduleRowSchema]
    repayments: list[LoanRepaymentResponse]


class LoanSummaryOverview(BaseModel):
    """User aggregate portfolio loan statistics."""

    active_loans_count: int
    total_outstanding_principal: Decimal
    total_monthly_emi: Decimal
    total_interest_paid_so_far: Decimal
    loans: list[LoanResponse]


class PrepaymentSimulationRequest(BaseModel):
    """Request for extra monthly payment simulation."""

    extra_monthly_amount: Decimal = Field(gt=Decimal("0.00"), le=Decimal("1000000.00"))


class PrepaymentSimulationResponse(BaseModel):
    """Impact of additional monthly contribution on loan tenure and interest."""

    loan_id: int
    loan_name: str
    original_tenure_months: int
    new_tenure_months: int
    months_saved: int
    original_total_interest: Decimal
    new_total_interest: Decimal
    interest_saved: Decimal
    extra_monthly_amount: Decimal


class LoanPrioritizationItemSchema(BaseModel):
    """Prioritized loan entry."""

    loan_id: int
    name: str
    lender: str
    outstanding_principal: Decimal
    interest_rate_pct: Decimal
    monthly_emi: Decimal
    rank: int
    strategy: str
    rationale: str


class LoanPrioritizationResponse(BaseModel):
    """Payoff strategy recommendations comparing Avalanche vs Snowball."""

    avalanche_strategy: list[LoanPrioritizationItemSchema]
    snowball_strategy: list[LoanPrioritizationItemSchema]
    avalanche_recommendation: str
    snowball_recommendation: str


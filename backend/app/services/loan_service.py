"""Loan Management Service.

Orchestrates database persistence, Python amortization engine calculations,
payment processing, prepayment simulations, and repayment prioritization strategies.
"""

from datetime import date
from decimal import Decimal
from typing import Any

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.errors import NotFoundError, ValidationFailure
from app.engine.loan import (
    calculate_emi,
    generate_amortization_schedule,
    prioritize_loans,
)
from app.engine.loan import (
    simulate_prepayment as engine_simulate_prepayment,
)
from app.models.loan import Loan, LoanRepayment
from app.schemas.loan import (
    AmortizationScheduleRowSchema,
    LoanCreate,
    LoanDetailResponse,
    LoanPrioritizationItemSchema,
    LoanPrioritizationResponse,
    LoanRepaymentCreate,
    LoanRepaymentResponse,
    LoanResponse,
    LoanSummaryOverview,
    PrepaymentSimulationResponse,
)


def _add_months(d: date, months: int) -> date:
    """Add `months` to a date using standard calendar month roll."""
    month = d.month - 1 + months
    year = d.year + month // 12
    month = month % 12 + 1
    # clamp day
    days_in_month = [31, 29 if year % 4 == 0 and (year % 100 != 0 or year % 400 == 0) else 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
    day = min(d.day, days_in_month[month - 1])
    return date(year, month, day)


def _compute_loan_live_metrics(loan: Loan, schedule: list[Any] | None = None) -> dict[str, Any]:
    """Calculate real-time financial metrics for a loan given its tenure and paid installments."""
    if schedule is None:
        schedule = generate_amortization_schedule(
            principal=loan.principal_amount,
            annual_rate_pct=loan.interest_rate_pct,
            tenure_months=loan.tenure_months,
            interest_type=loan.interest_type,  # type: ignore[arg-type]
        )

    total_repayment = sum((r.emi for r in schedule), Decimal("0.00"))
    total_interest = sum((r.interest_paid for r in schedule), Decimal("0.00"))

    paid_idx = min(loan.installments_paid, len(schedule))
    if paid_idx > 0:
        paid_rows = schedule[:paid_idx]
        total_interest_paid = sum((r.interest_paid for r in paid_rows), Decimal("0.00"))
        outstanding_principal = schedule[paid_idx - 1].closing_balance
    else:
        total_interest_paid = Decimal("0.00")
        outstanding_principal = loan.principal_amount

    remaining_installments = max(0, loan.tenure_months - loan.installments_paid)
    remaining_interest = max(Decimal("0.00"), total_interest - total_interest_paid)

    return {
        "outstanding_principal": outstanding_principal,
        "total_interest_paid": total_interest_paid,
        "remaining_interest": remaining_interest,
        "total_repayment_estimated": total_repayment,
        "total_interest_estimated": total_interest,
        "remaining_installments": remaining_installments,
        "schedule": schedule,
    }


def create_loan(db: Session, user_id: int, payload: LoanCreate) -> LoanResponse:
    """Validate, calculate EMI, and persist a new loan."""
    # Compute EMI if custom_emi was not explicitly specified
    if payload.custom_emi:
        emi = payload.custom_emi
    else:
        emi = calculate_emi(
            principal=payload.principal_amount,
            annual_rate_pct=payload.interest_rate_pct,
            tenure_months=payload.tenure_months,
            interest_type=payload.interest_type,
        )

    # Next EMI date defaults to start_date + 1 month
    next_emi = _add_months(payload.start_date, 1)

    loan = Loan(
        user_id=user_id,
        name=payload.name.strip(),
        lender=payload.lender.strip(),
        loan_type=payload.loan_type,
        principal_amount=payload.principal_amount,
        interest_rate_pct=payload.interest_rate_pct,
        interest_type=payload.interest_type,
        start_date=payload.start_date,
        tenure_months=payload.tenure_months,
        emi_amount=emi,
        installments_paid=0,
        status="active",
        next_emi_date=next_emi,
    )
    db.add(loan)
    db.commit()
    db.refresh(loan)

    metrics = _compute_loan_live_metrics(loan)
    return LoanResponse(
        id=loan.id,
        user_id=loan.user_id,
        name=loan.name,
        lender=loan.lender,
        loan_type=loan.loan_type,
        principal_amount=loan.principal_amount,
        interest_rate_pct=loan.interest_rate_pct,
        interest_type=loan.interest_type,
        start_date=loan.start_date,
        tenure_months=loan.tenure_months,
        emi_amount=loan.emi_amount,
        installments_paid=loan.installments_paid,
        remaining_installments=metrics["remaining_installments"],
        outstanding_principal=metrics["outstanding_principal"],
        total_interest_paid=metrics["total_interest_paid"],
        remaining_interest=metrics["remaining_interest"],
        total_repayment_estimated=metrics["total_repayment_estimated"],
        total_interest_estimated=metrics["total_interest_estimated"],
        next_emi_date=loan.next_emi_date,
        status=loan.status,
        created_at=loan.created_at,
    )


def get_loans(db: Session, user_id: int) -> LoanSummaryOverview:
    """Retrieve all active & closed loans for a user with aggregated statistics."""
    stmt = select(Loan).where(Loan.user_id == user_id).order_by(Loan.created_at.desc())
    loans = db.execute(stmt).scalars().all()

    loan_responses: list[LoanResponse] = []
    total_outstanding = Decimal("0.00")
    total_monthly_emi = Decimal("0.00")
    total_interest_paid = Decimal("0.00")
    active_count = 0

    for loan in loans:
        metrics = _compute_loan_live_metrics(loan)
        resp = LoanResponse(
            id=loan.id,
            user_id=loan.user_id,
            name=loan.name,
            lender=loan.lender,
            loan_type=loan.loan_type,
            principal_amount=loan.principal_amount,
            interest_rate_pct=loan.interest_rate_pct,
            interest_type=loan.interest_type,
            start_date=loan.start_date,
            tenure_months=loan.tenure_months,
            emi_amount=loan.emi_amount,
            installments_paid=loan.installments_paid,
            remaining_installments=metrics["remaining_installments"],
            outstanding_principal=metrics["outstanding_principal"],
            total_interest_paid=metrics["total_interest_paid"],
            remaining_interest=metrics["remaining_interest"],
            total_repayment_estimated=metrics["total_repayment_estimated"],
            total_interest_estimated=metrics["total_interest_estimated"],
            next_emi_date=loan.next_emi_date,
            status=loan.status,
            created_at=loan.created_at,
        )
        loan_responses.append(resp)

        if loan.status == "active":
            active_count += 1
            total_outstanding += metrics["outstanding_principal"]
            total_monthly_emi += loan.emi_amount
            total_interest_paid += metrics["total_interest_paid"]

    return LoanSummaryOverview(
        active_loans_count=active_count,
        total_outstanding_principal=total_outstanding,
        total_monthly_emi=total_monthly_emi,
        total_interest_paid_so_far=total_interest_paid,
        loans=loan_responses,
    )


def get_loan_detail(db: Session, user_id: int, loan_id: int) -> LoanDetailResponse:
    """Get complete single loan metrics, amortization table, and payment records."""
    stmt = select(Loan).where(Loan.id == loan_id, Loan.user_id == user_id)
    loan = db.execute(stmt).scalar_one_or_none()
    if not loan:
        raise NotFoundError(f"Loan #{loan_id} not found for user #{user_id}.")

    metrics = _compute_loan_live_metrics(loan)

    schedule_schemas = [
        AmortizationScheduleRowSchema(
            month=r.month,
            opening_balance=r.opening_balance,
            emi=r.emi,
            principal_paid=r.principal_paid,
            interest_paid=r.interest_paid,
            closing_balance=r.closing_balance,
        )
        for r in metrics["schedule"]
    ]

    repayment_schemas = [
        LoanRepaymentResponse.model_validate(rep)
        for rep in loan.repayments
    ]

    return LoanDetailResponse(
        id=loan.id,
        user_id=loan.user_id,
        name=loan.name,
        lender=loan.lender,
        loan_type=loan.loan_type,
        principal_amount=loan.principal_amount,
        interest_rate_pct=loan.interest_rate_pct,
        interest_type=loan.interest_type,
        start_date=loan.start_date,
        tenure_months=loan.tenure_months,
        emi_amount=loan.emi_amount,
        installments_paid=loan.installments_paid,
        remaining_installments=metrics["remaining_installments"],
        outstanding_principal=metrics["outstanding_principal"],
        total_interest_paid=metrics["total_interest_paid"],
        remaining_interest=metrics["remaining_interest"],
        total_repayment_estimated=metrics["total_repayment_estimated"],
        total_interest_estimated=metrics["total_interest_estimated"],
        next_emi_date=loan.next_emi_date,
        status=loan.status,
        created_at=loan.created_at,
        schedule=schedule_schemas,
        repayments=repayment_schemas,
    )


def record_repayment(
    db: Session,
    user_id: int,
    loan_id: int,
    payload: LoanRepaymentCreate,
) -> LoanRepaymentResponse:
    """Record an EMI installment payment, prepayment, or missed installment."""
    stmt = select(Loan).where(Loan.id == loan_id, Loan.user_id == user_id)
    loan = db.execute(stmt).scalar_one_or_none()
    if not loan:
        raise NotFoundError(f"Loan #{loan_id} not found for user #{user_id}.")

    if loan.status != "active":
        raise ValidationFailure(message="Cannot record payments on a closed or inactive loan.")

    if payload.payment_type == "emi" and payload.amount_paid < loan.emi_amount:
        raise ValidationFailure(
            message=f"Regular EMI payment cannot be less than the scheduled monthly EMI of ₹{loan.emi_amount:,.2f}. "
                    "For partial or custom payments towards debt reduction, please select 'Extra Prepayment'."
        )

    metrics = _compute_loan_live_metrics(loan)
    schedule = metrics["schedule"]

    inst_num = payload.installment_number or (loan.installments_paid + 1)
    matched_row = next((r for r in schedule if r.month == inst_num), None)

    if matched_row and payload.payment_type == "emi":
        principal_comp = matched_row.principal_paid
        interest_comp = matched_row.interest_paid
    else:
        # Prepayment goes directly towards principal reduction
        principal_comp = payload.amount_paid
        interest_comp = Decimal("0.00")

    repayment = LoanRepayment(
        loan_id=loan.id,
        installment_number=inst_num,
        payment_date=payload.payment_date,
        amount_paid=payload.amount_paid,
        principal_component=principal_comp,
        interest_component=interest_comp,
        extra_payment=payload.extra_payment,
        is_missed=(payload.payment_type == "missed"),
        payment_type=payload.payment_type,
        notes=payload.notes,
    )
    db.add(repayment)

    # Update loan state
    if payload.payment_type == "emi":
        loan.installments_paid += 1
        if loan.installments_paid >= loan.tenure_months:
            loan.status = "closed"
            loan.next_emi_date = None
        elif loan.next_emi_date:
            loan.next_emi_date = _add_months(loan.next_emi_date, 1)

    db.commit()
    db.refresh(repayment)
    return LoanRepaymentResponse.model_validate(repayment)


def simulate_loan_prepayment(
    db: Session,
    user_id: int,
    loan_id: int,
    extra_monthly_amount: Decimal,
) -> PrepaymentSimulationResponse:
    """Simulate the financial benefit of paying extra every month on a specific loan."""
    stmt = select(Loan).where(Loan.id == loan_id, Loan.user_id == user_id)
    loan = db.execute(stmt).scalar_one_or_none()
    if not loan:
        raise NotFoundError(f"Loan #{loan_id} not found for user #{user_id}.")

    metrics = _compute_loan_live_metrics(loan)
    outstanding_p = metrics["outstanding_principal"]
    remaining_tenure = metrics["remaining_installments"]

    if remaining_tenure <= 0 or outstanding_p <= Decimal("0.00"):
        raise ValidationFailure(message="Loan is already fully paid or has no remaining tenure.")

    result = engine_simulate_prepayment(
        principal=outstanding_p,
        annual_rate_pct=loan.interest_rate_pct,
        remaining_tenure_months=remaining_tenure,
        extra_monthly_amount=extra_monthly_amount,
        interest_type=loan.interest_type,  # type: ignore[arg-type]
    )

    return PrepaymentSimulationResponse(
        loan_id=loan.id,
        loan_name=loan.name,
        original_tenure_months=result.original_tenure_months,
        new_tenure_months=result.new_tenure_months,
        months_saved=result.months_saved,
        original_total_interest=result.original_total_interest,
        new_total_interest=result.new_total_interest,
        interest_saved=result.interest_saved,
        extra_monthly_amount=result.extra_monthly_amount,
    )


def get_prioritization_strategy(db: Session, user_id: int) -> LoanPrioritizationResponse:
    """Compute and explain Avalanche vs Snowball debt elimination strategies."""
    stmt = select(Loan).where(Loan.user_id == user_id, Loan.status == "active")
    active_loans = db.execute(stmt).scalars().all()

    loan_dicts: list[dict] = []
    for loan_item in active_loans:
        metrics = _compute_loan_live_metrics(loan_item)
        loan_dicts.append({
            "id": loan_item.id,
            "name": loan_item.name,
            "lender": loan_item.lender,
            "outstanding_principal": metrics["outstanding_principal"],
            "interest_rate_pct": loan_item.interest_rate_pct,
            "emi": loan_item.emi_amount,
        })

    avalanche_items = prioritize_loans(loan_dicts, strategy="avalanche")
    snowball_items = prioritize_loans(loan_dicts, strategy="snowball")

    avalanche_recs = (
        "Debt Avalanche focuses on the highest interest rate loans first (e.g., Credit Card or Personal Loans). "
        "Mathematically, this saves the absolute maximum amount in total interest charges over time."
    )
    snowball_recs = (
        "Debt Snowball prioritizes the smallest outstanding balance first. "
        "Knocking out smaller loans quickly provides psychological momentum and frees up cash flow faster."
    )

    return LoanPrioritizationResponse(
        avalanche_strategy=[LoanPrioritizationItemSchema(**item.__dict__) for item in avalanche_items],
        snowball_strategy=[LoanPrioritizationItemSchema(**item.__dict__) for item in snowball_items],
        avalanche_recommendation=avalanche_recs,
        snowball_recommendation=snowball_recs,
    )


def delete_loan(db: Session, user_id: int, loan_id: int) -> None:
    """Delete a loan and its associated repayments."""
    stmt = select(Loan).where(Loan.id == loan_id, Loan.user_id == user_id)
    loan = db.execute(stmt).scalar_one_or_none()
    if not loan:
        raise NotFoundError(f"Loan #{loan_id} not found for user #{user_id}.")

    db.delete(loan)
    db.commit()

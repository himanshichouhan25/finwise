"""Loan Management API Endpoints.

Provides endpoints for creating, listing, simulating prepayments,
logging installments, and prioritizing debt elimination strategies.
"""

from typing import Annotated

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user_id, get_db
from app.schemas.loan import (
    LoanCreate,
    LoanDetailResponse,
    LoanPrioritizationResponse,
    LoanRepaymentCreate,
    LoanRepaymentResponse,
    LoanResponse,
    LoanSummaryOverview,
    PrepaymentSimulationRequest,
    PrepaymentSimulationResponse,
)
from app.services.loan_service import (
    create_loan,
    delete_loan,
    get_loan_detail,
    get_loans,
    get_prioritization_strategy,
    record_repayment,
    simulate_loan_prepayment,
)

router = APIRouter(prefix="/loans", tags=["Loans & Debt Management"])


@router.post("", response_model=LoanResponse, status_code=status.HTTP_201_CREATED)
def add_new_loan(
    payload: LoanCreate,
    db: Annotated[Session, Depends(get_db)],
    user_id: Annotated[int, Depends(get_current_user_id)],
) -> LoanResponse:
    """Create and persist a new loan with automatic EMI calculation."""
    return create_loan(db=db, user_id=user_id, payload=payload)


@router.get("", response_model=LoanSummaryOverview)
def list_user_loans(
    db: Annotated[Session, Depends(get_db)],
    user_id: Annotated[int, Depends(get_current_user_id)],
) -> LoanSummaryOverview:
    """List all user loans with live metrics and portfolio totals."""
    return get_loans(db=db, user_id=user_id)


@router.get("/strategy/prioritization", response_model=LoanPrioritizationResponse)
def get_loan_prioritization(
    db: Annotated[Session, Depends(get_db)],
    user_id: Annotated[int, Depends(get_current_user_id)],
) -> LoanPrioritizationResponse:
    """Compare Avalanche vs Snowball debt payoff strategies."""
    return get_prioritization_strategy(db=db, user_id=user_id)


@router.get("/{loan_id}", response_model=LoanDetailResponse)
def get_loan_by_id(
    loan_id: int,
    db: Annotated[Session, Depends(get_db)],
    user_id: Annotated[int, Depends(get_current_user_id)],
) -> LoanDetailResponse:
    """Get single loan details including full amortization schedule and repayment history."""
    return get_loan_detail(db=db, user_id=user_id, loan_id=loan_id)


@router.post("/{loan_id}/repayments", response_model=LoanRepaymentResponse, status_code=status.HTTP_201_CREATED)
def log_loan_repayment(
    loan_id: int,
    payload: LoanRepaymentCreate,
    db: Annotated[Session, Depends(get_db)],
    user_id: Annotated[int, Depends(get_current_user_id)],
) -> LoanRepaymentResponse:
    """Log an EMI installment, extra prepayment, or missed payment."""
    return record_repayment(db=db, user_id=user_id, loan_id=loan_id, payload=payload)


@router.post("/{loan_id}/simulate-extra", response_model=PrepaymentSimulationResponse)
def simulate_prepayment_impact(
    loan_id: int,
    payload: PrepaymentSimulationRequest,
    db: Annotated[Session, Depends(get_db)],
    user_id: Annotated[int, Depends(get_current_user_id)],
) -> PrepaymentSimulationResponse:
    """Simulate months and interest saved by contributing an extra monthly amount."""
    return simulate_loan_prepayment(
        db=db,
        user_id=user_id,
        loan_id=loan_id,
        extra_monthly_amount=payload.extra_monthly_amount,
    )


@router.delete("/{loan_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_loan(
    loan_id: int,
    db: Annotated[Session, Depends(get_db)],
    user_id: Annotated[int, Depends(get_current_user_id)],
) -> None:
    """Delete a loan and its associated repayments."""
    delete_loan(db=db, user_id=user_id, loan_id=loan_id)


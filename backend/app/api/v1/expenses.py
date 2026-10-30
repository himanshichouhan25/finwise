"""Expense management endpoints."""

from typing import Annotated

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user_id, get_db
from app.schemas.expense import ExpenseCreate, ExpenseResponse, ExpenseUpdate
from app.services.budget_service import (
    create_expense,
    delete_expense,
    list_expenses,
    update_expense,
)

router = APIRouter(prefix="/expenses", tags=["Expenses"])


@router.get("", response_model=list[ExpenseResponse])
def get_expenses(
    user_id: Annotated[int, Depends(get_current_user_id)],
    db: Annotated[Session, Depends(get_db)],
    month: Annotated[str | None, Query(description="Filter by month in YYYY-MM format")] = None,
) -> list[ExpenseResponse]:
    """List expenses for current user, optionally filtered by month."""
    records = list_expenses(db, user_id, month)
    return [ExpenseResponse.model_validate(r) for r in records]


@router.post("", response_model=ExpenseResponse, status_code=status.HTTP_201_CREATED)
def add_expense(
    payload: ExpenseCreate,
    user_id: Annotated[int, Depends(get_current_user_id)],
    db: Annotated[Session, Depends(get_db)],
) -> ExpenseResponse:
    """Record a new expense entry."""
    record = create_expense(db, user_id, payload)
    return ExpenseResponse.model_validate(record)


@router.patch("/{expense_id}", response_model=ExpenseResponse)
def modify_expense(
    expense_id: int,
    payload: ExpenseUpdate,
    user_id: Annotated[int, Depends(get_current_user_id)],
    db: Annotated[Session, Depends(get_db)],
) -> ExpenseResponse:
    """Update details of an existing expense."""
    record = update_expense(db, user_id, expense_id, payload)
    return ExpenseResponse.model_validate(record)


@router.delete("/{expense_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_expense(
    expense_id: int,
    user_id: Annotated[int, Depends(get_current_user_id)],
    db: Annotated[Session, Depends(get_db)],
) -> None:
    """Delete an expense record."""
    delete_expense(db, user_id, expense_id)

"""Income management endpoints."""

from typing import Annotated

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user_id, get_db
from app.schemas.income import IncomeCreate, IncomeResponse
from app.services.budget_service import create_income, delete_income, list_incomes

router = APIRouter(prefix="/income", tags=["Income"])


@router.get("", response_model=list[IncomeResponse])
def get_incomes(
    user_id: Annotated[int, Depends(get_current_user_id)],
    db: Annotated[Session, Depends(get_db)],
) -> list[IncomeResponse]:
    """List all recorded income entries for current user."""
    records = list_incomes(db, user_id)
    return [IncomeResponse.model_validate(r) for r in records]


@router.post("", response_model=IncomeResponse, status_code=status.HTTP_201_CREATED)
def add_income(
    payload: IncomeCreate,
    user_id: Annotated[int, Depends(get_current_user_id)],
    db: Annotated[Session, Depends(get_db)],
) -> IncomeResponse:
    """Record a new income entry."""
    record = create_income(db, user_id, payload)
    return IncomeResponse.model_validate(record)


@router.delete("/{income_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_income(
    income_id: int,
    user_id: Annotated[int, Depends(get_current_user_id)],
    db: Annotated[Session, Depends(get_db)],
) -> None:
    """Delete an income entry."""
    delete_income(db, user_id, income_id)

"""Expense records request and response schemas."""

from datetime import date, datetime
from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, Field


class ExpenseCreate(BaseModel):
    """Schema for recording a new expense entry."""

    amount: Decimal = Field(gt=Decimal("0.00"), le=Decimal("100000000.00"), description="Expense amount in INR")
    category: str = Field(min_length=1, max_length=100, description="Expense category, e.g. Rent, Groceries, Dining")
    bucket: Literal["needs", "wants", "savings"] | None = Field(
        default=None, description="Optional bucket override; auto-resolved if omitted"
    )
    description: str = Field(default="", max_length=255)
    spent_on: date = Field(description="Date expense occurred")
    is_impulsive: bool = Field(default=False, description="User flag for impulse purchases")


class ExpenseUpdate(BaseModel):
    """Schema for updating an existing expense entry."""

    amount: Decimal | None = Field(default=None, gt=Decimal("0.00"), le=Decimal("100000000.00"))
    category: str | None = Field(default=None, min_length=1, max_length=100)
    bucket: Literal["needs", "wants", "savings"] | None = None
    description: str | None = Field(default=None, max_length=255)
    spent_on: date | None = None
    is_impulsive: bool | None = None


class ExpenseResponse(BaseModel):
    """Schema for returning recorded expense entries."""

    id: int
    user_id: int
    amount: Decimal
    category: str
    bucket: str
    description: str
    spent_on: date
    is_impulsive: bool
    created_at: datetime

    model_config = {"from_attributes": True}

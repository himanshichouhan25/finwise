"""Expense records request and response schemas."""

import datetime as dt
from decimal import Decimal
from typing import Any, Literal

from pydantic import BaseModel, Field, model_validator


class ExpenseCreate(BaseModel):
    """Schema for recording a new expense entry."""

    amount: Decimal = Field(gt=Decimal("0.00"), le=Decimal("100000000.00"), description="Expense amount in INR")
    category: str = Field(min_length=1, max_length=100, description="Expense category, e.g. Rent, Groceries, Dining")
    bucket: Literal["needs", "wants", "savings"] | None = Field(
        default=None, description="Optional bucket override; auto-resolved if omitted"
    )
    description: str = Field(default="", max_length=255)
    spent_on: dt.date | None = Field(default=None, description="Date expense occurred")
    date: dt.date | None = Field(default=None, description="Alias for spent_on")
    is_impulsive: bool = Field(default=False, description="User flag for impulse purchases")

    @model_validator(mode="before")
    @classmethod
    def resolve_date_fields(cls, data: Any) -> Any:
        if isinstance(data, dict) and ("spent_on" not in data or not data["spent_on"]):
            data["spent_on"] = data.get("date") or dt.date.today()
        return data


class ExpenseUpdate(BaseModel):
    """Schema for updating an existing expense entry."""

    amount: Decimal | None = Field(default=None, gt=Decimal("0.00"), le=Decimal("100000000.00"))
    category: str | None = Field(default=None, min_length=1, max_length=100)
    bucket: Literal["needs", "wants", "savings"] | None = None
    description: str | None = Field(default=None, max_length=255)
    spent_on: dt.date | None = None
    is_impulsive: bool | None = None


class ExpenseResponse(BaseModel):
    """Schema for returning recorded expense entries."""

    id: int
    user_id: int
    amount: Decimal
    category: str
    bucket: str
    description: str
    spent_on: dt.date
    is_impulsive: bool
    created_at: dt.datetime

    model_config = {"from_attributes": True}

"""Income records request and response schemas."""

from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, Field


class IncomeCreate(BaseModel):
    """Schema for recording a new income entry."""

    amount: Decimal = Field(gt=Decimal("0.00"), le=Decimal("100000000.00"), description="Income amount in INR")
    source: str = Field(min_length=1, max_length=100, description="Source of income, e.g. Salary, Freelance")
    received_on: date = Field(description="Date income was credited")
    is_recurring: bool = Field(default=False)


class IncomeResponse(BaseModel):
    """Schema for returning recorded income entries."""

    id: int
    user_id: int
    amount: Decimal
    source: str
    received_on: date
    is_recurring: bool
    created_at: datetime

    model_config = {"from_attributes": True}

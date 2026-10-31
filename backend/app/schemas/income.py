"""Income records request and response schemas."""

import datetime as dt
from decimal import Decimal
from typing import Any

from pydantic import BaseModel, Field, model_validator


class IncomeCreate(BaseModel):
    """Schema for recording a new income entry."""

    amount: Decimal = Field(gt=Decimal("0.00"), le=Decimal("100000000.00"), description="Income amount in INR")
    source: str = Field(min_length=1, max_length=100, description="Source of income, e.g. Salary, Freelance")
    received_on: dt.date | None = Field(default=None, description="Date income was credited")
    date: dt.date | None = Field(default=None, description="Alias for received_on")
    is_recurring: bool = Field(default=False)

    @model_validator(mode="before")
    @classmethod
    def resolve_date_fields(cls, data: Any) -> Any:
        if isinstance(data, dict) and ("received_on" not in data or not data["received_on"]):
            data["received_on"] = data.get("date") or dt.date.today()
        return data


class IncomeResponse(BaseModel):
    """Schema for returning recorded income entries."""

    id: int
    user_id: int
    amount: Decimal
    source: str
    received_on: dt.date
    is_recurring: bool
    created_at: dt.datetime

    model_config = {"from_attributes": True}

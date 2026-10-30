"""Financial profile request and response schemas."""

from datetime import datetime
from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, Field


class ProfileUpdate(BaseModel):
    """Schema for updating baseline income and emergency savings."""

    monthly_income: Decimal = Field(gt=Decimal("0.00"), le=Decimal("100000000.00"), description="Expected monthly income in INR")
    income_type: Literal["fixed", "irregular"] = Field(default="fixed")
    emergency_fund_saved: Decimal = Field(default=Decimal("0.00"), ge=Decimal("0.00"), le=Decimal("100000000.00"))


class ProfileResponse(BaseModel):
    """Schema for returning user financial profile."""

    id: int
    user_id: int
    monthly_income: Decimal
    income_type: str
    emergency_fund_saved: Decimal
    created_at: datetime

    model_config = {"from_attributes": True}

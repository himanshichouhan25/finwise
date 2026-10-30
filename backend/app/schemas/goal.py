"""Savings goal request and response schemas."""

from datetime import date, datetime
from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, Field


class GoalCreate(BaseModel):
    """Schema for creating a financial goal."""

    name: str = Field(min_length=1, max_length=80, description="Goal title, e.g. Laptop Upgrade")
    target_amount: Decimal = Field(gt=Decimal("0.00"), le=Decimal("100000000.00"))
    current_saved: Decimal = Field(default=Decimal("0.00"), ge=Decimal("0.00"), le=Decimal("100000000.00"))
    target_date: date | None = None
    planned_monthly_contribution: Decimal | None = Field(default=None, ge=Decimal("0.00"), le=Decimal("100000000.00"))
    expected_annual_return_pct: Decimal = Field(default=Decimal("0.00"), ge=Decimal("0.00"), le=Decimal("50.00"))


class GoalUpdate(BaseModel):
    """Schema for updating goal parameters or recording savings progress."""

    name: str | None = Field(default=None, min_length=1, max_length=80)
    target_amount: Decimal | None = Field(default=None, gt=Decimal("0.00"), le=Decimal("100000000.00"))
    current_saved: Decimal | None = Field(default=None, ge=Decimal("0.00"), le=Decimal("100000000.00"))
    target_date: date | None = None
    planned_monthly_contribution: Decimal | None = Field(default=None, ge=Decimal("0.00"), le=Decimal("100000000.00"))
    expected_annual_return_pct: Decimal | None = Field(default=None, ge=Decimal("0.00"), le=Decimal("50.00"))
    status: Literal["active", "achieved", "paused"] | None = None


class GoalResponse(BaseModel):
    """Schema for returning savings goal details."""

    id: int
    user_id: int
    name: str
    target_amount: Decimal
    current_saved: Decimal
    target_date: date | None
    planned_monthly_contribution: Decimal | None
    expected_annual_return_pct: Decimal
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}


class GoalPlanResponse(BaseModel):
    """Schema for goal timeline and required contribution plan."""

    goal_id: int
    goal_name: str
    target_amount: Decimal
    current_saved: Decimal
    remaining_amount: Decimal
    target_months: int
    annual_return_pct: Decimal
    required_monthly_savings: Decimal
    is_achieved: bool
    is_on_track: bool
    assumptions: list[str]

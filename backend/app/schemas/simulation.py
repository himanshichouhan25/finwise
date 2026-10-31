"""Financial simulation request and response schemas."""

from decimal import Decimal
from typing import Any

from pydantic import BaseModel, Field, model_validator


class SipRequest(BaseModel):
    """Parameters for SIP compound growth projection."""

    monthly_investment: Decimal = Field(gt=Decimal("0.00"), le=Decimal("10000000.00"))
    duration_years: int = Field(default=10, ge=1, le=50)
    annual_return_pct: Decimal = Field(ge=Decimal("0.00"), le=Decimal("50.00"))
    annual_step_up_pct: Decimal = Field(default=Decimal("0.00"), ge=Decimal("0.00"), le=Decimal("50.00"))
    annual_inflation_pct: Decimal = Field(default=Decimal("0.00"), ge=Decimal("0.00"), le=Decimal("30.00"))

    @model_validator(mode="before")
    @classmethod
    def resolve_aliases(cls, data: Any) -> Any:
        if isinstance(data, dict):
            if "duration_years" not in data or data["duration_years"] is None:
                data["duration_years"] = data.get("tenure_years", 10)
            if "annual_step_up_pct" not in data or data["annual_step_up_pct"] is None:
                data["annual_step_up_pct"] = data.get("step_up_pct", Decimal("0.00"))
            if "annual_inflation_pct" not in data or data["annual_inflation_pct"] is None:
                data["annual_inflation_pct"] = data.get("inflation_rate_pct", Decimal("0.00"))
        return data


class SipYearPointSchema(BaseModel):
    year: int
    total_invested: Decimal
    estimated_value: Decimal


class SipScenarioSchema(BaseModel):
    label: str
    scenario_name: str | None = None
    annual_return_pct: Decimal
    total_invested: Decimal
    estimated_value: Decimal
    maturity_amount: Decimal | None = None
    estimated_gain: Decimal
    wealth_gained: Decimal | None = None


class SipResponse(BaseModel):
    """Results for SIP compound growth projection."""

    monthly_investment: Decimal
    duration_years: int
    annual_return_pct: Decimal
    annual_step_up_pct: Decimal
    annual_inflation_pct: Decimal
    total_invested: Decimal
    estimated_value: Decimal
    maturity_amount: Decimal | None = None
    estimated_gain: Decimal
    wealth_gained: Decimal | None = None
    inflation_adjusted_value: Decimal
    inflation_adjusted_maturity: Decimal | None = None
    yearly_series: list[SipYearPointSchema]
    scenarios: list[SipScenarioSchema]
    assumptions: list[str]


class GoalWhatIfRequest(BaseModel):
    """Parameters for simulating timeline or contribution changes on a goal."""

    target_amount: Decimal = Field(gt=Decimal("0.00"), le=Decimal("100000000.00"))
    current_saved: Decimal = Field(default=Decimal("0.00"), ge=Decimal("0.00"), le=Decimal("100000000.00"))
    baseline_months: int = Field(ge=1, le=600)
    scenario_months: int = Field(ge=1, le=600)
    baseline_return_pct: Decimal = Field(default=Decimal("0.00"), ge=Decimal("0.00"), le=Decimal("50.00"))
    scenario_return_pct: Decimal = Field(default=Decimal("0.00"), ge=Decimal("0.00"), le=Decimal("50.00"))


class GoalWhatIfResponse(BaseModel):
    """Outcome diff between baseline and scenario goal plans."""

    months_difference: int
    monthly_savings_difference: Decimal
    baseline_required: Decimal
    scenario_required: Decimal
    summary_text: str


class GoalDelayRequest(BaseModel):
    """Parameters for calculating goal days delayed from impulsive purchases."""

    spend_amount: Decimal = Field(gt=Decimal("0.00"), le=Decimal("10000000.00"))
    goal_id: int | None = None
    # If goal_id is omitted, caller may pass planned contribution directly
    monthly_goal_contribution: Decimal | None = Field(default=None, ge=Decimal("0.00"), le=Decimal("10000000.00"))


class GoalDelayResponse(BaseModel):
    """Computed timeline delay caused by discretionary spending."""

    spend_amount: Decimal
    monthly_goal_contribution: Decimal
    daily_goal_rate: Decimal
    days_delayed: Decimal
    goal_name: str | None
    is_valid: bool
    message: str
    assumptions: list[str]

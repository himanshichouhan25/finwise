"""Financial simulation request and response schemas."""

from decimal import Decimal

from pydantic import BaseModel, Field


class SipRequest(BaseModel):
    """Parameters for SIP compound growth projection."""

    monthly_investment: Decimal = Field(gt=Decimal("0.00"), le=Decimal("10000000.00"))
    duration_years: int = Field(ge=1, le=50)
    annual_return_pct: Decimal = Field(ge=Decimal("0.00"), le=Decimal("50.00"))
    annual_step_up_pct: Decimal = Field(default=Decimal("0.00"), ge=Decimal("0.00"), le=Decimal("50.00"))
    annual_inflation_pct: Decimal = Field(default=Decimal("0.00"), ge=Decimal("0.00"), le=Decimal("30.00"))


class SipYearPointSchema(BaseModel):
    year: int
    total_invested: Decimal
    estimated_value: Decimal


class SipScenarioSchema(BaseModel):
    label: str
    annual_return_pct: Decimal
    total_invested: Decimal
    estimated_value: Decimal
    estimated_gain: Decimal


class SipResponse(BaseModel):
    """Results for SIP compound growth projection."""

    monthly_investment: Decimal
    duration_years: int
    annual_return_pct: Decimal
    annual_step_up_pct: Decimal
    annual_inflation_pct: Decimal
    total_invested: Decimal
    estimated_value: Decimal
    estimated_gain: Decimal
    inflation_adjusted_value: Decimal
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

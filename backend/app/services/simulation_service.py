"""Simulation Service.

Stateless simulation orchestrator for SIP growth, Goal What-If scenarios,
and Goal-days Delayed calculations.
"""

from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.engine.goal_delay import calculate_goal_days_delayed
from app.engine.goals import simulate_goal_what_if
from app.engine.sip import calculate_sip
from app.models import Goal
from app.schemas.simulation import (
    GoalDelayRequest,
    GoalDelayResponse,
    GoalWhatIfRequest,
    GoalWhatIfResponse,
    SipRequest,
    SipResponse,
    SipScenarioSchema,
    SipYearPointSchema,
)


def run_sip_simulation(payload: SipRequest) -> SipResponse:
    """Execute SIP compound wealth accumulation calculation."""
    res = calculate_sip(
        monthly_investment=payload.monthly_investment,
        duration_years=payload.duration_years,
        annual_return_pct=payload.annual_return_pct,
        annual_step_up_pct=payload.annual_step_up_pct,
        annual_inflation_pct=payload.annual_inflation_pct,
    )

    yearly_series = [
        SipYearPointSchema(year=pt.year, total_invested=pt.total_invested, estimated_value=pt.estimated_value)
        for pt in res.yearly_series
    ]
    scenarios = [
        SipScenarioSchema(
            label=sc.label,
            scenario_name=sc.label,
            annual_return_pct=sc.annual_return_pct,
            total_invested=sc.total_invested,
            estimated_value=sc.estimated_value,
            maturity_amount=sc.estimated_value,
            estimated_gain=sc.estimated_gain,
            wealth_gained=sc.estimated_gain,
        )
        for sc in res.scenarios
    ]

    return SipResponse(
        monthly_investment=res.monthly_investment,
        duration_years=res.duration_years,
        annual_return_pct=res.annual_return_pct,
        annual_step_up_pct=res.annual_step_up_pct,
        annual_inflation_pct=res.annual_inflation_pct,
        total_invested=res.total_invested,
        estimated_value=res.estimated_value,
        maturity_amount=res.estimated_value,
        estimated_gain=res.estimated_gain,
        wealth_gained=res.estimated_gain,
        inflation_adjusted_value=res.inflation_adjusted_value,
        inflation_adjusted_maturity=res.inflation_adjusted_value,
        yearly_series=yearly_series,
        scenarios=scenarios,
        assumptions=res.assumptions,
    )


def run_goal_what_if(payload: GoalWhatIfRequest) -> GoalWhatIfResponse:
    """Simulate comparative outcome between baseline and altered goal parameters."""
    res = simulate_goal_what_if(
        target_amount=payload.target_amount,
        current_saved=payload.current_saved,
        baseline_months=payload.baseline_months,
        scenario_months=payload.scenario_months,
        baseline_return_pct=payload.baseline_return_pct,
        scenario_return_pct=payload.scenario_return_pct,
    )

    return GoalWhatIfResponse(
        months_difference=res.months_difference,
        monthly_savings_difference=res.monthly_savings_difference,
        baseline_required=res.baseline_plan.required_monthly_savings,
        scenario_required=res.scenario_plan.required_monthly_savings,
        summary_text=res.summary_text,
    )


def run_goal_delay_simulation(db: Session, user_id: int, payload: GoalDelayRequest) -> GoalDelayResponse:
    """Compute timeline setback for an impulsive spend against an active goal."""
    goal_name: str | None = None
    monthly_contribution = payload.monthly_goal_contribution or Decimal("0.00")

    # If goal_id was specified, load planned contribution and name from database
    if payload.goal_id:
        stmt = select(Goal).where(Goal.id == payload.goal_id, Goal.user_id == user_id)
        goal = db.execute(stmt).scalar_one_or_none()
        if goal:
            goal_name = goal.name
            if goal.planned_monthly_contribution and goal.planned_monthly_contribution > Decimal("0.00"):
                monthly_contribution = goal.planned_monthly_contribution

    res = calculate_goal_days_delayed(
        unnecessary_spend=payload.spend_amount,
        monthly_goal_contribution=monthly_contribution,
        goal_name=goal_name,
    )

    return GoalDelayResponse(
        spend_amount=res.spend_amount,
        monthly_goal_contribution=res.monthly_goal_contribution,
        daily_goal_rate=res.daily_goal_rate,
        days_delayed=res.days_delayed,
        goal_name=res.goal_name,
        is_valid=res.is_valid,
        message=res.message,
        assumptions=res.assumptions,
    )

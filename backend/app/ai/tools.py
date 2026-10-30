"""Financial calculation tool schemas and execution dispatcher for AI Coach."""

import logging
from datetime import date
from decimal import Decimal
from typing import Any

from sqlalchemy.orm import Session

from app.engine.goal_delay import calculate_goal_days_delayed
from app.engine.goals import calculate_required_monthly_savings
from app.engine.sip import calculate_sip
from app.schemas.simulation import GoalDelayRequest
from app.services.budget_service import get_budget_summary
from app.services.health_score_service import get_and_snapshot_health_score
from app.services.simulation_service import run_goal_delay_simulation

logger = logging.getLogger("finwise.ai.tools")


def _sanitize_for_json(obj: Any) -> Any:
    """Recursively convert Decimals and dates to JSON-serializable primitives."""
    if isinstance(obj, Decimal):
        return float(obj)
    if isinstance(obj, date):
        return obj.isoformat()
    if isinstance(obj, dict):
        return {k: _sanitize_for_json(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [_sanitize_for_json(v) for v in obj]
    return obj


FINANCIAL_TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "get_budget_summary",
            "description": (
                "Retrieve the user's real financial budget breakdown based on the 50/30/20 rule, "
                "including total monthly income, needs, wants, actual savings, and bucket status."
            ),
            "parameters": {
                "type": "object",
                "properties": {},
                "required": [],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "project_sip",
            "description": (
                "Calculate compound growth of a Systematic Investment Plan (SIP) over a tenure. "
                "Calculates total invested, estimated future wealth, capital gains, and inflation-adjusted value."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "monthly_investment": {
                        "type": "number",
                        "description": "Monthly SIP amount in INR (e.g. 5000)",
                    },
                    "annual_return_pct": {
                        "type": "number",
                        "description": "Expected annual return percentage (e.g. 12.0 for equity index)",
                    },
                    "tenure_years": {
                        "type": "integer",
                        "description": "Investment duration in years (e.g. 10)",
                    },
                    "step_up_pct": {
                        "type": "number",
                        "description": "Annual SIP increment percentage (optional, default 0)",
                    },
                    "inflation_rate_pct": {
                        "type": "number",
                        "description": "Expected annual inflation rate (optional, default 6.0)",
                    },
                },
                "required": ["monthly_investment", "annual_return_pct", "tenure_years"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "plan_goal",
            "description": (
                "Calculate the exact required monthly savings needed to achieve a target goal amount by a target date."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "target_amount": {
                        "type": "number",
                        "description": "Target financial goal amount in INR (e.g. 200000 for emergency fund)",
                    },
                    "target_date": {
                        "type": "string",
                        "description": "Target deadline date in YYYY-MM-DD format (e.g. 2026-12-31)",
                    },
                    "current_savings": {
                        "type": "number",
                        "description": "Already saved amount for this goal in INR (default 0)",
                    },
                    "expected_return_pct": {
                        "type": "number",
                        "description": "Expected annual rate of return (default 0 for short-term goals < 3 years)",
                    },
                },
                "required": ["target_amount", "target_date"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "goal_days_delayed",
            "description": (
                "Calculate how many days an impulse or discretionary spend delays achieving a financial goal "
                "based on the user's daily savings rate."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "spend_amount": {
                        "type": "number",
                        "description": "The expense or purchase amount in INR (e.g. 4500)",
                    },
                    "monthly_contribution": {
                        "type": "number",
                        "description": "Monthly savings allocated towards the goal (optional if goal_id provided)",
                    },
                    "goal_id": {
                        "type": "integer",
                        "description": "Optional specific existing goal ID to calculate delay against",
                    },
                },
                "required": ["spend_amount"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_health_score",
            "description": (
                "Retrieve the user's comprehensive 0-100 financial health score, grade, and factor breakdowns "
                "(savings rate, emergency fund adequacy, budget adherence, goal progress, and investment ratio)."
            ),
            "parameters": {
                "type": "object",
                "properties": {},
                "required": [],
            },
        },
    },
]


def execute_tool(
    name: str,
    arguments: dict[str, Any],
    user_id: int,
    db: Session,
) -> dict[str, Any]:
    """Execute a recognized financial calculation tool and return structured results."""
    logger.info("Executing tool '%s' for user %d with args %s", name, user_id, arguments)
    try:
        if name == "get_budget_summary":
            summary = get_budget_summary(db=db, user_id=user_id)
            return _sanitize_for_json(summary.model_dump())

        elif name == "project_sip":
            monthly_inv = Decimal(str(arguments.get("monthly_investment", 0)))
            annual_ret = Decimal(str(arguments.get("annual_return_pct", 12.0)))
            tenure = int(arguments.get("tenure_years", 10))
            step_up = Decimal(str(arguments.get("step_up_pct", 0)))
            inflation = Decimal(str(arguments.get("inflation_rate_pct", 6.0)))

            result = calculate_sip(
                monthly_investment=monthly_inv,
                annual_return_pct=annual_ret,
                tenure_years=tenure,
                step_up_pct=step_up,
                inflation_rate_pct=inflation,
            )
            return {
                "monthly_investment": float(result.monthly_investment),
                "total_invested": float(result.total_invested),
                "wealth_gained": float(result.wealth_gained),
                "expected_maturity_amount": float(result.expected_maturity_amount),
                "inflation_adjusted_amount": float(result.inflation_adjusted_amount),
                "tenure_years": result.tenure_years,
                "annual_return_pct": float(result.annual_return_pct),
            }

        elif name == "plan_goal":
            target_amount = Decimal(str(arguments.get("target_amount", 0)))
            target_date_str = str(arguments.get("target_date", ""))
            target_date_obj = date.fromisoformat(target_date_str)
            current_savings = Decimal(str(arguments.get("current_savings", 0)))
            expected_ret = Decimal(str(arguments.get("expected_return_pct", 0)))

            plan = calculate_required_monthly_savings(
                target_amount=target_amount,
                target_date=target_date_obj,
                current_savings=current_savings,
                expected_annual_return_pct=expected_ret,
            )
            return {
                "target_amount": float(plan.target_amount),
                "remaining_amount": float(plan.remaining_amount),
                "months_remaining": plan.months_remaining,
                "required_monthly_savings": float(plan.required_monthly_savings),
                "is_achieved": plan.is_achieved,
                "is_expired": plan.is_expired,
            }

        elif name == "goal_days_delayed":
            spend_amount = Decimal(str(arguments.get("spend_amount", 0)))
            goal_id = arguments.get("goal_id")
            monthly_contrib = arguments.get("monthly_contribution")

            if monthly_contrib is not None and goal_id is None:
                delay = calculate_goal_days_delayed(
                    unnecessary_spend=spend_amount,
                    monthly_goal_contribution=Decimal(str(monthly_contrib)),
                )
                return {
                    "spend_amount": float(spend_amount),
                    "days_delayed": delay.days_delayed,
                    "daily_goal_rate": float(delay.daily_goal_rate),
                    "insight_message": delay.message,
                }
            else:
                payload = GoalDelayRequest(
                    spend_amount=spend_amount,
                    goal_id=int(goal_id) if goal_id is not None else None,
                    monthly_goal_contribution=Decimal(str(monthly_contrib)) if monthly_contrib is not None else None,
                )
                sim = run_goal_delay_simulation(db=db, user_id=user_id, payload=payload)
                return _sanitize_for_json(sim.model_dump())

        elif name == "get_health_score":
            score_data = get_and_snapshot_health_score(db=db, user_id=user_id)
            return _sanitize_for_json(score_data.model_dump())

        else:
            return {"error": f"Tool '{name}' is not supported."}

    except Exception as e:
        logger.exception("Error executing financial tool '%s': %s", name, str(e))
        return {"error": f"Failed to compute tool '{name}': {str(e)}"}

"""Financial calculation tool schemas and execution dispatcher for AI Coach."""

import logging
from datetime import date
from decimal import Decimal
from typing import Any

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.engine.goal_delay import calculate_goal_days_delayed
from app.engine.goals import calculate_required_monthly_savings
from app.engine.sip import calculate_sip
from app.schemas.simulation import GoalDelayRequest
from app.services.budget_service import get_budget_summary
from app.services.health_score_service import get_and_snapshot_health_score
from app.services.loan_service import (
    get_loans,
    get_prioritization_strategy,
    simulate_loan_prepayment,
)
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
                "Calculate required monthly savings, projected savings timeline, or reality-check feasibility to reach a financial goal "
                "(e.g. car, vacation, emergency fund, house). Can automatically look up user's saved goals if name/hint is provided."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "goal_name": {
                        "type": "string",
                        "description": "Name or keyword of the user's goal (e.g. 'thar', 'car', 'emergency')",
                    },
                    "target_amount": {
                        "type": "number",
                        "description": "Target financial goal amount in INR (e.g. 1700000)",
                    },
                    "target_date": {
                        "type": "string",
                        "description": "Target deadline date in YYYY-MM-DD format (e.g. 2028-01-01)",
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
                "required": [],
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
    {
        "type": "function",
        "function": {
            "name": "get_user_loans",
            "description": (
                "Retrieve user's active loans, total outstanding debt, monthly EMI obligations, "
                "interest rates, total interest paid so far, and remaining installments."
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
            "name": "simulate_loan_prepayment",
            "description": (
                "Simulate the financial impact of paying an extra monthly amount towards a loan. "
                "Calculates how many months are shaved off the tenure and how much total interest is saved."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "loan_id": {
                        "type": "integer",
                        "description": "ID of the loan to prepay",
                    },
                    "extra_monthly_amount": {
                        "type": "number",
                        "description": "Additional amount paid each month beyond the regular EMI (e.g. 2000)",
                    },
                },
                "required": ["loan_id", "extra_monthly_amount"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "prioritize_loans",
            "description": (
                "Compare Debt Avalanche (highest interest rate first) and Debt Snowball (lowest balance first) "
                "payoff strategies for all user loans, with mathematical and behavioral rationales."
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
            raw_tenure = arguments.get("duration_years", arguments.get("tenure_years", 10))
            try:
                tenure = int(raw_tenure)
            except (ValueError, TypeError):
                tenure = 10
            step_up = Decimal(str(arguments.get("annual_step_up_pct", arguments.get("step_up_pct", 0))))
            inflation = Decimal(str(arguments.get("annual_inflation_pct", arguments.get("inflation_rate_pct", 6.0))))

            result = calculate_sip(
                monthly_investment=monthly_inv,
                duration_years=tenure,
                annual_return_pct=annual_ret,
                annual_step_up_pct=step_up,
                annual_inflation_pct=inflation,
            )
            return {
                "monthly_investment": float(result.monthly_investment),
                "total_invested": float(result.total_invested),
                "wealth_gained": float(result.estimated_gain),
                "expected_maturity_amount": float(result.estimated_value),
                "inflation_adjusted_amount": float(result.inflation_adjusted_value),
                "tenure_years": result.duration_years,
                "annual_return_pct": float(result.annual_return_pct),
            }

        elif name == "plan_goal":
            goal_name_hint = str(arguments.get("goal_name", "")).strip().lower()
            raw_target_amount = arguments.get("target_amount")
            raw_target_date = str(arguments.get("target_date", "")).strip()

            from app.models.goal import Goal
            found_goal = None
            if db and user_id:
                user_goals = db.scalars(select(Goal).where(Goal.user_id == user_id)).all()
                if goal_name_hint:
                    found_goal = next((g for g in user_goals if goal_name_hint in g.name.lower()), None)
                if not found_goal and (not raw_target_amount or not raw_target_date):
                    found_goal = user_goals[0] if user_goals else None

            if found_goal:
                target_amount = found_goal.target_amount
                target_date_str = found_goal.target_date.isoformat() if found_goal.target_date else "2028-01-01"
                current_savings = found_goal.current_saved
                goal_title = found_goal.name
                planned_monthly = float(found_goal.planned_monthly_contribution or 0)
            else:
                goal_title = goal_name_hint or "Target Goal"
                target_amount = Decimal(str(raw_target_amount or 100000))
                target_date_str = raw_target_date or "2028-01-01"
                current_savings = Decimal(str(arguments.get("current_savings", 0)))
                planned_monthly = float(arguments.get("planned_monthly_contribution", 0))

            try:
                target_date_obj = date.fromisoformat(target_date_str)
            except Exception:
                target_date_obj = date(2028, 1, 1)

            today = date.today()
            months_to_deadline = max(1, (target_date_obj.year - today.year) * 12 + (target_date_obj.month - today.month))
            is_expired = target_date_obj <= today

            expected_ret = Decimal(str(arguments.get("expected_return_pct", 0)))

            plan = calculate_required_monthly_savings(
                target_amount=target_amount,
                current_saved=current_savings,
                months_to_deadline=months_to_deadline,
                annual_return_pct=expected_ret,
            )
            req_monthly = float(plan.required_monthly_savings)
            projected = float(current_savings) + (planned_monthly * months_to_deadline)
            is_unfeasible = planned_monthly < req_monthly * 0.75 if req_monthly > 0 else False

            return {
                "goal_name": goal_title,
                "target_amount": float(plan.target_amount),
                "current_saved": float(current_savings),
                "remaining_amount": float(plan.remaining_amount),
                "months_remaining": months_to_deadline,
                "planned_monthly": planned_monthly,
                "required_monthly_savings": req_monthly,
                "projected_saved_by_deadline": projected,
                "feasibility_assessment": "Severe Shortfall Alert" if is_unfeasible else "On Track",
                "reality_check_advice": (
                    f"Aap abhi ₹{planned_monthly:,.0f}/month save kar rahe ho, jisse {target_date_str} tak sirf ₹{projected:,.0f} hi judenge (shortfall of ₹{float(plan.remaining_amount) - (planned_monthly * months_to_deadline):,.0f}). "
                    f"Is goal ko time par achieve karne ke liye aapko ₹{req_monthly:,.0f}/month save karna padega (until unless koi sudden huge fund ya windfall na aaye)."
                    if is_unfeasible else
                    f"Aapka goal planned monthly savings se achievable hai."
                ),
                "is_achieved": plan.is_achieved,
                "is_expired": is_expired,
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

        elif name == "get_user_loans":
            loans_summary = get_loans(db=db, user_id=user_id)
            return _sanitize_for_json(loans_summary.model_dump())

        elif name == "simulate_loan_prepayment":
            loan_id = int(arguments.get("loan_id", 0))
            extra_amount = Decimal(str(arguments.get("extra_monthly_amount", 0)))
            sim_res = simulate_loan_prepayment(
                db=db,
                user_id=user_id,
                loan_id=loan_id,
                extra_monthly_amount=extra_amount,
            )
            return _sanitize_for_json(sim_res.model_dump())

        elif name == "prioritize_loans":
            prio_res = get_prioritization_strategy(db=db, user_id=user_id)
            return _sanitize_for_json(prio_res.model_dump())

        else:
            return {"error": f"Tool '{name}' is not supported."}

    except Exception as e:
        logger.exception("Error executing financial tool '%s': %s", name, str(e))
        return {"error": f"Failed to compute tool '{name}': {str(e)}"}

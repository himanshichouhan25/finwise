"""Savings Goals Planning and What-If Simulation Engine.

Computes required monthly savings, projected goal completion timelines,
and what-if scenario diffs.

Formulas:
- Zero return (R = 0): Required = (Target - Saved) / Months
- With return (R > 0): Required = (Target - Saved*(1+i)^m) * i / (((1+i)^m - 1) * (1+i))
- Months to goal:
    - If R = 0: ceil((Target - Saved) / Monthly Contribution)
    - If R > 0: ceil(ln((Target + c*(1+i)/i) / (Saved + c*(1+i)/i)) / ln(1+i))
"""

import math
from dataclasses import dataclass, field
from decimal import ROUND_CEILING, ROUND_HALF_UP, Decimal


@dataclass(frozen=True)
class GoalPlanResult:
    """Computed plan to reach a financial goal."""

    target_amount: Decimal
    current_saved: Decimal
    remaining_amount: Decimal
    target_months: int
    annual_return_pct: Decimal
    required_monthly_savings: Decimal
    is_achieved: bool
    is_on_track: bool
    assumptions: list[str] = field(
        default_factory=lambda: [
            "Contributions are made at the start of each month (annuity due).",
            "Returns compound monthly when an investment rate is specified.",
            "Short-term goals (<12 months) default to 0% return for capital protection.",
        ]
    )


@dataclass(frozen=True)
class GoalTimelineResult:
    """Estimated months and completion date for a given monthly contribution."""

    target_amount: Decimal
    current_saved: Decimal
    monthly_contribution: Decimal
    annual_return_pct: Decimal
    estimated_months: int | None
    is_reachable: bool
    assumptions: list[str] = field(
        default_factory=lambda: [
            "Assumes monthly contribution continues uninterrupted.",
            "Months are rounded up to the next full month.",
        ]
    )


@dataclass(frozen=True)
class GoalWhatIfResult:
    """Comparative outcome between baseline and adjusted scenario."""

    baseline_plan: GoalPlanResult
    scenario_plan: GoalPlanResult
    months_difference: int  # scenario_months - baseline_months (negative means faster)
    monthly_savings_difference: Decimal  # scenario_req - baseline_req
    summary_text: str


def calculate_required_monthly_savings(
    target_amount: Decimal,
    current_saved: Decimal,
    months_to_deadline: int,
    annual_return_pct: Decimal = Decimal("0.00"),
) -> GoalPlanResult:
    """Calculate the required monthly contribution to hit a savings goal."""
    two_dec = Decimal("0.01")
    target = max(Decimal("0.00"), target_amount)
    saved = max(Decimal("0.00"), current_saved)
    months = max(1, months_to_deadline)

    if saved >= target:
        return GoalPlanResult(
            target_amount=target,
            current_saved=saved,
            remaining_amount=Decimal("0.00"),
            target_months=months,
            annual_return_pct=Decimal("0.00"),
            required_monthly_savings=Decimal("0.00"),
            is_achieved=True,
            is_on_track=True,
        )

    remaining = (target - saved).quantize(two_dec, rounding=ROUND_HALF_UP)

    # For short-term goals (< 12 months), market returns should not be assumed
    effective_rate_pct = Decimal("0.00") if months < 12 else max(Decimal("0.00"), annual_return_pct)

    if effective_rate_pct <= Decimal("0.00"):
        # Zero return formula: (T - S) / m
        req_monthly = (remaining / Decimal(months)).quantize(two_dec, rounding=ROUND_HALF_UP)
    else:
        # Effective monthly rate
        r_float = float(effective_rate_pct) / 100.0
        i_monthly = (1.0 + r_float) ** (1.0 / 12.0) - 1.0
        t_float = float(target)
        s_float = float(saved)
        m_int = months

        # Formula: (T - S*(1+i)^m) * i / (((1+i)^m - 1) * (1+i))
        compound_factor = (1.0 + i_monthly) ** m_int
        numerator = (t_float - s_float * compound_factor) * i_monthly
        denominator = (compound_factor - 1.0) * (1.0 + i_monthly)

        req_float = numerator / denominator if denominator > 0 else float(remaining) / m_int
        req_monthly = Decimal(str(max(0.0, round(req_float, 2)))).quantize(two_dec, rounding=ROUND_HALF_UP)

    assumptions = [
        "Contributions are deposited at the start of each month (annuity due).",
        "Returns compound monthly when an investment return rate is specified.",
    ]
    if months < 12 and annual_return_pct > Decimal("0.00"):
        assumptions.append(
            f"Note: Assumed return reduced to 0% because the goal duration ({months}m) is under 12 months for capital safety."
        )

    return GoalPlanResult(
        target_amount=target,
        current_saved=saved,
        remaining_amount=remaining,
        target_months=months,
        annual_return_pct=effective_rate_pct,
        required_monthly_savings=req_monthly,
        is_achieved=False,
        is_on_track=True,
        assumptions=assumptions,
    )


def calculate_months_to_goal(
    target_amount: Decimal,
    current_saved: Decimal,
    monthly_contribution: Decimal,
    annual_return_pct: Decimal = Decimal("0.00"),
) -> GoalTimelineResult:
    """Calculate the number of months required to reach target amount."""
    target = max(Decimal("0.00"), target_amount)
    saved = max(Decimal("0.00"), current_saved)
    contrib = max(Decimal("0.00"), monthly_contribution)

    if saved >= target:
        return GoalTimelineResult(
            target_amount=target,
            current_saved=saved,
            monthly_contribution=contrib,
            annual_return_pct=annual_return_pct,
            estimated_months=0,
            is_reachable=True,
        )

    if contrib <= Decimal("0.00"):
        return GoalTimelineResult(
            target_amount=target,
            current_saved=saved,
            monthly_contribution=contrib,
            annual_return_pct=annual_return_pct,
            estimated_months=None,
            is_reachable=False,
        )

    remaining = target - saved
    r_float = float(annual_return_pct) / 100.0

    if r_float <= 0.0:
        # Zero return: ceil(remaining / contrib)
        months_dec = (remaining / contrib).quantize(Decimal("1"), rounding=ROUND_CEILING)
        months = int(months_dec)
    else:
        i_monthly = (1.0 + r_float) ** (1.0 / 12.0) - 1.0
        t_f = float(target)
        s_f = float(saved)
        c_f = float(contrib)

        # Annuity due compounding formula
        # n = ln((T + c(1+i)/i) / (S + c(1+i)/i)) / ln(1+i)
        growth_step = c_f * (1.0 + i_monthly) / i_monthly
        numerator = math.log((t_f + growth_step) / (s_f + growth_step))
        denominator = math.log(1.0 + i_monthly)
        months = math.ceil(numerator / denominator)

    return GoalTimelineResult(
        target_amount=target,
        current_saved=saved,
        monthly_contribution=contrib,
        annual_return_pct=annual_return_pct,
        estimated_months=months,
        is_reachable=True,
    )


def simulate_goal_what_if(
    target_amount: Decimal,
    current_saved: Decimal,
    baseline_months: int,
    scenario_months: int,
    baseline_return_pct: Decimal = Decimal("0.00"),
    scenario_return_pct: Decimal = Decimal("0.00"),
) -> GoalWhatIfResult:
    """Compare baseline savings plan against an alternate scenario."""
    base_plan = calculate_required_monthly_savings(target_amount, current_saved, baseline_months, baseline_return_pct)
    scen_plan = calculate_required_monthly_savings(target_amount, current_saved, scenario_months, scenario_return_pct)

    months_diff = scenario_months - baseline_months
    req_diff = scen_plan.required_monthly_savings - base_plan.required_monthly_savings

    if months_diff < 0:
        summary = (
            f"Shortening your timeline by {abs(months_diff)} months requires increasing monthly savings by ₹{req_diff:,.2f}."
        )
    elif months_diff > 0:
        summary = (
            f"Extending your timeline by {months_diff} months lowers your required monthly savings by ₹{abs(req_diff):,.2f}."
        )
    else:
        summary = (
            f"At the same timeline, return adjustment shifts required monthly savings by ₹{req_diff:,.2f}."
        )

    return GoalWhatIfResult(
        baseline_plan=base_plan,
        scenario_plan=scen_plan,
        months_difference=months_diff,
        monthly_savings_difference=req_diff,
        summary_text=summary,
    )

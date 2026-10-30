"""Goal-days Delayed Calculation Engine.

Calculates the timeline penalty of an impulsive or discretionary spend against
an active savings goal.

Formulas:
- Daily Goal Rate = Monthly Goal Contribution / 30
- Days Delayed = Unnecessary Spend / Daily Goal Rate

Example Reference Vector:
- ₹3,000 spend with ₹6,000/month contribution -> ₹200/day -> 15 days delayed.
"""

from dataclasses import dataclass, field
from decimal import ROUND_HALF_UP, Decimal


@dataclass(frozen=True)
class GoalDelayResult:
    """Computed timeline delay caused by discretionary spending."""

    spend_amount: Decimal
    monthly_goal_contribution: Decimal
    daily_goal_rate: Decimal
    days_delayed: Decimal
    goal_name: str | None
    is_valid: bool
    message: str
    assumptions: list[str] = field(
        default_factory=lambda: [
            "Calculation assumes a standard 30-day month.",
            "Based on your currently planned monthly savings rate for this goal.",
            "Investment growth is excluded to reflect the immediate cash flow impact.",
        ]
    )


def calculate_goal_days_delayed(
    unnecessary_spend: Decimal,
    monthly_goal_contribution: Decimal,
    goal_name: str | None = None,
) -> GoalDelayResult:
    """Calculate the number of days a goal is delayed by a discretionary purchase.

    Guards against zero or negative contribution without throwing ZeroDivisionError.
    """
    two_dec = Decimal("0.01")
    one_dec = Decimal("0.1")
    spend = max(Decimal("0.00"), unnecessary_spend)
    contrib = max(Decimal("0.00"), monthly_goal_contribution)

    if contrib <= Decimal("0.00"):
        return GoalDelayResult(
            spend_amount=spend,
            monthly_goal_contribution=Decimal("0.00"),
            daily_goal_rate=Decimal("0.00"),
            days_delayed=Decimal("0.0"),
            goal_name=goal_name,
            is_valid=False,
            message="Please configure an active monthly contribution for this goal first.",
        )

    # Standard 30-day month rate
    daily_rate = (contrib / Decimal("30")).quantize(two_dec, rounding=ROUND_HALF_UP)

    if daily_rate <= Decimal("0.00"):
        days_delayed = Decimal("0.0")
    else:
        days_delayed = (spend / daily_rate).quantize(one_dec, rounding=ROUND_HALF_UP)

    g_label = f"'{goal_name}'" if goal_name else "your goal"
    msg = (
        f"Spending ₹{spend:,.2f} sets back {g_label} by approximately {days_delayed} days "
        f"(based on your ₹{daily_rate:,.2f}/day savings rate)."
    )

    return GoalDelayResult(
        spend_amount=spend,
        monthly_goal_contribution=contrib,
        daily_goal_rate=daily_rate,
        days_delayed=days_delayed,
        goal_name=goal_name,
        is_valid=True,
        message=msg,
    )

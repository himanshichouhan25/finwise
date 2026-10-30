"""Financial Health Score (0-100) Engine.

Evaluates user financial stability across 5 weighted factors:
1. Savings Rate (25 pts): >=20% gets full marks, linear below.
2. Emergency Fund Coverage (25 pts): >=6 months essential needs (3m for fixed income).
3. Needs Ratio (20 pts): <=50% gets full marks, declining linearly to 0 at 80%.
4. Wants Discipline (15 pts): <=30% gets full marks, declining linearly to 0 at 50%.
5. Goal Progress (15 pts): Ratio of active goals on track; excluded if no goals exist.

Rescaling Rule:
- Any factor marked 'insufficient_data' is excluded and remaining weights are rescaled
  to ensure the score is always evaluated out of 100 without penalizing missing data.
"""

from dataclasses import dataclass, field
from decimal import ROUND_HALF_UP, Decimal


@dataclass(frozen=True)
class FactorScore:
    """Detailed score breakdown for an individual health factor."""

    name: str
    points: Decimal
    max_points: Decimal
    has_data: bool
    explanation: str
    improvement_tip: str


@dataclass(frozen=True)
class HealthScoreResult:
    """Aggregate Financial Health Score result."""

    score: int  # 0 to 100
    band: str  # 'Needs attention' | 'Building' | 'Healthy' | 'Strong'
    factors: list[FactorScore]
    assumptions: list[str] = field(
        default_factory=lambda: [
            "Financial health score is an educational metric, not a credit score.",
            "Evaluated across savings rate, emergency buffer, budget ratios, and goal discipline.",
            "Missing factors are excluded and remaining factors rescaled to maintain a 100-point basis.",
        ]
    )


def compute_health_score(
    net_income: Decimal,
    needs_spent: Decimal,
    wants_spent: Decimal,
    savings_spent: Decimal,
    emergency_fund_saved: Decimal,
    active_goals_count: int = 0,
    goals_on_track_count: int = 0,
    is_fixed_income: bool = True,
) -> HealthScoreResult:
    """Calculate the 0-100 Financial Health Score with factor breakdowns and rescaling."""
    two_dec = Decimal("0.01")
    factors: list[FactorScore] = []

    has_income = net_income > Decimal("0.00")

    # 1. Savings Rate (Max 25)
    if has_income:
        savings_ratio = savings_spent / net_income
        if savings_ratio >= Decimal("0.20"):
            s_pts = Decimal("25.00")
        else:
            s_pts = max(Decimal("0.00"), (savings_ratio / Decimal("0.20")) * Decimal("25.00"))
        s_pts = s_pts.quantize(two_dec, rounding=ROUND_HALF_UP)
        pct_str = (savings_ratio * Decimal("100")).quantize(two_dec)
        factors.append(
            FactorScore(
                name="Savings Rate",
                points=s_pts,
                max_points=Decimal("25.00"),
                has_data=True,
                explanation=f"You are saving {pct_str}% of your net income (Target: 20%+).",
                improvement_tip="Aim to route at least 20% of income directly into savings or index SIP on payday.",
            )
        )
    else:
        factors.append(
            FactorScore(
                name="Savings Rate",
                points=Decimal("0.00"),
                max_points=Decimal("25.00"),
                has_data=False,
                explanation="No income recorded for this period.",
                improvement_tip="Record income to measure your monthly savings rate.",
            )
        )

    # 2. Emergency Fund Coverage (Max 25)
    # Target: 3 months for fixed income, 6 months for irregular/gig
    target_months = Decimal("3.0") if is_fixed_income else Decimal("6.0")
    monthly_needs = needs_spent if needs_spent > Decimal("0.00") else (net_income * Decimal("0.50") if has_income else Decimal("0.00"))

    if monthly_needs > Decimal("0.00"):
        months_covered = emergency_fund_saved / monthly_needs
        if months_covered >= target_months:
            e_pts = Decimal("25.00")
        else:
            e_pts = max(Decimal("0.00"), (months_covered / target_months) * Decimal("25.00"))
        e_pts = e_pts.quantize(two_dec, rounding=ROUND_HALF_UP)
        m_cov_str = months_covered.quantize(Decimal("0.1"))
        factors.append(
            FactorScore(
                name="Emergency Fund",
                points=e_pts,
                max_points=Decimal("25.00"),
                has_data=True,
                explanation=f"Your emergency fund covers {m_cov_str} months of essential needs (Target: {target_months}m).",
                improvement_tip=f"Build liquid reserves until you have at least {target_months} months of mandatory needs parked safely.",
            )
        )
    else:
        factors.append(
            FactorScore(
                name="Emergency Fund",
                points=Decimal("0.00"),
                max_points=Decimal("25.00"),
                has_data=False,
                explanation="Essential spending data is required to benchmark emergency buffer.",
                improvement_tip="Log essential living expenses to determine your target emergency runway.",
            )
        )

    # 3. Needs Ratio (Max 20)
    # Full marks (20) at <=50%, declining linearly to 0 at 80%
    if has_income:
        needs_ratio = needs_spent / net_income
        if needs_ratio <= Decimal("0.50"):
            n_pts = Decimal("20.00")
        elif needs_ratio >= Decimal("0.80"):
            n_pts = Decimal("0.00")
        else:
            # Linear decline from 50% to 80%
            fraction = (Decimal("0.80") - needs_ratio) / Decimal("0.30")
            n_pts = (fraction * Decimal("20.00")).quantize(two_dec, rounding=ROUND_HALF_UP)
        n_pct = (needs_ratio * Decimal("100")).quantize(two_dec)
        factors.append(
            FactorScore(
                name="Needs Ratio",
                points=n_pts,
                max_points=Decimal("20.00"),
                has_data=True,
                explanation=f"Mandatory needs account for {n_pct}% of income (Budget threshold: <=50%).",
                improvement_tip="Keep essential overhead below 50% so you retain buffer for savings and unexpected bills.",
            )
        )
    else:
        factors.append(
            FactorScore(
                name="Needs Ratio",
                points=Decimal("0.00"),
                max_points=Decimal("20.00"),
                has_data=False,
                explanation="No income recorded to benchmark needs ratio.",
                improvement_tip="Add income to track what proportion goes toward mandatory bills.",
            )
        )

    # 4. Wants Discipline (Max 15)
    # Full marks (15) at <=30%, declining linearly to 0 at 50%
    if has_income:
        wants_ratio = wants_spent / net_income
        if wants_ratio <= Decimal("0.30"):
            w_pts = Decimal("15.00")
        elif wants_ratio >= Decimal("0.50"):
            w_pts = Decimal("0.00")
        else:
            # Linear decline from 30% to 50%
            fraction = (Decimal("0.50") - wants_ratio) / Decimal("0.20")
            w_pts = (fraction * Decimal("15.00")).quantize(two_dec, rounding=ROUND_HALF_UP)
        w_pct = (wants_ratio * Decimal("100")).quantize(two_dec)
        factors.append(
            FactorScore(
                name="Wants Discipline",
                points=w_pts,
                max_points=Decimal("15.00"),
                has_data=True,
                explanation=f"Lifestyle & discretionary spending is {w_pct}% of income (Ceiling: 30%).",
                improvement_tip="Review impulsive buys or subscriptions if discretionary spend creeps over 30%.",
            )
        )
    else:
        factors.append(
            FactorScore(
                name="Wants Discipline",
                points=Decimal("0.00"),
                max_points=Decimal("15.00"),
                has_data=False,
                explanation="No income recorded to benchmark wants ratio.",
                improvement_tip="Add income to monitor lifestyle spending limits.",
            )
        )

    # 5. Goal Progress (Max 15)
    # Ratio of active goals on track; insufficient data if 0 goals exist
    if active_goals_count > 0:
        ratio_on_track = Decimal(min(active_goals_count, goals_on_track_count)) / Decimal(active_goals_count)
        g_pts = (ratio_on_track * Decimal("15.00")).quantize(two_dec, rounding=ROUND_HALF_UP)
        factors.append(
            FactorScore(
                name="Goal Progress",
                points=g_pts,
                max_points=Decimal("15.00"),
                has_data=True,
                explanation=f"{goals_on_track_count} of {active_goals_count} savings goals are on track.",
                improvement_tip="Keep contributions steady to prevent delay in your financial milestones.",
            )
        )
    else:
        factors.append(
            FactorScore(
                name="Goal Progress",
                points=Decimal("0.00"),
                max_points=Decimal("15.00"),
                has_data=False,
                explanation="No active savings goals recorded yet.",
                improvement_tip="Set up at least one financial goal (e.g., laptop, emergency fund) to earn goal points.",
            )
        )

    # Rescaling Logic
    valid_factors = [f for f in factors if f.has_data]
    if valid_factors:
        total_earned = sum(f.points for f in valid_factors)
        total_possible = sum(f.max_points for f in valid_factors)
        # Rescale proportionally to 100 points basis
        raw_score = (total_earned / total_possible) * Decimal("100")
        final_score = int(raw_score.quantize(Decimal("1"), rounding=ROUND_HALF_UP))
        final_score = max(0, min(100, final_score))
    else:
        final_score = 50  # Neutral baseline when zero data exists

    # Score Bands per Blueprint Section 7.5
    if final_score < 40:
        band = "Needs attention"
    elif final_score < 60:
        band = "Building"
    elif final_score < 80:
        band = "Healthy"
    else:
        band = "Strong"

    return HealthScoreResult(
        score=final_score,
        band=band,
        factors=factors,
    )

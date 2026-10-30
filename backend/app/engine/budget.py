"""50/30/20 Budget Calculation Engine.

Pure Python implementation of the 50/30/20 budget framework:
- Needs: 50% of net monthly income
- Wants: 30% of net monthly income
- Savings: 20% of net monthly income

Formulas:
- Target = Net Monthly Income * Target Percentage
- Variance = Actual - Target
- Status = 'within' if Actual <= Target else 'over'
"""

from dataclasses import dataclass, field
from decimal import ROUND_HALF_UP, Decimal

# Default category to 50/30/20 bucket mapping per Blueprint Section 5
DEFAULT_CATEGORY_BUCKET_MAP: dict[str, str] = {
    # Needs (50%)
    "rent": "needs",
    "hostel": "needs",
    "pg": "needs",
    "groceries": "needs",
    "food staples": "needs",
    "utilities": "needs",
    "electricity": "needs",
    "water": "needs",
    "wi-fi": "needs",
    "internet": "needs",
    "transport": "needs",
    "fuel": "needs",
    "metro": "needs",
    "bus": "needs",
    "health": "needs",
    "medical": "needs",
    "medicine": "needs",
    "education": "needs",
    "tuition": "needs",
    "books": "needs",
    "minimum debt payments": "needs",
    "loan emi": "needs",
    # Wants (30%)
    "dining out": "wants",
    "ordering food": "wants",
    "cafeteria": "wants",
    "entertainment": "wants",
    "movies": "wants",
    "shopping": "wants",
    "clothing": "wants",
    "subscriptions": "wants",
    "streaming": "wants",
    "travel": "wants",
    "vacation": "wants",
    "gadgets": "wants",
    "gaming": "wants",
    # Savings (20%)
    "sip": "savings",
    "mutual funds": "savings",
    "investments": "savings",
    "emergency fund": "savings",
    "savings deposit": "savings",
    "fixed deposit": "savings",
    "gold": "savings",
}


@dataclass(frozen=True)
class BucketMetric:
    """Computed metrics for a single 50/30/20 budget bucket."""

    bucket: str
    target_pct: Decimal
    target_amount: Decimal
    actual_amount: Decimal
    variance: Decimal  # actual - target (positive = overspent, negative = underspent)
    percent_of_income: Decimal
    status: str  # 'within' | 'over'


@dataclass(frozen=True)
class BudgetSummaryResult:
    """Complete budget summary calculation output."""

    net_income: Decimal
    total_expenses: Decimal
    net_savings: Decimal
    needs: BucketMetric
    wants: BucketMetric
    savings: BucketMetric
    suggestions: list[str]
    assumptions: list[str] = field(
        default_factory=lambda: [
            "Targets are derived using the 50/30/20 allocation framework.",
            "Needs encompass mandatory living obligations, food staples, and shelter.",
            "Wants encompass discretionary lifestyle spending, dining out, and entertainment.",
            "Savings encompass investments, debt prepayments, and emergency fund deposits.",
        ]
    )


def resolve_bucket(category: str, user_override: str | None = None) -> str:
    """Resolve expense bucket from user override or default category mapping."""
    if user_override and user_override.lower() in {"needs", "wants", "savings"}:
        return user_override.lower()

    clean_category = category.strip().lower()
    for cat_key, bucket in DEFAULT_CATEGORY_BUCKET_MAP.items():
        if cat_key in clean_category:
            return bucket

    return "wants"  # Default unmapped categories conservatively to wants


def calculate_budget_summary(
    net_income: Decimal,
    needs_spent: Decimal,
    wants_spent: Decimal,
    savings_spent: Decimal,
    persona: str = "first_job",
) -> BudgetSummaryResult:
    """Compute 50/30/20 budget breakdown and deterministic suggestions.

    Handles zero/negative income safely without division by zero.
    """
    safe_income = max(Decimal("0.00"), net_income)
    two_dec = Decimal("0.01")

    # Target allocations
    needs_target = (safe_income * Decimal("0.50")).quantize(two_dec, rounding=ROUND_HALF_UP)
    wants_target = (safe_income * Decimal("0.30")).quantize(two_dec, rounding=ROUND_HALF_UP)
    savings_target = (safe_income * Decimal("0.20")).quantize(two_dec, rounding=ROUND_HALF_UP)

    total_expenses = (needs_spent + wants_spent + savings_spent).quantize(two_dec, rounding=ROUND_HALF_UP)
    net_savings = (safe_income - (needs_spent + wants_spent)).quantize(two_dec, rounding=ROUND_HALF_UP)

    def build_metric(bucket: str, target_pct: Decimal, target: Decimal, actual: Decimal) -> BucketMetric:
        variance = (actual - target).quantize(two_dec, rounding=ROUND_HALF_UP)
        pct_of_income = (
            ((actual / safe_income) * Decimal("100")).quantize(two_dec, rounding=ROUND_HALF_UP)
            if safe_income > Decimal("0.00")
            else Decimal("0.00")
        )
        status = "over" if actual > target else "within"
        return BucketMetric(
            bucket=bucket,
            target_pct=target_pct,
            target_amount=target,
            actual_amount=actual,
            variance=variance,
            percent_of_income=pct_of_income,
            status=status,
        )

    needs_metric = build_metric("needs", Decimal("50.00"), needs_target, needs_spent)
    wants_metric = build_metric("wants", Decimal("30.00"), wants_target, wants_spent)
    savings_metric = build_metric("savings", Decimal("20.00"), savings_target, savings_spent)

    # Generate deterministic rule-based suggestions
    suggestions: list[str] = []

    if safe_income <= Decimal("0.00"):
        suggestions.append("Record this month's income to unlock personalized 50/30/20 targets.")
    else:
        # Wants analysis
        if wants_metric.status == "over":
            overage = wants_metric.variance
            suggestions.append(
                f"Wants spending is ₹{overage:,.2f} ({wants_metric.percent_of_income}%) above the 30% target. "
                f"Trimming ₹{overage:,.2f}/month on dining or shopping brings you back to a balanced 30%."
            )
        else:
            suggestions.append("Discretionary spending is well disciplined within your 30% wants limit.")

        # Needs analysis
        if needs_metric.status == "over":
            suggestions.append(
                f"Needs take up {needs_metric.percent_of_income}% of income (target: 50%). "
                "Consider reviewing fixed recurring utilities or rent overhead."
            )

        # Savings analysis
        if savings_spent < savings_target:
            shortfall = (savings_target - savings_spent).quantize(two_dec, rounding=ROUND_HALF_UP)
            suggestions.append(
                f"Savings are ₹{shortfall:,.2f} below the 20% target. Diverting discretionary savings will build your buffer."
            )
        else:
            suggestions.append("Great job! You have met or exceeded your 20% monthly savings goal.")

        # Persona-tailored rule additions
        if persona == "student":
            suggestions.append("Student Tip: Focus on low-cost student discounts and building a ₹5,000 liquid buffer.")
        elif persona == "gig_worker":
            suggestions.append(
                "Gig Worker Tip: Because earnings vary, keep a higher 6-month buffer before aggressive lock-in investments."
            )

    return BudgetSummaryResult(
        net_income=safe_income,
        total_expenses=total_expenses,
        net_savings=net_savings,
        needs=needs_metric,
        wants=wants_metric,
        savings=savings_metric,
        suggestions=suggestions,
    )

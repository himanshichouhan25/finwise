"""Unit tests for 50/30/20 budget calculations and bucket resolution."""

from decimal import Decimal

from app.engine.budget import calculate_budget_summary, resolve_bucket


def test_budget_summary_normal_allocation():
    """Verify standard 50/30/20 budget math for ₹50,000 monthly income."""
    income = Decimal("50000.00")
    needs = Decimal("25000.00")  # Exactly 50%
    wants = Decimal("15000.00")  # Exactly 30%
    savings = Decimal("10000.00")  # Exactly 20%

    result = calculate_budget_summary(income, needs, wants, savings)

    assert result.net_income == Decimal("50000.00")
    assert result.needs.target_amount == Decimal("25000.00")
    assert result.needs.actual_amount == Decimal("25000.00")
    assert result.needs.variance == Decimal("0.00")
    assert result.needs.status == "within"

    assert result.wants.target_amount == Decimal("15000.00")
    assert result.wants.actual_amount == Decimal("15000.00")
    assert result.wants.status == "within"

    assert result.savings.target_amount == Decimal("10000.00")
    assert result.savings.actual_amount == Decimal("10000.00")
    assert result.savings.status == "within"


def test_budget_summary_over_wants_suggestion():
    """Verify that exceeding wants generates deterministic corrective suggestions."""
    income = Decimal("40000.00")
    needs = Decimal("18000.00")
    wants = Decimal("16000.00")  # Target is 12,000; over by 4,000
    savings = Decimal("4000.00")

    result = calculate_budget_summary(income, needs, wants, savings)

    assert result.wants.status == "over"
    assert result.wants.variance == Decimal("4000.00")
    assert any("Trimming ₹4,000.00/month" in s for s in result.suggestions)


def test_budget_summary_zero_income_safe():
    """Verify zero income handles division by zero safely without errors."""
    result = calculate_budget_summary(Decimal("0.00"), Decimal("0.00"), Decimal("0.00"), Decimal("0.00"))
    assert result.net_income == Decimal("0.00")
    assert result.needs.percent_of_income == Decimal("0.00")
    assert len(result.suggestions) > 0


def test_resolve_bucket_mapping():
    """Verify default and override resolution for expense buckets."""
    assert resolve_bucket("Apartment Rent") == "needs"
    assert resolve_bucket("Groceries & Milk") == "needs"
    assert resolve_bucket("Netflix Subscription") == "wants"
    assert resolve_bucket("Nifty 50 SIP") == "savings"
    # User override takes precedence
    assert resolve_bucket("Groceries", user_override="wants") == "wants"

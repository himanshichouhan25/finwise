"""Unit tests for Goal-days Delayed calculation and reference vectors."""

from decimal import Decimal

from app.engine.goal_delay import calculate_goal_days_delayed


def test_goal_days_delayed_reference_vector():
    """Verify Section 10 vector: ₹3,000 spend with ₹6,000/mo contribution -> 15.0 days."""
    spend = Decimal("3000.00")
    contrib = Decimal("6000.00")

    result = calculate_goal_days_delayed(spend, contrib, goal_name="MacBook Air")

    assert result.is_valid is True
    assert result.daily_goal_rate == Decimal("200.00")
    assert result.days_delayed == Decimal("15.0")
    assert "15.0 days" in result.message


def test_goal_days_delayed_zero_contribution_guard():
    """Verify zero contribution safely returns invalid status without division by zero."""
    result = calculate_goal_days_delayed(
        unnecessary_spend=Decimal("2000.00"),
        monthly_goal_contribution=Decimal("0.00"),
    )

    assert result.is_valid is False
    assert result.days_delayed == Decimal("0.0")
    assert "configure an active monthly contribution" in result.message


def test_goal_days_delayed_zero_spend():
    """Verify zero spend calculates 0.0 days delayed."""
    result = calculate_goal_days_delayed(
        unnecessary_spend=Decimal("0.00"),
        monthly_goal_contribution=Decimal("15000.00"),
    )

    assert result.is_valid is True
    assert result.days_delayed == Decimal("0.0")

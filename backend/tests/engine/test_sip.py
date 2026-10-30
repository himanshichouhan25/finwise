"""Unit tests for SIP projection calculator and reference vectors."""

from decimal import Decimal

from app.engine.sip import calculate_sip


def test_sip_zero_percent_reference_vector():
    """Verify Section 10 reference vector: P=5,000, 5 years, 0% return -> Invested = Value = 3,00,000."""
    result = calculate_sip(
        monthly_investment=Decimal("5000.00"),
        duration_years=5,
        annual_return_pct=Decimal("0.00"),
    )

    assert result.total_invested == Decimal("300000.00")
    assert result.estimated_value == Decimal("300000.00")
    assert result.estimated_gain == Decimal("0.00")
    assert len(result.yearly_series) == 5
    assert result.yearly_series[0].total_invested == Decimal("60000.00")


def test_sip_positive_compound_growth():
    """Verify positive returns generate gains greater than principal."""
    result = calculate_sip(
        monthly_investment=Decimal("10000.00"),
        duration_years=10,
        annual_return_pct=Decimal("12.00"),
    )

    # 10,000/month for 10 years = 12,00,000 invested
    assert result.total_invested == Decimal("1200000.00")
    assert result.estimated_value > result.total_invested
    assert result.estimated_gain > Decimal("0.00")
    assert len(result.scenarios) == 3


def test_sip_with_step_up_increases_investment():
    """Verify 10% annual step-up yields higher cumulative investment than fixed."""
    flat = calculate_sip(
        monthly_investment=Decimal("10000.00"),
        duration_years=3,
        annual_return_pct=Decimal("10.00"),
        annual_step_up_pct=Decimal("0.00"),
    )
    step_up = calculate_sip(
        monthly_investment=Decimal("10000.00"),
        duration_years=3,
        annual_return_pct=Decimal("10.00"),
        annual_step_up_pct=Decimal("10.00"),
    )

    assert step_up.total_invested > flat.total_invested
    assert step_up.estimated_value > flat.estimated_value


def test_sip_with_inflation_adjustment():
    """Verify inflation discount produces real purchasing power value lower than nominal value."""
    result = calculate_sip(
        monthly_investment=Decimal("10000.00"),
        duration_years=10,
        annual_return_pct=Decimal("12.00"),
        annual_inflation_pct=Decimal("6.00"),
    )

    assert result.inflation_adjusted_value < result.estimated_value

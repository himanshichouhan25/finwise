"""Unit tests for Loan Financial Calculation Engine."""

from decimal import Decimal

from app.engine.loan import (
    calculate_emi,
    generate_amortization_schedule,
    prioritize_loans,
    simulate_prepayment,
)


def test_calculate_emi_reducing_balance():
    """Verify standard reducing balance EMI matches known mathematical values.
    Example: Principal = 1,00,000, Rate = 12% p.a., Tenure = 12 months.
    Monthly rate r = 1% = 0.01.
    Formula: 100000 * 0.01 * (1.01^12) / (1.01^12 - 1) ≈ 8,884.88
    """
    principal = Decimal("100000.00")
    rate = Decimal("12.00")
    tenure = 12

    emi = calculate_emi(principal, rate, tenure, interest_type="reducing_balance")
    assert emi == Decimal("8884.88")


def test_calculate_emi_zero_interest():
    """Verify zero interest loan produces pure principal division."""
    principal = Decimal("60000.00")
    rate = Decimal("0.00")
    tenure = 12

    emi = calculate_emi(principal, rate, tenure, interest_type="reducing_balance")
    assert emi == Decimal("5000.00")


def test_calculate_emi_flat_rate():
    """Verify flat rate loan EMI.
    Example: Principal = 1,00,000, Flat rate = 10% p.a., Tenure = 12 months.
    Total interest = 1,00,000 * 10% * 1 year = 10,000.
    Total amount = 1,10,000. EMI = 1,10,000 / 12 ≈ 9,166.67.
    """
    principal = Decimal("100000.00")
    rate = Decimal("10.00")
    tenure = 12

    emi = calculate_emi(principal, rate, tenure, interest_type="flat")
    assert emi == Decimal("9166.67")


def test_generate_amortization_schedule_closing_balance_reaches_zero():
    """Amortization schedule must terminate at zero balance."""
    principal = Decimal("50000.00")
    rate = Decimal("10.00")
    tenure = 6

    schedule = generate_amortization_schedule(principal, rate, tenure)
    assert len(schedule) == 6
    assert schedule[-1].closing_balance == Decimal("0.00")
    # Total principal paid across all months must equal original principal
    total_principal_paid = sum(row.principal_paid for row in schedule)
    assert total_principal_paid == principal


def test_simulate_prepayment_saves_interest_and_months():
    """Prepaying an extra amount each month must shorten tenure and save interest."""
    principal = Decimal("200000.00")
    rate = Decimal("11.50")
    tenure = 36  # 3 years
    extra_payment = Decimal("2000.00")

    result = simulate_prepayment(
        principal=principal,
        annual_rate_pct=rate,
        remaining_tenure_months=tenure,
        extra_monthly_amount=extra_payment,
    )

    assert result.months_saved > 0
    assert result.interest_saved > Decimal("0.00")
    assert result.new_tenure_months < result.original_tenure_months
    assert result.new_total_interest < result.original_total_interest


def test_prioritize_loans_avalanche_vs_snowball():
    """Verify Avalanche sorts by rate descending and Snowball sorts by balance ascending."""
    test_loans = [
        {"id": 1, "name": "Credit Card", "outstanding_principal": Decimal("25000.00"), "interest_rate_pct": Decimal("36.00"), "emi": Decimal("2500.00")},
        {"id": 2, "name": "Education Loan", "outstanding_principal": Decimal("400000.00"), "interest_rate_pct": Decimal("9.50"), "emi": Decimal("11000.00")},
        {"id": 3, "name": "Personal Loan", "outstanding_principal": Decimal("80000.00"), "interest_rate_pct": Decimal("14.00"), "emi": Decimal("3800.00")},
    ]

    avalanche = prioritize_loans(test_loans, strategy="avalanche")
    assert avalanche[0].name == "Credit Card"  # 36%
    assert avalanche[1].name == "Personal Loan"  # 14%
    assert avalanche[2].name == "Education Loan"  # 9.5%

    snowball = prioritize_loans(test_loans, strategy="snowball")
    assert snowball[0].name == "Credit Card"  # 25,000
    assert snowball[1].name == "Personal Loan"  # 80,000
    assert snowball[2].name == "Education Loan"  # 4,00,000

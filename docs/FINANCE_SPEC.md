# FinWise AI — Financial Calculation Specifications & Reference Vectors

This document specifies the exact mathematical formulas implemented in `backend/app/engine/`. All financial calculations are implemented in pure Python with zero database or network dependencies.

---

## 1. Budget Engine (50/30/20 Rule)

### Targets:
- **Needs**: $50\%$ of net monthly income
- **Wants**: $30\%$ of net monthly income
- **Savings**: $20\%$ of net monthly income

### Metrics Computed:
- $\text{actual} = \sum \text{expenses in bucket}$
- $\text{target} = \text{monthly income} \times \text{target percentage}$
- $\text{variance} = \text{actual} - \text{target}$
- $\text{percent\_of\_income} = (\text{actual} / \text{monthly income}) \times 100$
- Status: `within` ($\le \text{target}$), `over` ($> \text{target}$), `under` ($< \text{target}$)

### Category Defaults:
- **Needs**: rent, groceries, utilities, transport, health, education fees, minimum debt payments.
- **Wants**: dining out, entertainment, shopping, subscriptions, travel, gadgets.
- **Savings**: SIP/investments, emergency fund deposit, savings goal contributions.

---

## 2. SIP Projection Engine

### Formula:
For monthly investment $P$, duration $Y$ years ($n = 12 \times Y$ months), and annual return rate $R\%$:
- Effective monthly rate:
  $$i = \left(1 + \frac{R}{100}\right)^{\frac{1}{12}} - 1$$
- Future Value (annuity due, deposited at beginning of month):
  $$FV = P \times \frac{(1+i)^n - 1}{i} \times (1+i)$$
  *(If $i = 0$, $FV = P \times n$)*
- Inflation-adjusted Value:
  $$FV_{\text{real}} = \frac{FV}{(1 + \text{inflation})^Y}$$

### Mandatory Assumptions:
- "Return rate is an assumption chosen by you, not a prediction."
- "Returns are not guaranteed; actual market returns fluctuate and can result in capital loss."

### Reference Vector:
- $P = 5,000$, $Y = 5$, $R = 0\% \implies \text{invested} = 3,00,000$, $FV = 3,00,000$.

---

## 3. Goal Planning & Goal-days Delayed

### Required Monthly Savings:
For target amount $T$, current saved $S$, months to deadline $m$, and monthly rate $i$:
- With $i = 0$:
  $$\text{required\_monthly} = \frac{T - S}{m}$$
- With $i > 0$:
  $$\text{required\_monthly} = \frac{\left(T - S(1+i)^m\right) \times i}{((1+i)^m - 1)(1+i)}$$

### Goal-days Delayed:
Measures the timeline penalty of an impulsive or discretionary spend:
$$\text{daily\_goal\_rate} = \frac{\text{monthly\_goal\_contribution}}{30}$$
$$\text{days\_delayed} = \frac{\text{unnecessary\_spend}}{\text{daily\_goal\_rate}}$$

### Reference Vectors:
- Goal: Target ₹60,000, Saved ₹0, 12 months, 0% return $\implies$ ₹5,000 / month.
- Delay: Spend ₹3,000 with ₹6,000 / month goal contribution:
  $$\text{daily rate} = \frac{6,000}{30} = 200/\text{day} \implies \frac{3,000}{200} = 15\text{ days delayed}.$$

---

## 4. Financial Health Score (0–100 Scale)

Total score is the rescaled sum of 5 weighted factors:

| Factor | Max Points | Measurement |
| :--- | :--- | :--- |
| **Savings Rate** | 25 | Full marks at $\ge 20\%$ savings; linear below |
| **Emergency Fund** | 25 | Full marks at 6 months of essential needs (3 months for fixed income); linear below |
| **Needs Ratio** | 20 | Full marks when needs $\le 50\%$; declines linearly to 0 at $80\%$ |
| **Wants Discipline** | 15 | Full marks when wants $\le 30\%$; declines linearly to 0 at $50\%$ |
| **Goal Progress** | 15 | Share of active goals on track; if no goals exist, marked `insufficient_data` |

### Rescaling Rule:
If any factor has insufficient data, it is excluded and remaining factor weights are rescaled so the maximum remains 100. Never assume a zero score for missing data.

### Health Bands:
- `0–39`: Needs Attention
- `40–59`: Building
- `60–79`: Healthy
- `80–100`: Strong

---

## 5. Claim Reality Check Engine

### Annualized Compounded Return:
- For total return $r$ (fraction) over $t$ months:
  $$\text{CAGR} = (1 + r)^{\frac{12}{t}} - 1$$
- Repeating monthly rate $r_m$:
  $$\text{Annualized} = (1 + r_m)^{12} - 1$$

### Reference Test Vectors:
- "10% per month" $\implies (1.10)^{12} - 1 \approx 213.84\%$ per annum.
- "Double your money in 5 years" $\implies 2^{1/5} - 1 \approx 14.87\%$ per annum.

### Red-Flag Rules:
- Guaranteed / Assured return promises
- "Risk-free" high return claims
- Implied annualized return $> 30\%$ (High Risk), $> 100\%$ (Extreme Risk)
- Fixed daily or weekly percentage payouts
- Urgency and scarcity language ("limited slots", "invest before midnight")
- Pressure to move to private channels (Telegram/WhatsApp) or deposit crypto/wire transfer
- Guarantees of loss recovery
- Complete absence of stated risks

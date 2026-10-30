# FinWise AI — API Specification

All backend endpoints are served under the versioned prefix `/api/v1`.

## 1. Conventions and Headers

- **Content-Type**: `application/json`
- **User Identification**: MVP uses the `X-User-Id` request header (integer user ID).
- **Date Format**: ISO 8601 strings (`YYYY-MM-DD` or `YYYY-MM-DDTHH:MM:SSZ`).
- **Monetary Amounts**: Decimal numbers rounded to 2 decimal places.
- **Percentages**: Given as numerical percentages (e.g., `12.5` represents 12.5%).

---

## 2. Standard Error Format

All error responses return HTTP status codes with a consistent JSON envelope:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Input validation failed."
  }
}
```

### Common Error Codes:
- `NOT_FOUND` (HTTP 404): Requested entity does not exist.
- `VALIDATION_ERROR` (HTTP 422): Input violates range, type, or constraint limits.
- `UNAUTHORIZED` (HTTP 401 / 400): Missing or invalid `X-User-Id`.
- `AI_UNAVAILABLE` (HTTP 503): Groq/LLM service is unreachable or rate-limited; returns deterministic calculation fallback.
- `RATE_LIMITED` (HTTP 429): In-memory user rate limit exceeded.

---

## 3. Endpoints Overview

### System & Personas
- `GET /api/v1/health` — Service health check, database connectivity, and AI status.
- `GET /api/v1/personas` — Predefined persona presets (`student`, `first_job`, `gig_worker`).
- `GET /api/v1/users` — List existing demo users.
- `POST /api/v1/users` — Create demo user.

### Financial Profile & Records
- `GET /api/v1/profile` — Get current user's profile and emergency fund status.
- `PUT /api/v1/profile` — Update expected monthly income, income type, and emergency fund.
- `GET /api/v1/income` — List recorded income entries.
- `POST /api/v1/income` — Add income record.
- `DELETE /api/v1/income/{id}` — Delete income record.
- `GET /api/v1/expenses?month=YYYY-MM` — List monthly expenses.
- `POST /api/v1/expenses` — Create expense (with category and 50/30/20 bucket tag).
- `PATCH /api/v1/expenses/{id}` — Update expense details.
- `DELETE /api/v1/expenses/{id}` — Delete expense.

### Budget & Financial Health
- `GET /api/v1/budget/summary?month=YYYY-MM` — Monthly totals, 50/30/20 bucket variance, category breakdown, and deterministic suggestions.
- `GET /api/v1/health-score` — Compute and snapshot the 0–100 Financial Health Score with factor breakdowns.

### Goals & Simulations
- `GET /api/v1/goals` — List user savings goals.
- `POST /api/v1/goals` — Create savings goal.
- `PATCH /api/v1/goals/{id}` — Update goal progress or target.
- `DELETE /api/v1/goals/{id}` — Delete goal.
- `GET /api/v1/goals/{id}/plan` — Calculate required monthly savings and estimated completion date.
- `POST /api/v1/simulations/goal-whatif` — Compare baseline vs scenario adjustments.
- `POST /api/v1/simulations/sip` — SIP compound growth projection with inflation adjustment.
- `POST /api/v1/simulations/goal-delay` — Calculate goal days delayed for an unnecessary purchase.

### AI Financial Coach
- `POST /api/v1/coach/chat` — Send user message, load user snapshot, execute tool calls, return validated response with SEBI guardrails.
- `GET /api/v1/coach/sessions` — List user conversation sessions.
- `GET /api/v1/coach/sessions/{session_id}` — Retrieve conversation history with tool executions.

### Finfluencer Claim Reality Check
- `POST /api/v1/claims/analyze` — Analyze finfluencer return claims with deterministic CAGR math, Rule of 72, benchmark multipliers, and SEBI red-flag rules.
- `GET /api/v1/claims/history` — Audit history of previously analyzed claims.

### 24h Cooling-Off Decision Journal
- `POST /api/v1/journal/entries` — Log impulse purchase or financial decision with an active cooling-off timer (24h/48h) and goal delay calculation.
- `GET /api/v1/journal/entries` — List logged decision journal entries (filterable by `?status=pending_review|proceeded|dropped`).
- `GET /api/v1/journal/summary` — Aggregate metrics: active cooling timers, review-ready items, and total money saved.
- `GET /api/v1/journal/entries/{entry_id}` — Retrieve details and real-time remaining cooling-off countdown for a specific entry.
- `POST /api/v1/journal/entries/{entry_id}/decide` — Finalize decision after cooling period expires (`proceeded` vs `dropped`).

### Aggregated View
- `GET /api/v1/dashboard` — Single composite payload for the application home screen (profile, budget summary, health score, top goals, journal preview).

---

## 4. Key Request & Response Examples

### AI Coach Chat (`POST /api/v1/coach/chat`)

**Request:**
```json
{
  "message": "Can I afford to buy a ₹45,000 laptop next month?",
  "session_id": null
}
```

**Response (HTTP 200):**
```json
{
  "session_id": 1,
  "response": "Based on your monthly surplus of ₹18,000, purchasing a ₹45,000 laptop in one month would delay your emergency fund goal by ~75 days. Consider saving ₹15,000/month across 3 months instead.\n\n*Disclaimer: Educational analysis only. FinWise AI is not a SEBI-registered financial advisor.*",
  "tools_called": ["get_budget_summary", "goal_days_delayed"],
  "model_used": "llama-3.3-70b-versatile"
}
```

---

### Finfluencer Claim Reality Check (`POST /api/v1/claims/analyze`)

**Request:**
```json
{
  "raw_text": "Invest ₹10,000 in our options trading bot, guaranteed 5% daily returns! Double your capital in 20 days. Join Telegram VIP now!",
  "initial_amount": 10000,
  "promised_amount": 20000,
  "duration_days": 20
}
```

**Response (HTTP 200):**
```json
{
  "id": 1,
  "raw_text": "Invest ₹10,000 in our options trading bot, guaranteed 5% daily returns! Double your capital in 20 days. Join Telegram VIP now!",
  "implied_cagr": 3678.34,
  "doubling_time_days": 20.0,
  "verdict": "Likely Scam",
  "risk_score": 95,
  "nifty_multiple": 306.5,
  "fd_multiple": 525.4,
  "buffett_multiple": 183.9,
  "red_flags": [
    "Promising guaranteed or risk-free returns on market-linked securities violates SEBI guidelines.",
    "Unrealistic returns: 3678.3% CAGR dwarfs the Nifty 50 historical average (~12% CAGR).",
    "Directing investors to private Telegram or WhatsApp channels without SEBI registration is a common fraud vector."
  ],
  "reality_context": "At 3678.3% CAGR, ₹10,000 would theoretically turn into crores within a few years — an economic impossibility.",
  "sebi_disclaimer": "FinWise AI Claim Reality Check provides mathematical feasibility analysis only. Not SEBI-registered advisory."
}
```

---

### Decision Journal Entry (`POST /api/v1/journal/entries`)

**Request:**
```json
{
  "item_name": "Premium Noise Cancelling Headphones",
  "amount": 24999.00,
  "category": "Electronics",
  "cooling_period_hours": 24,
  "rationale": "Great discount on sale right now, impulse urge."
}
```

**Response (HTTP 200):**
```json
{
  "id": 1,
  "item_name": "Premium Noise Cancelling Headphones",
  "amount": 24999.00,
  "category": "Electronics",
  "cooling_period_hours": 24,
  "cooling_off_until": "2026-11-01T02:30:00Z",
  "status": "pending_review",
  "goal_delay_days": 41.6,
  "rationale": "Great discount on sale right now, impulse urge.",
  "decision_note": null,
  "remaining_seconds": 86395,
  "is_cooling_active": true,
  "created_at": "2026-10-31T02:30:00Z",
  "decided_at": null
}
```

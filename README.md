# FinWise AI

> **AI Financial Coach for First-Time Investors**  
> *Built for MNIT Jaipur 24-Hour Hackathon*

---

## 1. Project Overview

**FinWise AI** is an intelligent personal financial companion designed specifically for college students, first-job professionals, young earners, and gig workers. 

### Philosophy:
*Don't just track your money. Understand your money, question financial claims, and make smarter decisions.*

Unlike generic expense trackers or superficial chatbots, FinWise AI couples a **deterministic, pure Python financial intelligence engine** with an **AI financial coach**. Numbers and calculations are 100% computed in Python, while the LLM explains, contextualizes, and guides the user using their own real data.

---

## 2. Core Features

1. **50/30/20 Smart Budgeting**
   - Automated categorization into Needs (50%), Wants (30%), and Savings (20%).
   - Variance detection and deterministic monthly saving suggestions.
   - Persona-tailored advice for Students, First-Job Earners, and Gig Workers.

2. **SIP & Goal Planning Engine**
   - Precise start-of-month compound growth projections with optional step-up and inflation adjustments.
   - Goal planning with required monthly savings and timeline estimation.
   - **Goal-days Delayed**: Calculates the exact timeline setback caused by impulsive or discretionary purchases.

3. **Financial Health Score (0–100)**
   - Transparent evaluation across 5 weighted factors: Savings Rate, Emergency Fund, Needs Ratio, Wants Discipline, and Goal Progress.
   - Rescaling logic ensuring missing data never defaults to an unfair zero.

4. **AI Financial Coach (Groq / Llama 3.3 70B)**
   - Conversational coach grounded directly in the user's fresh database financial snapshot.
   - Allow-listed Python calculator tools with strict argument validation.
   - Output guardrails preventing fabricated numbers, stock tips, or guaranteed-return claims.
   - Bilingual support: Simple English and natural Hinglish (Roman script).

5. **Claim Reality Check (Finfluencer Fraud Detection)**
   - Annualized CAGR math for viral promises (e.g., "10% per month" = 213.84% APY).
   - Rule-based red-flag detection (unrealistic returns, urgency language, guaranteed promises).

6. **Financial Decision Journal**
   - Log significant purchases or financial moves.
   - Automated 24h / 48h cooling-off periods for high-value or emotionally charged purchases to curb impulsive spending.

---

## 3. Architecture & Tech Stack

FinWise AI is architected as a **modular monolith** prioritizing speed, zero-hallucination calculations, and reliability:

- **Backend:** Python 3.12, FastAPI, SQLAlchemy 2.x, Pydantic v2, Groq SDK.
- **Financial Engine:** Pure Python (`backend/app/engine/`) with zero database or network dependencies.
- **Database:** SQLite (`finwise.db`) with typed SQLAlchemy 2.0 models.
- **Frontend:** React 18, Vite, Tailwind CSS, Lucide React, Recharts, TanStack Query.
- **Design System:** Bespoke fintech aesthetic with Teal (`#0E6B6B`), warm Brass (`#B08D57`), Fraunces serif headings, and Inter body typography.

---

## 4. Repository Structure

```
finwise/
├── .env.example              # Sample configuration template
├── .gitignore                # Git ignore rules for Python, SQLite, node, etc.
├── README.md                 # Project documentation
├── docs/                     # Architecture & specifications
│   ├── DECISIONS.md          # Architecture Decision Records (ADR)
│   ├── API.md                # API endpoints and error specifications
│   └── FINANCE_SPEC.md       # Financial calculation math and test vectors
└── backend/                  # FastAPI backend service
    ├── pyproject.toml        # Ruff linter and Pytest configuration
    └── requirements.txt      # Approved Python dependencies
```

---

## 5. Getting Started (Backend)

### Prerequisites:
- Python 3.12+
- Git

### Setup:
1. Clone the repository and navigate into the folder:
   ```bash
   git clone https://github.com/himanshichouhan25/finwise.git
   cd finwise
   ```

2. Create and activate a Python virtual environment:
   ```bash
   python -m venv .venv
   # Windows:
   .venv\Scripts\activate
   # macOS/Linux:
   source .venv/bin/activate
   ```

3. Install backend dependencies:
   ```bash
   pip install -r backend/requirements.txt
   ```

4. Configure environment variables:
   ```bash
   cp .env.example .env
   # Edit .env to add your GROQ_API_KEY (optional: backend boots gracefully without it)
   ```

5. Run Linting and Tests:
   ```bash
   ruff check backend
   pytest backend
   ```

---

## 6. Known MVP Limitations

- **Authentication:** In scope for post-hackathon. The MVP uses pre-configured demo personas (`student`, `first_job`, `gig_worker`) identified via the `X-User-Id` request header.
- **AI Quota Protection:** AI endpoints utilize an in-memory per-process rate limiter (20 requests/min).
- **Graceful Degradation:** If the LLM provider is offline, the backend continues to serve all deterministic financial calculations and fallback summaries.

---

## 7. Disclaimer

*FinWise AI is an educational tool, not a registered investment adviser under SEBI or any other regulatory body. All figures, SIP projections, and goal estimates are mathematical simulations based on user assumptions. Investments carry market risks, including the possible loss of principal.*

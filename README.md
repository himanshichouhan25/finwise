# FinWise AI

> **AI Financial Coach & Expense Intelligence Platform for First-Time Investors**  
> *Built for MNIT Jaipur 24-Hour Hackathon 2026*

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19.0+-61DAFB.svg?logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8.0+-646CFF.svg?logo=vite&logoColor=white)](https://vitejs.dev)
[![Python](https://img.shields.io/badge/Python-3.12+-3776AB.svg?logo=python&logoColor=white)](https://python.org)
[![Groq](https://img.shields.io/badge/Groq-Llama_3.3_70B-F55036.svg)](https://groq.com)
[![Tests](https://img.shields.io/badge/Tests-48%20Passing-brightgreen.svg)]()
[![Code_Style](https://img.shields.io/badge/Code_Style-Ruff_0_Errors-blue.svg)]()

---

## 1. Project Overview

**FinWise AI** is an intelligent personal financial companion designed specifically for young Indian earners — college students with research stipends, first-job software engineers, and gig economy creators.

### Core Philosophy:
*Don't just track your money. Understand your money, question viral financial claims, and make disciplined investment decisions.*

Unlike generic expense trackers or superficial chatbots, FinWise AI enforces a **strict Zero-Financial-Hallucination principle**:
- **100% of calculations** (50/30/20 budget allocations, SIP compound growth, goal timelines, health scores, and claim CAGR math) are executed strictly in pure Python.
- **The LLM (Groq / Llama 3.3 70B)** never invents figures; it receives the user's authoritative real-time financial snapshot and provides empathetic, bilingual (English & Hinglish) guidance with SEBI compliance guardrails.

---

## 2. Differentiator Features

1. **50/30/20 Smart Budgeting & Auto-Bucketing**
   - Automatically classifies expenses into Needs (50%), Wants (30%), and Savings (20%).
   - Generates deterministic variance suggestions and savings targets.

2. **Goal-Days Delayed Calculator (Signature Feature)**
   - Translates discretionary or impulsive spending into real-life setbacks.
   - *Example:* "Buying this ₹4,500 sneaker delays your 3-Month Emergency Fund goal by 25 days!"

3. **Finfluencer Claim Reality Check (SEBI Scam Detector)**
   - Computes implied Compounded Annual Growth Rate (CAGR) for social media promises.
   - Compares claims against Nifty 50 (12.5%), Fixed Deposit (7%), Gold (10.5%), and Warren Buffett (20%).
   - Detects scam signals: promised "guaranteed" returns, urgency FOMO language, and unregistered Telegram/WhatsApp VIP tipping channels.

4. **Impulse Decision Journal & 24h/48h Cooling-Off Timers**
   - Users log prospective purchases and lock a cooling-off timer (24h or 48h) before buying.
   - Disables rash spending, records emotional triggers (`fomo`, `excited`, `stressed`), and tracks cumulative money saved from avoided purchases.

5. **Financial Health Score (0–100)**
   - Transparent evaluation across 5 weighted factors: Savings Rate, Emergency Fund Buffer, Needs Ratio, Wants Discipline, and Goal Progress.
   - Dynamic weight rescaling prevents penalizing students who haven't started equity investing yet.

6. **AI Financial Coach with Multi-Key Rotation Pool**
   - Powered by `llama-3.3-70b-versatile` with automatic failover to `llama-3.1-8b-instant`.
   - Multi-key rotation pool (`GROQ_API_KEYS=key1,key2,key3`) guarantees zero downtime on rate limits (HTTP 429).
   - Multi-round calculation tool calling (`project_sip`, `plan_goal`, `get_budget_summary`).
   - SEBI guardrails strictly refuse individual stock tips and speculative promises.

---

## 3. Architecture & Tech Stack

```
                          ┌─────────────────────────────────────┐
                          │    React 18 + Vite (Frontend)       │
                          │   Dark Mode Glassmorphism & Tokens  │
                          └──────────────────┬──────────────────┘
                                             │ HTTP (Proxy :3000 -> :8000)
                                             │ Header: X-User-Id (1 | 2 | 3)
                                             ▼
                          ┌─────────────────────────────────────┐
                          │       FastAPI Backend Application   │
                          │        Structured Request Logging   │
                          │       Standard JSON Error Envelope  │
                          └──────────┬───────────────────────┬──┘
                                     │                       │
              ┌──────────────────────┴──────┐    ┌───────────┴─────────────────────┐
              │ Pure Python Financial Engine│    │ AI Coach & LLM Client           │
              │  - app/engine/budget.py     │    │  - Groq Multi-Key Pool Rotation │
              │  - app/engine/sip.py        │    │  - SEBI Compliance Guardrails   │
              │  - app/engine/goals.py      │    │  - Tool Calling Dispatcher      │
              │  - app/engine/goal_delay.py │    │  - English & Hinglish Prompts   │
              │  - app/engine/claim_math.py │    └─────────────────────────────────┘
              │  - app/engine/red_flags.py  │
              └──────────────┬──────────────┘
                             │
                             ▼
              ┌─────────────────────────────┐
              │ SQLite Database (Typed ORM) │
              │   Users, Profiles, Incomes, │
              │   Expenses, Goals, Claims,  │
              │   Chat Sessions, Journal    │
              └─────────────────────────────┘
```

---

## 4. Getting Started Locally

### Prerequisites:
- Python 3.12+
- Node.js 18+ and npm

### 1. Clone & Set Up Python Virtual Environment:
```bash
git clone https://github.com/himanshichouhan25/finwise.git
cd finwise

# Create and activate virtualenv
python -m venv .venv
# On Windows:
.venv\Scripts\activate
# On Linux/macOS:
source .venv/bin/activate

# Install backend dependencies
pip install -r backend/requirements.txt
```

### 2. Configure Environment Variables:
```bash
cp .env.example .env
# Open .env and insert your Groq API key(s):
# GROQ_API_KEY=gsk_...
# GROQ_API_KEYS=gsk_key1,gsk_key2 (optional failover pool)
```
*(Note: If no API key is provided, the backend boots cleanly in offline mode and all deterministic calculators remain 100% operational).*

### 3. Seed Demo Personas into Database:
```bash
python backend/scripts/seed_demo.py
```
This populates the 3 hackathon demo personas:
- **User 1 (Student):** Aarav Sharma (Research stipend ₹15k, PG hostel rent, laptop goal)
- **User 2 (First Job):** Priya Patel (Salary ₹65k, high wants spending, Goa trip goal)
- **User 3 (Gig Worker):** Rohan Verma (Freelance design ₹48k, irregular income, camera upgrade)

### 4. Run Backend Server:
```bash
uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 8000 --reload
```
Swagger API docs available at: `http://127.0.0.1:8000/docs`

### 5. Run Frontend Development Server:
In a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:3000` in your browser.

---

## 5. Running Tests & Quality Verification

Run the complete backend test suite:
```bash
pytest backend
```
> **Result:** `48 passed in 1.42s`

Run the Ruff linter check:
```bash
ruff check backend
```
> **Result:** `All checks passed!`

Verify frontend production build:
```bash
cd frontend && npm run build
```
> **Result:** `✓ built in 717ms`

---

## 6. Hackathon 3-Minute Demo Script

| Minute | Screen / Feature | Key Talking Points |
| :--- | :--- | :--- |
| **0:00 - 0:45** | **Dashboard & 50/30/20 Budget** | Switch personas via the sidebar dropdown (*Aarav - Student* to *Priya - Software Engineer*). Highlight zero-auth MVP headers (`X-User-Id`). Explain the deterministic 50/30/20 breakdown and Health Score. |
| **0:45 - 1:30** | **Goal-Days Delayed Widget** | Open **Goals**. Type ₹4,500 into the impulse spend widget. Show how it immediately calculates: *"+25 Days Delay on Emergency Fund!"* This reframes spending from monetary cost into time of life lost. |
| **1:30 - 2:15** | **Finfluencer Scam Audit** | Open **Finfluencer Audit**. Click the sample claim *"Turn ₹10,000 into 1 Crore in 3 years"*. Watch the engine compute an implied **800%+ CAGR**, compare it against Warren Buffett (20%) and Nifty (12.5%), and flag extreme risk and Ponzi red flags. |
| **2:15 - 2:45** | **Impulse Decision Journal** | Open **Decision Journal**. Show an active item with a live **24-hour cooling-off countdown**. Highlight that impulsive buying is locked until reflection time elapses, showing ₹40,000+ saved from avoided purchases. |
| **2:45 - 3:00** | **AI Financial Coach** | Ask the coach in natural Hinglish: *"Can I afford buying ₹6,000 headphones?"* Watch the coach execute the allow-listed calculation tools live, cite the user's real budget numbers, and conclude with the mandatory SEBI disclaimer. |

---

## 7. Disclaimer

*FinWise AI is strictly an educational planning tool, not a registered investment adviser under SEBI or any other regulatory authority. All figures, SIP projections, and goal simulations are mathematical models based on user inputs. Market investments are subject to market risks.*

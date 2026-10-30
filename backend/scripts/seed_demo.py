"""Seed script for FinWise AI demo personas.

Populates the database with realistic sample data for three target personas:
1. Student (Aarav) - College student with monthly stipend/allowance
2. First-Job Professional (Priya) - Early career corporate earner starting SIP
3. Gig Worker (Rohan) - Freelancer with irregular income streams

IDEMPOTENT: Safe to run multiple times. Cleans or updates existing persona data.
"""

import os
import sys
from datetime import UTC, date, datetime, timedelta
from decimal import Decimal

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sqlalchemy import select

from app.core.security import hash_password
from app.db.base import Base
from app.db.session import SessionLocal, engine
from app.models import (
    ChatMessage,
    ChatSession,
    ClaimCheck,
    ExpenseRecord,
    FinancialProfile,
    Goal,
    HealthScoreSnapshot,
    IncomeRecord,
    JournalEntry,
    User,
)


def seed_demo_data():
    """Populate database with demo personas and financial records."""
    # Ensure all tables are created
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        today = date.today()
        # Seed personas definition
        personas_data = [
            {
                "name": "Aarav Sharma [Sample data]",
                "email": "aarav@finwise.ai",
                "password": "Password@123",
                "persona": "student",
                "language_pref": "hinglish",
                "profile": {
                    "monthly_income": Decimal("15000.00"),
                    "income_type": "fixed",
                    "emergency_fund_saved": Decimal("5000.00"),
                },
                "income": [
                    {
                        "amount": Decimal("15000.00"),
                        "source": "College Research Stipend",
                        "received_on": today.replace(day=1),
                        "is_recurring": True,
                    }
                ],
                "expenses": [
                    {
                        "amount": Decimal("6000.00"),
                        "category": "Rent & Hostel PG",
                        "bucket": "needs",
                        "description": "Monthly room rent",
                        "spent_on": today.replace(day=2),
                        "is_impulsive": False,
                    },
                    {
                        "amount": Decimal("3500.00"),
                        "category": "Mess & Groceries",
                        "bucket": "needs",
                        "description": "College mess charges",
                        "spent_on": today.replace(day=5),
                        "is_impulsive": False,
                    },
                    {
                        "amount": Decimal("800.00"),
                        "category": "Books & Stationery",
                        "bucket": "needs",
                        "description": "Engineering textbooks",
                        "spent_on": today.replace(day=8),
                        "is_impulsive": False,
                    },
                    {
                        "amount": Decimal("1200.00"),
                        "category": "Cafeteria & Snacks",
                        "bucket": "wants",
                        "description": "Weekend hangout with friends",
                        "spent_on": today.replace(day=12),
                        "is_impulsive": True,
                    },
                    {
                        "amount": Decimal("499.00"),
                        "category": "Streaming Subscriptions",
                        "bucket": "wants",
                        "description": "Spotify & Prime student pack",
                        "spent_on": today.replace(day=15),
                        "is_impulsive": False,
                    },
                    {
                        "amount": Decimal("2500.00"),
                        "category": "Savings Deposit",
                        "bucket": "savings",
                        "description": "Deposit into High-Yield Savings",
                        "spent_on": today.replace(day=18),
                        "is_impulsive": False,
                    },
                ],
                "goals": [
                    {
                        "name": "Coding Laptop Upgrade",
                        "target_amount": Decimal("60000.00"),
                        "current_saved": Decimal("15000.00"),
                        "target_date": today + timedelta(days=365),
                        "planned_monthly_contribution": Decimal("3000.00"),
                        "expected_annual_return_pct": Decimal("6.00"),
                        "status": "active",
                    }
                ],
                "chat": {
                    "title": "College Budgeting Advice",
                    "messages": [
                        {"role": "user", "content": "Bhai mere 15,000 me se kitna save karna chahiye?"},
                        {
                            "role": "assistant",
                            "content": "Aarav, student life me 15-20% save karna bhi bohot badhiya shuruat hai! Tumhare 15k stipend me se target rakho ₹2,500-₹3,000 har mahine alag rakhne ka.",
                        },
                    ],
                },
                "journal": {
                    "title": "Wireless Gaming Headphones",
                    "decision_type": "purchase",
                    "amount": Decimal("3499.00"),
                    "rationale": "Saw a flash discount on Amazon; friends are playing Valorant.",
                    "emotional_state": "fomo",
                    "is_urgent": True,
                    "cooling_off_until": datetime.now(UTC) + timedelta(hours=24),
                    "status": "pending_review",
                    "outcome_note": "",
                },
            },
            {
                "name": "Priya Patel [Sample data]",
                "email": "priya@finwise.ai",
                "password": "Password@123",
                "persona": "first_job",
                "language_pref": "en",
                "profile": {
                    "monthly_income": Decimal("65000.00"),
                    "income_type": "fixed",
                    "emergency_fund_saved": Decimal("150000.00"),
                },
                "income": [
                    {
                        "amount": Decimal("65000.00"),
                        "source": "Software Engineer Salary",
                        "received_on": today.replace(day=1),
                        "is_recurring": True,
                    }
                ],
                "expenses": [
                    {
                        "amount": Decimal("22000.00"),
                        "category": "Apartment Rent",
                        "bucket": "needs",
                        "description": "1BHK rent in Bangalore",
                        "spent_on": today.replace(day=2),
                        "is_impulsive": False,
                    },
                    {
                        "amount": Decimal("8500.00"),
                        "category": "Groceries & Supermarket",
                        "bucket": "needs",
                        "description": "Monthly staples & fresh produce",
                        "spent_on": today.replace(day=4),
                        "is_impulsive": False,
                    },
                    {
                        "amount": Decimal("3200.00"),
                        "category": "Electricity & Wi-Fi",
                        "bucket": "needs",
                        "description": "Utility bills",
                        "spent_on": today.replace(day=7),
                        "is_impulsive": False,
                    },
                    {
                        "amount": Decimal("6500.00"),
                        "category": "Dining Out & Ordering",
                        "bucket": "wants",
                        "description": "Weekend dinners and office lunches",
                        "spent_on": today.replace(day=11),
                        "is_impulsive": False,
                    },
                    {
                        "amount": Decimal("4800.00"),
                        "category": "Apparel & Shopping",
                        "bucket": "wants",
                        "description": "Workwear shirts and skincare",
                        "spent_on": today.replace(day=14),
                        "is_impulsive": True,
                    },
                    {
                        "amount": Decimal("15000.00"),
                        "category": "Nifty 50 Index SIP",
                        "bucket": "savings",
                        "description": "Automated monthly SIP",
                        "spent_on": today.replace(day=10),
                        "is_impulsive": False,
                    },
                ],
                "goals": [
                    {
                        "name": "6-Month Emergency Fund",
                        "target_amount": Decimal("200000.00"),
                        "current_saved": Decimal("150000.00"),
                        "target_date": today + timedelta(days=180),
                        "planned_monthly_contribution": Decimal("10000.00"),
                        "expected_annual_return_pct": Decimal("6.50"),
                        "status": "active",
                    },
                    {
                        "name": "First Car Downpayment",
                        "target_amount": Decimal("300000.00"),
                        "current_saved": Decimal("80000.00"),
                        "target_date": today + timedelta(days=540),
                        "planned_monthly_contribution": Decimal("12000.00"),
                        "expected_annual_return_pct": Decimal("10.00"),
                        "status": "active",
                    },
                ],
                "chat": {
                    "title": "Index Fund SIP Strategy",
                    "messages": [
                        {"role": "user", "content": "How much should I step up my SIP each year?"},
                        {
                            "role": "assistant",
                            "content": "Priya, a 10% annual step-up is ideal. When your salary increments arrive each year, increasing your SIP by ₹1,500/month significantly accelerates your compounding timeline.",
                        },
                    ],
                },
                "journal": {
                    "title": "Designer Weekend Leather Bag",
                    "decision_type": "purchase",
                    "amount": Decimal("12000.00"),
                    "rationale": "Saw a brand sale; want a statement accessory for meetings.",
                    "emotional_state": "excited",
                    "is_urgent": False,
                    "cooling_off_until": datetime.now(UTC) + timedelta(hours=24),
                    "status": "pending_review",
                    "outcome_note": "",
                },
            },
            {
                "name": "Rohan Verma [Sample data]",
                "email": "rohan@finwise.ai",
                "password": "Password@123",
                "persona": "gig_worker",
                "language_pref": "hinglish",
                "profile": {
                    "monthly_income": Decimal("48000.00"),
                    "income_type": "irregular",
                    "emergency_fund_saved": Decimal("90000.00"),
                },
                "income": [
                    {
                        "amount": Decimal("28000.00"),
                        "source": "UI/UX Design Project (Client A)",
                        "received_on": today.replace(day=3),
                        "is_recurring": False,
                    },
                    {
                        "amount": Decimal("20000.00"),
                        "source": "Brand Identity Retainer (Client B)",
                        "received_on": today.replace(day=14),
                        "is_recurring": True,
                    },
                ],
                "expenses": [
                    {
                        "amount": Decimal("14000.00"),
                        "category": "Studio Rent & Utilities",
                        "bucket": "needs",
                        "description": "Home office workspace",
                        "spent_on": today.replace(day=3),
                        "is_impulsive": False,
                    },
                    {
                        "amount": Decimal("7500.00"),
                        "category": "Food & Groceries",
                        "bucket": "needs",
                        "description": "Monthly living groceries",
                        "spent_on": today.replace(day=6),
                        "is_impulsive": False,
                    },
                    {
                        "amount": Decimal("3500.00"),
                        "category": "Software Subscriptions",
                        "bucket": "needs",
                        "description": "Figma, Adobe Creative Cloud",
                        "spent_on": today.replace(day=8),
                        "is_impulsive": False,
                    },
                    {
                        "amount": Decimal("4500.00"),
                        "category": "Mechanical Keyboard",
                        "bucket": "wants",
                        "description": "Custom mechanical keyboard kit",
                        "spent_on": today.replace(day=12),
                        "is_impulsive": True,
                    },
                    {
                        "amount": Decimal("10000.00"),
                        "category": "Emergency Liquid Fund",
                        "bucket": "savings",
                        "description": "Freelancer buffer allocation",
                        "spent_on": today.replace(day=16),
                        "is_impulsive": False,
                    },
                ],
                "goals": [
                    {
                        "name": "4K Video Editing Rig",
                        "target_amount": Decimal("150000.00"),
                        "current_saved": Decimal("60000.00"),
                        "target_date": today + timedelta(days=240),
                        "planned_monthly_contribution": Decimal("12000.00"),
                        "expected_annual_return_pct": Decimal("5.00"),
                        "status": "active",
                    }
                ],
                "chat": {
                    "title": "Irregular Income Buffer Planning",
                    "messages": [
                        {"role": "user", "content": "Gig work me jab payment late hoti hai toh budget kaise maintain karein?"},
                        {
                            "role": "assistant",
                            "content": "Rohan, gig workers ke liye 6 mahine ka emergency fund essential hai. High-earning months me extra savings park karo taaki dry months me tension na ho.",
                        },
                    ],
                },
                "journal": {
                    "title": "Ultra-wide Curved Monitor",
                    "decision_type": "purchase",
                    "amount": Decimal("32000.00"),
                    "rationale": "More screen estate for editing videos.",
                    "emotional_state": "excited",
                    "is_urgent": False,
                    "cooling_off_until": datetime.now(UTC) + timedelta(hours=48),
                    "status": "pending_review",
                    "outcome_note": "",
                },
            },
        ]

        print("--- Seeding FinWise AI Demo Personas ---")
        for pdata in personas_data:
            # Check if user already exists
            user = db.execute(select(User).where(User.persona == pdata["persona"])).scalar_one_or_none()
            if user:
                print(f"[Exists] Persona '{pdata['persona']}' already exists. Updating records...")
                # Remove child records to refresh cleanly
                db.delete(user)
                db.flush()

            # Create User
            user = User(
                email=pdata.get("email"),
                hashed_password=hash_password(pdata.get("password", "Password@123")),
                is_active=True,
                name=pdata["name"],
                persona=pdata["persona"],
                language_pref=pdata["language_pref"],
            )
            db.add(user)
            db.flush()

            # Create Profile
            prof = pdata["profile"]
            profile = FinancialProfile(
                user_id=user.id,
                monthly_income=prof["monthly_income"],
                income_type=prof["income_type"],
                emergency_fund_saved=prof["emergency_fund_saved"],
            )
            db.add(profile)

            # Create Incomes
            for inc in pdata["income"]:
                db.add(IncomeRecord(user_id=user.id, **inc))

            # Create Expenses
            for exp in pdata["expenses"]:
                db.add(ExpenseRecord(user_id=user.id, **exp))

            # Create Goals
            for goal in pdata["goals"]:
                db.add(Goal(user_id=user.id, **goal))

            # Create Sample Chat
            chat_data = pdata["chat"]
            session = ChatSession(user_id=user.id, title=chat_data["title"])
            db.add(session)
            db.flush()
            for msg in chat_data["messages"]:
                db.add(ChatMessage(session_id=session.id, role=msg["role"], content=msg["content"]))

            # Create Journal
            jdata = pdata["journal"]
            db.add(JournalEntry(user_id=user.id, **jdata))

            # Create initial health score snapshot
            db.add(
                HealthScoreSnapshot(
                    user_id=user.id,
                    score=72 if pdata["persona"] != "student" else 58,
                    breakdown_json='{"savings_rate": 20, "emergency_fund": 18, "needs_ratio": 16, "wants_discipline": 10, "goal_progress": 8}',
                )
            )

            # Create sample claim check
            db.add(
                ClaimCheck(
                    user_id=user.id,
                    claim_text="Invest ₹10,000 today and earn 10% guaranteed returns every month!",
                    extracted_json='{"promised_return_pct": 10.0, "period": "month", "is_guaranteed": true}',
                    computed_json='{"cagr_pct": 213.84, "illustration_1y": 31384.28}',
                    risk_level="extreme",
                    explanation="Guaranteed 10% monthly return implies an absurd 213.84% annual return, which is mathematically impossible in regulated markets.",
                )
            )

            print(f"[Created] Persona '{pdata['persona']}' (User ID: {user.id}, Name: {user.name})")

        db.commit()
        print("--- Demo data successfully seeded! ---")
    except Exception as e:
        db.rollback()
        print(f"Error seeding demo data: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_demo_data()

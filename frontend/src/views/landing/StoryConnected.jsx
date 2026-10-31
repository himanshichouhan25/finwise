import React from 'react';
import {
  PieChart,
  Target,
  TrendingUp,
  CreditCard,
  Activity,
  Clock,
  ArrowUpRight,
  ShieldCheck
} from 'lucide-react';

export default function StoryConnected() {
  return (
    <section id="features" style={{ padding: '7rem 0', background: 'var(--cs-bg-soft)', position: 'relative' }}>
      <div className="cs-container">
        {/* Section Header */}
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center', marginBottom: '5rem' }}>
          <div className="cs-eyebrow cs-eyebrow-teal">
            <Activity size={14} /> Integrated Architecture
          </div>
          <h2 className="cs-headline-editorial" style={{ marginBottom: '1.25rem' }}>
            Your financial life, <br />
            <span style={{ color: 'var(--cs-teal)' }}>connected in real time.</span>
          </h2>
          <p style={{ fontSize: '1.15rem', color: 'var(--cs-text-secondary)', lineHeight: 1.6 }}>
            No more jumping between isolated calculator tabs. Every budget entry, loan payment, and savings goal
            feeds continuously into a single personal financial operating system.
          </p>
        </div>

        {/* Feature Showcase 1: 50/30/20 Budget & Expense Intelligence (Asymmetrical 2-Column) */}
        <div
          className="cs-editorial-split"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1.15fr',
            gap: '3.5rem',
            alignItems: 'center',
            marginBottom: '6rem',
          }}
        >
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--cs-violet)', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.75rem' }}>
              <PieChart size={16} /> Module 01 • Cash Flow Discipline
            </div>
            <h3 style={{ fontSize: '2.2rem', fontWeight: 850, color: 'var(--cs-text-primary)', marginBottom: '1rem', lineHeight: 1.15 }}>
              50/30/20 Budgeting without manual spreadsheet pain.
            </h3>
            <p style={{ fontSize: '1.05rem', color: 'var(--cs-text-secondary)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              Record incomes and expenses once. FinWise automatically categorizes transactions into Needs, Wants, and Savings,
              alerting you before you exceed your monthly discretionary limits.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.9rem', color: 'var(--cs-text-primary)' }}>
              <div>✓ Automatic category-to-bucket mapping (Housing, Food, Groceries, Entertainment)</div>
              <div>✓ Live remaining balance alerts for discretionary Wants</div>
              <div>✓ Real-time net monthly surplus calculation</div>
            </div>
          </div>

          {/* Budget UI Mockup */}
          <div className="cs-editorial-card" style={{ padding: '2rem', borderRadius: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '0.85rem', borderBottom: '1px solid var(--cs-border-light)' }}>
              <span style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--cs-text-primary)' }}>Monthly Budget Allocation</span>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--cs-teal)', background: 'var(--cs-teal-soft)', padding: '0.25rem 0.65rem', borderRadius: '6px' }}>Verified Python Engine</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ background: 'var(--cs-bg-soft)', borderRadius: '14px', padding: '1rem' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--cs-violet)', fontWeight: 750, textTransform: 'uppercase' }}>Needs (50%)</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 850, color: 'var(--cs-text-primary)', margin: '0.2rem 0' }}>₹21,600</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--cs-text-secondary)' }}>48% of ₹45K</div>
              </div>
              <div style={{ background: 'var(--cs-bg-soft)', borderRadius: '14px', padding: '1rem' }}>
                <div style={{ fontSize: '0.72rem', color: '#D97706', fontWeight: 750, textTransform: 'uppercase' }}>Wants (30%)</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 850, color: 'var(--cs-text-primary)', margin: '0.2rem 0' }}>₹12,600</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--cs-text-secondary)' }}>28% of ₹45K</div>
              </div>
              <div style={{ background: 'var(--cs-bg-soft)', borderRadius: '14px', padding: '1rem' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--cs-teal)', fontWeight: 750, textTransform: 'uppercase' }}>Savings (20%)</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 850, color: 'var(--cs-text-primary)', margin: '0.2rem 0' }}>₹10,800</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--cs-text-secondary)' }}>24% of ₹45K</div>
              </div>
            </div>
            <div style={{ height: '10px', borderRadius: '999px', background: '#E2E8F0', overflow: 'hidden', display: 'flex' }}>
              <div style={{ width: '48%', background: 'var(--cs-violet)' }} />
              <div style={{ width: '28%', background: '#F59E0B' }} />
              <div style={{ width: '24%', background: 'var(--cs-teal)' }} />
            </div>
          </div>
        </div>

        {/* Feature Showcase 2: SIP Wealth Simulator & Loan Amortization (Asymmetrical 2-Column Inverted) */}
        <div
          className="cs-editorial-split"
          style={{
            display: 'grid',
            gridTemplateColumns: '1.15fr 1fr',
            gap: '3.5rem',
            alignItems: 'center',
          }}
        >
          {/* SIP & Loan Mockup */}
          <div className="cs-editorial-card" style={{ padding: '2rem', borderRadius: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              
              {/* SIP Card */}
              <div style={{ background: 'var(--cs-bg-soft)', borderRadius: '16px', padding: '1.25rem', border: '1px solid var(--cs-border-light)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#10B981', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                  <TrendingUp size={16} /> SIP Wealth Projection
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 850, color: 'var(--cs-text-primary)' }}>₹28.4 Lakhs</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--cs-text-muted)', marginBottom: '0.75rem' }}>₹5,000/mo • 10% Step-Up • 15 Years</div>
                <div style={{ fontSize: '0.75rem', padding: '0.4rem 0.6rem', borderRadius: '8px', background: '#FFFFFF', color: 'var(--cs-text-secondary)', border: '1px solid var(--cs-border-light)' }}>
                  Inflation Adjusted (5.5%): <strong>₹16.2 Lakhs</strong> Purchasing Power
                </div>
              </div>

              {/* Loan Card */}
              <div style={{ background: 'var(--cs-bg-soft)', borderRadius: '16px', padding: '1.25rem', border: '1px solid var(--cs-border-light)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#F59E0B', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                  <CreditCard size={16} /> Loan Prepayment Intel
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 850, color: 'var(--cs-text-primary)' }}>Save ₹42,500</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--cs-text-muted)', marginBottom: '0.75rem' }}>Education Loan • Reducing Balance</div>
                <div style={{ fontSize: '0.75rem', padding: '0.4rem 0.6rem', borderRadius: '8px', background: '#FFFFFF', color: 'var(--cs-text-secondary)', border: '1px solid var(--cs-border-light)' }}>
                  +₹2,000/mo Prepayment cuts tenure by <strong>14 Months</strong>
                </div>
              </div>

            </div>
          </div>

          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--cs-teal)', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.75rem' }}>
              <TrendingUp size={16} /> Module 02 • Long-Term Projections
            </div>
            <h3 style={{ fontSize: '2.2rem', fontWeight: 850, color: 'var(--cs-text-primary)', marginBottom: '1rem', lineHeight: 1.15 }}>
              Realistic wealth compounding & strategic debt reduction.
            </h3>
            <p style={{ fontSize: '1.05rem', color: 'var(--cs-text-secondary)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              FinWise models SIP growth with true start-of-month annuity math, optional annual step-ups, and inflation purchasing power discounting.
              For loans, it reveals the exact interest saved through monthly prepayments.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.9rem', color: 'var(--cs-text-primary)' }}>
              <div>✓ Clear distinction between estimated wealth and historical reality</div>
              <div>✓ Reducing-balance EMI amortization schedules</div>
              <div>✓ Avalanche vs Snowball debt payoff ranking</div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}


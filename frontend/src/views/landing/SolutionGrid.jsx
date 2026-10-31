import React from 'react';
import {
  BotMessageSquare,
  PieChart,
  Target,
  Clock,
  TrendingUp,
  CreditCard,
  ShieldAlert,
  Activity,
  LineChart,
  ArrowUpRight
} from 'lucide-react';

export default function SolutionGrid({ onSelectFeature }) {
  const modules = [
    {
      id: 'coach',
      icon: BotMessageSquare,
      title: 'AI Financial Coach',
      category: 'Context-Aware AI',
      desc: 'Ask questions in English or Hindi. Executes deterministic Python calculators without LLM hallucinations.',
      badge: 'Groq Multi-Model',
      accent: 'var(--lp-brand-violet)',
      bg: 'var(--lp-bg-lavender)',
    },
    {
      id: 'budget',
      icon: PieChart,
      title: '50/30/20 Budget Engine',
      category: 'Cash Flow Intelligence',
      desc: 'Automatically sorts expenses into Needs, Wants, and Savings with live overrun alerts.',
      badge: 'Rule Engine',
      accent: 'var(--lp-brand-teal)',
      bg: 'var(--lp-brand-teal-soft)',
    },
    {
      id: 'goals',
      icon: Target,
      title: 'Goal Planner & What-If',
      category: 'Savings Roadmap',
      desc: 'Set goals for emergency funds, education, or electronics with automatic monthly allocation schedules.',
      badge: 'Goal Tracking',
      accent: 'var(--lp-brand-violet)',
      bg: 'var(--lp-bg-lavender)',
    },
    {
      id: 'delayed',
      icon: Clock,
      title: 'Goal-Days Delayed',
      category: 'Signature USP',
      desc: 'Translates spontaneous impulse spends into the exact calendar days your primary goals are postponed.',
      badge: 'Behavioral FinTech',
      accent: '#EF4444',
      bg: 'rgba(239, 68, 68, 0.08)',
    },
    {
      id: 'sip',
      icon: TrendingUp,
      title: 'SIP Compounding Simulator',
      category: 'Wealth Projection',
      desc: 'Projects long-term compounding with optional annual step-up and 5.5% inflation purchasing power discounting.',
      badge: 'Pure Annuity Math',
      accent: '#10B981',
      bg: 'rgba(16, 185, 129, 0.08)',
    },
    {
      id: 'loans',
      icon: CreditCard,
      title: 'Loan & EMI Manager',
      category: 'Debt Prioritization',
      desc: 'Reducing-balance amortization schedules with prepayment simulator (Avalanche vs Snowball strategies).',
      badge: 'Amortization Engine',
      accent: '#F59E0B',
      bg: 'rgba(245, 158, 11, 0.08)',
    },
    {
      id: 'claims',
      icon: ShieldAlert,
      title: 'Finfluencer Claim Check',
      category: 'Scam Detection',
      desc: 'Pastes social media video promises, computes implied CAGR, and flags SEBI regulatory violations.',
      badge: 'SEBI Guardrail',
      accent: '#DC2626',
      bg: 'rgba(220, 38, 38, 0.08)',
    },
    {
      id: 'health',
      icon: Activity,
      title: 'Financial Health Score',
      category: 'Holistic Diagnostics',
      desc: 'Calculates a comprehensive 0–100 score across savings rate, DTI, emergency runway, and goals.',
      badge: '5-Pillar Score',
      accent: 'var(--lp-brand-violet)',
      bg: 'var(--lp-bg-lavender)',
    },
    {
      id: 'market',
      icon: LineChart,
      title: 'Market Intelligence',
      category: 'Indian Equities',
      desc: 'Live and EOD quotes, multi-timeframe OHLCV candles, and verified fundamentals (NIFTY, SENSEX, NSE stocks).',
      badge: 'Multi-Provider Failover',
      accent: 'var(--lp-brand-teal)',
      bg: 'var(--lp-brand-teal-soft)',
    },
  ];

  return (
    <section id="features" style={{ padding: '6rem 0', background: 'var(--lp-bg-white)', position: 'relative' }}>
      <div className="lp-container">
        {/* Section Header */}
        <div style={{ maxWidth: '750px', margin: '0 auto', textAlign: 'center', marginBottom: '3.5rem' }}>
          <div className="lp-badge lp-badge-teal" style={{ marginBottom: '1rem' }}>
            Unified Financial Platform
          </div>
          <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.75rem)', marginBottom: '1rem' }}>
            One intelligent companion for your{' '}
            <span className="lp-gradient-text">financial life.</span>
          </h2>
          <p style={{ fontSize: '1.05rem', color: 'var(--lp-text-secondary)', lineHeight: 1.6 }}>
            Every tool connects directly to your verified numbers. No fragmented spreadsheets, no isolated calculators.
          </p>
        </div>

        {/* 9-Module Connected Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {modules.map((mod) => {
            const Icon = mod.icon;
            return (
              <div
                key={mod.id}
                className="lp-card lp-card-hover"
                onClick={() => onSelectFeature?.(mod.id)}
                style={{
                  padding: '1.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderRadius: '20px',
                  border: '1px solid var(--lp-border-subtle)',
                  cursor: 'pointer',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                    <div
                      style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: '14px',
                        background: mod.bg,
                        color: mod.accent,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Icon size={24} />
                    </div>
                    <span style={{ fontSize: '0.74rem', padding: '0.25rem 0.65rem', borderRadius: '6px', background: 'var(--lp-bg-soft)', color: 'var(--lp-text-muted)', fontWeight: 700 }}>
                      {mod.badge}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: mod.accent, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.35rem' }}>
                    {mod.category}
                  </div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--lp-text-primary)', marginBottom: '0.65rem' }}>
                    {mod.title}
                  </h3>
                  <p style={{ fontSize: '0.88rem', color: 'var(--lp-text-secondary)', lineHeight: 1.55, margin: 0 }}>
                    {mod.desc}
                  </p>
                </div>

                <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--lp-border-light)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 600, color: mod.accent }}>
                  <span>Explore Feature</span>
                  <ArrowUpRight size={16} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

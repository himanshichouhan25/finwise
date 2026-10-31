import React from 'react';
import { HelpCircle, Clock, AlertTriangle, Calculator, Sparkles } from 'lucide-react';

export default function ProblemSection() {
  const problems = [
    {
      icon: HelpCircle,
      tag: 'Information Overload',
      title: 'Financial data is everywhere, but clarity is rare',
      description:
        'Standard banking apps tell you what you spent, but never tell you what it means for your future, leaving first-time earners confused and overwhelmed.',
      accent: 'var(--lp-brand-violet)',
      bg: 'var(--lp-bg-lavender)',
    },
    {
      icon: Clock,
      tag: 'Hidden Opportunity Cost',
      title: 'Impulse purchases silently delay what matters most',
      description:
        'A single ₹8,000 flash-sale gadget doesn’t just cost ₹8,000—it delays your 3-month safety fund or first vehicle down payment by an invisible 22 days.',
      accent: '#EF4444',
      bg: 'rgba(239, 68, 68, 0.08)',
    },
    {
      icon: AlertTriangle,
      tag: 'The Influencer Trap',
      title: 'Social media claims promise impossible returns',
      description:
        'Unregistered finfluencers promise 50% monthly gains or "guaranteed penny stock breakouts" that mathematically defy Warren Buffett’s 50-year record.',
      accent: '#D97706',
      bg: 'rgba(245, 158, 11, 0.08)',
    },
    {
      icon: Calculator,
      tag: 'Complex Math Barriers',
      title: 'Loan EMI and SIP compound growth remain abstract',
      description:
        'Understanding reducing-balance interest, loan prepayments, annual step-up compounding, and inflation purchasing power requires tedious spreadsheet work.',
      accent: 'var(--lp-brand-teal)',
      bg: 'var(--lp-brand-teal-soft)',
    },
  ];

  return (
    <section id="problem" style={{ padding: '6rem 0', background: 'var(--lp-bg-soft)', position: 'relative' }}>
      <div className="lp-container">
        {/* Section Header */}
        <div style={{ maxWidth: '720px', margin: '0 auto', textAlign: 'center', marginBottom: '3.5rem' }}>
          <div className="lp-badge lp-badge-violet" style={{ marginBottom: '1rem' }}>
            The Reality of First-Time Personal Finance
          </div>
          <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.75rem)', marginBottom: '1rem' }}>
            Managing money is easy.{' '}
            <span style={{ color: 'var(--lp-brand-violet)' }}>Understanding it is harder.</span>
          </h2>
          <p style={{ fontSize: '1.05rem', color: 'var(--lp-text-secondary)', lineHeight: 1.6 }}>
            Most tools record past transactions like a digital cash register. FinWise AI was built to solve
            the friction points college students, gig freelancers, and first-job earners actually face every day.
          </p>
        </div>

        {/* 4 Editorial Problem Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
          {problems.map((prob) => {
            const Icon = prob.icon;
            return (
              <div
                key={prob.title}
                className="lp-card lp-card-hover"
                style={{
                  padding: '1.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderRadius: '20px',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                    <div
                      style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '12px',
                        background: prob.bg,
                        color: prob.accent,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Icon size={22} />
                    </div>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: prob.accent, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      {prob.tag}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--lp-text-primary)' }}>
                    {prob.title}
                  </h3>
                  <p style={{ fontSize: '0.88rem', color: 'var(--lp-text-secondary)', lineHeight: 1.55, margin: 0 }}>
                    {prob.description}
                  </p>
                </div>

                <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--lp-border-light)', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', fontWeight: 600, color: 'var(--lp-brand-violet)' }}>
                  <Sparkles size={14} /> Solved by FinWise Intelligence
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

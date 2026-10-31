import React from 'react';
import { ArrowRight, Compass, LineChart, ShieldCheck } from 'lucide-react';

export default function HowItWorks({ onOpenAuth }) {
  const steps = [
    {
      num: '01',
      icon: Compass,
      title: '1. Understand',
      desc: 'Input or import your monthly income and expenses. FinWise automatically categorizes everything into transparent 50/30/20 buckets.',
      badge: 'Zero Guesswork',
    },
    {
      num: '02',
      icon: LineChart,
      title: '2. Plan',
      desc: 'Simulate financial goals, model annual SIP step-up compounding with inflation discounting, and plan debt-reduction strategies.',
      badge: 'Mathematical Engines',
    },
    {
      num: '03',
      icon: ShieldCheck,
      title: '3. Decide Smarter',
      desc: 'Consult your AI coach in plain English or Hindi, audit viral investment claims, and pause impulse buys with 24-hour cooling-off timers.',
      badge: 'Protected Future',
    },
  ];

  return (
    <section id="how-it-works" style={{ padding: '6rem 0', background: 'var(--lp-bg-white)', position: 'relative' }}>
      <div className="lp-container">
        {/* Header */}
        <div style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center', marginBottom: '4rem' }}>
          <div className="lp-badge lp-badge-violet" style={{ marginBottom: '1rem' }}>
            Simple 3-Step Journey
          </div>
          <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.75rem)', marginBottom: '1rem' }}>
            How FinWise transforms your financial confidence.
          </h2>
          <p style={{ fontSize: '1.05rem', color: 'var(--lp-text-secondary)', lineHeight: 1.6 }}>
            No tedious manual bookkeeping. No complicated financial jargon. A structured path from confusion to clarity.
          </p>
        </div>

        {/* 3 Steps */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', position: 'relative' }}>
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={step.title}
                className="lp-card lp-card-hover"
                style={{
                  padding: '2.25rem 1.75rem',
                  borderRadius: '24px',
                  border: '1px solid var(--lp-border-subtle)',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                    <div
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '14px',
                        background: 'var(--lp-bg-lavender)',
                        color: 'var(--lp-brand-violet)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Icon size={24} />
                    </div>
                    <span style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--lp-border-subtle)' }}>
                      {step.num}
                    </span>
                  </div>

                  <span style={{ fontSize: '0.72rem', padding: '0.2rem 0.6rem', borderRadius: '6px', background: 'var(--lp-brand-teal-soft)', color: 'var(--lp-brand-teal)', fontWeight: 700, textTransform: 'uppercase' }}>
                    {step.badge}
                  </span>

                  <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--lp-text-primary)', marginTop: '0.85rem', marginBottom: '0.75rem' }}>
                    {step.title}
                  </h3>
                  <p style={{ fontSize: '0.92rem', color: 'var(--lp-text-secondary)', lineHeight: 1.6, margin: 0 }}>
                    {step.desc}
                  </p>
                </div>

                <div style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid var(--lp-border-light)' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--lp-brand-violet)' }}>
                    Phase {idx + 1} of Financial Freedom
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA Button */}
        <div style={{ textAlign: 'center', marginTop: '3.5rem' }}>
          <button
            type="button"
            onClick={() => onOpenAuth?.('register')}
            className="lp-btn lp-btn-primary"
            style={{ padding: '0.85rem 2rem', fontSize: '1rem' }}
          >
            Start Your Journey Free <ArrowRight size={17} />
          </button>
        </div>
      </div>
    </section>
  );
}


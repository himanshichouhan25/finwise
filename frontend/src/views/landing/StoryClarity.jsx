import React from 'react';
import { Sparkles, Activity, ShieldCheck, HeartPulse, Check, ArrowRight } from 'lucide-react';

export default function StoryClarity({ onOpenAuth }) {
  const pillars = [
    { name: 'Savings Discipline', score: '92 / 100', status: 'Excellent', desc: 'Saving 24% of monthly net income (target >20%)' },
    { name: 'Emergency Runway', score: '80 / 100', status: 'Strong', desc: '2.4 months saved toward 3-month safety fund' },
    { name: 'Debt Burden (DTI)', score: '88 / 100', status: 'Low Risk', desc: 'Monthly debt payments comprise only 12% of income' },
    { name: 'Goal Adherence', score: '78 / 100', status: 'On Track', desc: '2 active goals funded consistently without overdue lapses' },
  ];

  return (
    <section style={{ padding: '7rem 0', background: 'var(--cs-bg-white)', position: 'relative' }}>
      <div className="cs-container">
        {/* Header */}
        <div style={{ maxWidth: '820px', margin: '0 auto', textAlign: 'center', marginBottom: '4.5rem' }}>
          <div className="cs-eyebrow cs-eyebrow-teal">
            <HeartPulse size={14} /> Unified Financial Health
          </div>
          <h2 className="cs-headline-editorial" style={{ marginBottom: '1.25rem' }}>
            Less financial noise. <br />
            <span style={{ color: 'var(--cs-teal)' }}>More intentional decisions.</span>
          </h2>
          <p style={{ fontSize: '1.15rem', color: 'var(--cs-text-secondary)', lineHeight: 1.6 }}>
            Personal finance is not about restriction or sacrifice—it is about clarity. FinWise consolidates your complete
            financial intelligence into an objective diagnostic, showing you where you stand and where you can grow.
          </p>
        </div>

        {/* Unified Diagnostic Showcase Stage */}
        <div
          className="cs-editorial-card"
          style={{
            maxWidth: '1060px',
            margin: '0 auto',
            padding: '3rem',
            borderRadius: '28px',
            background: 'linear-gradient(135deg, #FFFFFF 0%, #FAF7FF 50%, #F1F5F9 100%)',
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3.5rem', alignItems: 'center' }}>
            
            {/* Left: Overall Health Score Circular Gauge */}
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  width: '160px',
                  height: '160px',
                  borderRadius: '50%',
                  background: 'conic-gradient(var(--cs-teal) 0% 84%, #E2E8F0 84% 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.5rem auto',
                  boxShadow: '0 12px 30px rgba(15, 159, 154, 0.25)',
                }}
              >
                <div style={{ width: '130px', height: '130px', borderRadius: '50%', background: '#FFFFFF', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '3rem', fontWeight: 950, color: 'var(--cs-teal)', lineHeight: 1 }}>84</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--cs-text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>out of 100</span>
                </div>
              </div>

              <h4 style={{ fontSize: '1.35rem', fontWeight: 850, color: 'var(--cs-text-primary)', marginBottom: '0.35rem' }}>
                Strong Financial Health
              </h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--cs-text-secondary)', maxWidth: '280px', margin: '0 auto' }}>
                Composite score normalized across savings rate, debt-to-income, and goal consistency.
              </p>
            </div>

            {/* Right: 4 Health Diagnostic Pillars */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {pillars.map((pil) => (
                <div
                  key={pil.name}
                  style={{
                    background: '#FFFFFF',
                    borderRadius: '16px',
                    padding: '1.1rem 1.35rem',
                    border: '1px solid var(--cs-border-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxShadow: '0 2px 8px rgba(16, 24, 40, 0.03)',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.92rem', fontWeight: 750, color: 'var(--cs-text-primary)' }}>{pil.name}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--cs-text-muted)' }}>{pil.desc}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.05rem', fontWeight: 850, color: 'var(--cs-violet)' }}>{pil.score}</div>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--cs-teal)', background: 'var(--cs-teal-soft)', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                      {pil.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>

          </div>

          <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--cs-border-light)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--cs-text-muted)' }}>
              ✦ Educational diagnostic tool based on peer-reviewed personal finance benchmarks.
            </span>
            <button
              type="button"
              onClick={() => onOpenAuth?.('register')}
              className="cs-btn cs-btn-primary"
              style={{ fontSize: '0.9rem', padding: '0.7rem 1.4rem' }}
            >
              Get Your Score Free <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}


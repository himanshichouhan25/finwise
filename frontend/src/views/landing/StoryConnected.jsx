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
import SectionArtifacts from './SectionArtifacts';

export default function StoryConnected() {
  return (
    <section 
      id="features" 
      style={{ 
        padding: '7rem 0', 
        background: 'linear-gradient(180deg, #F8FAFC 0%, #ECFDF5 35%, #F0FDFA 75%, #F8FAFC 100%)', 
        position: 'relative', 
        overflow: 'hidden' 
      }}
    >
      <SectionArtifacts variant="connected" glowPosition="both" />
      <div className="cs-container" style={{ position: 'relative', zIndex: 1 }}>
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
            No more logging into three separate spreadsheets and five apps. Every module feeds into the same deterministic core engine.
          </p>
        </div>

        {/* Feature Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '2rem',
          }}
        >
          {[
            {
              icon: PieChart,
              title: '50/30/20 Budgeting',
              desc: 'Live allocation tracker for Needs, Wants, and Savings with real-time overrun warnings.',
              color: 'var(--cs-violet)',
              tag: 'Core'
            },
            {
              icon: Target,
              title: 'Goal-Days Delayed',
              desc: 'Translates spending impulses into calendar delays on your real goals before you swipe.',
              color: 'var(--cs-teal)',
              tag: 'Signature'
            },
            {
              icon: ShieldCheck,
              title: 'Claim Reality Check',
              desc: 'Mathematical finfluencer scam auditor with regulatory guardrails and fact-checking.',
              color: '#10B981',
              tag: 'SEBI-Aligned'
            },
            {
              icon: TrendingUp,
              title: 'SIP Compounding Simulator',
              desc: 'Accurate wealth projections and inflation-adjusted forecasts with visible assumptions.',
              color: '#6366F1',
              tag: 'Wealth'
            },
            {
              icon: CreditCard,
              title: 'Loan Prepayment Engine',
              desc: 'Amortization schedules showing total interest saved when adding small recurring prepayments.',
              color: '#8B5CF6',
              tag: 'Debt'
            },
            {
              icon: Clock,
              title: 'Impulse Decision Journal',
              desc: 'Psychological cooling-off timers and reflection tracking for high-conviction spending.',
              color: '#F59E0B',
              tag: 'Behavioral'
            },
          ].map(({ icon: Icon, title, desc, color, tag }) => (
            <div
              key={title}
              className="cs-editorial-card"
              style={{
                padding: '2.25rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                background: '#FFFFFF',
                boxShadow: '0 20px 45px -10px rgba(15, 159, 154, 0.12), 0 4px 16px rgba(0, 0, 0, 0.04)',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                  <div
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '14px',
                      background: `rgba(15, 159, 154, 0.08)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: color,
                    }}
                  >
                    <Icon size={24} />
                  </div>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 750,
                      textTransform: 'uppercase',
                      padding: '0.25rem 0.65rem',
                      borderRadius: '8px',
                      background: 'var(--cs-bg-soft)',
                      color: 'var(--cs-text-muted)',
                      letterSpacing: '0.04em',
                    }}
                  >
                    {tag}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--cs-text-primary)', marginBottom: '0.75rem' }}>
                  {title}
                </h3>
                <p style={{ fontSize: '0.92rem', color: 'var(--cs-text-secondary)', lineHeight: 1.6, margin: 0 }}>
                  {desc}
                </p>
              </div>

              <div
                style={{
                  marginTop: '1.75rem',
                  paddingTop: '1rem',
                  borderTop: '1px solid var(--cs-border-light)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  color: color,
                  fontSize: '0.82rem',
                  fontWeight: 700,
                }}
              >
                Learn architecture <ArrowUpRight size={15} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

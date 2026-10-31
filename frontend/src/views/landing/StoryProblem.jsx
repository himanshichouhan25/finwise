import React from 'react';
import { ArrowDownRight, ArrowUpRight, Clock, HelpCircle, Compass } from 'lucide-react';
import SectionArtifacts from './SectionArtifacts';

export default function StoryProblem() {
  return (
    <section 
      id="problem" 
      style={{ 
        padding: '7rem 0', 
        background: 'linear-gradient(180deg, #F8FAFC 0%, #EEF2FF 40%, #F5F3FF 75%, #F8FAFC 100%)', 
        position: 'relative', 
        overflow: 'hidden' 
      }}
    >
      <SectionArtifacts variant="problem" />
      <div className="cs-container" style={{ position: 'relative', zIndex: 1 }}>
        {/* Section Header */}
        <div style={{ maxWidth: '820px', marginBottom: '4rem' }}>
          <div className="cs-eyebrow cs-eyebrow-light">
            <Compass size={14} /> The Personal Finance Friction
          </div>
          <h2 className="cs-headline-editorial" style={{ marginBottom: '1.25rem' }}>
            Your money is moving. <br />
            <span style={{ color: 'var(--cs-violet)' }}>Is it moving you forward?</span>
          </h2>
          <p style={{ fontSize: '1.2rem', color: 'var(--cs-text-secondary)', lineHeight: 1.6, maxWidth: '640px' }}>
            Every month, money flows through bank accounts and UPI apps. But transactions only tell you what happened—not
            what you should do next.
          </p>
        </div>

        {/* Editorial Split Grid: Money Flow vs Goal Impact */}
        <div
          className="cs-editorial-split"
          style={{
            display: 'grid',
            gridTemplateColumns: '1.1fr 0.9fr',
            gap: '3rem',
            alignItems: 'stretch',
          }}
        >
          {/* Card A: The Fragmented Flow */}
          <div
            className="cs-editorial-card"
            style={{
              padding: '2.5rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              background: '#FFFFFF',
              boxShadow: '0 20px 45px -10px rgba(109, 74, 255, 0.1), 0 4px 16px rgba(0, 0, 0, 0.04)',
            }}
          >
            <div>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--cs-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1.5rem' }}>
                Traditional Money Flow (Unstructured)
              </div>

              {/* Inflow vs Outflow Visual */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ background: 'var(--cs-bg-soft)', borderRadius: '16px', padding: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#10B981', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                    <ArrowDownRight size={18} /> Inflow Earned
                  </div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 850, color: 'var(--cs-text-primary)' }}>₹45,000</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--cs-text-secondary)' }}>Stipend / First Salary</div>
                </div>

                <div style={{ background: 'var(--cs-bg-soft)', borderRadius: '16px', padding: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#EF4444', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                    <ArrowUpRight size={18} /> Invisible Outflow
                  </div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 850, color: '#EF4444' }}>-₹38,200</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--cs-text-secondary)' }}>Micro-UPI, subscriptions, FOMO</div>
                </div>
              </div>

              <div style={{ fontSize: '0.98rem', color: 'var(--cs-text-secondary)', lineHeight: 1.6 }}>
                Without unified categorization, small spontaneous expenses disperse your savings before you can invest.
                You are left wondering where your paycheck vanished at the end of every month.
              </div>
            </div>

            <div style={{ marginTop: '2rem', paddingTop: '1.25rem', borderTop: '1px solid var(--cs-border-light)', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--cs-text-muted)', fontSize: '0.82rem' }}>
              <HelpCircle size={16} /> Result: Disconnected from your long-term roadmap
            </div>
          </div>

          {/* Card B: The Real Hidden Consequence (Goal Postponement) */}
          <div
            className="cs-editorial-card"
            style={{
              padding: '2.5rem',
              background: 'linear-gradient(135deg, #FAF7FF 0%, #FFFFFF 100%)',
              border: '1.5px solid rgba(109, 74, 255, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 20px 45px -10px rgba(109, 74, 255, 0.12), 0 4px 16px rgba(0, 0, 0, 0.04)',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--cs-violet)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  The Hidden Trade-Off
                </span>
                <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.65rem', borderRadius: '6px', background: 'rgba(239, 68, 68, 0.1)', color: '#DC2626', fontWeight: 700 }}>
                  Calendar Shift
                </span>
              </div>

              <h3 style={{ fontSize: '1.5rem', fontWeight: 850, color: 'var(--cs-text-primary)', marginBottom: '1rem', lineHeight: 1.25 }}>
                Every unplanned spend postpones a planned milestone.
              </h3>

              <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '1.25rem', border: '1px solid var(--cs-border-light)', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Clock size={20} color="#DC2626" />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--cs-text-muted)' }}>Contemplated ₹12,000 Purchase</div>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--cs-text-primary)' }}>+16 Days Added to Goal</div>
                  </div>
                </div>
                <div style={{ height: '6px', borderRadius: '999px', background: '#F1F5F9', overflow: 'hidden' }}>
                  <div style={{ width: '65%', height: '100%', background: 'linear-gradient(90deg, #6D4AFF, #EF4444)' }} />
                </div>
              </div>

              <p style={{ fontSize: '0.92rem', color: 'var(--cs-text-secondary)', lineHeight: 1.6, margin: 0 }}>
                FinWise AI introduces <strong>Goal-Days Delayed</strong>: translating monetary outflows into tangible
                calendar days so you intuitively understand what each financial decision actually costs.
              </p>
            </div>

            <div style={{ marginTop: '2rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(109, 74, 255, 0.15)', fontSize: '0.85rem', fontWeight: 700, color: 'var(--cs-violet)' }}>
              ✦ FinWise replaces guessing with deterministic clarity.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

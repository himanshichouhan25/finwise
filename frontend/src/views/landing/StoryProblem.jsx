import React from 'react';
import { ArrowDownRight, ArrowUpRight, Clock, HelpCircle, Compass, Zap, AlertTriangle, Calendar, Target } from 'lucide-react';
import SectionArtifacts from './SectionArtifacts';

export default function StoryProblem() {
  return (
    <section 
      id="problem" 
      style={{ 
        padding: '7rem 0', 
        background: 'linear-gradient(180deg, #F8FAFC 0%, #EEF2FF 35%, #F5F3FF 75%, #F8FAFC 100%)', 
        position: 'relative', 
        overflow: 'hidden' 
      }}
    >
      <SectionArtifacts variant="problem" />
      
      <div className="cs-container" style={{ position: 'relative', zIndex: 1 }}>
        {/* Section Header */}
        <div style={{ maxWidth: '820px', marginBottom: '4rem' }}>
          <div className="cs-eyebrow cs-eyebrow-light" style={{ boxShadow: '0 4px 14px rgba(109, 74, 255, 0.15)' }}>
            <Compass size={14} /> The Personal Finance Friction
          </div>
          <h2 className="cs-headline-editorial" style={{ marginBottom: '1.25rem' }}>
            Your money is moving. <br />
            <span style={{ 
              background: 'linear-gradient(135deg, #6D4AFF 0%, #0F9F9A 100%)', 
              WebkitBackgroundClip: 'text', 
              WebkitTextFillColor: 'transparent' 
            }}>
              Is it moving you forward?
            </span>
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
          {/* Card A: The Fragmented Flow (High-End Cashflow Leakage Graphic) */}
          <div
            className="cs-editorial-card"
            style={{
              padding: '2.5rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              background: '#FFFFFF',
              borderRadius: '28px',
              border: '1.5px solid rgba(109, 74, 255, 0.18)',
              boxShadow: '0 25px 50px -12px rgba(109, 74, 255, 0.12), 0 4px 20px rgba(0, 0, 0, 0.04)',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--cs-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Traditional Money Flow (Unstructured)
                </div>
                <span style={{ fontSize: '0.72rem', padding: '0.2rem 0.6rem', borderRadius: '6px', background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', fontWeight: 750 }}>
                  High Friction
                </span>
              </div>

              {/* Inflow vs Outflow Visual Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.75rem' }}>
                <div style={{ 
                  background: 'linear-gradient(135deg, #F0FDF4 0%, #FFFFFF 100%)', 
                  borderRadius: '18px', 
                  padding: '1.25rem',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.06)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#10B981', fontSize: '0.82rem', fontWeight: 750, marginBottom: '0.4rem' }}>
                    <ArrowDownRight size={18} /> Inflow Earned
                  </div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#065F46', letterSpacing: '-0.02em' }}>₹45,000</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--cs-text-secondary)', marginTop: '2px' }}>Stipend / First Salary</div>
                </div>

                <div style={{ 
                  background: 'linear-gradient(135deg, #FEF2F2 0%, #FFFFFF 100%)', 
                  borderRadius: '18px', 
                  padding: '1.25rem',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.06)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#EF4444', fontSize: '0.82rem', fontWeight: 750, marginBottom: '0.4rem' }}>
                    <ArrowUpRight size={18} /> Invisible Outflow
                  </div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#DC2626', letterSpacing: '-0.02em' }}>-₹38,200</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--cs-text-secondary)', marginTop: '2px' }}>Micro-UPI, subscriptions, FOMO</div>
                </div>
              </div>

              {/* Graphic: Visual Cashflow Leakage Pipeline */}
              <div style={{ 
                background: '#FAFBFD', 
                borderRadius: '18px', 
                padding: '1.25rem', 
                border: '1px solid var(--cs-border-light)', 
                marginBottom: '1.5rem' 
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--cs-text-primary)' }}>
                    Salary Distribution Pipeline
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#EF4444', fontWeight: 750 }}>
                    84.8% Outflow
                  </span>
                </div>

                {/* Multi-segment progress bar */}
                <div style={{ height: '10px', borderRadius: '999px', display: 'flex', overflow: 'hidden', gap: '2px', marginBottom: '1rem', background: '#F1F5F9' }}>
                  <div style={{ width: '34%', background: '#F59E0B', title: 'Food & UPI' }} />
                  <div style={{ width: '22%', background: '#8B5CF6', title: 'Subscriptions' }} />
                  <div style={{ width: '29%', background: '#EF4444', title: 'Impulses' }} />
                  <div style={{ width: '15%', background: '#10B981', title: 'Investable Buffer' }} />
                </div>

                {/* Leakage Breakdown Chips */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', fontSize: '0.72rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--cs-text-secondary)' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#F59E0B' }} />
                    Food/UPI: ₹15.4K
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--cs-text-secondary)' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#8B5CF6' }} />
                    Subs: ₹9.8K
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--cs-text-secondary)' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#EF4444' }} />
                    Impulse: ₹13K
                  </div>
                </div>
              </div>

              {/* Residual Alert */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.65rem', 
                padding: '0.75rem 1rem', 
                borderRadius: '12px', 
                background: 'rgba(245, 158, 11, 0.08)', 
                border: '1px solid rgba(245, 158, 11, 0.25)',
                fontSize: '0.82rem',
                color: '#B45309'
              }}>
                <AlertTriangle size={16} />
                <span>Only <strong>₹6,800 (15.2%)</strong> remains for emergency reserves or compounding investments.</span>
              </div>
            </div>

            <div style={{ marginTop: '2rem', paddingTop: '1.25rem', borderTop: '1px solid var(--cs-border-light)', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--cs-text-muted)', fontSize: '0.82rem' }}>
              <HelpCircle size={16} /> Result: Disconnected from your long-term roadmap
            </div>
          </div>

          {/* Card B: The Real Hidden Consequence (Goal Postponement Engine Graphic) */}
          <div
            className="cs-editorial-card"
            style={{
              padding: '2.5rem',
              background: 'linear-gradient(135deg, #FAF7FF 0%, #FFFFFF 100%)',
              borderRadius: '28px',
              border: '1.5px solid rgba(109, 74, 255, 0.3)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 25px 50px -12px rgba(109, 74, 255, 0.16), 0 4px 20px rgba(0, 0, 0, 0.04)',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--cs-violet)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  The Hidden Trade-Off
                </span>
                <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.65rem', borderRadius: '6px', background: 'rgba(239, 68, 68, 0.1)', color: '#DC2626', fontWeight: 750 }}>
                  Calendar Shift
                </span>
              </div>

              <h3 style={{ fontSize: '1.5rem', fontWeight: 850, color: 'var(--cs-text-primary)', marginBottom: '1rem', lineHeight: 1.25 }}>
                Every unplanned spend postpones a planned milestone.
              </h3>

              {/* Graphic: Interactive Impulse Delay Card */}
              <div style={{ 
                background: '#FFFFFF', 
                borderRadius: '20px', 
                padding: '1.5rem', 
                border: '1.5px solid rgba(109, 74, 255, 0.2)', 
                boxShadow: '0 10px 25px -5px rgba(109, 74, 255, 0.08)',
                marginBottom: '1.5rem' 
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Clock size={22} color="#DC2626" />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--cs-text-muted)', fontWeight: 650 }}>Contemplated Expense</div>
                      <div style={{ fontSize: '1.15rem', fontWeight: 850, color: 'var(--cs-text-primary)' }}>₹12,000 Purchase</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.75rem', color: '#DC2626', fontWeight: 750, textTransform: 'uppercase' }}>Delay Impact</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 950, color: '#DC2626' }}>+16 Days</div>
                  </div>
                </div>

                {/* Visual Timeline Comparison Graphic */}
                <div style={{ 
                  background: '#F8FAFC', 
                  borderRadius: '14px', 
                  padding: '1rem', 
                  border: '1px solid var(--cs-border-light)' 
                }}>
                  {/* Baseline Pace */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem', fontSize: '0.78rem' }}>
                    <span style={{ color: '#10B981', fontWeight: 750, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Target size={14} /> Planned Goal Date:
                    </span>
                    <span style={{ fontWeight: 800, color: 'var(--cs-text-primary)' }}>Oct 15, 2026</span>
                  </div>

                  {/* Delay Timeline Bar */}
                  <div style={{ height: '8px', borderRadius: '999px', background: '#E2E8F0', overflow: 'hidden', position: 'relative', marginBottom: '0.6rem' }}>
                    <div style={{ width: '68%', height: '100%', background: '#10B981', borderRadius: '999px' }} />
                    <div style={{ position: 'absolute', left: '68%', width: '18%', height: '100%', background: '#EF4444' }} />
                  </div>

                  {/* Shifted Pace */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                    <span style={{ color: '#DC2626', fontWeight: 750, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Calendar size={14} /> New Shifted Date:
                    </span>
                    <span style={{ fontWeight: 850, color: '#DC2626' }}>Oct 31, 2026 (+16 Days)</span>
                  </div>
                </div>
              </div>

              <p style={{ fontSize: '0.92rem', color: 'var(--cs-text-secondary)', lineHeight: 1.6, margin: 0 }}>
                FinWise AI introduces <strong>Goal-Days Delayed</strong>: translating monetary outflows into tangible
                calendar days so you intuitively understand what each financial decision actually costs.
              </p>
            </div>

            <div style={{ marginTop: '2rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(109, 74, 255, 0.18)', fontSize: '0.85rem', fontWeight: 750, color: 'var(--cs-violet)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Zap size={16} /> FinWise replaces guessing with deterministic clarity.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

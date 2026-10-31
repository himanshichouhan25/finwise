import React from 'react';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Clock,
  BotMessageSquare
} from 'lucide-react';

export default function LandingHero({ onOpenAuth, onExploreDemo }) {
  return (
    <section id="overview" style={{ position: 'relative', paddingTop: '3.5rem', paddingBottom: '5rem', overflow: 'hidden' }}>
      {/* Background Soft Orbs */}
      <div
        className="lp-glow-orb"
        style={{
          top: '-10%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '750px',
          height: '420px',
          background: 'radial-gradient(ellipse, rgba(109, 74, 255, 0.12) 0%, rgba(15, 159, 154, 0.08) 50%, transparent 70%)',
        }}
      />
      <div
        className="lp-glow-orb"
        style={{
          top: '25%',
          right: '-5%',
          width: '450px',
          height: '450px',
          background: 'radial-gradient(circle, rgba(221, 248, 245, 0.8) 0%, transparent 70%)',
        }}
      />

      <div className="lp-container" style={{ position: 'relative', zIndex: 1 }}>
        {/* Top Announcement Badge */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.75rem' }}>
          <div className="lp-badge lp-badge-violet">
            <Sparkles size={14} /> Problem Statement 3.1 • AI Financial Coach for First-Time Investors
          </div>
        </div>

        {/* Main Headline & Supporting Paragraph */}
        <div style={{ maxWidth: '840px', margin: '0 auto', textAlign: 'center', marginBottom: '2.5rem' }}>
          <h1
            style={{
              fontSize: 'clamp(2.5rem, 5vw, 4rem)',
              lineHeight: 1.1,
              fontWeight: 800,
              marginBottom: '1.25rem',
              color: 'var(--lp-text-primary)',
            }}
          >
            Your Money Deserves a{' '}
            <span className="lp-gradient-text">Smarter Plan.</span>
          </h1>
          <p
            style={{
              fontSize: 'clamp(1.05rem, 2vw, 1.25rem)',
              color: 'var(--lp-text-secondary)',
              lineHeight: 1.6,
              maxWidth: '680px',
              margin: '0 auto',
            }}
          >
            FinWise AI helps you understand your finances, plan your goals, evaluate influencer claims,
            and make more confident money decisions with explainable intelligence.
          </p>
        </div>

        {/* Hero CTAs */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '4rem' }}>
          <button
            type="button"
            onClick={() => onOpenAuth?.('register')}
            className="lp-btn lp-btn-primary"
            style={{ padding: '0.85rem 1.8rem', fontSize: '1rem' }}
          >
            Explore FinWise Free <ArrowRight size={17} />
          </button>
          <button
            type="button"
            onClick={() => onExploreDemo?.()}
            className="lp-btn lp-btn-secondary"
            style={{ padding: '0.85rem 1.6rem', fontSize: '1rem' }}
          >
            Instant Guest Demo
          </button>
          <a
            href="#how-it-works"
            style={{ fontSize: '0.9rem', color: 'var(--lp-text-muted)', fontWeight: 600, textDecoration: 'none', marginLeft: '0.5rem' }}
          >
            See How It Works ↓
          </a>
        </div>

        {/* Hero Product Visual Composition */}
        <div style={{ maxWidth: '1060px', margin: '0 auto', position: 'relative' }}>
          {/* Main Dashboard Card Preview */}
          <div
            className="lp-card"
            style={{
              padding: '1.75rem',
              borderRadius: '24px',
              border: '1px solid rgba(226, 232, 240, 0.9)',
              background: '#FFFFFF',
              boxShadow: '0 25px 60px -15px rgba(16, 24, 40, 0.12), 0 0 0 1px rgba(16, 24, 40, 0.04)',
            }}
          >
            {/* Mockup Top Window Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '1.25rem', borderBottom: '1px solid var(--lp-border-light)', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ width: '11px', height: '11px', borderRadius: '50%', background: '#EF4444' }} />
                <span style={{ width: '11px', height: '11px', borderRadius: '50%', background: '#F59E0B' }} />
                <span style={{ width: '11px', height: '11px', borderRadius: '50%', background: '#10B981' }} />
                <span style={{ fontSize: '0.78rem', color: 'var(--lp-text-muted)', fontWeight: 600, marginLeft: '0.5rem' }}>
                  finwise.app/dashboard
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem', borderRadius: '6px', background: 'var(--lp-bg-lavender)', color: 'var(--lp-brand-violet)', fontWeight: 700 }}>
                  Active Persona: Student
                </span>
                <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem', borderRadius: '6px', background: 'var(--lp-brand-teal-soft)', color: 'var(--lp-brand-teal)', fontWeight: 700 }}>
                  ● Live Intelligence
                </span>
              </div>
            </div>

            {/* Dashboard Inner Grid Preview */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
              
              {/* Card 1: 50/30/20 Budget */}
              <div style={{ background: 'var(--lp-bg-soft)', borderRadius: '16px', padding: '1.25rem', border: '1px solid var(--lp-border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--lp-text-secondary)' }}>50/30/20 Budget Summary</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--lp-brand-teal)', fontWeight: 700 }}>October 2026</span>
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--lp-text-primary)', marginBottom: '0.35rem' }}>
                  ₹45,000 <span style={{ fontSize: '0.82rem', fontWeight: 500, color: 'var(--lp-text-muted)' }}>Net Income</span>
                </div>
                {/* Visual Bar */}
                <div style={{ height: '8px', borderRadius: '999px', background: '#E2E8F0', overflow: 'hidden', display: 'flex', margin: '0.85rem 0' }}>
                  <div style={{ width: '48%', background: 'var(--lp-brand-violet)' }} title="Needs: 48%" />
                  <div style={{ width: '28%', background: '#F59E0B' }} title="Wants: 28%" />
                  <div style={{ width: '24%', background: 'var(--lp-brand-teal)' }} title="Savings: 24%" />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--lp-text-secondary)', fontWeight: 600 }}>
                  <span style={{ color: 'var(--lp-brand-violet)' }}>● Needs ₹21.6K (48%)</span>
                  <span style={{ color: '#D97706' }}>● Wants ₹12.6K (28%)</span>
                  <span style={{ color: 'var(--lp-brand-teal)' }}>● Savings ₹10.8K (24%)</span>
                </div>
              </div>

              {/* Card 2: Financial Health Score */}
              <div style={{ background: 'var(--lp-bg-soft)', borderRadius: '16px', padding: '1.25rem', border: '1px solid var(--lp-border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--lp-text-secondary)' }}>Financial Health Diagnostic</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--lp-brand-violet)', fontWeight: 700 }}>0 - 100 Scale</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{
                    width: '64px', height: '64px', borderRadius: '50%',
                    background: 'conic-gradient(var(--lp-brand-teal) 0% 84%, #E2E8F0 84% 100%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.1rem', color: 'var(--lp-brand-teal)' }}>
                      84
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--lp-text-primary)' }}>Strong Financial Health</div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--lp-text-muted)' }}>Low debt burden (DTI 12%), active 3-month safety fund</div>
                  </div>
                </div>
              </div>

              {/* Card 3: AI Coach Dialogue Preview */}
              <div style={{ background: 'var(--lp-bg-soft)', borderRadius: '16px', padding: '1.25rem', border: '1px solid var(--lp-border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: 'var(--lp-brand-violet)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <BotMessageSquare size={14} color="#FFFFFF" />
                  </div>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--lp-text-primary)' }}>AI Financial Coach</span>
                </div>
                <div style={{ background: '#FFFFFF', borderRadius: '10px', padding: '0.65rem 0.85rem', fontSize: '0.75rem', color: 'var(--lp-text-secondary)', lineHeight: 1.45, border: '1px solid var(--lp-border-subtle)', marginBottom: '0.5rem' }}>
                  "If you allocate ₹3,500/mo into your Emergency Fund goal, you will reach your 3-month target <strong>45 days ahead of schedule</strong>."
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--lp-brand-violet)', fontWeight: 600 }}>
                  ✓ Deterministic Python Engine • SEBI Compliant
                </div>
              </div>

            </div>
          </div>

          {/* Floating Highlight Card 1: Goal-Days Delayed */}
          <div
            className="lp-card lp-animate-float lp-hide-mobile"
            style={{
              position: 'absolute',
              bottom: '-28px',
              left: '-25px',
              padding: '1rem 1.25rem',
              borderRadius: '16px',
              boxShadow: 'var(--lp-shadow-xl)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.85rem',
              maxWidth: '320px',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(226, 232, 240, 0.9)',
            }}
          >
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Clock size={20} color="#EF4444" />
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#EF4444', fontWeight: 700, textTransform: 'uppercase' }}>
                Goal-Days Delayed
              </div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--lp-text-primary)' }}>
                ₹15,000 Impulse Spend
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--lp-text-muted)' }}>
                Delays Emergency Fund by <strong>+18 days</strong>
              </div>
            </div>
          </div>

          {/* Floating Highlight Card 2: Scam Audit */}
          <div
            className="lp-card lp-animate-float-delayed lp-hide-mobile"
            style={{
              position: 'absolute',
              top: '20px',
              right: '-25px',
              padding: '1rem 1.25rem',
              borderRadius: '16px',
              boxShadow: 'var(--lp-shadow-xl)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.85rem',
              maxWidth: '310px',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(226, 232, 240, 0.9)',
            }}
          >
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(15, 159, 154, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <ShieldCheck size={20} color="var(--lp-brand-teal)" />
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--lp-brand-teal)', fontWeight: 700, textTransform: 'uppercase' }}>
                Claim Reality Check
              </div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--lp-text-primary)' }}>
                "Double in 30 Days"
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--lp-text-muted)' }}>
                Implied CAGR 4,096% • <strong>Scam Flagged</strong>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

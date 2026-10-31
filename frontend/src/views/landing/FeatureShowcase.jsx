import React from 'react';
import {
  BotMessageSquare,
  Sparkles,
  CheckCircle2,
  Clock,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

export default function FeatureShowcase({ onOpenAuth }) {
  return (
    <section style={{ padding: '6rem 0', background: 'var(--lp-bg-soft)', position: 'relative' }}>
      <div className="lp-container">

        {/* ── SHOWCASE 1: AI FINANCIAL COACH ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '4rem', alignItems: 'center', marginBottom: '7rem' }}>
          <div>
            <div className="lp-badge lp-badge-violet" style={{ marginBottom: '1rem' }}>
              Core AI Intelligence
            </div>
            <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.75rem)', marginBottom: '1.25rem' }}>
              An AI coach that truly knows your numbers.
            </h2>
            <p style={{ fontSize: '1.05rem', color: 'var(--lp-text-secondary)', lineHeight: 1.6, marginBottom: '1.75rem' }}>
              Unlike generic chatbots that guess math or hallucinate statistics, FinWise AI ingests your verified income,
              expenses, loans, and goals—executing verified Python formulas directly during conversation.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '2rem' }}>
              {[
                'Context-aware: Remembers your active persona, goals, and monthly balance',
                'Zero Math Hallucinations: Dispatches deterministic calculation engines via tool calling',
                'Hindi & Hinglish Support: Built for young Indian earners and first-time investors',
                'SEBI Regulatory Guardrails: Blocks speculative stock tips and attaches clear disclaimers',
              ].map((text) => (
                <div key={text} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <CheckCircle2 size={18} color="var(--lp-brand-violet)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span style={{ fontSize: '0.92rem', color: 'var(--lp-text-primary)', fontWeight: 500 }}>{text}</span>
                </div>
              ))}
            </div>
            <button type="button" onClick={() => onOpenAuth?.('register')} className="lp-btn lp-btn-primary">
              Chat with AI Coach <ArrowRight size={16} />
            </button>
          </div>

          {/* AI Coach UI Mockup */}
          <div className="lp-card" style={{ padding: '1.75rem', borderRadius: '24px', boxShadow: 'var(--lp-shadow-xl)', border: '1px solid rgba(226, 232, 240, 0.9)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingBottom: '1rem', borderBottom: '1px solid var(--lp-border-light)', marginBottom: '1.25rem' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'var(--lp-brand-violet)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <BotMessageSquare size={20} color="#FFFFFF" />
              </div>
              <div>
                <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--lp-text-primary)' }}>FinWise AI Coach</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--lp-brand-teal)', fontWeight: 600 }}>● Active Session • LLaMA 3.3 Engine</div>
              </div>
            </div>

            {/* Conversation Flow */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* User Message */}
              <div style={{ alignSelf: 'flex-end', background: 'var(--lp-bg-soft)', borderRadius: '14px 14px 2px 14px', padding: '0.85rem 1rem', maxWidth: '85%', fontSize: '0.85rem', color: 'var(--lp-text-primary)', border: '1px solid var(--lp-border-subtle)' }}>
                "Can I afford to buy a ₹12,000 smart watch this month on my ₹35,000 salary?"
              </div>

              {/* Coach Response */}
              <div style={{ alignSelf: 'flex-start', background: 'var(--lp-bg-lavender-subtle)', borderRadius: '14px 14px 14px 2px', padding: '1rem 1.15rem', maxWidth: '95%', border: '1px solid rgba(109, 74, 255, 0.18)' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.2rem 0.5rem', borderRadius: '6px', background: 'var(--lp-bg-lavender)', color: 'var(--lp-brand-violet)', fontSize: '0.72rem', fontWeight: 700, marginBottom: '0.65rem' }}>
                  <Sparkles size={12} /> Executed: calculate_goal_delay(amount=12000)
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--lp-text-primary)', lineHeight: 1.5, margin: '0 0 0.5rem 0' }}>
                  Based on your active 50/30/20 budget, your remaining Wants budget for October is <strong>₹4,200</strong>.
                  Spending ₹12,000 will cause an <strong>overrun of ₹7,800</strong> and delay your <strong>Laptop Savings Goal by 14 calendar days</strong>.
                </p>
                <div style={{ fontSize: '0.72rem', color: 'var(--lp-text-muted)', fontStyle: 'italic', borderTop: '1px solid rgba(109, 74, 255, 0.15)', paddingTop: '0.5rem' }}>
                  *Educational insight based on your recorded budget. Not official SEBI advice.*
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── SHOWCASE 2: GOAL-DAYS DELAYED & BEHAVIORAL FINTECH ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '4rem', alignItems: 'center', marginBottom: '7rem' }}>
          
          {/* Goal Delay Interactive Mockup */}
          <div className="lp-card" style={{ padding: '1.75rem', borderRadius: '24px', boxShadow: 'var(--lp-shadow-xl)', border: '1px solid rgba(226, 232, 240, 0.9)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', paddingBottom: '0.85rem', borderBottom: '1px solid var(--lp-border-light)' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--lp-text-secondary)' }}>Goal Impact Analyzer</span>
              <span style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem', borderRadius: '6px', background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', fontWeight: 700 }}>
                Impulse Detector
              </span>
            </div>

            {/* Simulated Expense Input */}
            <div style={{ background: 'var(--lp-bg-soft)', borderRadius: '12px', padding: '1rem', marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--lp-text-muted)', marginBottom: '0.35rem' }}>Contemplated Spontaneous Purchase</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--lp-text-primary)' }}>Weekend Trip & Dinner</span>
                <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#EF4444' }}>₹14,500</span>
              </div>
            </div>

            {/* Impact Calculation Result */}
            <div style={{ border: '2px dashed rgba(239, 68, 68, 0.25)', borderRadius: '14px', padding: '1.25rem', background: 'rgba(254, 242, 242, 0.5)', textAlign: 'center', marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#DC2626', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                Hidden Calendar Cost
              </div>
              <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#DC2626', lineHeight: 1.1 }}>
                +21 Days
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--lp-text-secondary)', marginTop: '0.35rem' }}>
                Postpones your <strong>Emergency Fund Goal (Target: ₹80,000)</strong> from Dec 15 to Jan 05.
              </div>
            </div>

            {/* 24-Hour Cooling-Off Pill */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', background: '#FFFFFF', border: '1px solid var(--lp-border-subtle)', borderRadius: '10px', padding: '0.75rem 1rem' }}>
              <Clock size={18} color="var(--lp-brand-violet)" />
              <div style={{ fontSize: '0.78rem', color: 'var(--lp-text-secondary)' }}>
                Logged to <strong>Decision Journal</strong> with 24-hour cooling-off countdown.
              </div>
            </div>
          </div>

          <div>
            <div className="lp-badge lp-badge-teal" style={{ marginBottom: '1rem' }}>
              Signature Innovation
            </div>
            <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.75rem)', marginBottom: '1.25rem' }}>
              See the exact days impulse spends delay your future.
            </h2>
            <p style={{ fontSize: '1.05rem', color: 'var(--lp-text-secondary)', lineHeight: 1.6, marginBottom: '1.75rem' }}>
              When money is digital, spending ₹10,000 feels painless. FinWise AI recalculates your daily savings rate and
              shows you the true calendar cost: exactly how many days of hard work that purchase postpones your real goals.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '2rem' }}>
              {[
                'Instant calendar conversion: ₹ amount ➔ exact days delayed on your top priority goal',
                'Decision Journal integration: Place impulse buys on a 24h cooling-off timer before buying',
                'Avoided Spends Tracking: Tracks cumulative wealth preserved by pausing before purchasing',
              ].map((text) => (
                <div key={text} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <CheckCircle2 size={18} color="var(--lp-brand-teal)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span style={{ fontSize: '0.92rem', color: 'var(--lp-text-primary)', fontWeight: 500 }}>{text}</span>
                </div>
              ))}
            </div>
            <button type="button" onClick={() => onOpenAuth?.('register')} className="lp-btn lp-btn-teal">
              Try Goal Simulator <ArrowRight size={16} />
            </button>
          </div>
        </div>

        {/* ── SHOWCASE 3: FINFLUENCER CLAIM AUDIT ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '4rem', alignItems: 'center' }}>
          <div>
            <div className="lp-badge lp-badge-violet" style={{ marginBottom: '1rem' }}>
              Scam & Fake Return Shield
            </div>
            <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.75rem)', marginBottom: '1.25rem' }}>
              Expose deceptive social media returns in seconds.
            </h2>
            <p style={{ fontSize: '1.05rem', color: 'var(--lp-text-secondary)', lineHeight: 1.6, marginBottom: '1.75rem' }}>
              Paste any viral YouTube, Telegram, or Instagram stock tip. FinWise calculates the implied Compound Annual
              Growth Rate (CAGR) and compares it against historical benchmarks to protect young investors from Ponzi schemes.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '2rem' }}>
              {[
                'Mathematical Reality Check: Exposes impossible compound claims (e.g. 900% annualized)',
                'Red Flag Taxonomy: Scans for urgency traps, guaranteed returns, and unregulated Telegram groups',
                'Benchmark Comparison: Visualizes claim vs NIFTY 50 (12%) and Warren Buffett (20%)',
              ].map((text) => (
                <div key={text} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <CheckCircle2 size={18} color="var(--lp-brand-violet)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span style={{ fontSize: '0.92rem', color: 'var(--lp-text-primary)', fontWeight: 500 }}>{text}</span>
                </div>
              ))}
            </div>
            <button type="button" onClick={() => onOpenAuth?.('register')} className="lp-btn lp-btn-primary">
              Audit a Claim Free <ArrowRight size={16} />
            </button>
          </div>

          {/* Claim Audit UI Mockup */}
          <div className="lp-card" style={{ padding: '1.75rem', borderRadius: '24px', boxShadow: 'var(--lp-shadow-xl)', border: '1px solid rgba(226, 232, 240, 0.9)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <ShieldAlert size={20} color="#DC2626" />
              <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#DC2626' }}>
                Finfluencer Audit Verdict • High Risk Scam Flagged
              </span>
            </div>

            <div style={{ background: 'var(--lp-bg-soft)', borderRadius: '12px', padding: '1rem', fontSize: '0.82rem', color: 'var(--lp-text-secondary)', marginBottom: '1.25rem', borderLeft: '4px solid #DC2626' }}>
              "Turn ₹10,000 into ₹1 Crore in 3 years with secret crypto algorithmic trading!"
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
              <div style={{ background: '#FFFFFF', border: '1px solid var(--lp-border-subtle)', borderRadius: '12px', padding: '1rem', textAlign: 'center' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--lp-text-muted)' }}>Implied Annual CAGR</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#DC2626' }}>900.0%</div>
                <div style={{ fontSize: '0.68rem', color: '#DC2626', fontWeight: 600 }}>Mathematically Absurd</div>
              </div>
              <div style={{ background: '#FFFFFF', border: '1px solid var(--lp-border-subtle)', borderRadius: '12px', padding: '1rem', textAlign: 'center' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--lp-text-muted)' }}>Historical Benchmark</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--lp-brand-teal)' }}>12.5%</div>
                <div style={{ fontSize: '0.68rem', color: 'var(--lp-text-muted)', fontWeight: 600 }}>NIFTY 50 20-Year Avg</div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.78rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#DC2626', fontWeight: 600 }}>
                ✕ Exceeds highest verified hedge fund returns in human history
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#DC2626', fontWeight: 600 }}>
                ✕ Violates SEBI Prohibition of Fraudulent and Unfair Trade Practices Regulations
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

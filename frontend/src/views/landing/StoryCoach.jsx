import React from 'react';
import { BotMessageSquare, Sparkles, CheckCircle2, ShieldAlert, Languages, ArrowRight } from 'lucide-react';

export default function StoryCoach({ onOpenAuth }) {
  return (
    <section id="coach" style={{ padding: '7rem 0', background: 'var(--cs-bg-white)', position: 'relative' }}>
      <div className="cs-container">
        <div
          className="cs-editorial-split"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1.05fr',
            gap: '4rem',
            alignItems: 'center',
          }}
        >
          {/* Left Editorial Text */}
          <div>
            <div className="cs-eyebrow cs-eyebrow-light">
              <BotMessageSquare size={14} /> Context-Aware Financial Intelligence
            </div>

            <h2 className="cs-headline-editorial" style={{ marginBottom: '1.5rem' }}>
              Meet the coach that helps you <br />
              <span style={{ color: 'var(--cs-violet)' }}>think before you spend.</span>
            </h2>

            <p style={{ fontSize: '1.15rem', color: 'var(--cs-text-secondary)', lineHeight: 1.6, marginBottom: '2rem' }}>
              Most financial advice is either generic generic platitudes or complex investment jargon. FinWise AI speaks
              plain language, connects directly to your verified budget, and helps you evaluate decisions before money leaves your account.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2.5rem' }}>
              {[
                { title: 'Ground Truth Snapshots', desc: 'Ingests your active 50/30/20 balance, loans, and goals before every answer.' },
                { title: 'Zero Hallucinations', desc: 'Dispatches deterministic Python calculators for all compound and EMI numbers.' },
                { title: 'Multilingual Guidance', desc: 'Full support for English, Hindi, and Hinglish for natural conversation.' },
                { title: 'SEBI Compliance Guardrail', desc: 'Explicitly filters speculative stock tips and guarantees no false promises.' },
              ].map(({ title, desc }) => (
                <div key={title} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
                  <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'var(--cs-bg-lavender)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                    <CheckCircle2 size={15} color="var(--cs-violet)" />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 750, color: 'var(--cs-text-primary)' }}>{title}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--cs-text-secondary)', lineHeight: 1.5 }}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => onOpenAuth?.('register')}
              className="cs-btn cs-btn-primary"
            >
              Start a Conversation <ArrowRight size={17} />
            </button>
          </div>

          {/* Right: Realistic Conversational UI Stage */}
          <div>
            <div
              className="cs-editorial-card"
              style={{
                padding: '2rem',
                borderRadius: '24px',
                border: '1px solid var(--cs-border-light)',
                background: '#FFFFFF',
                boxShadow: 'var(--cs-shadow-card)',
              }}
            >
              {/* Chat Session Top Bar */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '1rem', borderBottom: '1px solid var(--cs-border-light)', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: 'var(--cs-violet)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <BotMessageSquare size={20} color="#FFFFFF" />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--cs-text-primary)' }}>FinWise AI Coach</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--cs-teal)', fontWeight: 600 }}>● Active Context: Student Persona • ₹45,000 Income</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--cs-text-muted)' }}>
                  <Languages size={14} /> English / Hindi
                </div>
              </div>

              {/* Chat Messages */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* User Bubble */}
                <div style={{ alignSelf: 'flex-end', background: 'var(--cs-bg-soft)', borderRadius: '16px 16px 4px 16px', padding: '1rem 1.25rem', maxWidth: '85%', fontSize: '0.9rem', color: 'var(--cs-text-primary)', border: '1px solid var(--cs-border-light)', lineHeight: 1.5 }}>
                  "Can I afford to buy this ₹12,000 smart watch this month?"
                </div>

                {/* AI Coach Bubble with Tool Call Trace */}
                <div style={{ alignSelf: 'flex-start', background: 'var(--cs-bg-lavender-subtle)', borderRadius: '16px 16px 16px 4px', padding: '1.25rem', maxWidth: '96%', border: '1.5px solid rgba(109, 74, 255, 0.2)' }}>
                  {/* Tool Execution Tag */}
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.25rem 0.65rem', borderRadius: '8px', background: 'var(--cs-bg-lavender)', color: 'var(--cs-violet)', fontSize: '0.72rem', fontWeight: 750, marginBottom: '0.85rem' }}>
                    <Sparkles size={13} /> Tool: calculate_goal_delay(amount=12000, goal="Emergency Fund")
                  </div>

                  <p style={{ fontSize: '0.92rem', color: 'var(--cs-text-primary)', lineHeight: 1.6, margin: '0 0 0.85rem 0' }}>
                    Let’s check your budget, upcoming expenses, and current goals before deciding.
                  </p>

                  <div style={{ background: '#FFFFFF', borderRadius: '12px', padding: '0.85rem 1rem', border: '1px solid var(--cs-border-light)', marginBottom: '0.85rem', fontSize: '0.82rem', lineHeight: 1.6 }}>
                    <div>• <strong>Current Wants Balance:</strong> ₹4,200 remaining for October.</div>
                    <div>• <strong>Overrun:</strong> Spending ₹12,000 will exceed Wants by <strong>₹7,800</strong>.</div>
                    <div>• <strong>Goal Trade-off:</strong> Postpones your ₹80,000 Emergency Fund by <strong>14 calendar days</strong>.</div>
                  </div>

                  <p style={{ fontSize: '0.88rem', color: 'var(--cs-text-secondary)', lineHeight: 1.5, margin: '0 0 0.85rem 0' }}>
                    <strong>Recommendation:</strong> Consider logging this to your <em>Impulse Decision Journal</em> with a 24-hour cooling-off timer, or waiting until next month's allocation.
                  </p>

                  <div style={{ fontSize: '0.72rem', color: 'var(--cs-text-muted)', borderTop: '1px solid rgba(109, 74, 255, 0.15)', paddingTop: '0.65rem', fontStyle: 'italic' }}>
                    *Educational coaching support for personal decision-making. Does not guarantee financial outcomes.*
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}


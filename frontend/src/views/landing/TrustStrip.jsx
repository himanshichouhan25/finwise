import React from 'react';
import { Eye, Target, ShieldAlert, HeartPulse } from 'lucide-react';

export default function TrustStrip() {
  const values = [
    {
      icon: Eye,
      title: 'Understand Your Money',
      desc: 'Transparent 50/30/20 cash flow breakdown without guesswork.',
    },
    {
      icon: Target,
      title: 'Plan Smarter Goals',
      desc: 'Connect monthly savings targets directly to what you care about.',
    },
    {
      icon: ShieldAlert,
      title: 'Question Financial Claims',
      desc: 'Mathematical reality checks against viral social media stock tips.',
    },
    {
      icon: HeartPulse,
      title: 'Build Healthier Habits',
      desc: '24-hour impulse cooling-off timers and 0-100 diagnostics.',
    },
  ];

  return (
    <section style={{ borderTop: '1px solid var(--lp-border-subtle)', borderBottom: '1px solid var(--lp-border-subtle)', background: 'var(--lp-bg-white)', padding: '2.5rem 0' }}>
      <div className="lp-container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '2rem' }}>
          {values.map(({ icon: Icon, title, desc }) => (
            <div key={title} style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  background: 'var(--lp-bg-lavender)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  color: 'var(--lp-brand-violet)',
                }}
              >
                <Icon size={20} />
              </div>
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--lp-text-primary)', marginBottom: '0.25rem' }}>
                  {title}
                </h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--lp-text-muted)', lineHeight: 1.5, margin: 0 }}>
                  {desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

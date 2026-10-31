import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { PERSONAS } from '../../api/client';

export default function CinematicFinalCta({ onOpenAuth, onExploreDemo, on1ClickDemo }) {
  return (
    <section
      style={{
        padding: '7rem 0 6rem 0',
        background: 'radial-gradient(ellipse at 50% 100%, #151D2F 0%, #090D16 80%)',
        color: '#FFFFFF',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background Luminous Aura */}
      <div
        style={{
          position: 'absolute',
          bottom: '-20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '700px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(109, 74, 255, 0.28) 0%, rgba(15, 159, 154, 0.15) 50%, transparent 75%)',
          filter: 'blur(80px)',
          pointerEvents: 'none',
        }}
      />

      <div className="cs-container" style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
        <div style={{ maxWidth: '780px', margin: '0 auto' }}>
          
          <div className="cs-eyebrow cs-eyebrow-dark" style={{ marginBottom: '1.5rem' }}>
            <Sparkles size={14} color="#B4A2FE" /> Your Financial Future, Unfolding
          </div>

          <h2 className="cs-headline-hero" style={{ marginBottom: '1.5rem' }}>
            Your next financial decision <br />
            <span
              style={{
                background: 'linear-gradient(135deg, #FFFFFF 20%, #B4A2FE 60%, #2DD4BF 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              can be smarter.
            </span>
          </h2>

          <p
            style={{
              fontSize: '1.25rem',
              color: '#94A3B8',
              lineHeight: 1.6,
              maxWidth: '620px',
              margin: '0 auto 3rem auto',
            }}
          >
            Start understanding your money—and build a plan around what matters to you.
          </p>

          {/* Main Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '3.5rem' }}>
            <button
              type="button"
              onClick={() => onOpenAuth?.('register')}
              className="cs-btn cs-btn-primary"
              style={{ padding: '1rem 2.25rem', fontSize: '1.05rem', background: '#FFFFFF', color: 'var(--cs-violet-deep)', fontWeight: 800 }}
            >
              Explore FinWise AI <ArrowRight size={18} />
            </button>
            <button
              type="button"
              onClick={() => onExploreDemo?.()}
              className="cs-btn cs-btn-glass-hero"
              style={{ padding: '1rem 2rem', fontSize: '1.05rem' }}
            >
              Instant Guest Mode
            </button>
          </div>

          {/* 1-Click Hackathon Persona Pills */}
          <div style={{ paddingTop: '2rem', borderTop: '1px solid rgba(255, 255, 255, 0.12)' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#B4A2FE', marginBottom: '1rem' }}>
              ⚡ Or Instant 1-Click Access with Seeded Personas:
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
              {PERSONAS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => on1ClickDemo?.(p.id)}
                  style={{
                    padding: '0.65rem 1.15rem',
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: '#FFFFFF',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    backdropFilter: 'blur(10px)',
                    transition: 'all 0.18s ease',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(109, 74, 255, 0.3)'; e.currentTarget.style.borderColor = '#B4A2FE'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'; e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'; }}
                >
                  <span style={{ fontWeight: 800 }}>{p.name}</span>
                  <span style={{ color: '#0F9F9A', fontSize: '0.75rem', fontWeight: 600 }}>({p.tier})</span>
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}


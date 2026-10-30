import React from 'react';
import { ShieldCheck, RefreshCw } from 'lucide-react';
import { PERSONAS, getActiveUserId } from '../api/client';

export default function TopBar({ title, onRefresh, isRefreshing }) {
  const activeId = getActiveUserId();
  const currentPersona = PERSONAS.find((p) => p.id === activeId) || PERSONAS[0];

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 30, background: 'rgba(8, 12, 20, 0.85)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border-subtle)' }}>
      {/* SEBI Educational Notice Banner */}
      <div className="disclaimer-banner">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <ShieldCheck size={14} color="#14B8A6" />
          <span>
            <strong>SEBI Compliance:</strong> FinWise AI provides educational coaching & deterministic expense intelligence. Not a registered investment advisor.
          </span>
        </div>
        <span style={{ color: '#64748B' }}>MNIT Jaipur Hackathon 2026</span>
      </div>

      {/* Main Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.85rem 1.75rem',
      }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#FFFFFF' }}>
            {title}
          </h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* Active Persona Pill */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--border-subtle)',
            padding: '0.35rem 0.85rem',
            borderRadius: '9999px',
          }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#14B8A6' }} />
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#F8FAFC' }}>
              {currentPersona.name}
            </span>
            <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
              ({currentPersona.tier})
            </span>
          </div>

          {/* Refresh Action */}
          <button
            className="btn btn-outline"
            onClick={onRefresh}
            disabled={isRefreshing}
            style={{ padding: '0.45rem 0.75rem', fontSize: '0.8rem' }}
            title="Refresh live financial data"
          >
            <RefreshCw size={14} className={isRefreshing ? 'spin' : ''} />
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>
      </div>
    </header>
  );
}

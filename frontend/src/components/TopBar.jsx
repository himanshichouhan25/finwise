import React, { useState, useEffect } from 'react';
import { ShieldCheck, RefreshCw, KeyRound, UserCheck, Home, Menu } from 'lucide-react';
import { PERSONAS, getActiveUserId, getAuthToken, getAuthUser } from '../api/client';

export default function TopBar({ title, onRefresh, isRefreshing, onOpenAuth, onGoToLanding, onToggleMobile }) {
  const [activeId, setActiveId] = useState(getActiveUserId());
  const [authUser, setAuthUser] = useState(getAuthUser());
  const [token, setToken] = useState(getAuthToken());

  useEffect(() => {
    const handleAuthChange = () => {
      setAuthUser(getAuthUser());
      setToken(getAuthToken());
      setActiveId(getActiveUserId());
    };
    window.addEventListener('finwise_auth_changed', handleAuthChange);
    window.addEventListener('finwise_persona_changed', handleAuthChange);
    return () => {
      window.removeEventListener('finwise_auth_changed', handleAuthChange);
      window.removeEventListener('finwise_persona_changed', handleAuthChange);
    };
  }, []);

  const currentPersona = PERSONAS.find((p) => p.id === activeId) || {
    name: authUser?.name || 'Investor',
    tier: authUser?.persona || 'User',
  };

  const displayName = authUser?.name || currentPersona.name;
  const displayRole = authUser?.persona ? authUser.persona.replace('_', ' ') : currentPersona.tier;

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 30,
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border-subtle)',
      boxShadow: 'var(--shadow-xs)',
    }}>
      {/* SEBI Compliance Banner */}
      <div className="disclaimer-banner">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <ShieldCheck size={14} color="var(--teal-primary)" />
          <span style={{ fontSize: '0.73rem', color: 'var(--text-secondary)' }}>
            <strong style={{ color: 'var(--text-main)' }}>SEBI Compliance:</strong> Educational coaching & deterministic calculation engine. Not registered investment advisory.
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          {token ? (
            <span style={{ color: 'var(--teal-primary)', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 600 }}>
              <UserCheck size={12} /> JWT Live
            </span>
          ) : (
            <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 600 }}>Demo Persona</span>
          )}
          <span style={{ color: 'var(--text-muted)' }}>• MNIT Jaipur 2026</span>
        </div>
      </div>

      {/* Main Action Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.85rem 1.75rem',
        flexWrap: 'wrap',
        gap: '0.75rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {onToggleMobile && (
            <button
              onClick={onToggleMobile}
              className="btn btn-outline"
              style={{ padding: '0.45rem', display: 'flex', alignItems: 'center' }}
              aria-label="Open Navigation Menu"
            >
              <Menu size={18} color="var(--text-main)" />
            </button>
          )}
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, letterSpacing: '-0.02em' }}>
              {title}
            </h2>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
          {/* Active User Pill */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'var(--bg-surface-subtle)',
            border: '1px solid var(--border-subtle)',
            padding: '0.35rem 0.85rem',
            borderRadius: 'var(--radius-full)',
            boxShadow: 'var(--shadow-xs)',
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: token ? 'var(--teal-primary)' : 'var(--gold-primary)',
            }} />
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)' }}>
              {displayName}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
              ({displayRole})
            </span>
          </div>

          {/* Landing Page Link */}
          <button
            className="btn btn-outline"
            onClick={onGoToLanding}
            style={{ padding: '0.45rem 0.75rem', fontSize: '0.8rem' }}
            title="Go to Landing & Story Page"
          >
            <Home size={13} color="var(--violet-primary)" />
            <span>Landing Page</span>
          </button>

          {/* Auth Button */}
          <button
            className="btn btn-violet"
            onClick={onOpenAuth}
            style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}
          >
            <KeyRound size={13} />
            <span>{token ? 'Account' : 'Sign In / Up'}</span>
          </button>

          {/* Refresh Data Button */}
          <button
            className="btn btn-outline"
            onClick={onRefresh}
            disabled={isRefreshing}
            style={{ padding: '0.45rem 0.65rem' }}
            title="Refresh active financial snapshot"
            aria-label="Refresh financial data"
          >
            <RefreshCw
              size={13}
              color="var(--text-secondary)"
              style={{
                transition: 'transform 0.4s ease',
                transform: isRefreshing ? 'rotate(180deg)' : 'none',
              }}
            />
          </button>
        </div>
      </div>
    </header>
  );
}

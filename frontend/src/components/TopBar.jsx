import React, { useState, useEffect } from 'react';
import { ShieldCheck, RefreshCw, KeyRound, LogOut, UserCheck } from 'lucide-react';
import { PERSONAS, getActiveUserId, getAuthToken, getAuthUser, logoutUser } from '../api/client';

export default function TopBar({ title, onRefresh, isRefreshing, onOpenAuth }) {
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
    <header style={{ position: 'sticky', top: 0, zIndex: 30, background: 'rgba(8, 12, 20, 0.85)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border-subtle)' }}>
      {/* SEBI Educational Notice Banner */}
      <div className="disclaimer-banner">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <ShieldCheck size={14} color="#14B8A6" />
          <span>
            <strong>SEBI Compliance:</strong> FinWise AI provides educational coaching & deterministic expense intelligence. Not a registered investment advisor.
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          {token ? (
            <span style={{ color: '#2DD4BF', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <UserCheck size={12} /> JWT Authenticated
            </span>
          ) : (
            <span style={{ color: '#94A3B8', fontSize: '0.7rem' }}>Demo Mode</span>
          )}
          <span style={{ color: '#64748B' }}>• MNIT Jaipur 2026</span>
        </div>
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Active User Pill */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--border-subtle)',
            padding: '0.35rem 0.85rem',
            borderRadius: '9999px',
          }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: token ? '#14B8A6' : '#F59E0B' }} />
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#F8FAFC' }}>
              {displayName}
            </span>
            <span style={{ fontSize: '0.75rem', color: '#94A3B8', textTransform: 'capitalize' }}>
              ({displayRole})
            </span>
          </div>

          {/* Auth Button */}
          {authUser && token ? (
            <button
              className="btn btn-outline"
              onClick={async () => {
                await logoutUser();
                onRefresh();
              }}
              style={{ padding: '0.45rem 0.75rem', fontSize: '0.8rem', borderColor: 'rgba(239, 68, 68, 0.3)', color: '#FCA5A5' }}
              title="Log out of session"
            >
              <LogOut size={13} />
              <span>Log Out</span>
            </button>
          ) : (
            <button
              className="btn btn-primary"
              onClick={onOpenAuth}
              style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}
            >
              <KeyRound size={13} />
              <span>Sign In / Register</span>
            </button>
          )}

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

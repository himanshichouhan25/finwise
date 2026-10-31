import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  PieChart, 
  TrendingUp, 
  Target, 
  BotMessageSquare, 
  ShieldAlert, 
  Hourglass, 
  Activity, 
  UserCircle2, 
  Sparkles,
  BarChart3,
  CreditCard,
  LogOut
} from 'lucide-react';
import { PERSONAS, getActiveUserId, setActiveUserId, getAuthUser, getAuthToken, logoutUser } from '../api/client';

export default function Sidebar({ currentTab, setTab, onGoToLanding }) {
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

  const isRealUser = Boolean(authUser?.email && token);

  const NAV_ITEMS = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'market', label: 'Market Intel', icon: BarChart3, badge: 'NSE/BSE' },
    { id: 'budget', label: '50/30/20 Budget', icon: PieChart },
    { id: 'sip', label: 'SIP Simulator', icon: TrendingUp },
    { id: 'loans', label: 'Loans & EMIs', icon: CreditCard, badge: 'New' },
    { id: 'goals', label: 'Goals & Timeline', icon: Target },
    { id: 'coach', label: 'AI Coach Chat', icon: BotMessageSquare, badge: 'Live AI' },
    { id: 'claims', label: 'Finfluencer Audit', icon: ShieldAlert, badge: 'SEBI' },
    { id: 'journal', label: 'Decision Journal', icon: Hourglass, badge: '24h Timer' },
    { id: 'health', label: 'Health Score', icon: Activity },
    { id: 'profile', label: 'My Profile', icon: UserCircle2 },
  ];

  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border-subtle)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{
            width: '34px',
            height: '34px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #14B8A6 0%, #0D9488 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(20, 184, 166, 0.4)'
          }}>
            <Sparkles size={18} color="#FFFFFF" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#FFFFFF', lineHeight: 1.1 }}>
              FinWise <span style={{ color: '#2DD4BF' }}>AI</span>
            </h1>
            <p style={{ fontSize: '0.68rem', color: '#94A3B8', marginTop: '1px' }}>
              Financial Intelligence
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav style={{ padding: '0.75rem 0.6rem', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.55rem 0.75rem',
                borderRadius: '8px',
                border: 'none',
                background: isActive ? 'rgba(20, 184, 166, 0.15)' : 'transparent',
                color: isActive ? '#2DD4BF' : '#94A3B8',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease',
                fontWeight: isActive ? 600 : 500,
                fontSize: '0.84rem',
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.background = 'transparent';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <Icon size={16} color={isActive ? '#2DD4BF' : '#64748B'} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`badge ${isActive ? 'badge-teal' : 'badge-slate'}`} style={{ fontSize: '0.62rem', padding: '0.15rem 0.4rem' }}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Persona & Auth Footer */}
      <div style={{
        padding: '0.85rem 1rem',
        borderTop: '1px solid var(--border-subtle)',
        background: 'rgba(15, 23, 42, 0.5)',
        flexShrink: 0,
      }}>
        {isRealUser ? (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.45rem' }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #14B8A6, #0D9488)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontWeight: 800, fontSize: '0.82rem', flexShrink: 0,
              }}>
                {(authUser.name || 'U')[0].toUpperCase()}
              </div>
              <div style={{ overflow: 'hidden', flex: 1 }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#F8FAFC', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {authUser.name}
                </div>
                <div style={{ fontSize: '0.68rem', color: '#14B8A6', textTransform: 'capitalize' }}>
                  {authUser.persona || 'Investor'} • JWT Live
                </div>
              </div>
            </div>
            {onGoToLanding && (
              <button
                onClick={async () => {
                  await logoutUser();
                  onGoToLanding();
                }}
                style={{
                  width: '100%', padding: '0.35rem 0.5rem',
                  borderRadius: '6px', border: '1px solid rgba(239, 68, 68, 0.3)',
                  background: 'rgba(239, 68, 68, 0.08)', color: '#FCA5A5',
                  fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem',
                }}
              >
                <LogOut size={12} /> Exit / Log Out
              </button>
            )}
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <UserCircle2 size={13} color="#F59E0B" />
                <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#F8FAFC' }}>
                  DEMO PERSONA
                </span>
              </div>
              <span style={{ fontSize: '0.65rem', color: '#14B8A6', fontWeight: 600 }}>
                Demo Mode
              </span>
            </div>
            <select
              className="fin-select"
              value={activeId}
              onChange={(e) => setActiveUserId(e.target.value)}
              style={{ fontSize: '0.75rem', padding: '0.35rem', width: '100%' }}
            >
              {PERSONAS.map((p) => (
                <option key={p.id} value={p.id} style={{ background: '#0F172A', color: '#F8FAFC' }}>
                  {p.name} ({p.role})
                </option>
              ))}
            </select>
            {onGoToLanding && (
              <button
                onClick={onGoToLanding}
                style={{
                  width: '100%', marginTop: '0.4rem', padding: '0.35rem 0.5rem',
                  borderRadius: '6px', border: '1px solid rgba(20, 184, 166, 0.3)',
                  background: 'rgba(20, 184, 166, 0.08)', color: '#2DD4BF',
                  fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem',
                }}
              >
                ← Exit to Landing Page
              </button>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}

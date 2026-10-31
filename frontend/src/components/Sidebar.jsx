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
  LogOut,
  X
} from 'lucide-react';
import { PERSONAS, getActiveUserId, setActiveUserId, getAuthUser, getAuthToken, logoutUser } from '../api/client';

export default function Sidebar({ currentTab, setTab, onGoToLanding, mobileOpen, onCloseMobile }) {
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
    { id: 'dashboard', label: 'Executive Dashboard', icon: LayoutDashboard },
    { id: 'market', label: 'Market Intelligence', icon: BarChart3, badge: 'NSE/BSE' },
    { id: 'budget', label: '50/30/20 Budget', icon: PieChart },
    { id: 'sip', label: 'SIP Simulator', icon: TrendingUp },
    { id: 'loans', label: 'Loans & Repayment', icon: CreditCard },
    { id: 'goals', label: 'Goals & Timeline', icon: Target },
    { id: 'coach', label: 'AI Financial Coach', icon: BotMessageSquare, badge: 'Live AI' },
    { id: 'claims', label: 'Claim Reality Check', icon: ShieldAlert, badge: 'SEBI' },
    { id: 'journal', label: 'Decision Journal', icon: Hourglass, badge: '24h Timer' },
    { id: 'health', label: 'Health Diagnostic', icon: Activity },
    { id: 'profile', label: 'Financial Profile', icon: UserCircle2 },
  ];

  return (
    <aside className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
      {/* Brand Header */}
      <div style={{
        padding: '1.25rem 1.4rem',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #7047FF 0%, #5135CC 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(112, 71, 255, 0.3)',
          }}>
            <Sparkles size={18} color="#FFFFFF" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.1, margin: 0 }}>
              FinWise <span style={{ color: 'var(--violet-primary)' }}>AI</span>
            </h1>
            <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '2px', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Wealth Intelligence
            </p>
          </div>
        </div>

        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              padding: '0.25rem',
              display: 'flex',
              alignItems: 'center',
            }}
            className="md:hidden"
            aria-label="Close Navigation"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <nav style={{
        padding: '0.85rem 0.75rem',
        flex: 1,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.25rem',
      }}>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setTab(item.id);
                if (onCloseMobile) onCloseMobile();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: isActive ? 'var(--violet-soft)' : 'transparent',
                color: isActive ? 'var(--violet-primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.18s ease',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.86rem',
                position: 'relative',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = '#F8F9FD';
                  e.currentTarget.style.color = 'var(--text-main)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Icon
                  size={17}
                  color={isActive ? '#7047FF' : '#8A94A6'}
                  strokeWidth={isActive ? 2.3 : 1.8}
                />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`badge ${
                    item.badge === 'SEBI'
                      ? 'badge-amber'
                      : item.badge === 'Live AI'
                      ? 'badge-violet'
                      : 'badge-teal'
                  }`}
                  style={{ fontSize: '0.62rem', padding: '0.15rem 0.45rem', fontWeight: 700 }}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Persona & Auth Footer */}
      <div style={{
        padding: '1rem',
        borderTop: '1px solid var(--border-subtle)',
        background: '#FAFBFD',
        flexShrink: 0,
      }}>
        {isRealUser ? (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.65rem' }}>
              <div style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #7047FF, #5135CC)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                fontWeight: 800,
                fontSize: '0.85rem',
                flexShrink: 0,
                boxShadow: '0 2px 8px rgba(112, 71, 255, 0.25)',
              }}>
                {(authUser.name || 'U')[0].toUpperCase()}
              </div>
              <div style={{ overflow: 'hidden', flex: 1 }}>
                <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {authUser.name}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--teal-primary)', fontWeight: 600, textTransform: 'capitalize' }}>
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
                className="btn btn-outline"
                style={{
                  width: '100%',
                  padding: '0.4rem 0.6rem',
                  fontSize: '0.74rem',
                  color: '#DC2626',
                  borderColor: '#FEE2E2',
                  background: '#FEF2F2',
                }}
              >
                <LogOut size={13} /> Exit / Log Out
              </button>
            )}
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.45rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <UserCircle2 size={14} color="#7047FF" />
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-main)', letterSpacing: '0.04em' }}>
                  TEST PERSONA
                </span>
              </div>
              <span className="badge badge-teal" style={{ fontSize: '0.62rem', padding: '0.12rem 0.4rem' }}>
                Demo Mode
              </span>
            </div>
            <select
              className="fin-select"
              value={activeId}
              onChange={(e) => setActiveUserId(e.target.value)}
              style={{ fontSize: '0.78rem', padding: '0.45rem 0.6rem', width: '100%', marginBottom: '0.45rem' }}
            >
              {PERSONAS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.role})
                </option>
              ))}
            </select>
            {onGoToLanding && (
              <button
                onClick={onGoToLanding}
                className="btn btn-outline"
                style={{
                  width: '100%',
                  padding: '0.4rem 0.6rem',
                  fontSize: '0.74rem',
                  color: 'var(--violet-primary)',
                  borderColor: 'rgba(112, 71, 255, 0.25)',
                  background: 'var(--violet-soft)',
                }}
              >
                ← Back to Landing Page
              </button>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}

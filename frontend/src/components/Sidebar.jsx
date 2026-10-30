import React from 'react';
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
  BarChart3
} from 'lucide-react';
import { PERSONAS, getActiveUserId, setActiveUserId } from '../api/client';

export default function Sidebar({ currentTab, setTab }) {
  const activeId = getActiveUserId();

  const NAV_ITEMS = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'market', label: 'Market Intel', icon: BarChart3, badge: 'NSE/BSE' },
    { id: 'budget', label: '50/30/20 Budget', icon: PieChart },
    { id: 'sip', label: 'SIP Simulator', icon: TrendingUp },
    { id: 'goals', label: 'Goals & Timeline', icon: Target },
    { id: 'coach', label: 'AI Coach Chat', icon: BotMessageSquare, badge: 'Live AI' },
    { id: 'claims', label: 'Finfluencer Audit', icon: ShieldAlert, badge: 'SEBI' },
    { id: 'journal', label: 'Decision Journal', icon: Hourglass, badge: '24h Timer' },
    { id: 'health', label: 'Health Score', icon: Activity },
  ];

  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #14B8A6 0%, #0D9488 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(20, 184, 166, 0.4)'
          }}>
            <Sparkles size={20} color="#FFFFFF" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#FFFFFF', lineHeight: 1.1 }}>
              FinWise <span style={{ color: '#2DD4BF' }}>AI</span>
            </h1>
            <p style={{ fontSize: '0.7rem', color: '#94A3B8', marginTop: '2px' }}>
              Expense Intelligence
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav style={{ padding: '1rem 0.75rem', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
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
                padding: '0.65rem 0.85rem',
                borderRadius: '10px',
                border: 'none',
                background: isActive ? 'rgba(20, 184, 166, 0.15)' : 'transparent',
                color: isActive ? '#2DD4BF' : '#94A3B8',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease',
                fontWeight: isActive ? 600 : 500,
                fontSize: '0.875rem',
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.background = 'transparent';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Icon size={18} color={isActive ? '#2DD4BF' : '#64748B'} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`badge ${isActive ? 'badge-teal' : 'badge-slate'}`} style={{ fontSize: '0.65rem' }}>
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
        background: 'rgba(15, 23, 42, 0.4)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <UserCircle2 size={15} color="#F59E0B" />
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#F8FAFC' }}>
              DEMO PERSONA
            </span>
          </div>
          <span style={{ fontSize: '0.65rem', color: '#14B8A6', fontWeight: 600 }}>
            JWT Enabled
          </span>
        </div>
        <select
          className="fin-select"
          value={activeId}
          onChange={(e) => setActiveUserId(e.target.value)}
          style={{ fontSize: '0.8rem', padding: '0.45rem', width: '100%' }}
        >
          {PERSONAS.map((p) => (
            <option key={p.id} value={p.id} style={{ background: '#0F172A', color: '#F8FAFC' }}>
              {p.name} ({p.role})
            </option>
          ))}
        </select>
        <p style={{ fontSize: '0.65rem', color: '#64748B', marginTop: '0.4rem', textAlign: 'center' }}>
          Signed HS256 Token • Persona ID: {activeId}
        </p>
      </div>
    </aside>
  );
}

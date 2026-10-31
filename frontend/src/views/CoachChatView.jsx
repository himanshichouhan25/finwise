import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  Wrench, 
  Plus, 
  MessageSquare, 
  ShieldCheck, 
  AlertCircle 
} from 'lucide-react';
import { sendCoachMessage, getCoachSessions, getCoachSessionDetail } from '../api/client';

export default function CoachChatView({ initialPrompt = '' }) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState(initialPrompt || '');
  const [sessionId, setSessionId] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const loadSessions = async () => {
    try {
      const res = await getCoachSessions();
      setSessions(res);
    } catch (err) {
      console.error('Failed to load coach sessions:', err);
    }
  };

  useEffect(() => {
    loadSessions();
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          content: 'Namaste! I am your FinWise AI Coach. I analyze your real-time financial snapshot to help you balance your 50/30/20 budget, project compound SIP wealth, and evaluate whether you can afford discretionary purchases.\n\nHow can I help optimize your money decisions today?',
          tools_used: null,
          created_at: new Date().toISOString(),
        },
      ]);
    }
  }, []);

  const handleSelectSession = async (sId) => {
    try {
      setLoading(true);
      setError(null);
      const detail = await getCoachSessionDetail(sId);
      setSessionId(detail.id);
      setMessages(detail.messages);
    } catch (err) {
      setError('Failed to load session history');
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = () => {
    setSessionId(null);
    setMessages([
      {
        id: 'welcome-new',
        role: 'assistant',
        content: 'Started a fresh consultation! Ask me anything about your cash flow, budget limits, emergency runway, or SIP compounding goals.',
        tools_used: null,
        created_at: new Date().toISOString(),
      },
    ]);
  };

  const handleSend = async (textToSend = null) => {
    const text = (textToSend || inputText).trim();
    if (!text || loading) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setLoading(true);
    setError(null);

    try {
      const res = await sendCoachMessage(text, sessionId);
      setSessionId(res.session_id);
      setMessages((prev) => [...prev, res.message]);
      loadSessions();
    } catch (err) {
      const errText = err.message || 'AI Coach service is temporarily offline or rate-limited. Deterministic calculators remain available.';
      setError(errText);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: `⚠️ ${errText}`,
          created_at: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const QUICK_PROMPTS = [
    "How should I budget my income with 50/30/20?",
    "Can I afford buying ₹5,000 headphones?",
    "Calculate ₹4,000 monthly SIP for 10 years at 12%",
    "How much should my Emergency Fund be?",
  ];

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 85px)', overflow: 'hidden' }}>
      {/* Session History Sidebar Drawer */}
      <div style={{
        width: '260px',
        background: '#FFFFFF',
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        padding: '1.25rem 1rem',
        flexShrink: 0,
      }}>
        <button
          className="btn btn-violet"
          onClick={handleNewChat}
          style={{ width: '100%', marginBottom: '1.25rem', fontSize: '0.84rem', padding: '0.65rem' }}
        >
          <Plus size={16} />
          <span>New Consultation</span>
        </button>

        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.65rem', paddingLeft: '0.35rem' }}>
          Past Sessions
        </span>

        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          {sessions.length === 0 ? (
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', paddingLeft: '0.35rem' }}>No saved sessions</span>
          ) : (
            sessions.map((s) => (
              <button
                key={s.id}
                onClick={() => handleSelectSession(s.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  padding: '0.6rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  background: sessionId === s.id ? 'var(--violet-soft)' : 'transparent',
                  color: sessionId === s.id ? 'var(--violet-primary)' : 'var(--text-secondary)',
                  fontSize: '0.8rem',
                  fontWeight: sessionId === s.id ? 700 : 500,
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                <MessageSquare size={14} color={sessionId === s.id ? 'var(--violet-primary)' : 'var(--text-muted)'} />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.title}</span>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Flow */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg-app)' }}>
        {/* Messages Stream */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {messages.map((m) => {
            const isUser = m.role === 'user';
            return (
              <div
                key={m.id}
                style={{
                  display: 'flex',
                  gap: '0.85rem',
                  maxWidth: '850px',
                  alignSelf: isUser ? 'flex-end' : 'flex-start',
                }}
              >
                {!isUser && (
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #7047FF 0%, #5135CC 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 3px 10px rgba(112, 71, 255, 0.25)',
                    flexShrink: 0,
                  }}>
                    <Bot size={18} color="#FFFFFF" />
                  </div>
                )}

                <div style={{
                  background: isUser ? 'var(--violet-primary)' : '#FFFFFF',
                  border: `1px solid ${isUser ? 'transparent' : 'var(--border-subtle)'}`,
                  borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  padding: '1.15rem 1.25rem',
                  color: isUser ? '#FFFFFF' : 'var(--text-main)',
                  fontSize: '0.92rem',
                  lineHeight: '1.55',
                  boxShadow: isUser ? 'var(--shadow-violet)' : 'var(--shadow-sm)',
                  whiteSpace: 'pre-wrap',
                }}>
                  {m.content}

                  {/* Tool Execution Pill */}
                  {m.tools_used && m.tools_used.length > 0 && (
                    <div style={{ marginTop: '0.85rem', paddingTop: '0.65rem', borderTop: '1px solid var(--border-light)' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.74rem', color: 'var(--teal-primary)', background: 'var(--teal-soft)', padding: '0.2rem 0.55rem', borderRadius: 'var(--radius-full)', fontWeight: 600 }}>
                        <Wrench size={12} />
                        <span>Ran deterministic calculation: <strong>{m.tools_used[0].name}</strong></span>
                      </div>
                    </div>
                  )}
                </div>

                {isUser && (
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: '#EDE9FE',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <User size={18} color="var(--violet-primary)" />
                  </div>
                )}
              </div>
            );
          })}

          {loading && (
            <div style={{ display: 'flex', gap: '0.85rem', alignSelf: 'flex-start' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #7047FF 0%, #5135CC 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Bot size={18} color="#FFFFFF" />
              </div>
              <div style={{
                background: '#FFFFFF',
                border: '1px solid var(--border-subtle)',
                borderRadius: '16px 16px 16px 4px',
                padding: '0.9rem 1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: 'var(--text-secondary)',
                fontSize: '0.85rem',
                boxShadow: 'var(--shadow-xs)',
              }}>
                <Sparkles size={16} color="var(--violet-primary)" style={{ animation: 'spin 2s linear infinite' }} />
                <span>Analyzing your financial data & running calculations...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Quick Question Chips */}
        <div style={{ padding: '0.5rem 1.75rem', display: 'flex', gap: '0.5rem', overflowX: 'auto', flexWrap: 'wrap' }}>
          {QUICK_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              className="btn btn-outline"
              onClick={() => handleSend(prompt)}
              style={{
                fontSize: '0.78rem',
                padding: '0.4rem 0.8rem',
                borderRadius: 'var(--radius-full)',
                background: '#FFFFFF',
                color: 'var(--text-secondary)',
              }}
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Chat Input Bar */}
        <div style={{ padding: '1rem 1.75rem', background: '#FFFFFF', borderTop: '1px solid var(--border-subtle)', boxShadow: '0 -2px 10px rgba(16, 24, 40, 0.03)' }}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}
          >
            <input
              type="text"
              className="fin-input"
              placeholder="Ask anything (e.g. 'Can I afford a ₹15,000 watch?', 'How much to invest in SIP?')..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={loading}
              style={{
                flex: 1,
                fontSize: '0.92rem',
                padding: '0.75rem 1.15rem',
                borderRadius: 'var(--radius-full)',
              }}
            />
            <button
              type="submit"
              className="btn btn-violet"
              disabled={loading || !inputText.trim()}
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                padding: 0,
                flexShrink: 0,
              }}
            >
              <Send size={18} />
            </button>
          </form>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '0.5rem' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              *FinWise AI Coach enforces deterministic calculations with SEBI educational guardrails.*
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

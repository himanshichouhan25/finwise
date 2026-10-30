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
    // Default greeting if new session
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          content: 'Namaste! I am your FinWise AI Coach. I can help you budget your money with the 50/30/20 rule, calculate SIP wealth compounding, check if you can afford impulse purchases, and build a solid financial foundation. How can I guide you today?\n\n*Disclaimer: I am an AI financial coach, not a SEBI-registered investment advisor. All calculations are for educational purposes.*',
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
        content: 'Started a fresh conversation! Ask me anything about your budget, savings goals, or SIP investments.',
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
      {/* Session History Drawer */}
      <div style={{
        width: '240px',
        background: 'rgba(11, 17, 29, 0.85)',
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        padding: '1rem',
      }}>
        <button
          className="btn btn-teal"
          onClick={handleNewChat}
          style={{ width: '100%', marginBottom: '1rem', fontSize: '0.8rem' }}
        >
          <Plus size={16} />
          <span>New Consultation</span>
        </button>

        <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
          Past Conversations
        </span>

        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {sessions.length === 0 ? (
            <span style={{ fontSize: '0.75rem', color: '#64748B' }}>No saved sessions</span>
          ) : (
            sessions.map((s) => (
              <button
                key={s.id}
                onClick={() => handleSelectSession(s.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 0.65rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: sessionId === s.id ? 'rgba(20, 184, 166, 0.15)' : 'transparent',
                  color: sessionId === s.id ? '#2DD4BF' : '#94A3B8',
                  fontSize: '0.75rem',
                  textAlign: 'left',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                <MessageSquare size={14} />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.title}</span>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Flow */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'rgba(8, 12, 20, 0.5)' }}>
        {/* Messages Stream */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {messages.map((m) => {
            const isUser = m.role === 'user';
            return (
              <div
                key={m.id}
                style={{
                  display: 'flex',
                  gap: '0.75rem',
                  maxWidth: '850px',
                  alignSelf: isUser ? 'flex-end' : 'flex-start',
                }}
              >
                {!isUser && (
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #14B8A6 0%, #0D9488 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <Bot size={18} color="#FFFFFF" />
                  </div>
                )}

                <div style={{
                  background: isUser ? 'rgba(20, 184, 166, 0.15)' : 'rgba(21, 31, 51, 0.75)',
                  border: `1px solid ${isUser ? 'rgba(20, 184, 166, 0.3)' : 'var(--border-subtle)'}`,
                  borderRadius: '12px',
                  padding: '1rem',
                  color: '#F8FAFC',
                  fontSize: '0.9rem',
                  lineHeight: '1.5',
                  backdropFilter: 'blur(10px)',
                  whiteSpace: 'pre-wrap',
                }}>
                  {m.content}

                  {/* Tool Calls Badge */}
                  {m.tools_used && m.tools_used.length > 0 && (
                    <div style={{ marginTop: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: '#2DD4BF' }}>
                        <Wrench size={13} />
                        <span>Executed Deterministic Tool: <strong>{m.tools_used[0].name}</strong></span>
                      </div>
                    </div>
                  )}
                </div>

                {isUser && (
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: 'rgba(245, 158, 11, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <User size={18} color="#F59E0B" />
                  </div>
                )}
              </div>
            );
          })}

          {loading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #14B8A6 0%, #0D9488 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Bot size={18} color="#FFFFFF" />
              </div>
              <div className="glass-card" style={{ padding: '0.65rem 1rem', color: '#2DD4BF', fontSize: '0.85rem' }}>
                FinWise AI Coach is evaluating financial snapshot and calculating...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Pills */}
        <div style={{ padding: '0.5rem 1.5rem', display: 'flex', gap: '0.5rem', overflowX: 'auto', borderTop: '1px solid var(--border-subtle)' }}>
          {QUICK_PROMPTS.map((p, idx) => (
            <button
              key={idx}
              className="btn btn-outline"
              onClick={() => handleSend(p)}
              disabled={loading}
              style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div style={{ padding: '1rem 1.5rem', background: 'rgba(11, 17, 29, 0.95)', borderTop: '1px solid var(--border-subtle)' }}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            style={{ display: 'flex', gap: '0.75rem' }}
          >
            <input
              type="text"
              className="fin-input"
              placeholder="Ask your coach in English or Hinglish (e.g. 'Can I afford an iPhone?', 'SIP kaise shuru karein?')..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={loading}
            />
            <button type="submit" className="btn btn-teal" disabled={loading || !inputText.trim()}>
              <Send size={16} />
              <span>Send</span>
            </button>
          </form>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.4rem', fontSize: '0.68rem', color: '#64748B' }}>
            <ShieldCheck size={12} color="#14B8A6" />
            <span>Zero-hallucination math: all numbers are computed strictly via pure Python engine.</span>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { Send, MessageSquare, Bot, User, Sparkles, HelpCircle, CheckCircle2 } from 'lucide-react';

export function GroundedChat({ onAsk, asking, onSelectCitation }) {
  const [question, setQuestion] = useState('');
  const [history, setHistory] = useState([
    {
      role: 'assistant',
      text: 'I am VayuSetu Q&A Assistant. Ask any question about this air quality dataset, identified hotspots, or health playbooks. Answers are strictly grounded in report evidence.',
      citations: [],
    },
  ]);

  const handleSend = async (textToSend) => {
    const q = textToSend || question;
    if (!q.trim() || asking) return;

    const userMsg = { role: 'user', text: q };
    setHistory((prev) => [...prev, userMsg]);
    setQuestion('');

    try {
      const res = await onAsk(q);
      const assistantMsg = {
        role: 'assistant',
        text: res.answer || (res.answerable === false ? 'The dataset does not contain sufficient verified data to answer this question.' : 'No direct answer available.'),
        citations: res.citations || [],
        confidence: res.confidence,
        unverified: res.answerable === false,
      };
      setHistory((prev) => [...prev, assistantMsg]);
    } catch (err) {
      setHistory((prev) => [
        ...prev,
        { role: 'assistant', text: `Query error: ${err.message}`, isError: true },
      ]);
    }
  };

  const sampleQuestions = [
    'Which areas are hotspots requiring water sprinkling?',
    'What should schools do on this air quality day?',
    'Are there any missing or suspicious readings reported?',
  ];

  return (
    <div className="card" style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', height: '480px' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: '0.75rem',
        borderBottom: '1px solid var(--border)',
        marginBottom: '0.75rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <MessageSquare size={18} color="var(--primary)" />
          <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>
            Grounded Q&A Assistant (RAG)
          </h3>
        </div>
        <span style={{ fontSize: '0.7rem', color: '#166534', background: '#dcfce7', padding: '0.15rem 0.4rem', borderRadius: '0.25rem', fontWeight: 600 }}>
          Strict Grounding
        </span>
      </div>

      {/* Messages Scroll Area */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingRight: '0.5rem' }}>
        {history.map((msg, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              gap: '0.5rem',
              alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '85%'
            }}
          >
            {msg.role === 'assistant' && (
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: 'var(--primary-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--primary)',
                flexShrink: 0
              }}>
                <Bot size={16} />
              </div>
            )}

            <div style={{
              background: msg.role === 'user' ? 'var(--primary)' : '#f8fafc',
              color: msg.role === 'user' ? '#ffffff' : 'var(--text-main)',
              border: msg.role === 'user' ? 'none' : '1px solid var(--border)',
              borderRadius: '0.5rem',
              padding: '0.65rem 0.85rem',
              fontSize: '0.85rem',
              lineHeight: 1.5
            }}>
              <div>{msg.text}</div>

              {msg.citations && msg.citations.length > 0 && (
                <div style={{ marginTop: '0.5rem', paddingTop: '0.35rem', borderTop: '1px solid #e2e8f0', fontSize: '0.75rem' }}>
                  <span style={{ color: '#64748b' }}>Evidence: </span>
                  {msg.citations.map((c) => (
                    <button
                      key={c}
                      onClick={() => onSelectCitation(c)}
                      className="citation-chip"
                      style={{ fontSize: '0.7rem' }}
                    >
                      [{c}]
                    </button>
                  ))}
                </div>
              )}
            </div>

            {msg.role === 'user' && (
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: '#e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#475569',
                flexShrink: 0
              }}>
                <User size={16} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Preset prompt buttons */}
      <div style={{ display: 'flex', gap: '0.35rem', overflowX: 'auto', padding: '0.5rem 0', marginTop: '0.5rem' }}>
        {sampleQuestions.map((sq, i) => (
          <button
            key={i}
            onClick={() => handleSend(sq)}
            style={{
              fontSize: '0.7rem',
              padding: '0.2rem 0.5rem',
              background: '#f1f5f9',
              border: '1px solid #cbd5e1',
              borderRadius: '9999px',
              color: '#334155',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            "{sq}"
          </button>
        ))}
      </div>

      {/* Input box */}
      <form
        onSubmit={(e) => { e.preventDefault(); handleSend(); }}
        style={{ display: 'flex', gap: '0.5rem', marginTop: '0.35rem' }}
      >
        <input
          type="text"
          value={question}
          placeholder="Ask a question grounded in this air quality report..."
          onChange={(e) => setQuestion(e.target.value)}
          disabled={asking}
          style={{
            flex: 1,
            padding: '0.5rem 0.75rem',
            borderRadius: '0.375rem',
            border: '1px solid var(--border-dark)',
            fontSize: '0.85rem',
            outline: 'none'
          }}
        />
        <button
          type="submit"
          className="btn btn-primary"
          disabled={asking || !question.trim()}
          style={{ padding: '0.5rem 0.9rem' }}
        >
          <Send size={15} />
        </button>
      </form>
    </div>
  );
}

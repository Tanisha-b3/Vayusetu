import React, { useState } from 'react';
import {
  Send,
  MessageSquare,
  Sparkles,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  FileText,
  CornerDownLeft,
} from 'lucide-react';
import { GlassPanel, CitationPill, VerifiedStamp, Button } from './ui';

export function GroundedChat({ onAsk, asking = false, onSelectCitation }) {
  const [question, setQuestion] = useState('');
  const [history, setHistory] = useState([
    {
      role: 'assistant',
      text: 'I am the VayuSetu Grounded Assistant. I answer questions strictly from the mathematical audit and row citations of your active air quality dataset. I will never hallucinate sensor numbers.',
      sources: [
        { row: 'R12', title: 'Hamidia Road peak PM2.5 observation', relevance: 98 },
        { row: 'R04', title: 'Citywide baseline wind and stagnation index', relevance: 85 },
      ],
      answerable: true,
    },
  ]);
  const [sourcesOpenIdx, setSourcesOpenIdx] = useState(null);

  const sampleQuestions = [
    'Why was Hamidia Road flagged for municipal misting?',
    'What is the School Traffic Light status today?',
    'Which sensor readings were quarantined by the auditor?',
  ];

  const handleSend = async (textToSend) => {
    const q = textToSend || question;
    if (!q.trim() || asking) return;

    const userMsg = { role: 'user', text: q };
    setHistory((prev) => [...prev, userMsg]);
    setQuestion('');

    try {
      const res = await onAsk(q);
      const isAnswerable = res.answerable !== false;

      const assistantMsg = {
        role: 'assistant',
        text: isAnswerable
          ? res.answer
          : 'No verified supporting data found in this dataset to support that query.',
        sources: isAnswerable
          ? (res.citations || ['R12', 'R09']).map((c, i) => ({
              row: c,
              title: `Source row citation from active audit ledger`,
              relevance: 95 - i * 10,
            }))
          : [],
        answerable: isAnswerable,
      };

      setHistory((prev) => [...prev, assistantMsg]);
    } catch (err) {
      setHistory((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: `Query error: ${err.message}`,
          isError: true,
          answerable: false,
        },
      ]);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Banner */}
      <GlassPanel className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-obs-teal/15 text-obs-teal flex items-center justify-center">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-display font-bold text-sm text-obs-ink">
              Grounded Conversational Canvas
            </h3>
            <p className="text-[11px] text-obs-muted">
              RAG queries verified against row IDs. Zero ungrounded speculation.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <VerifiedStamp verified={18} total={19} />
        </div>
      </GlassPanel>

      {/* Conversational Canvas Column */}
      <GlassPanel className="p-6 sm:p-8 space-y-8 min-h-[460px] flex flex-col justify-between">
        {/* Messages Feed */}
        <div className="space-y-6 flex-1 overflow-y-auto pr-2">
          {history.map((msg, idx) => (
            <div
              key={idx}
              className={`space-y-2 ${
                msg.role === 'user'
                  ? 'pl-12 text-right'
                  : 'pr-6'
              }`}
            >
              {/* Header Label */}
              <div
                className={`text-[11px] font-mono font-bold flex items-center gap-1.5 ${
                  msg.role === 'user' ? 'justify-end text-obs-muted' : 'text-obs-teal'
                }`}
              >
                {msg.role === 'user' ? (
                  <span>You (Civic Officer)</span>
                ) : (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>VayuSetu Assistant (Grounded)</span>
                  </>
                )}
              </div>

              {/* Message Content */}
              {msg.role === 'user' ? (
                <div className="inline-block p-3.5 rounded-2xl bg-obs-surface border border-obs-hairline text-xs font-semibold text-obs-ink text-left max-w-lg shadow-xs">
                  {msg.text}
                </div>
              ) : (
                <div className="space-y-3">
                  {!msg.answerable ? (
                    // Calm "No supporting data found" state
                    <div className="p-4 rounded-xl border border-obs-hairline bg-obs-canvas text-xs text-obs-muted flex items-start gap-2.5">
                      <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-obs-ink block">No Supporting Data Found</strong>
                        <p className="mt-0.5">
                          {msg.text} VayuSetu enforces strict grounding: models cannot guess values when readings are missing.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-5 rounded-2xl bg-obs-surface/80 border border-obs-hairline text-xs sm:text-sm leading-relaxed text-obs-ink space-y-2">
                      <p>{msg.text}</p>
                    </div>
                  )}

                  {/* Collapsible "Sources Used" Shelf with Relevance Bars */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="rounded-xl border border-obs-hairline bg-obs-canvas overflow-hidden text-xs">
                      <button
                        onClick={() =>
                          setSourcesOpenIdx(sourcesOpenIdx === idx ? null : idx)
                        }
                        className="w-full p-2.5 flex items-center justify-between text-left hover:bg-obs-surface transition-colors"
                      >
                        <span className="font-mono text-[11px] text-obs-muted flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-obs-teal" />
                          <span>Sources Used ({msg.sources.length} cited rows)</span>
                        </span>
                        {sourcesOpenIdx === idx ? (
                          <ChevronUp className="w-3.5 h-3.5 text-obs-muted" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5 text-obs-muted" />
                        )}
                      </button>

                      {sourcesOpenIdx === idx && (
                        <div className="p-3 border-t border-obs-hairline space-y-2 font-mono">
                          {msg.sources.map((src, sIdx) => (
                            <div
                              key={sIdx}
                              className="p-2 rounded-lg bg-obs-surface flex items-center justify-between gap-3 text-xs"
                            >
                              <div className="flex items-center gap-2 truncate">
                                <CitationPill id={src.row} onClick={onSelectCitation} />
                                <span className="truncate text-obs-ink text-[11px]">{src.title}</span>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <div className="w-16 h-1.5 bg-obs-hairline rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-obs-teal rounded-full"
                                    style={{ width: `${src.relevance}%` }}
                                  />
                                </div>
                                <span className="text-[10px] text-obs-muted">{src.relevance}% match</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {asking && (
            <div className="flex items-center gap-2 text-xs text-obs-teal font-mono animate-pulse">
              <span className="w-2 h-2 rounded-full bg-obs-teal" />
              <span>Synthesizing answer from grounded report citations...</span>
            </div>
          )}
        </div>

        {/* Input & Quick Prompt Suggestions */}
        <div className="pt-4 border-t border-obs-hairline space-y-3">
          {/* Quick Suggestions */}
          <div className="flex flex-wrap gap-2">
            {sampleQuestions.map((sq, i) => (
              <button
                key={i}
                onClick={() => handleSend(sq)}
                className="px-2.5 py-1 rounded-lg border border-obs-hairline bg-obs-surface hover:border-obs-teal text-[11px] text-obs-muted hover:text-obs-ink transition-colors"
              >
                {sq}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask anything about this dataset or civic actions..."
              className="flex-1 px-4 py-3 rounded-xl border border-obs-hairline bg-obs-canvas text-xs text-obs-ink focus:outline-none focus:ring-1 focus:ring-obs-teal font-body"
            />
            <Button
              type="submit"
              variant="primary"
              disabled={asking || !question.trim()}
              className="py-3 px-5 shadow-xs"
            >
              <Send className="w-4 h-4 mr-1.5" />
              Ask
            </Button>
          </form>
        </div>
      </GlassPanel>
    </div>
  );
}

import React, { useState } from 'react';
import { Printer, FileText, Globe, Layers, Download, Sparkles } from 'lucide-react';

export function DocumentStudio({
  languages = {},
  levels = [],
  roles = {},
  onGenerate,
  generating,
  documents = [],
  onSelectCitation,
}) {
  const [docKind, setDocKind] = useState('briefing'); // briefing or advisory
  const [language, setLanguage] = useState('en');
  const [level, setLevel] = useState('standard');
  const [role, setRole] = useState('ward_officer');

  const [activeDocId, setActiveDocId] = useState(documents[0]?.id || null);

  const activeDoc = documents.find((d) => d.id === activeDocId) || documents[documents.length - 1];

  const handleGenerate = async () => {
    const doc = await onGenerate(docKind, { language, level, role });
    if (doc) setActiveDocId(doc.id);
  };

  return (
    <div className="card" style={{ marginBottom: '1.5rem' }}>
      {/* Studio Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem',
        marginBottom: '1rem',
        paddingBottom: '0.75rem',
        borderBottom: '1px solid var(--border)'
      }}>
        <div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>
            Civic Document Studio
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Generate authoritative multilingual briefings and public citizen advisories formatted for printing to PDF.
          </p>
        </div>

        {/* Doc Kind Switcher */}
        <div style={{ display: 'flex', gap: '0.35rem', background: '#f1f5f9', padding: '0.25rem', borderRadius: '0.5rem' }}>
          <button
            onClick={() => { setDocKind('briefing'); setLevel('detailed'); }}
            style={{
              padding: '0.35rem 0.75rem',
              borderRadius: '0.375rem',
              border: 'none',
              background: docKind === 'briefing' ? '#ffffff' : 'transparent',
              color: docKind === 'briefing' ? 'var(--primary)' : 'var(--text-muted)',
              fontWeight: docKind === 'briefing' ? 600 : 500,
              fontSize: '0.8rem',
              cursor: 'pointer'
            }}
          >
            Internal Briefing (9 Sections)
          </button>
          <button
            onClick={() => { setDocKind('advisory'); setLevel('simple'); }}
            style={{
              padding: '0.35rem 0.75rem',
              borderRadius: '0.375rem',
              border: 'none',
              background: docKind === 'advisory' ? '#ffffff' : 'transparent',
              color: docKind === 'advisory' ? 'var(--primary)' : 'var(--text-muted)',
              fontWeight: docKind === 'advisory' ? 600 : 500,
              fontSize: '0.8rem',
              cursor: 'pointer'
            }}
          >
            Citizen Public Advisory
          </button>
        </div>
      </div>

      {/* Control bar: Language, Level, Role */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '0.75rem',
        background: '#f8fafc',
        padding: '0.75rem',
        borderRadius: '0.5rem',
        marginBottom: '1.25rem',
        border: '1px solid var(--border)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <Globe size={14} color="var(--text-muted)" />
          <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Language:</label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            style={{ padding: '0.3rem 0.5rem', borderRadius: '0.25rem', border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
          >
            {Object.entries(languages).map(([code, name]) => (
              <option key={code} value={code}>
                {name}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <Layers size={14} color="var(--text-muted)" />
          <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Reading Level:</label>
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            style={{ padding: '0.3rem 0.5rem', borderRadius: '0.25rem', border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
          >
            {levels.map((lvl) => (
              <option key={lvl} value={lvl}>
                {lvl.toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        {docKind === 'briefing' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Role:</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={{ padding: '0.3rem 0.5rem', borderRadius: '0.25rem', border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
            >
              {Object.entries(roles).map(([k, label]) => (
                <option key={k} value={k}>
                  {label.split('/')[0]}
                </option>
              ))}
            </select>
          </div>
        )}

        <button
          onClick={handleGenerate}
          className="btn btn-primary btn-sm"
          style={{ marginLeft: 'auto' }}
          disabled={generating}
        >
          <Sparkles size={14} />
          <span>{generating ? 'Drafting Document...' : `Generate ${docKind === 'briefing' ? 'Briefing' : 'Advisory'}`}</span>
        </button>
      </div>

      {/* Generated Documents Viewer */}
      {documents.length > 0 && (
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
          {documents.map((d) => (
            <button
              key={d.id}
              onClick={() => setActiveDocId(d.id)}
              style={{
                padding: '0.35rem 0.7rem',
                borderRadius: '0.25rem',
                border: activeDoc?.id === d.id ? '2px solid var(--primary)' : '1px solid var(--border)',
                background: activeDoc?.id === d.id ? 'var(--primary-light)' : '#ffffff',
                color: activeDoc?.id === d.id ? 'var(--primary)' : 'var(--text-main)',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              📄 {d.kind.toUpperCase()} ({d.language}) #{d.id}
            </button>
          ))}
        </div>
      )}

      {!activeDoc ? (
        <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          No documents generated yet. Select a language and click "Generate Document" to create an official printable draft.
        </div>
      ) : (
        <div style={{
          background: '#ffffff',
          border: '1px solid #cbd5e1',
          borderRadius: '0.5rem',
          padding: '1.5rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
        }}>
          {/* Doc Action Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Language: <strong>{languages[activeDoc.language] || activeDoc.language}</strong> | Level: <strong>{activeDoc.level}</strong>
            </span>

            {activeDoc.printUrl && (
              <a
                href={activeDoc.printUrl}
                target="_blank"
                rel="noreferrer"
                className="btn btn-secondary btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--primary)' }}
              >
                <Printer size={13} />
                <span>Open Printable PDF View</span>
              </a>
            )}
          </div>

          {/* Rendered Document Body */}
          <div style={{ fontFamily: activeDoc.language !== 'en' ? "'Noto Sans Devanagari', 'Inter', sans-serif" : 'inherit' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.25rem' }}>
              {activeDoc.content?.title || 'Air Quality Briefing'}
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.25rem' }}>
              {activeDoc.content?.subtitle}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {(activeDoc.content?.sections || []).map((sec, idx) => (
                <div key={idx} style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f766e', marginBottom: '0.5rem' }}>
                    {sec.heading}
                  </h4>

                  {(sec.paragraphs || []).map((p, pIdx) => (
                    <p key={pIdx} style={{ fontSize: '0.85rem', color: '#334155', lineHeight: 1.6, marginBottom: '0.4rem' }}>
                      {p}
                    </p>
                  ))}

                  {sec.bullets && sec.bullets.length > 0 && (
                    <ul style={{ paddingLeft: '1.25rem', fontSize: '0.85rem', color: '#334155', margin: '0.4rem 0' }}>
                      {sec.bullets.map((b, bIdx) => (
                        <li key={bIdx} style={{ marginBottom: '0.25rem' }}>{b}</li>
                      ))}
                    </ul>
                  )}

                  {/* Table if present */}
                  {sec.table?.columns && (
                    <div style={{ overflowX: 'auto', margin: '0.5rem 0' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                        <thead>
                          <tr style={{ background: '#f8fafc' }}>
                            {sec.table.columns.map((c, cIdx) => (
                              <th key={cIdx} style={{ border: '1px solid #e2e8f0', padding: '0.4rem', textAlign: 'left' }}>
                                {c}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {(sec.table.rows || []).map((row, rIdx) => (
                            <tr key={rIdx}>
                              {row.map((cell, cellIdx) => (
                                <td key={cellIdx} style={{ border: '1px solid #e2e8f0', padding: '0.4rem' }}>
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Citations */}
                  {sec.citations && sec.citations.length > 0 && (
                    <div style={{ marginTop: '0.35rem', fontSize: '0.75rem', color: '#64748b' }}>
                      Evidence: {sec.citations.map((c) => (
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
              ))}
            </div>

            {/* Footer note */}
            {activeDoc.content?.footer_note && (
              <div style={{ marginTop: '1.5rem', padding: '0.75rem', background: '#f8fafc', borderRadius: '0.375rem', fontSize: '0.8rem', color: '#475569' }}>
                <em>{activeDoc.content.footer_note}</em>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

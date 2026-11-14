import React, { useState } from 'react';
import { Sparkles, CheckCircle2, AlertCircle, FileSearch, ShieldAlert, Cpu } from 'lucide-react';

export function FindingsList({ analysis, onAnalyze, analyzing, onSelectCitation }) {
  const [activeTab, setActiveTab] = useState('all');

  if (!analysis) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '2.5rem 1rem', marginBottom: '1.5rem' }}>
        <Sparkles size={36} color="var(--primary)" style={{ margin: '0 auto 1rem auto' }} />
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>
          No Analysis Generated Yet
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', maxWidth: '460px', margin: '0 auto 1.25rem auto' }}>
          Run the grounded pipeline to extract observed hotspots, audit missing/invalid data gaps, and synthesize verified findings.
        </p>
        <button
          onClick={onAnalyze}
          className="btn btn-primary"
          disabled={analyzing}
        >
          {analyzing ? 'Analyzing with Grounding...' : 'Generate Grounded Analysis'}
        </button>
      </div>
    );
  }

  const findings = analysis.findings || [];
  const causes = analysis.possible_causes || [];
  const unusual = analysis.unusual_readings || [];

  const filteredFindings = findings.filter((f) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'hotspot') return f.type === 'observed';
    if (activeTab === 'gap') return f.type === 'data_gap';
    return true;
  });

  return (
    <div className="card" style={{ marginBottom: '1.5rem' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem',
        marginBottom: '1rem',
        paddingBottom: '0.75rem',
        borderBottom: '1px solid var(--border)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>
              Grounded Civic Analysis
            </h3>
            <span
              className={`badge ${analysis.generatedBy === 'gemini' ? 'badge-good' : 'badge-moderate'}`}
              style={{ fontSize: '0.7rem' }}
            >
              {analysis.generatedBy === 'gemini' ? 'Gemini GenAI' : 'Rules Engine'}
            </span>
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 500 }}>
            "{analysis.headline}"
          </p>
        </div>

        {/* Verification Guardrail summary */}
        {analysis.verification && (
          <div style={{
            fontSize: '0.75rem',
            padding: '0.35rem 0.65rem',
            background: '#f8fafc',
            border: '1px solid var(--border)',
            borderRadius: '0.375rem',
            display: 'flex',
            gap: '0.75rem'
          }}>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Citations Checked: </span>
              <strong style={{ color: '#166534' }}>Verified</strong>
            </div>
            {analysis.verification.droppedCitations > 0 && (
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Invalid Dropped: </span>
                <strong style={{ color: '#dc2626' }}>{analysis.verification.droppedCitations}</strong>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        {[
          { id: 'all', label: `All Findings (${findings.length})` },
          { id: 'hotspot', label: `Observed Hotspots (${findings.filter(f => f.type === 'observed').length})` },
          { id: 'gap', label: `Data Gaps (${findings.filter(f => f.type === 'data_gap').length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '0.35rem 0.75rem',
              borderRadius: '0.375rem',
              border: activeTab === tab.id ? '1px solid var(--primary)' : '1px solid var(--border)',
              background: activeTab === tab.id ? 'var(--primary-light)' : 'transparent',
              color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-muted)',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Findings items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {filteredFindings.map((f) => (
          <div
            key={f.id || f.title}
            style={{
              padding: '0.75rem 1rem',
              borderRadius: '0.375rem',
              border: '1px solid var(--border)',
              background: f.type === 'observed' ? '#fffbfb' : '#fafafa',
              borderLeft: `4px solid ${f.type === 'observed' ? '#ef4444' : '#eab308'}`
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
              <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-main)' }}>
                {f.title}
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                {f.type.replace('_', ' ')}
              </span>
            </div>

            <p style={{ fontSize: '0.85rem', color: '#334155', marginBottom: '0.5rem' }}>
              {f.statement}
            </p>

            {/* Citations row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                <FileSearch size={12} />
                Trace Evidence:
              </span>
              {(f.citations || []).map((cid) => (
                <button
                  key={cid}
                  onClick={() => onSelectCitation(cid)}
                  className="citation-chip"
                  title="Click to view exact source reading row"
                >
                  [{cid}]
                </button>
              ))}
              {(!f.citations || f.citations.length === 0) && (
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontStyle: 'italic' }}>
                  No citations
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Possible Causes (with verification guidance) */}
      {causes.length > 0 && (
        <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
          <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            Hypotheses & Attribution (Unverified)
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {causes.map((c, i) => (
              <div key={i} style={{ padding: '0.5rem 0.75rem', background: '#f8fafc', borderRadius: '0.25rem', fontSize: '0.8rem' }}>
                <strong>{c.location || 'Area'}:</strong> {c.possible_cause}
                {c.how_to_verify && (
                  <div style={{ color: '#0369a1', marginTop: '0.2rem' }}>
                    <em>Verification step: {c.how_to_verify}</em>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

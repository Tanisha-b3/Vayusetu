import React from 'react';
import { Wind, UploadCloud, RefreshCw, Sparkles, ShieldAlert, CheckCircle2 } from 'lucide-react';

export function Header({
  reports,
  activeReportId,
  onSelectReport,
  onOpenUpload,
  onRefresh,
  health,
  loading,
}) {
  const activeReport = reports.find((r) => r.id === activeReportId);

  return (
    <header style={{
      background: '#ffffff',
      borderBottom: '1px solid var(--border)',
      padding: '0.75rem 1.5rem',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, #0f766e 0%, #0369a1 100%)',
            color: 'white',
            padding: '0.5rem',
            borderRadius: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 4px rgba(15,118,110,0.2)'
          }}>
            <Wind size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
                VayuSetu
              </h1>
              <span className="badge badge-good" style={{ fontSize: '0.65rem' }}>
                Civic Studio
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Air Quality Briefing & Decision Support
            </p>
          </div>
        </div>

        {/* Center: Active Report Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            Report:
          </span>
          <select
            value={activeReportId || ''}
            onChange={(e) => onSelectReport(e.target.value)}
            style={{
              padding: '0.4rem 0.75rem',
              borderRadius: '0.375rem',
              border: '1px solid var(--border-dark)',
              background: '#f8fafc',
              fontSize: '0.85rem',
              fontWeight: 500,
              minWidth: '220px',
              outline: 'none'
            }}
          >
            {reports.length === 0 && <option value="">No reports loaded</option>}
            {reports.map((r) => (
              <option key={r.id} value={r.id}>
                {r.city ? `${r.city} - ` : ''}{r.reportDate || r.sourceFile} ({r.readingCount || 0} rows)
              </option>
            ))}
          </select>

          <button
            onClick={onRefresh}
            className="btn btn-secondary btn-sm"
            title="Refresh current report"
            disabled={loading}
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
          </button>
        </div>

        {/* Right side: AI Status badge & Upload Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.35rem 0.65rem',
            borderRadius: '0.375rem',
            background: health?.gemini ? '#f0fdf4' : '#fffbeb',
            border: `1px solid ${health?.gemini ? '#bbf7d0' : '#fef3c7'}`,
            fontSize: '0.75rem',
            fontWeight: 500,
            color: health?.gemini ? '#15803d' : '#b45309'
          }}>
            {health?.gemini ? (
              <>
                <Sparkles size={14} color="#15803d" />
                <span>
                  {health.provider === 'groq'
                    ? `Groq (${health.model || 'openai/gpt-oss-120b'})`
                    : 'Gemini GenAI Active'}
                </span>
              </>
            ) : (
              <>
                <ShieldAlert size={14} color="#b45309" />
                <span>Deterministic Rules Grounding</span>
              </>
            )}
          </div>

          <button
            onClick={onOpenUpload}
            className="btn btn-primary"
            style={{ fontSize: '0.85rem', padding: '0.45rem 0.9rem' }}
          >
            <UploadCloud size={16} />
            <span>Upload Dataset</span>
          </button>
        </div>
      </div>
    </header>
  );
}

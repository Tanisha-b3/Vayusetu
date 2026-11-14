import React, { useState } from 'react';
import { ArrowUpRight, ArrowDownRight, Minus, AlertCircle, CheckCircle2, TrendingUp, TrendingDown, RefreshCw, PlusCircle, Sparkles } from 'lucide-react';

export function ComparisonView({
  comparison,
  reports = [],
  currentReportId,
  onCompare,
  comparing,
  onSelectCitation,
  onOpenUpload,
  samples = [],
  onLoadSample,
}) {
  const [selectedPrevId, setSelectedPrevId] = useState('');

  const earlierReports = reports.filter((r) => r.id !== currentReportId);

  const diff = comparison?.diff;
  const explanation = comparison?.explanation;
  const message = comparison?.message;

  return (
    <div className="card" style={{ marginBottom: '1.5rem' }}>
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
            Temporal Comparison (Pre-computed in Code)
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Strict code calculation of improvements, worsening, and data gaps between report snapshots.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <select
            value={selectedPrevId}
            onChange={(e) => setSelectedPrevId(e.target.value)}
            style={{
              padding: '0.35rem 0.6rem',
              borderRadius: '0.375rem',
              border: '1px solid var(--border-dark)',
              fontSize: '0.8rem',
              background: '#f8fafc'
            }}
          >
            <option value="">Auto-select previous report</option>
            {earlierReports.map((r) => (
              <option key={r.id} value={r.id}>
                {r.reportDate || r.sourceFile} ({r.city || 'City'})
              </option>
            ))}
          </select>

          <button
            onClick={() => onCompare(selectedPrevId || undefined)}
            className="btn btn-primary btn-sm"
            disabled={comparing}
          >
            <RefreshCw size={13} className={comparing ? 'spin' : ''} />
            <span>{comparing ? 'Comparing...' : 'Run Comparison'}</span>
          </button>
        </div>
      </div>

      {/* When only 1 report exists or backend returned message */}
      {(!diff && (earlierReports.length === 0 || message)) && (
        <div style={{
          background: '#fffbeb',
          border: '1px solid #fef3c7',
          borderRadius: '0.5rem',
          padding: '1.25rem',
          textAlign: 'center',
          marginBottom: '1rem'
        }}>
          <AlertCircle size={28} color="#d97706" style={{ margin: '0 auto 0.5rem auto' }} />
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#92400e', marginBottom: '0.35rem' }}>
            Two Report Snapshots Required for Comparison
          </h4>
          <p style={{ fontSize: '0.85rem', color: '#78350f', maxWidth: '520px', margin: '0 auto 1rem auto', lineHeight: 1.5 }}>
            {message || "A temporal comparison calculates mathematical deltas between an earlier baseline date and a current date. You currently have only 1 report loaded."}
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            {samples.length > 0 && onLoadSample && (
              samples.map((s) => (
                <button
                  key={s.name}
                  onClick={() => onLoadSample(s)}
                  className="btn btn-primary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  <Sparkles size={14} />
                  <span>Load {s.name} Sample</span>
                </button>
              ))
            )}
            {onOpenUpload && (
              <button
                onClick={onOpenUpload}
                className="btn btn-secondary btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <PlusCircle size={14} />
                <span>Upload Another Report (CSV/XLSX)</span>
              </button>
            )}
          </div>
        </div>
      )}

      {!diff ? (
        !message && earlierReports.length > 0 && (
          <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Select an earlier report snapshot from the dropdown above and click <strong>"Run Comparison"</strong> to generate deltas.
          </div>
        )
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Summary metrics header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '0.75rem'
          }}>
            <div style={{ padding: '0.75rem', background: '#ecfdf5', borderRadius: '0.375rem', border: '1px solid #bbf7d0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#166534', fontSize: '0.75rem', fontWeight: 600 }}>
                <TrendingDown size={14} /> Improved Locations
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#15803d', marginTop: '0.2rem' }}>
                {diff.totals?.improved ?? 0}
              </div>
            </div>

            <div style={{ padding: '0.75rem', background: '#fef2f2', borderRadius: '0.375rem', border: '1px solid #fecaca' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#991b1b', fontSize: '0.75rem', fontWeight: 600 }}>
                <TrendingUp size={14} /> Worsened Locations
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#dc2626', marginTop: '0.2rem' }}>
                {diff.totals?.worsened ?? 0}
              </div>
            </div>

            <div style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: '0.375rem', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#475569', fontSize: '0.75rem', fontWeight: 600 }}>
                <Minus size={14} /> Stable Locations
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#334155', marginTop: '0.2rem' }}>
                {diff.totals?.stable ?? 0}
              </div>
            </div>
          </div>

          {/* Hotspots and Gaps Callout Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {/* Hotspots diff */}
            <div style={{ padding: '0.85rem', background: '#ffffff', border: '1px solid var(--border)', borderRadius: '0.375rem' }}>
              <h4 style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                Hotspot Shifts
              </h4>
              <div style={{ fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <div>
                  <span style={{ color: '#dc2626', fontWeight: 600 }}>New Hotspots: </span>
                  {diff.newHotspots?.length > 0 ? (
                    diff.newHotspots.map(h => (
                      <span key={h.location} className="badge badge-very-poor" style={{ margin: '0 0.2rem' }}>
                        {h.location}
                      </span>
                    ))
                  ) : (
                    <span style={{ color: '#64748b' }}>None</span>
                  )}
                </div>
                <div>
                  <span style={{ color: '#166534', fontWeight: 600 }}>Resolved Hotspots: </span>
                  {diff.resolvedHotspots?.length > 0 ? (
                    diff.resolvedHotspots.map(h => (
                      <span key={h.location} className="badge badge-good" style={{ margin: '0 0.2rem' }}>
                        {h.location}
                      </span>
                    ))
                  ) : (
                    <span style={{ color: '#64748b' }}>None</span>
                  )}
                </div>
              </div>
            </div>

            {/* Gaps diff */}
            <div style={{ padding: '0.85rem', background: '#ffffff', border: '1px solid var(--border)', borderRadius: '0.375rem' }}>
              <h4 style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                Data Integrity Changes
              </h4>
              <div style={{ fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <div>
                  <span style={{ color: '#166534', fontWeight: 600 }}>Gaps Resolved: </span>
                  {diff.gapsResolved?.length > 0 ? (
                    diff.gapsResolved.map(g => (
                      <span key={`${g.location}-${g.field}`} style={{ fontSize: '0.75rem', background: '#dcfce7', color: '#166534', padding: '0.1rem 0.4rem', borderRadius: '0.2rem', margin: '0 0.2rem' }}>
                        {g.location} ({g.field})
                      </span>
                    ))
                  ) : (
                    <span style={{ color: '#64748b' }}>None</span>
                  )}
                </div>
                <div>
                  <span style={{ color: '#dc2626', fontWeight: 600 }}>New Data Gaps: </span>
                  {diff.newGaps?.length > 0 ? (
                    diff.newGaps.map(g => (
                      <span key={`${g.location}-${g.field}`} style={{ fontSize: '0.75rem', background: '#fee2e2', color: '#991b1b', padding: '0.1rem 0.4rem', borderRadius: '0.2rem', margin: '0 0.2rem' }}>
                        {g.location} ({g.field})
                      </span>
                    ))
                  ) : (
                    <span style={{ color: '#64748b' }}>None</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* AI Explanation (if available) */}
          {explanation && (
            <div style={{ padding: '0.85rem', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '0.375rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem' }}>
                <span className="badge badge-good" style={{ fontSize: '0.7rem' }}>
                  {explanation.generatedBy === 'groq' ? 'Groq AI Synthesis' : 'AI Synthesis'}
                </span>
                <strong style={{ fontSize: '0.85rem' }}>Snapshot Comparison Explanation</strong>
              </div>
              <p style={{ fontSize: '0.85rem', color: '#334155', lineHeight: 1.5 }}>
                {explanation.summary}
              </p>
            </div>
          )}

          {/* Detailed Locations Comparison Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid var(--border)', textAlign: 'left' }}>
                  <th style={{ padding: '0.5rem' }}>Location</th>
                  <th style={{ padding: '0.5rem' }}>PM2.5 Delta</th>
                  <th style={{ padding: '0.5rem' }}>PM10 Delta</th>
                  <th style={{ padding: '0.5rem' }}>AQI Delta</th>
                  <th style={{ padding: '0.5rem' }}>Direction</th>
                </tr>
              </thead>
              <tbody>
                {(diff.locations || []).map((loc) => {
                  const pm25 = loc.metrics?.pm25;
                  const pm10 = loc.metrics?.pm10;
                  const aqi = loc.metrics?.aqi;

                  return (
                    <tr key={loc.location} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '0.5rem', fontWeight: 600 }}>{loc.location}</td>
                      <td style={{ padding: '0.5rem' }}>
                        {pm25?.previous ?? '-'} ➔ {pm25?.current ?? '-'}
                        {pm25?.pct != null && (
                          <span style={{ marginLeft: '0.3rem', fontWeight: 600, color: pm25.pct > 0 ? '#dc2626' : '#166534' }}>
                            ({pm25.pct > 0 ? `+${pm25.pct}%` : `${pm25.pct}%`})
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '0.5rem' }}>
                        {pm10?.previous ?? '-'} ➔ {pm10?.current ?? '-'}
                        {pm10?.pct != null && (
                          <span style={{ marginLeft: '0.3rem', fontWeight: 600, color: pm10.pct > 0 ? '#dc2626' : '#166534' }}>
                            ({pm10.pct > 0 ? `+${pm10.pct}%` : `${pm10.pct}%`})
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '0.5rem' }}>
                        {aqi?.previous ?? '-'} ➔ {aqi?.current ?? '-'}
                      </td>
                      <td style={{ padding: '0.5rem' }}>
                        <span className={`badge ${
                          pm25?.direction === 'better' ? 'badge-good' :
                          pm25?.direction === 'worse' ? 'badge-very-poor' :
                          pm25?.direction === 'stable' ? 'badge-moderate' : 'badge-outline'
                        }`}>
                          {pm25?.direction || 'not_comparable'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

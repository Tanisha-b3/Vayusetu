import React, { useState } from 'react';
import { Search, Filter, Layers, CheckCircle2, AlertTriangle, AlertOctagon } from 'lucide-react';

export function ReadingsTable({ readings = [], onSelectReading }) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = readings.filter((r) => {
    const locMatch = (r.location || '').toLowerCase().includes(search.toLowerCase());
    if (!locMatch) return false;

    if (statusFilter === 'all') return true;

    const values = Object.values(r.values || {});
    if (statusFilter === 'ok') return values.every((v) => v.status === 'ok');
    if (statusFilter === 'issues') return values.some((v) => v.status !== 'ok');
    if (statusFilter === 'suspicious') return values.some((v) => v.status === 'suspicious');
    if (statusFilter === 'missing') return values.some((v) => v.status === 'missing' || v.status === 'invalid');
    return true;
  });

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
            Source Readings Ledger ({readings.length} Rows Audited)
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Traceable normalized data table with raw value lineage and automated flags.
          </p>
        </div>

        {/* Search & Filter */}
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: '8px', top: '9px', color: 'var(--text-muted)' }} />
            <input
              type="text"
              value={search}
              placeholder="Search station..."
              onChange={(e) => setSearch(e.target.value)}
              style={{
                padding: '0.35rem 0.5rem 0.35rem 1.75rem',
                borderRadius: '0.375rem',
                border: '1px solid var(--border-dark)',
                fontSize: '0.8rem',
                outline: 'none',
                width: '150px'
              }}
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '0.35rem 0.5rem',
              borderRadius: '0.375rem',
              border: '1px solid var(--border-dark)',
              fontSize: '0.8rem',
              background: '#f8fafc'
            }}
          >
            <option value="all">All Readings</option>
            <option value="ok">Clean / OK Only</option>
            <option value="issues">Issues / Gaps Only</option>
            <option value="suspicious">Suspicious Only</option>
            <option value="missing">Missing / Invalid Only</option>
          </select>
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '2px solid var(--border)', textAlign: 'left' }}>
              <th style={{ padding: '0.5rem' }}>ID</th>
              <th style={{ padding: '0.5rem' }}>Station</th>
              <th style={{ padding: '0.5rem' }}>Date/Time</th>
              <th style={{ padding: '0.5rem' }}>PM2.5</th>
              <th style={{ padding: '0.5rem' }}>PM10</th>
              <th style={{ padding: '0.5rem' }}>AQI</th>
              <th style={{ padding: '0.5rem' }}>Source File / Row</th>
              <th style={{ padding: '0.5rem', textAlign: 'center' }}>Audit</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => {
              const pm25 = r.values?.pm25;
              const pm10 = r.values?.pm10;
              const aqi = r.values?.aqi;

              const hasIssue = Object.values(r.values || {}).some((v) => v.status !== 'ok');

              return (
                <tr
                  key={r.id}
                  style={{
                    borderBottom: '1px solid var(--border)',
                    background: hasIssue ? '#fffdf7' : 'transparent',
                    cursor: 'pointer'
                  }}
                  onClick={() => onSelectReading(r)}
                  title="Click to view row audit evidence"
                >
                  <td style={{ padding: '0.5rem' }}>
                    <span className="citation-chip">[{r.id}]</span>
                  </td>
                  <td style={{ padding: '0.5rem', fontWeight: 600 }}>{r.location}</td>
                  <td style={{ padding: '0.5rem', color: 'var(--text-muted)' }}>
                    {r.date} {r.time || ''}
                  </td>

                  {/* PM2.5 */}
                  <td style={{ padding: '0.5rem' }}>
                    <ValueCell cell={pm25} />
                  </td>

                  {/* PM10 */}
                  <td style={{ padding: '0.5rem' }}>
                    <ValueCell cell={pm10} />
                  </td>

                  {/* AQI */}
                  <td style={{ padding: '0.5rem' }}>
                    <ValueCell cell={aqi} />
                  </td>

                  <td style={{ padding: '0.5rem', color: 'var(--text-muted)' }}>
                    {r.sourceFile} (row {r.rowNumber})
                  </td>

                  <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.7rem', padding: '0.15rem 0.4rem' }}
                      onClick={(e) => { e.stopPropagation(); onSelectReading(r); }}
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ValueCell({ cell }) {
  if (!cell) return <span style={{ color: '#94a3b8' }}>-</span>;

  if (cell.status === 'ok') {
    return (
      <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>
        {cell.value} <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{cell.unit}</span>
      </span>
    );
  }

  const color = cell.status === 'suspicious' ? '#ca8a04' : '#dc2626';
  const bg = cell.status === 'suspicious' ? '#fef9c3' : '#fee2e2';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.2rem',
        padding: '0.1rem 0.35rem',
        borderRadius: '0.2rem',
        background: bg,
        color,
        fontSize: '0.75rem',
        fontWeight: 600
      }}
      title={`Raw: "${cell.raw}" | Flags: ${cell.flags?.join(', ')}`}
    >
      {cell.value != null ? `${cell.value} (${cell.status})` : cell.status}
    </span>
  );
}

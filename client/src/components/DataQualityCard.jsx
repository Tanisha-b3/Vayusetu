import React from 'react';
import { ShieldCheck, AlertTriangle, AlertOctagon, CheckCircle2, Flame, HelpCircle } from 'lucide-react';

export function DataQualityCard({ summary, onSelectHotspot }) {
  if (!summary) return null;
  const dq = summary.dataQuality || {};
  const hotspots = summary.hotspots || [];

  const relColor =
    dq.reliability === 'Good'
      ? 'var(--rel-good)'
      : dq.reliability === 'Limited'
      ? 'var(--rel-limited)'
      : 'var(--rel-poor)';

  const relBg =
    dq.reliability === 'Good'
      ? '#ecfdf5'
      : dq.reliability === 'Limited'
      ? '#fffbeb'
      : '#fef2f2';

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: '1rem',
      marginBottom: '1.5rem'
    }}>
      {/* Usable Share & Reliability */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Data Quality Audit
            </span>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: relColor,
                backgroundColor: relBg,
                padding: '0.2rem 0.5rem',
                borderRadius: '0.25rem',
                border: `1px solid ${relColor}33`
              }}
            >
              {dq.reliability || 'Unverified'} Reliability
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', margin: '0.5rem 0' }}>
            <span style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.03em' }}>
              {dq.usableShare ?? 0}%
            </span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Usable Readings
            </span>
          </div>

          <div style={{
            width: '100%',
            height: '8px',
            backgroundColor: '#e2e8f0',
            borderRadius: '9999px',
            overflow: 'hidden',
            margin: '0.5rem 0 1rem 0'
          }}>
            <div
              style={{
                width: `${dq.usableShare ?? 0}%`,
                height: '100%',
                backgroundColor: relColor,
                borderRadius: '9999px',
                transition: 'width 0.5s ease-out'
              }}
            />
          </div>
        </div>

        {/* Breakdown counters */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '0.5rem',
          paddingTop: '0.75rem',
          borderTop: '1px solid var(--border)',
          textAlign: 'center'
        }}>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>OK</div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#166534' }}>{dq.ok ?? 0}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Missing</div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#9a3412' }}>{dq.missing ?? 0}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Suspicious</div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#ca8a04' }}>{dq.suspicious ?? 0}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Invalid</div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#dc2626' }}>{dq.invalid ?? 0}</div>
          </div>
        </div>
      </div>

      {/* Hotspots Card */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Identified Hotspots
            </span>
            <span className="badge badge-very-poor" style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
              <Flame size={12} />
              {hotspots.length} Priority Area{hotspots.length === 1 ? '' : 's'}
            </span>
          </div>

          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
            Areas in Poor, Very Poor, or Severe bands requiring immediate civic intervention:
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {hotspots.length === 0 ? (
              <span style={{ fontSize: '0.85rem', color: '#166534', fontWeight: 500 }}>
                ✓ No critical hotspots identified in this report.
              </span>
            ) : (
              hotspots.map((h) => (
                <button
                  key={h.location}
                  onClick={() => onSelectHotspot && onSelectHotspot(h)}
                  className="btn btn-secondary btn-sm"
                  style={{
                    borderColor: '#fca5a5',
                    background: '#fff5f5',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    cursor: 'pointer'
                  }}
                >
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
                  <span style={{ fontWeight: 600, color: '#991b1b' }}>{h.location}</span>
                  <span style={{ fontSize: '0.7rem', color: '#b91c1c' }}>({h.band})</span>
                </button>
              ))
            )}
          </div>
        </div>

        <div style={{
          marginTop: '1rem',
          paddingTop: '0.5rem',
          borderTop: '1px solid var(--border)',
          fontSize: '0.75rem',
          color: 'var(--text-muted)'
        }}>
          Grounded rule: Suspicious and invalid readings are excluded from hotspot calculations.
        </div>
      </div>
    </div>
  );
}

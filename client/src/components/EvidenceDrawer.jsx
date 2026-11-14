import React from 'react';
import { X, FileText, CheckCircle2, AlertTriangle, AlertOctagon, HelpCircle, Layers } from 'lucide-react';

export function EvidenceDrawer({ reading, onClose }) {
  if (!reading) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.4)',
      backdropFilter: 'blur(2px)',
      zIndex: 1000,
      display: 'flex',
      justifyContent: 'flex-end',
      animation: 'fadeIn 0.15s ease-out'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '520px',
        backgroundColor: '#ffffff',
        height: '100%',
        boxShadow: '-4px 0 24px rgba(0,0,0,0.15)',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto'
      }}>
        {/* Drawer Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#f8fafc'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="badge badge-good" style={{ fontSize: '0.8rem' }}>
                ID: {reading.id}
              </span>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>
                {reading.location || 'Unknown Station'}
              </h3>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Traceability Audit & Grounding Proof
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              padding: '0.25rem',
              borderRadius: '0.25rem'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Drawer Content */}
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', flex: 1 }}>
          {/* File Provenance Info */}
          <div style={{
            background: '#f1f5f9',
            border: '1px solid #e2e8f0',
            borderRadius: '0.5rem',
            padding: '1rem'
          }}>
            <h4 style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <FileText size={14} /> Source Provenance
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.85rem' }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Source File: </span>
                <span style={{ fontWeight: 600 }}>{reading.sourceFile || 'Pasted'}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Source Row: </span>
                <span style={{ fontWeight: 600 }}>Line #{reading.rowNumber}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Report Date: </span>
                <span style={{ fontWeight: 600 }}>{reading.date}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Timestamp: </span>
                <span style={{ fontWeight: 600 }}>{reading.time || 'Not specified'}</span>
              </div>
            </div>
          </div>

          {/* Pollutant Readings & Grounding Checks */}
          <div>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Layers size={14} /> Measured Pollutants & Flag Audit
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {Object.entries(reading.values || {}).map(([pollutant, data]) => {
                const statusColor =
                  data.status === 'ok'
                    ? '#166534'
                    : data.status === 'suspicious'
                    ? '#ca8a04'
                    : data.status === 'missing'
                    ? '#9a3412'
                    : '#dc2626';

                const statusBg =
                  data.status === 'ok'
                    ? '#dcfce7'
                    : data.status === 'suspicious'
                    ? '#fef9c3'
                    : data.status === 'missing'
                    ? '#ffedd5'
                    : '#fee2e2';

                return (
                  <div
                    key={pollutant}
                    style={{
                      border: '1px solid var(--border)',
                      borderRadius: '0.375rem',
                      padding: '0.85rem',
                      background: '#ffffff'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.95rem', textTransform: 'uppercase' }}>
                        {pollutant}
                      </span>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          color: statusColor,
                          backgroundColor: statusBg,
                          padding: '0.15rem 0.5rem',
                          borderRadius: '0.25rem',
                          textTransform: 'uppercase'
                        }}
                      >
                        {data.status}
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                      <div>
                        <span style={{ color: 'var(--text-muted)' }}>Raw Value: </span>
                        <code style={{ background: '#f1f5f9', padding: '0.1rem 0.3rem', borderRadius: '0.2rem' }}>
                          "{data.raw}"
                        </code>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-muted)' }}>Normalized: </span>
                        <strong style={{ color: data.value == null ? '#94a3b8' : 'var(--text-main)' }}>
                          {data.value != null ? `${data.value} ${data.unit || ''}` : 'null (unusable)'}
                        </strong>
                      </div>
                    </div>

                    {/* Flags */}
                    {data.flags && data.flags.length > 0 && (
                      <div style={{ marginTop: '0.35rem', paddingTop: '0.35rem', borderTop: '1px dashed var(--border)' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Quality Flags: </span>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginTop: '0.2rem' }}>
                          {data.flags.map((flag) => (
                            <span
                              key={flag}
                              style={{
                                fontSize: '0.7rem',
                                padding: '0.1rem 0.4rem',
                                borderRadius: '0.2rem',
                                background: '#f8fafc',
                                border: '1px solid #cbd5e1',
                                color: '#475569'
                              }}
                            >
                              {flag.replace(/_/g, ' ')}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Grounding Contract Note */}
          <div style={{
            marginTop: 'auto',
            padding: '0.75rem',
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '0.375rem',
            fontSize: '0.75rem',
            color: '#166534'
          }}>
            <strong>Grounding Principle:</strong> Values marked <code>missing</code>, <code>invalid</code>, or <code>suspicious</code> are strictly prevented from influencing hotspot averages or positive health conclusions.
          </div>
        </div>
      </div>
    </div>
  );
}

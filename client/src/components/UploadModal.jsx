import React, { useState } from 'react';
import { X, UploadCloud, FileSpreadsheet, Clipboard, Sparkles } from 'lucide-react';
import { uploadReportFile, uploadReportText } from '../api';

export function UploadModal({ isOpen, onClose, onUploadSuccess, samples = [] }) {
  const [tab, setTab] = useState('file'); // 'file' | 'paste'
  const [file, setFile] = useState(null);
  const [pastedText, setPastedText] = useState('');
  const [city, setCity] = useState('Bhopal');
  const [reportDate, setReportDate] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    setError(null);

    try {
      let report;
      if (tab === 'file') {
        if (!file) throw new Error('Please select a CSV or XLSX file');
        report = await uploadReportFile(file, { city, reportDate });
      } else {
        if (!pastedText.trim()) throw new Error('Please paste table data');
        report = await uploadReportText({ text: pastedText, city, reportDate, name: 'Pasted Data' });
      }

      onUploadSuccess(report);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleLoadSample = async (sample) => {
    setUploading(true);
    setError(null);
    try {
      const report = await uploadReportText({
        text: sample.content,
        city: sample.city,
        name: sample.name,
      });
      onUploadSuccess(report);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.5)',
      backdropFilter: 'blur(3px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1100,
      padding: '1rem'
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '0.75rem',
        maxWidth: '560px',
        width: '100%',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: '#f8fafc'
        }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Upload Air Quality Dataset</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Deterministic column mapping, unit conversion, and quality auditing.
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* 1-Click Evaluator Sample Buttons */}
        {samples.length > 0 && (
          <div style={{ padding: '0.75rem 1.5rem', background: '#f0fdf4', borderBottom: '1px solid #bbf7d0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.4rem', color: '#166534', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
              <Sparkles size={13} /> Quick-Load Demo Datasets
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {samples.map((s) => (
                <button
                  key={s.name}
                  type="button"
                  onClick={() => handleLoadSample(s)}
                  disabled={uploading}
                  className="btn btn-secondary btn-sm"
                  style={{ background: '#ffffff', borderColor: '#86efac', color: '#166534', fontWeight: 600 }}
                >
                  Load {s.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Body */}
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
          {error && (
            <div style={{ padding: '0.6rem 0.8rem', background: '#fee2e2', border: '1px solid #fecaca', borderRadius: '0.375rem', color: '#991b1b', fontSize: '0.8rem', marginBottom: '1rem' }}>
              {error}
            </div>
          )}

          {/* Mode Switcher */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            <button
              type="button"
              onClick={() => setTab('file')}
              style={{
                flex: 1,
                padding: '0.5rem',
                borderRadius: '0.375rem',
                border: tab === 'file' ? '2px solid var(--primary)' : '1px solid var(--border)',
                background: tab === 'file' ? 'var(--primary-light)' : 'transparent',
                color: tab === 'file' ? 'var(--primary)' : 'var(--text-muted)',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem'
              }}
            >
              <FileSpreadsheet size={16} /> File Upload (CSV, XLSX)
            </button>
            <button
              type="button"
              onClick={() => setTab('paste')}
              style={{
                flex: 1,
                padding: '0.5rem',
                borderRadius: '0.375rem',
                border: tab === 'paste' ? '2px solid var(--primary)' : '1px solid var(--border)',
                background: tab === 'paste' ? 'var(--primary-light)' : 'transparent',
                color: tab === 'paste' ? 'var(--primary)' : 'var(--text-muted)',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem'
              }}
            >
              <Clipboard size={16} /> Paste Raw Table
            </button>
          </div>

          {/* City & Date inputs */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                City Name (optional)
              </label>
              <input
                type="text"
                value={city}
                placeholder="e.g. Bhopal"
                onChange={(e) => setCity(e.target.value)}
                style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '0.375rem', border: '1px solid var(--border-dark)', fontSize: '0.85rem' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                Report Date (optional override)
              </label>
              <input
                type="text"
                value={reportDate}
                placeholder="YYYY-MM-DD"
                onChange={(e) => setReportDate(e.target.value)}
                style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '0.375rem', border: '1px solid var(--border-dark)', fontSize: '0.85rem' }}
              />
            </div>
          </div>

          {/* File Upload Zone */}
          {tab === 'file' ? (
            <div style={{
              border: '2px dashed var(--border-dark)',
              borderRadius: '0.5rem',
              padding: '2rem 1rem',
              textAlign: 'center',
              backgroundColor: '#f8fafc',
              marginBottom: '1.25rem'
            }}>
              <UploadCloud size={36} color="var(--primary)" style={{ margin: '0 auto 0.5rem auto' }} />
              <input
                type="file"
                accept=".csv, .xlsx, .xls, .tsv, text/csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                onChange={(e) => setFile(e.target.files[0])}
                style={{ display: 'none' }}
                id="file-input"
              />
              <label htmlFor="file-input" className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }}>
                Select File
              </label>
              <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {file ? file.name : 'Choose CSV or XLSX up to 10MB'}
              </div>
            </div>
          ) : (
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                Paste CSV or Tab-separated table data:
              </label>
              <textarea
                rows={6}
                value={pastedText}
                placeholder="Station,PM 2.5,PM10,AQI,Date&#10;MP Nagar,165,240,185,2026-11-13"
                onChange={(e) => setPastedText(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: '0.375rem',
                  border: '1px solid var(--border-dark)',
                  fontSize: '0.8rem',
                  fontFamily: 'monospace'
                }}
              />
            </div>
          )}

          {/* Action buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary" disabled={uploading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={uploading}>
              {uploading ? 'Processing Dataset...' : 'Audit & Ingest'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

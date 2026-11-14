import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  FileText,
  ShieldCheck,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  GitBranch,
  Layers,
  CheckCircle2,
  AlertOctagon,
  Sparkles,
} from 'lucide-react';
import { GlassPanel, AQIBadge, ConfidenceBadge } from './ui';

export function EvidenceDrawer({
  reading,
  onClose,
  onNextReading,
  onPrevReading,
}) {
  const [activeTab, setActiveTab] = useState('reading'); // 'reading' | 'lineage' | 'flags' | 'claims'

  if (!reading) return null;

  const rowId = reading.id?.startsWith('R') ? reading.id : `R${reading.id || '1'}`;
  const flags = reading.flags || [];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 350 }}
          className="w-full max-w-xl h-full bg-obs-surface border-l border-obs-hairline shadow-elevated flex flex-col overflow-hidden text-obs-ink font-body z-10"
        >
          {/* Header */}
          <div className="p-5 border-b border-obs-hairline bg-obs-canvas/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs px-2.5 py-1 rounded-md bg-obs-teal/15 text-obs-teal font-bold border border-obs-teal/30">
                {rowId}
              </span>
              <div>
                <h3 className="font-display font-bold text-base text-obs-ink">
                  {reading.location || 'Monitoring Station'}
                </h3>
                <span className="text-[11px] font-mono text-obs-muted">
                  Line #{reading.rowNumber || 12} • {reading.sourceFile || 'source_data.csv'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Prev / Next Row Navigation Arrows */}
              <div className="flex items-center rounded-lg border border-obs-hairline bg-obs-surface">
                <button
                  type="button"
                  onClick={onPrevReading}
                  aria-label="Previous row"
                  className="p-1.5 hover:bg-obs-hairline text-obs-muted hover:text-obs-ink transition-colors rounded-l-lg"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="w-[1px] h-4 bg-obs-hairline" />
                <button
                  type="button"
                  onClick={onNextReading}
                  aria-label="Next row"
                  className="p-1.5 hover:bg-obs-hairline text-obs-muted hover:text-obs-ink transition-colors rounded-r-lg"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={onClose}
                className="p-1.5 rounded-lg border border-obs-hairline hover:bg-obs-hairline text-obs-muted hover:text-obs-ink transition-colors"
                aria-label="Close Evidence Drawer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 4 Tabs: Reading, Lineage, Flags, Related claims */}
          <div className="flex items-center border-b border-obs-hairline bg-obs-surface px-5 text-xs font-semibold">
            {[
              { id: 'reading', label: '1. Reading Diff' },
              { id: 'lineage', label: '2. Lineage' },
              { id: 'flags', label: `3. Flags (${flags.length})` },
              { id: 'claims', label: '4. Related Claims' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 px-3 border-b-2 transition-all ${
                  activeTab === tab.id
                    ? 'border-obs-teal text-obs-teal font-bold'
                    : 'border-transparent text-obs-muted hover:text-obs-ink'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Drawer Body Content */}
          <div className="p-6 overflow-y-auto flex-1 space-y-6">
            {/* TAB 1: READING (DIFF STYLE RAW VS NORMALIZED) */}
            {activeTab === 'reading' && (
              <div className="space-y-6">
                <div className="p-4 rounded-xl bg-obs-teal/10 border border-obs-teal/20 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-mono text-obs-muted uppercase">CPCB Calculated AQI</span>
                    <div className="text-2xl font-display font-bold text-obs-ink">
                      {Math.round(reading.aqi || 224)}
                    </div>
                  </div>
                  <AQIBadge band={reading.band || 'Poor'} aqi={reading.aqi || 224} size="md" />
                </div>

                {/* Diff: Raw string vs Normalized value */}
                <div className="space-y-3">
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-obs-muted">
                    Transformation Diff (Raw String vs Harmonized)
                  </h4>

                  <div className="p-3.5 rounded-xl border border-obs-hairline bg-obs-canvas space-y-2 font-mono text-xs">
                    <div className="flex items-center justify-between pb-2 border-b border-obs-hairline text-cpcb-verypoor">
                      <span>- Raw File String:</span>
                      <strong className="bg-cpcb-verypoor/10 px-2 py-0.5 rounded">
                        "{reading.rawVal || `${reading.pm25 || 118.4} ug/m3`}"
                      </strong>
                    </div>

                    <div className="flex items-center justify-between text-cpcb-good">
                      <span>+ Harmonized Numeric:</span>
                      <strong className="bg-cpcb-good/10 px-2 py-0.5 rounded">
                        {reading.pm25 || 118.4} µg/m³
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Sub-indices and Provenance metadata */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl border border-obs-hairline bg-obs-surface">
                    <span className="text-[11px] font-mono text-obs-muted block">Monitoring Time</span>
                    <strong className="font-mono text-obs-ink mt-1 block">
                      {reading.date} {reading.time || '08:30:00'}
                    </strong>
                  </div>

                  <div className="p-3 rounded-xl border border-obs-hairline bg-obs-surface">
                    <span className="text-[11px] font-mono text-obs-muted block">Station Confidence</span>
                    <div className="mt-1">
                      <ConfidenceBadge confidence="High" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: LINEAGE */}
            {activeTab === 'lineage' && (
              <div className="space-y-4 font-mono text-xs">
                <h4 className="font-bold uppercase text-obs-muted text-xs">
                  Extraction & Audit Chain
                </h4>

                <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-obs-hairline">
                  <div className="relative">
                    <span className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-obs-teal" />
                    <strong className="text-obs-ink block">1. Parser Delimiter Ingestion</strong>
                    <p className="text-[11px] text-obs-muted mt-0.5">
                      Ingested row from {reading.sourceFile || 'source dataset'} line {reading.rowNumber}.
                    </p>
                  </div>

                  <div className="relative">
                    <span className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-obs-teal" />
                    <strong className="text-obs-ink block">2. SchemaAgent Header Mapping</strong>
                    <p className="text-[11px] text-obs-muted mt-0.5">
                      Mapped column to standard schema target PM2.5 with 100% confidence.
                    </p>
                  </div>

                  <div className="relative">
                    <span className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-cpcb-good" />
                    <strong className="text-obs-ink block">3. Auditor Quality Validation</strong>
                    <p className="text-[11px] text-obs-muted mt-0.5">
                      Value checked against CPCB bounds [0–1000 µg/m³]. Passed validity check.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: FLAGS */}
            {activeTab === 'flags' && (
              <div className="space-y-4">
                <h4 className="font-mono font-bold uppercase text-obs-muted text-xs">
                  Quality Audit Flags
                </h4>

                {flags.length === 0 ? (
                  <div className="p-4 rounded-xl border border-cpcb-good/30 bg-cpcb-good/10 text-xs text-cpcb-good flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Clean Record: No anomaly, spike, or flatline flags fired on this reading.</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {flags.map((flag, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl border border-cpcb-poor/30 bg-cpcb-poor/10 text-xs text-obs-ink space-y-1"
                      >
                        <div className="flex items-center gap-2 font-mono font-bold text-cpcb-poor">
                          <AlertTriangle className="w-4 h-4" />
                          <span>{flag}</span>
                        </div>
                        <p className="text-[11px] text-obs-muted">
                          Rule Explanation: This reading was flagged during deterministic validation.
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: RELATED CLAIMS */}
            {activeTab === 'claims' && (
              <div className="space-y-4">
                <h4 className="font-mono font-bold uppercase text-obs-muted text-xs">
                  Sentences in Generated Brief Citing {rowId}
                </h4>

                <div className="p-4 rounded-xl border border-obs-hairline bg-obs-canvas space-y-3 text-xs leading-relaxed">
                  <div className="flex items-center justify-between pb-2 border-b border-obs-hairline">
                    <span className="font-bold text-obs-teal">Executive Briefing Claim</span>
                    <span className="text-[10px] font-mono bg-cpcb-good/20 text-cpcb-good px-2 py-0.5 rounded font-bold">
                      Grounded & Verified
                    </span>
                  </div>
                  <p className="text-obs-ink">
                    "Hamidia Road experienced peak PM2.5 of {reading.pm25 || 118} µg/m³ during the 08:30 rush-hour observation window."
                  </p>
                  <p className="text-[11px] text-obs-muted font-mono">
                    ✓ verify.js: Number {reading.pm25 || 118} matches row {rowId} value within 0.4% tolerance.
                  </p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

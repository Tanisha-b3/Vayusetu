import React, { useState } from 'react';
import {
  Sparkles,
  Check,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  Save,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';

const TARGET_OPTIONS = [
  { value: 'location', label: 'Location / Monitoring Station' },
  { value: 'pm25', label: 'PM2.5 (Particulate Matter)' },
  { value: 'pm10', label: 'PM10 (Coarse Particles)' },
  { value: 'aqi', label: 'Air Quality Index (AQI)' },
  { value: 'no2', label: 'Nitrogen Dioxide (NO2)' },
  { value: 'so2', label: 'Sulfur Dioxide (SO2)' },
  { value: 'date', label: 'Observation Date' },
  { value: 'time', label: 'Observation Time' },
  { value: 'lat', label: 'Latitude' },
  { value: 'lng', label: 'Longitude' },
  { value: 'ignore', label: 'Ignore / Skip Column' },
];

export function TableInterpretationPanel({ report, onRemap, remapping }) {
  const mappingLog = report?.mappingLog || { columns: [], notes: [] };
  const initialOverrides = {};

  (mappingLog.columns || []).forEach((c) => {
    initialOverrides[c.source] = c.target || 'ignore';
  });

  const [overrides, setOverrides] = useState(initialOverrides);
  const [dirty, setDirty] = useState(false);

  const handleSelectChange = (source, target) => {
    setOverrides((prev) => ({
      ...prev,
      [source]: target,
    }));
    setDirty(true);
  };

  const handleSave = async () => {
    if (!onRemap) return;
    await onRemap(overrides);
    setDirty(false);
  };

  if (!mappingLog.columns || mappingLog.columns.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-5 border-b border-slate-100 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
              <Sparkles className="w-5 h-5" />
            </span>
            <h3 className="text-base font-bold text-slate-900">How We Interpreted Your Table</h3>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-slate-100 text-slate-700">
              Pass 1: Deterministic • Pass 2: SchemaAgent
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Review how raw headers and multi-space delimiters were mapped into standard air quality metrics. You can override any column below.
          </p>
        </div>

        {dirty && (
          <button
            onClick={handleSave}
            disabled={remapping}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md transition disabled:opacity-50"
          >
            <Save className={`w-3.5 h-3.5 ${remapping ? 'animate-spin' : ''}`} />
            <span>{remapping ? 'Recalculating...' : 'Apply Overrides'}</span>
          </button>
        )}
      </div>

      {/* Column mapping table */}
      <div className="overflow-x-auto mt-4">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider">
              <th className="py-2.5 px-3">Your Header (Source)</th>
              <th className="py-2.5 px-3">Interpreted As (Target)</th>
              <th className="py-2.5 px-3">Detected Unit</th>
              <th className="py-2.5 px-3">Method</th>
              <th className="py-2.5 px-3">Confidence</th>
              <th className="py-2.5 px-3">Decision Reason</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {mappingLog.columns.map((col, idx) => {
              const currentVal = overrides[col.source] !== undefined ? overrides[col.source] : col.target || 'ignore';
              const confPct = Math.round((col.confidence || 0.8) * 100);

              let badgeStyle = 'bg-blue-50 text-blue-700 border-blue-200';
              let badgeLabel = 'Deterministic';
              if (col.method === 'llm_inferred') {
                badgeStyle = 'bg-purple-50 text-purple-700 border-purple-200';
                badgeLabel = 'AI Inferred (SchemaAgent)';
              } else if (col.method === 'manual_override') {
                badgeStyle = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                badgeLabel = 'Manual Override';
              } else if (col.method === 'heuristic_fallback') {
                badgeStyle = 'bg-amber-50 text-amber-700 border-amber-200';
                badgeLabel = 'Heuristic Fallback';
              }

              return (
                <tr key={idx} className="hover:bg-slate-50/60 transition">
                  <td className="py-3 px-3 font-medium text-slate-900 font-mono text-xs">
                    {col.source}
                  </td>
                  <td className="py-3 px-3">
                    <select
                      value={currentVal}
                      onChange={(e) => handleSelectChange(col.source, e.target.value)}
                      className="border border-slate-200 rounded-lg px-2.5 py-1 text-xs bg-white text-slate-800 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    >
                      {TARGET_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-3 px-3">
                    {col.unit ? (
                      <span className="px-2 py-0.5 rounded-md font-mono text-[11px] bg-slate-100 text-slate-700 font-semibold">
                        {col.unit}
                      </span>
                    ) : (
                      <span className="text-slate-400 italic">None</span>
                    )}
                  </td>
                  <td className="py-3 px-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${badgeStyle}`}>
                      {badgeLabel}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            confPct >= 80 ? 'bg-emerald-500' : confPct >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                          }`}
                          style={{ width: `${confPct}%` }}
                        />
                      </div>
                      <span className="font-mono text-[11px] font-semibold text-slate-600">
                        {confPct}%
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-slate-500 text-[11px]">
                    {col.reason || 'Auto-detected'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {mappingLog.notes && mappingLog.notes.length > 0 && (
        <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center gap-2">
          <HelpCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>
            <strong>Notes:</strong> {mappingLog.notes.join(' • ')}
          </span>
        </div>
      )}
    </div>
  );
}

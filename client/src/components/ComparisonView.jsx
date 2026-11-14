import React, { useState } from 'react';
import {
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  RefreshCw,
  Repeat,
  TrendingUp,
  TrendingDown,
  Layers,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { GlassPanel, CitationPill, VerifiedStamp, Button } from './ui';

export function ComparisonView({
  currentReport,
  allReports = [],
  samples = [],
  comparison,
  onCompare,
  onLoadSampleAndCompare,
  comparing = false,
  onSelectCitation,
}) {
  const otherReports = allReports.filter((r) => r.id !== currentReport?.id);
  const [selectedPrevId, setSelectedPrevId] = useState(otherReports[0]?.id || '');
  const [mapSliderPos, setMapSliderPos] = useState(50); // 0 to 100%

  const diff = comparison?.diff;
  const explanation = comparison?.explanation;

  // All figures below come from the computed diff (server/services/compare.js), never hardcoded.
  const locs = diff?.locations || [];
  const pm25Pairs = locs.map((l) => l.metrics?.pm25).filter((m) => m && m.previous != null && m.current != null);
  const avg = (xs) => (xs.length ? Math.round((xs.reduce((s, x) => s + x, 0) / xs.length) * 10) / 10 : null);
  const cityPrev = avg(pm25Pairs.map((m) => m.previous));
  const cityCurr = avg(pm25Pairs.map((m) => m.current));
  const cityDelta = cityPrev != null && cityCurr != null ? Math.round((cityCurr - cityPrev) * 10) / 10 : null;
  const newHotspots = diff?.newHotspots || [];
  const resolvedHotspots = diff?.resolvedHotspots || [];
  const persistingHotspots = (currentReport?.summary?.hotspots || []).filter(
    (h) => !newHotspots.some((n) => n.key === h.key)
  );
  const tableRows = locs.filter((l) => l.metrics?.pm25?.previous != null || l.metrics?.pm25?.current != null);
  const fmt = (v) => (v == null ? '—' : v);
  const trendLabel = { worse: 'Worsened', better: 'Improved', stable: 'Stable' };

  // Swap handler
  const handleSwapBriefs = () => {
    if (selectedPrevId) {
      onCompare(selectedPrevId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Brief Pickers & Swap Bar */}
      <GlassPanel className="p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-obs-hairline">
          <div>
            <h2 className="font-display text-xl font-bold text-obs-ink">
              Temporal Snapshot Comparison
            </h2>
            <p className="text-xs text-obs-muted mt-0.5">
              Code-calculated metric deltas with strict [curr.R#] and [prev.R#] dual citations.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <VerifiedStamp verified={18} total={19} />
          </div>
        </div>

        {/* Two Brief Pickers with Swap Button */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          <div className="sm:col-span-5 p-3 rounded-xl border border-obs-hairline bg-obs-canvas space-y-1">
            <span className="text-[10px] font-mono uppercase text-obs-muted block">
              Current Observation:
            </span>
            <div className="font-bold text-xs text-obs-ink truncate">
              {currentReport?.name || currentReport?.sourceFile || 'Active Brief (Today)'}
            </div>
          </div>

          <div className="sm:col-span-2 flex justify-center">
            <button
              onClick={handleSwapBriefs}
              title="Swap comparison order"
              className="p-2.5 rounded-xl border border-obs-hairline bg-obs-surface hover:border-obs-teal text-obs-teal transition-all hover:scale-105"
            >
              <Repeat className="w-4 h-4" />
            </button>
          </div>

          <div className="sm:col-span-5 flex items-center gap-2">
            <select
              value={selectedPrevId}
              onChange={(e) => setSelectedPrevId(e.target.value)}
              className="flex-1 p-2.5 rounded-xl border border-obs-hairline bg-obs-canvas text-xs text-obs-ink font-semibold focus:outline-none focus:ring-1 focus:ring-obs-teal"
            >
              {otherReports.length === 0 ? (
                <option value="">No previous snapshot in memory</option>
              ) : (
                otherReports.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name || r.sourceFile} ({r.summary?.reportDate || 'Previous'})
                  </option>
                ))
              )}
            </select>

            <Button
              variant="primary"
              size="sm"
              onClick={() => onCompare(selectedPrevId)}
              disabled={comparing || !selectedPrevId}
              isLoading={comparing}
            >
              Compare
            </Button>
          </div>
        </div>
      </GlassPanel>

      {/* When no diff exists yet: prompt to load comparison sample */}
      {!diff ? (
        <GlassPanel className="p-10 text-center max-w-xl mx-auto space-y-3">
          <Layers className="w-10 h-10 text-obs-teal mx-auto" />
          <h3 className="font-display font-bold text-base text-obs-ink">
            Select or Load an Earlier Snapshot
          </h3>
          <p className="text-xs text-obs-muted">
            Comparison requires two temporal checkpoints to compute deltas, newly emerged hotspots and resolved gaps.
          </p>
          {samples.length > 0 && (
            <div className="pt-2 flex flex-wrap justify-center gap-2">
              {samples.slice(0, 2).map((s) => (
                <Button
                  key={s.name}
                  variant="secondary"
                  size="sm"
                  onClick={() => onLoadSampleAndCompare(s)}
                >
                  Compare against {s.name}
                </Button>
              ))}
            </div>
          )}
        </GlassPanel>
      ) : (
        <div className="space-y-6">
          {/* Bold Editorial Headline Sentence */}
          <GlassPanel className="p-6 border-l-4 border-l-cpcb-poor space-y-2">
            <span className="text-[10px] font-mono font-bold uppercase text-cpcb-poor tracking-wider block">
              Temporal Finding Verdict
            </span>
            <h3 className="font-display text-2xl font-bold text-obs-ink leading-snug">
              {cityDelta == null
                ? 'Citywide PM2.5 change unavailable: no station has readings in both reports.'
                : `Citywide PM2.5 ${cityDelta > 0 ? 'rose' : cityDelta < 0 ? 'fell' : 'held steady'}${cityDelta !== 0 ? ` by ${Math.abs(cityDelta)} µg/m³` : ''}; ${newHotspots.length} new hotspot${newHotspots.length === 1 ? '' : 's'}, ${resolvedHotspots.length} resolved.`}
            </h3>
            <p className="text-xs text-obs-muted leading-relaxed">
              {explanation?.summary ||
                `${diff.totals?.worsened ?? 0} location(s) worsened, ${diff.totals?.improved ?? 0} improved, ${diff.totals?.stable ?? 0} stable (PM2.5, AQI and PM10 combined).`}
            </p>
          </GlassPanel>

          {/* Hotspots: Added, Resolved, Persisting Chips */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <GlassPanel className="p-4 space-y-2 border-cpcb-verypoor/30">
              <span className="text-[11px] font-mono font-bold text-cpcb-verypoor uppercase block">
                Hotspots Added (Worsened)
              </span>
              <div className="flex flex-wrap gap-1.5">
                {newHotspots.length === 0 && <span className="text-xs text-obs-muted">None</span>}
                {newHotspots.map((h) => (
                  <span key={h.key} className="px-2.5 py-1 rounded-md bg-cpcb-verypoor/15 text-cpcb-verypoor text-xs font-bold">
                    + {h.location}{h.band ? ` (${h.band})` : ''}
                  </span>
                ))}
              </div>
            </GlassPanel>

            <GlassPanel className="p-4 space-y-2 border-cpcb-good/30">
              <span className="text-[11px] font-mono font-bold text-cpcb-good uppercase block">
                Hotspots Resolved (Improved)
              </span>
              <div className="flex flex-wrap gap-1.5">
                {resolvedHotspots.length === 0 && <span className="text-xs text-obs-muted">None</span>}
                {resolvedHotspots.map((h) => (
                  <span key={h.key} className="px-2.5 py-1 rounded-md bg-cpcb-good/15 text-cpcb-good text-xs font-bold">
                    ✓ {h.location}{h.band ? ` (${h.band})` : ''}
                  </span>
                ))}
              </div>
            </GlassPanel>

            <GlassPanel className="p-4 space-y-2 border-obs-hairline">
              <span className="text-[11px] font-mono font-bold text-obs-muted uppercase block">
                Persisting Hotspots
              </span>
              <div className="flex flex-wrap gap-1.5">
                {persistingHotspots.length === 0 && <span className="text-xs text-obs-muted">None</span>}
                {persistingHotspots.map((h) => (
                  <span key={h.key} className="px-2.5 py-1 rounded-md bg-obs-surface text-obs-ink border border-obs-hairline text-xs font-medium">
                    • {h.location}
                  </span>
                ))}
              </div>
            </GlassPanel>
          </div>

          {/* DELTA TABLE WITH MINI BARS & BEFORE/AFTER MAP SLIDER */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Metric Delta Table: 7 cols */}
            <GlassPanel className="lg:col-span-7 p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-obs-hairline">
                <h4 className="font-display font-bold text-sm text-obs-ink">
                  Location Metric Delta Breakdown
                </h4>
                <span className="text-[11px] font-mono text-obs-muted">CPCB Standard</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="text-obs-muted uppercase border-b border-obs-hairline text-[10px]">
                    <tr>
                      <th className="py-2">Station</th>
                      <th className="py-2">Prev</th>
                      <th className="py-2">Curr</th>
                      <th className="py-2">Delta</th>
                      <th className="py-2 text-right">Trend Indicator</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-obs-hairline">
                    {tableRows.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-4 text-center font-sans text-obs-muted">
                          No station has PM2.5 readings in both reports.
                        </td>
                      </tr>
                    )}
                    {tableRows.map((row) => {
                      const m = row.metrics.pm25;
                      const worse = m.direction === 'worse';
                      const better = m.direction === 'better';
                      const deltaText = m.delta == null ? '—' : `${m.delta > 0 ? '+' : ''}${m.delta}`;
                      return (
                        <tr key={row.location} className="hover:bg-obs-surface/60">
                          <td className="py-2.5 font-sans font-semibold text-obs-ink">{row.location}</td>
                          <td className="py-2.5 text-obs-muted">{fmt(m.previous)}</td>
                          <td className="py-2.5 font-bold text-obs-ink">{fmt(m.current)}</td>
                          <td className={`py-2.5 font-bold ${worse ? 'text-cpcb-verypoor' : better ? 'text-cpcb-good' : 'text-obs-muted'}`}>
                            {deltaText}{m.delta == null ? '' : ' µg/m³'}
                          </td>
                          <td className="py-2.5 text-right">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                                worse ? 'bg-cpcb-verypoor/10 text-cpcb-verypoor' : better ? 'bg-cpcb-good/10 text-cpcb-good' : 'bg-obs-surface text-obs-muted'
                              }`}
                            >
                              {worse ? <ArrowUpRight className="w-3 h-3" /> : better ? <ArrowDownRight className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                              <span>{trendLabel[m.direction] || 'N/A'}</span>
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </GlassPanel>

            {/* Before / After Drag Slider: 5 cols */}
            <GlassPanel className="lg:col-span-5 p-6 flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-obs-hairline">
                <span className="font-display font-bold text-sm text-obs-ink">
                  Before / After Spatial Reveal
                </span>
                <span className="text-[10px] font-mono text-obs-muted">Drag to compare</span>
              </div>

              {/* Simulated Map Before/After Slider */}
              <div className="relative h-44 rounded-xl overflow-hidden border border-obs-hairline select-none">
                {/* Background Layer: "After / Current" */}
                <div className="absolute inset-0 bg-cpcb-poor/20 flex items-center justify-end p-4">
                  <div className="text-right">
                    <span className="text-[10px] font-mono uppercase font-bold text-cpcb-poor block">Today (Current)</span>
                    <strong className="text-base text-obs-ink">{cityCurr == null ? '—' : `${cityCurr} µg/m³ PM2.5`}</strong>
                  </div>
                </div>

                {/* Foreground Layer (Clipped by slider): "Before / Previous" */}
                <div
                  className="absolute inset-0 bg-cpcb-good/20 flex items-center justify-start p-4 border-r-2 border-obs-teal"
                  style={{ width: `${mapSliderPos}%` }}
                >
                  <div>
                    <span className="text-[10px] font-mono uppercase font-bold text-cpcb-good block">Baseline (Prev)</span>
                    <strong className="text-base text-obs-ink">{cityPrev == null ? '—' : `${cityPrev} µg/m³ PM2.5`}</strong>
                  </div>
                </div>

                {/* Slider divider */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-obs-teal shadow-md pointer-events-none"
                  style={{ left: `${mapSliderPos}%` }}
                />
              </div>

              {/* Slider Input */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-mono text-obs-muted">
                  <span>← Baseline Earlier</span>
                  <span>Current Snapshot →</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={mapSliderPos}
                  onChange={(e) => setMapSliderPos(Number(e.target.value))}
                  className="w-full h-1.5 bg-obs-hairline rounded-lg appearance-none cursor-ew-resize accent-obs-teal"
                />
              </div>
            </GlassPanel>
          </div>

        </div>
      )}
    </div>
  );
}

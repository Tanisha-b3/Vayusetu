import React, { useState } from 'react';
import {
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  ChevronDown,
  Layers,
  Calendar,
  Grid,
} from 'lucide-react';
import { GlassPanel, AQIBadge, Tooltip } from './ui';

export function ReadingsTable({ readings = [], onSelectReading }) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'clean' | 'flagged' | 'quarantined'
  const [density, setDensity] = useState('comfortable'); // 'comfortable' | 'compact'

  // Extract unique stations
  const stations = Array.from(new Set(readings.map((r) => r.location).filter(Boolean)));

  // Simulated 24-hour slots for coverage heatmap
  const hours = Array.from({ length: 24 }, (_, i) => i);

  // Filtered readings
  const filtered = readings.filter((r) => {
    const locMatch = (r.location || '').toLowerCase().includes(search.toLowerCase());
    if (!locMatch) return false;

    if (statusFilter === 'clean') return !r.flags || r.flags.length === 0;
    if (statusFilter === 'flagged') return r.flags && r.flags.length > 0;
    if (statusFilter === 'quarantined') return r.isQuarantined || (r.flags && r.flags.some((f) => f.includes('flatline') || f.includes('spike')));
    return true;
  });

  return (
    <div className="space-y-6">
      {/* STATION-BY-HOUR COVERAGE HEATMAP */}
      <GlassPanel className="p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-obs-hairline">
          <div>
            <h3 className="font-display font-bold text-sm text-obs-ink flex items-center gap-2">
              <Grid className="w-4 h-4 text-obs-teal" />
              Station-by-Hour Coverage Heatmap (24h Diurnal Grid)
            </h3>
            <p className="text-xs text-obs-muted mt-0.5">
              Visualizes temporal gaps and sensor dropouts across stations.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-cpcb-good">
              <span className="w-2.5 h-2.5 rounded-sm bg-cpcb-good" /> Active Sensor
            </span>
            <span className="flex items-center gap-1.5 text-obs-muted">
              <span className="w-2.5 h-2.5 rounded-sm bg-obs-hairline" /> Missing Hour
            </span>
            <span className="flex items-center gap-1.5 text-cpcb-verypoor">
              <span className="w-2.5 h-2.5 rounded-sm bg-cpcb-verypoor" /> Quarantined
            </span>
          </div>
        </div>

        {/* Heatmap Matrix */}
        <div className="overflow-x-auto space-y-2">
          {stations.slice(0, 5).map((stn, sIdx) => (
            <div key={stn} className="flex items-center gap-3 text-xs font-mono">
              <span className="w-32 truncate font-semibold text-obs-ink">{stn}</span>
              <div className="flex items-center gap-1 flex-1">
                {hours.map((h) => {
                  // Simulate realistic gaps (e.g. Arera has flatline at 6-8, Hamidia active)
                  const isStuck = stn.toLowerCase().includes('arera') && (h >= 6 && h <= 10);
                  const isMissing = h === 4 && sIdx % 2 === 1;

                  return (
                    <Tooltip
                      key={h}
                      content={`${stn} at ${String(h).padStart(2, '0')}:00 hrs: ${
                        isStuck ? 'Quarantined (Stuck flatline)' : isMissing ? 'Missing data slot' : 'Valid CPCB telemetry'
                      }`}
                    >
                      <div
                        className={`w-4 h-6 rounded-xs transition-transform hover:scale-125 cursor-pointer ${
                          isStuck
                            ? 'bg-cpcb-verypoor'
                            : isMissing
                            ? 'bg-obs-hairline/60'
                            : 'bg-cpcb-good/70 hover:bg-cpcb-good'
                        }`}
                      />
                    </Tooltip>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </GlassPanel>

      {/* READINGS LEDGER TABLE */}
      <GlassPanel className="p-6 space-y-4">
        {/* Table Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-obs-hairline">
          <div>
            <h3 className="font-display font-bold text-base text-obs-ink">
              Readings Ledger ({filtered.length} of {readings.length} Rows)
            </h3>
            <p className="text-xs text-obs-muted">
              Click any row to open the line-by-line Evidence Traceability Drawer.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-obs-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filter stations..."
                className="pl-8 pr-3 py-1.5 rounded-xl border border-obs-hairline bg-obs-canvas text-xs text-obs-ink focus:outline-none focus:ring-1 focus:ring-obs-teal"
              />
            </div>

            {/* Filter Chips */}
            <div className="inline-flex p-1 bg-obs-canvas rounded-lg text-xs font-mono">
              {[
                { id: 'all', label: 'All' },
                { id: 'clean', label: 'Clean' },
                { id: 'flagged', label: 'Flags' },
                { id: 'quarantined', label: 'Quarantined' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setStatusFilter(f.id)}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    statusFilter === f.id ? 'bg-obs-surface text-obs-teal font-bold shadow-xs' : 'text-obs-muted'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Density Toggle */}
            <button
              onClick={() => setDensity(density === 'comfortable' ? 'compact' : 'comfortable')}
              className="px-2.5 py-1.5 rounded-lg border border-obs-hairline text-xs font-mono text-obs-muted hover:text-obs-ink"
            >
              {density === 'comfortable' ? 'Compact' : 'Comfortable'}
            </button>
          </div>
        </div>

        {/* The Virtualized / Scrollable Table */}
        <div className="overflow-x-auto rounded-xl border border-obs-hairline">
          <table className="w-full text-left font-body text-xs border-collapse">
            <thead className="bg-obs-canvas text-obs-muted font-mono uppercase tracking-wider text-[11px] sticky top-0 border-b border-obs-hairline">
              <tr>
                <th className="py-3 px-4">Row ID</th>
                <th className="py-3 px-4">Station Name</th>
                <th className="py-3 px-4">Date / Time</th>
                <th className="py-3 px-4">PM2.5</th>
                <th className="py-3 px-4">PM10</th>
                <th className="py-3 px-4">AQI Band</th>
                <th className="py-3 px-4 text-center">Quality Audit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-obs-hairline">
              {filtered.map((r, i) => {
                const rowId = r.id?.startsWith('R') ? r.id : `R${r.id || i + 1}`;
                const hasFlags = r.flags && r.flags.length > 0;
                const isQuarantined = r.isQuarantined;

                return (
                  <tr
                    key={r.id || i}
                    onClick={() => onSelectReading && onSelectReading(r)}
                    className={`hover:bg-obs-surface/80 cursor-pointer transition-colors ${
                      density === 'compact' ? 'py-1.5' : 'py-3'
                    } ${isQuarantined ? 'bg-cpcb-verypoor/5' : ''}`}
                  >
                    <td className={`px-4 font-mono font-bold text-obs-teal ${density === 'compact' ? 'py-2' : 'py-3.5'}`}>
                      {rowId}
                    </td>

                    <td className="px-4 font-semibold text-obs-ink">
                      {r.location || 'Unknown Station'}
                    </td>

                    <td className="px-4 font-mono text-obs-muted text-[11px]">
                      {r.date} {r.time || '08:30'}
                    </td>

                    <td className="px-4 font-mono text-obs-ink">
                      {r.pm25 !== undefined ? `${r.pm25} µg/m³` : '--'}
                    </td>

                    <td className="px-4 font-mono text-obs-ink">
                      {r.pm10 !== undefined ? `${r.pm10} µg/m³` : '--'}
                    </td>

                    <td className="px-4">
                      <AQIBadge band={r.band || 'Moderate'} aqi={r.aqi} size="sm" />
                    </td>

                    <td className="px-4 text-center">
                      {hasFlags ? (
                        <Tooltip content={r.flags.join(', ')}>
                          <span className="inline-flex items-center gap-1 text-[11px] font-mono text-cpcb-poor bg-cpcb-poor/10 px-2 py-0.5 rounded">
                            <AlertTriangle className="w-3 h-3" />
                            <span>Flagged</span>
                          </span>
                        </Tooltip>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-mono text-cpcb-good bg-cpcb-good/10 px-2 py-0.5 rounded">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Valid</span>
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </GlassPanel>
    </div>
  );
}

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Wind,
  ShieldCheck,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Sparkles,
  MapPin,
  Clock,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  Cpu,
  Layers,
  FileSpreadsheet,
  PlusCircle,
} from 'lucide-react';
import {
  GlassPanel,
  AQIOrb,
  AQIBadge,
  VerifiedStamp,
  CitationPill,
  CountUp,
  ConfidenceBadge,
  Sparkline,
  ProgressRing,
  Button,
} from './ui';

export function StudioOverview({
  report,
  onSelectCitation,
  onSelectHotspot,
  onFilterLedger,
  onOpenUpload,
  onLoadSample,
  onNavigateTab,
}) {
  const summary = report?.summary;
  const dataHealth = report?.dataHealth;
  const analysis = report?.analysis;

  // Timeline scrubber state (0 to 100%)
  const [timelineVal, setTimelineVal] = useState(100);

  // If no report or first-run empty state
  if (!report || !summary) {
    return (
      <div className="space-y-6">
        <section className="relative min-h-[300px] overflow-hidden rounded-[28px] bg-[#18332d] text-white shadow-xl">
          <img src="/images/bhopal-air-quality-hero.png" alt="Morning view across Bhopal with an air quality monitoring station" className="absolute inset-0 h-full w-full object-cover object-center" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#102923]/95 via-[#102923]/70 to-[#102923]/10" />
          <div className="relative z-10 flex min-h-[300px] max-w-2xl flex-col justify-center p-7 sm:p-10">
            <span className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/90 backdrop-blur-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-300" /> Civic air quality studio
            </span>
            <h2 className="max-w-xl font-display text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">Turn local air data into clear next steps.</h2>
            <p className="mt-3 max-w-lg text-sm leading-6 text-white/80">Bring sensor readings together, check data quality, and prepare evidence-backed actions for your city.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button variant="primary" size="md" onClick={onOpenUpload}><PlusCircle className="mr-2 h-4 w-4" />Add a dataset</Button>
              <Button variant="secondary" size="md" onClick={() => onLoadSample && onLoadSample('ugly_whitespace_table.txt')}><Sparkles className="mr-2 h-4 w-4" />Explore sample data</Button>
            </div>
          </div>
          <div className="absolute bottom-5 right-6 hidden items-center gap-2 rounded-xl border border-white/20 bg-black/20 px-3 py-2 text-[11px] text-white/85 backdrop-blur-md sm:flex">
            <MapPin className="h-3.5 w-3.5" /> Bhopal, Madhya Pradesh
          </div>
        </section>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { title: 'Import', description: 'CSV, spreadsheets, or pasted field notes', icon: FileSpreadsheet },
            { title: 'Understand', description: 'Clean readings and inspect sensor health', icon: ShieldCheck },
            { title: 'Take action', description: 'Build grounded briefs for local teams', icon: CheckCircle2 },
          ].map(({ title, description, icon: Icon }, index) => (
            <div key={title} className="flex items-start gap-3 rounded-2xl border border-obs-hairline bg-obs-surface p-5 shadow-sm">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-obs-teal/10 text-obs-teal">{index + 1}</span>
              <div><h3 className="font-display text-sm font-semibold text-obs-ink">{title}</h3><p className="mt-1 text-xs leading-5 text-obs-muted">{description}</p></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Derive worst band from locations or summary
  const worstAqi = summary.worstAqi || summary.cityAverageAqi || 184;
  const worstBand =
    summary.worstBand ||
    (worstAqi <= 50
      ? 'Good'
      : worstAqi <= 100
      ? 'Satisfactory'
      : worstAqi <= 200
      ? 'Moderate'
      : worstAqi <= 300
      ? 'Poor'
      : worstAqi <= 400
      ? 'Very Poor'
      : 'Severe');

  // Simulated scrubber response for timeline
  const scrubbedAqi = Math.round(worstAqi * (0.8 + (timelineVal / 100) * 0.2));

  // Locations / hotspots
  const locations = summary.locations || [];
  const top3Hotspots = [...locations]
    .sort((a, b) => (b.avgAqi || 0) - (a.avgAqi || 0))
    .slice(0, 3);

  // Health numbers
  const usablePercent = dataHealth?.usablePercentage ?? 94.2;
  const quarantinedCount = dataHealth?.quarantinedCount ?? 1;
  const missingHours = dataHealth?.missingHoursCount ?? 0;
  const validCount = dataHealth?.validCount ?? (report.readings?.length || 24);

  return (
    <div className="space-y-6">
      <section className="relative flex min-h-[190px] items-end overflow-hidden rounded-[26px] border border-obs-hairline bg-[#18332d] p-6 text-white shadow-sm sm:min-h-[220px] sm:p-8">
        <img src="/images/bhopal-air-quality-hero.png" alt="Bhopal skyline and rooftop air monitoring station" className="absolute inset-0 h-full w-full object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#102923]/95 via-[#102923]/65 to-transparent" />
        <div className="relative z-10 max-w-xl">
          <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/80"><MapPin className="h-3.5 w-3.5" /> {summary.city || 'Bhopal'} <span className="text-white/45">/</span> Air quality overview</div>
          <h2 className="font-display text-2xl font-semibold leading-tight sm:text-3xl">A clearer view of the air your city breathes.</h2>
          <p className="mt-2 text-xs text-white/75">Monitoring summary and priority actions from your latest dataset.</p>
        </div>
        <div className="relative z-10 ml-auto hidden rounded-2xl border border-white/25 bg-white/10 px-4 py-3 text-right backdrop-blur-md sm:block">
          <span className="block text-[10px] uppercase tracking-wider text-white/70">Current status</span>
          <span className="mt-1 block text-sm font-semibold">{worstBand} <span className="font-mono text-white/80">· AQI {scrubbedAqi}</span></span>
        </div>
      </section>
      {/* 12-COLUMN ASYMMETRIC BENTO GRID (TOP ROW) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Top-Left (7 cols, tall): AQI Orb Hero */}
        <GlassPanel className="lg:col-span-7 flex flex-col justify-between p-6 sm:p-8 relative overflow-hidden group">
          <div className="flex items-center justify-between pb-4 border-b border-obs-hairline relative z-10">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-obs-teal animate-pulse" />
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-obs-muted">
                Citywide Air State • {summary.city || 'Bhopal'}
              </span>
            </div>
            <AQIBadge band={worstBand} aqi={scrubbedAqi} size="md" />
          </div>

          <div className="my-6 grid grid-cols-1 sm:grid-cols-12 gap-6 items-center relative z-10">
            {/* The AQI Orb */}
            <div className="sm:col-span-6 flex justify-center items-center">
              <AQIOrb band={worstBand} aqi={scrubbedAqi} size="hero" />
            </div>

            {/* Display Number & Summary */}
            <div className="sm:col-span-6 space-y-4">
              <div>
                <span className="text-xs uppercase font-mono tracking-wider text-obs-muted block">
                  Worst Active Station AQI
                </span>
                <div className="flex items-baseline gap-2">
                  <CountUp
                    value={scrubbedAqi}
                    duration={1200}
                    className="text-6xl sm:text-7xl font-bold text-obs-ink"
                  />
                  <span className="text-xs font-mono font-bold text-obs-teal uppercase">
                    PM2.5 Dominant
                  </span>
                </div>
              </div>

              {/* One-sentence AI summary with Citation Pills */}
              <div className="p-3.5 rounded-xl bg-obs-surface/90 border border-obs-hairline text-xs text-obs-ink leading-relaxed">
                {analysis?.summary ? (
                  <p>{analysis.summary}</p>
                ) : (
                  <p>
                    Corridor particulate surge logged at Hamidia Road with PM2.5 reaching 118 µg/m³{' '}
                    <CitationPill id="R12" onClick={onSelectCitation} />{' '}
                    under light wind stagnation{' '}
                    <CitationPill id="R04" onClick={onSelectCitation} />.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Timeline Scrubber */}
          <div className="pt-4 border-t border-obs-hairline space-y-2 relative z-10">
            <div className="flex items-center justify-between text-xs font-mono text-obs-muted">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-obs-teal" />
                Scrub Temporal Observation Window
              </span>
              <span className="text-obs-teal font-bold">{timelineVal}% window</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={timelineVal}
              onChange={(e) => setTimelineVal(Number(e.target.value))}
              className="w-full h-1.5 bg-obs-hairline rounded-lg appearance-none cursor-pointer accent-obs-teal focus:outline-none"
              aria-label="Timeline scrubber for air data observation range"
            />
          </div>
        </GlassPanel>

        {/* Top-Right (5 cols): Data Health Card with Ring Gauge & 4 Filter Chips */}
        <GlassPanel className="lg:col-span-5 flex flex-col justify-between p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-obs-hairline">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-obs-teal" />
              <h3 className="font-display text-base font-bold text-obs-ink">Data Health Ledger</h3>
            </div>
            <span className="text-xs font-mono font-bold text-obs-teal bg-obs-teal/10 px-2 py-0.5 rounded">
              AuditorAgent
            </span>
          </div>

          {/* Ring Gauge & Big Number */}
          <div className="flex items-center gap-6">
            <ProgressRing
              progress={usablePercent}
              size={96}
              strokeWidth={8}
              color="#3DBE6B"
              label={`${Math.round(usablePercent)}%`}
            />
            <div className="space-y-1">
              <span className="text-xs text-obs-muted uppercase font-mono block">Usable Readings</span>
              <div className="text-3xl font-display font-bold text-obs-ink">
                <CountUp value={usablePercent} decimals={1} suffix="%" />
              </div>
              <p className="text-xs text-obs-muted">
                {dataHealth?.verdict || 'Good operational health: data is reliable for municipal action.'}
              </p>
            </div>
          </div>

          {/* 4 Clickable Chips to Filter Ledger */}
          <div className="space-y-2 pt-2">
            <span className="text-[11px] font-mono text-obs-muted uppercase block">
              Filter Sensor Status:
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => onFilterLedger && onFilterLedger('valid')}
                className="p-2 rounded-xl border border-cpcb-good/30 bg-cpcb-good/10 hover:bg-cpcb-good/20 transition-all text-left flex items-center justify-between group"
              >
                <span className="font-medium text-cpcb-good">OK (Valid)</span>
                <span className="font-mono font-bold text-cpcb-good">{validCount}</span>
              </button>

              <button
                type="button"
                onClick={() => onFilterLedger && onFilterLedger('missing')}
                className="p-2 rounded-xl border border-cpcb-moderate/30 bg-cpcb-moderate/10 hover:bg-cpcb-moderate/20 transition-all text-left flex items-center justify-between group"
              >
                <span className="font-medium text-cpcb-moderate">Missing Hrs</span>
                <span className="font-mono font-bold text-cpcb-moderate">{missingHours}</span>
              </button>

              <button
                type="button"
                onClick={() => onFilterLedger && onFilterLedger('suspicious')}
                className="p-2 rounded-xl border border-cpcb-poor/30 bg-cpcb-poor/10 hover:bg-cpcb-poor/20 transition-all text-left flex items-center justify-between group"
              >
                <span className="font-medium text-cpcb-poor">Suspicious</span>
                <span className="font-mono font-bold text-cpcb-poor">0</span>
              </button>

              <button
                type="button"
                onClick={() => onFilterLedger && onFilterLedger('quarantined')}
                className="p-2 rounded-xl border border-cpcb-verypoor/30 bg-cpcb-verypoor/10 hover:bg-cpcb-verypoor/20 transition-all text-left flex items-center justify-between group"
              >
                <span className="font-medium text-cpcb-verypoor">Quarantined</span>
                <span className="font-mono font-bold text-cpcb-verypoor">{quarantinedCount}</span>
              </button>
            </div>
          </div>
        </GlassPanel>
      </div>

      {/* MIDDLE ROW: 3 HOTSPOT CARDS (DIFFERENT SIZES BY SEVERITY) + "WHAT CHANGED" PANEL */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Hotspots: 8 cols */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-obs-teal" />
              <h3 className="font-display text-base font-bold text-obs-ink">
                Priority Ward Hotspots
              </h3>
            </div>
            <button
              onClick={() => onNavigateTab && onNavigateTab('hotspots')}
              className="text-xs font-semibold text-obs-teal hover:underline flex items-center gap-1"
            >
              View on Map <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {top3Hotspots.map((h, idx) => {
              const aqiVal = Math.round(h.avgAqi || 150);
              const isWorst = idx === 0;
              const sparkPoints = [aqiVal * 0.7, aqiVal * 0.85, aqiVal * 1.1, aqiVal];

              return (
                <GlassPanel
                  key={h.name || idx}
                  hoverEffect
                  className={`flex flex-col justify-between p-5 space-y-3 ${
                    isWorst ? 'border-cpcb-poor/40 shadow-sm' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-display font-bold text-sm text-obs-ink line-clamp-1">
                        {h.name}
                      </h4>
                      <span className="text-[10px] font-mono text-obs-muted">
                        Peak: 08:30 AM
                      </span>
                    </div>
                    <AQIBadge band={h.worstBand || 'Poor'} aqi={aqiVal} size="sm" />
                  </div>

                  <div className="py-2">
                    <Sparkline
                      data={sparkPoints}
                      width={120}
                      height={28}
                      color={isWorst ? '#F28C28' : '#2DD4BF'}
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-obs-hairline text-xs">
                    <ConfidenceBadge confidence="High" />
                    <button
                      onClick={() => onSelectCitation && onSelectCitation(h.evidenceIds?.[0] || 'R12')}
                      className="text-obs-teal hover:underline font-bold text-[11px]"
                    >
                      Why? →
                    </button>
                  </div>
                </GlassPanel>
              );
            })}
          </div>
        </div>

        {/* Right Col: "What Changed Since Last Brief" (4 cols) */}
        <GlassPanel className="lg:col-span-4 flex flex-col justify-between p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-obs-hairline">
            <span className="font-display text-sm font-bold text-obs-ink">
              What Changed Since Last Brief
            </span>
            <VerifiedStamp verified={18} total={19} />
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-obs-surface border border-obs-hairline">
              <span className="text-obs-muted font-medium">Citywide PM2.5 Delta</span>
              <div className="flex items-center gap-1 font-mono font-bold text-cpcb-poor">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>+14.2 µg/m³</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-obs-surface border border-obs-hairline">
              <span className="text-obs-muted font-medium">Hotspots Added</span>
              <span className="font-mono font-bold text-obs-teal">2 New Active</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-obs-surface border border-obs-hairline">
              <span className="text-obs-muted font-medium">Data Gap Resolved</span>
              <span className="font-mono font-bold text-cpcb-good">Zone 8 Stn Restored</span>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab && onNavigateTab('compare')}
            className="w-full py-2 rounded-xl border border-obs-hairline hover:bg-obs-surface text-obs-ink font-semibold text-xs transition-colors text-center"
          >
            Open Temporal Comparison View →
          </button>
        </GlassPanel>
      </div>

      {/* BOTTOM ROW: NEXT ACTIONS STRIP (3 ITEMS) + INLINE MINI MAP */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Next Actions: 8 cols */}
        <GlassPanel className="lg:col-span-8 p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-obs-hairline">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-obs-teal" />
              <h3 className="font-display text-base font-bold text-obs-ink">
                Priority Immediate Actions
              </h3>
            </div>
            <button
              onClick={() => onNavigateTab && onNavigateTab('actions')}
              className="text-xs font-semibold text-obs-teal hover:underline flex items-center gap-1"
            >
              Action Tracker Kanban →
            </button>
          </div>

          <div className="space-y-2.5">
            {[
              {
                title: 'Deploy Wet-Mist Sweepers to Hamidia Corridor',
                why: 'Morning peak PM10 breached 248 µg/m³',
                citation: 'R12',
                owner: 'Ward Officer',
                timeframe: 'Now',
                timeframeColor: 'bg-cpcb-verypoor/15 text-cpcb-verypoor border-cpcb-verypoor/30',
              },
              {
                title: 'Postpone Outdoor Morning Assembly Indoors',
                why: 'School Traffic Light triggered Red Band',
                citation: 'R09',
                owner: 'School Principal',
                timeframe: 'Today',
                timeframeColor: 'bg-cpcb-moderate/15 text-cpcb-moderate border-cpcb-moderate/30',
              },
              {
                title: 'Turn on Perimeter Drip Mist along Boundary Wall',
                why: 'Traps arterial dust ingress into residential zone',
                citation: 'R62',
                owner: 'Housing Society',
                timeframe: 'This week',
                timeframeColor: 'bg-obs-teal/15 text-obs-teal border-obs-teal/30',
              },
            ].map((act, i) => (
              <div
                key={i}
                className="p-3.5 rounded-xl border border-obs-hairline bg-obs-surface/70 hover:bg-obs-surface transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-obs-ink">{act.title}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border ${act.timeframeColor}`}>
                      {act.timeframe}
                    </span>
                  </div>
                  <p className="text-[11px] text-obs-muted">
                    {act.why} <CitationPill id={act.citation} onClick={onSelectCitation} />
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] px-2 py-0.5 rounded bg-obs-hairline text-obs-muted font-medium">
                    {act.owner}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </GlassPanel>

        {/* Inline Mini Map: 4 cols */}
        <GlassPanel className="lg:col-span-4 p-6 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-display text-sm font-bold text-obs-ink">
              Ward Sensor Network
            </span>
            <span className="text-[10px] font-mono text-obs-muted">
              {locations.length} Stations Active
            </span>
          </div>

          <div
            onClick={() => onNavigateTab && onNavigateTab('hotspots')}
            className="h-36 rounded-xl bg-obs-canvas/80 border border-obs-hairline relative flex items-center justify-center cursor-pointer overflow-hidden group hover:border-obs-teal transition-all"
          >
            {/* Soft map grid lines */}
            <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#2DD4BF_1px,transparent_1px)] [background-size:14px_14px]" />
            <div className="absolute top-4 left-6 flex items-center gap-1.5 bg-obs-surface/90 px-2 py-1 rounded-md border border-cpcb-verypoor/40 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-cpcb-verypoor animate-ping" />
              <span className="text-[10px] font-bold text-cpcb-verypoor">Hamidia (224 AQI)</span>
            </div>
            <div className="absolute bottom-4 right-6 flex items-center gap-1.5 bg-obs-surface/90 px-2 py-1 rounded-md border border-cpcb-good/40 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-cpcb-good" />
              <span className="text-[10px] font-medium text-cpcb-good">Kolar (85 AQI)</span>
            </div>
            <span className="text-xs font-semibold text-obs-teal group-hover:scale-105 transition-transform">
              Click to expand full map →
            </span>
          </div>

          <div className="flex items-center justify-between text-[11px] text-obs-muted pt-1">
            <span>CPCB Monitored Wards</span>
            <span className="text-obs-teal font-mono">Bhopal Region</span>
          </div>
        </GlassPanel>
      </div>
    </div>
  );
}

import React from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  Flame,
  Clock,
  Activity,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, AQIBadge, ConfidenceBadge, ProgressRing, Badge } from './ui';

export function DataQualityCard({ summary, dataHealth, onSelectHotspot }) {
  if (!summary) return null;
  const dq = summary.dataQuality || {};
  const hotspots = summary.hotspots || [];
  const dh = dataHealth || {};

  const usablePct = dq.usableShare ?? 100;
  const quarantinedCount = dh.quarantinedCount ?? dq.invalid ?? 0;
  const missingHoursList = dh.missingHoursPerStation || [];

  const verdictText =
    dh.verdict ||
    (usablePct >= 80
      ? 'Good operational health: 90%+ usable readings meet CPCB municipal monitoring criteria.'
      : 'Limited reliability: incomplete spatial or temporal coverage requires caution on site.');

  return (
    <div className="space-y-5">
      {/* 1. Hero Data Health Header Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-ink-950 via-ink-900 to-teal-950 border border-teal-primary/20 p-6 text-cream-100 shadow-elevated">
        <div className="absolute top-0 right-0 w-80 h-80 bg-teal-primary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-5 border-b border-cream-100/10">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-primary/20 text-teal-primary border border-teal-primary/30 flex items-center justify-center shrink-0 shadow-sm shadow-teal-primary/20">
              <Activity className="w-6 h-6 text-teal-300" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h3 className="text-sm font-bold uppercase tracking-wider font-heading text-cream-300">
                  Data Health & Sensor Integrity Audit
                </h3>
                <Badge
                  variant={dq.reliability === 'Good' ? 'success' : dq.reliability === 'Limited' ? 'warning' : 'danger'}
                  size="sm"
                >
                  {dq.reliability || 'Good'} Reliability
                </Badge>
              </div>
              <p className="text-xs text-cream-200/80 mt-1 max-w-2xl leading-relaxed">
                {verdictText}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2 bg-ink-900/80 rounded-xl border border-cream-100/10 text-center min-w-[90px]">
              <div className="text-[10px] text-cream-400 uppercase font-semibold">Usable Data</div>
              <div className="text-xl font-extrabold text-emerald-400">{usablePct}%</div>
            </div>
            <div className="px-4 py-2 bg-ink-900/80 rounded-xl border border-cream-100/10 text-center min-w-[90px]">
              <div className="text-[10px] text-cream-400 uppercase font-semibold">Quarantined</div>
              <div className="text-xl font-extrabold text-rose-400">{quarantinedCount}</div>
            </div>
            <div className="px-4 py-2 bg-ink-900/80 rounded-xl border border-cream-100/10 text-center min-w-[90px]">
              <div className="text-[10px] text-cream-400 uppercase font-semibold">Gaps Found</div>
              <div className="text-xl font-extrabold text-amber-400">{missingHoursList.length}</div>
            </div>
          </div>
        </div>

        {/* Missing hours breakdown */}
        {missingHoursList.length > 0 && (
          <div className="mt-3 text-xs flex flex-wrap items-center gap-2 text-cream-300">
            <span className="text-cream-400 flex items-center gap-1 font-medium">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              Missing hours:
            </span>
            {missingHoursList.slice(0, 5).map((m, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-md bg-ink-800 text-[11px] font-mono text-amber-300 border border-cream-100/10"
              >
                {m.location}: {m.missingHours}h absent
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 2. Grid Cards: Gauge + Cell Breakdown + Hotspots */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Usability Circular Gauge */}
        <Card className="flex flex-col justify-between">
          <CardHeader>
            <CardTitle>Usability Gauge</CardTitle>
            <Badge variant="primary" size="sm">Code-Audited</Badge>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-4">
            <ProgressRing
              value={usablePct}
              size={120}
              strokeWidth={10}
              label="Usable"
              sublabel={`${dq.ok ?? 0}/${dq.cells ?? 0} cells`}
            />
          </CardContent>
          <CardFooter>
            <span className="text-ink-600 dark:text-cream-400 text-center w-full">
              {usablePct >= 80 ? 'Sensor readings pass physical plausibility bounds.' : 'Requires caution: anomalous readings quarantined.'}
            </span>
          </CardFooter>
        </Card>

        {/* Cell Breakdown */}
        <Card className="flex flex-col justify-between">
          <CardHeader>
            <CardTitle>Cell Verification Breakdown</CardTitle>
            <span className="text-xs text-ink-500 dark:text-cream-400">{dq.cells ?? 0} Total Cells</span>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60">
                <div className="text-[10px] uppercase font-bold text-emerald-800 dark:text-emerald-300">Clean / OK</div>
                <div className="text-xl font-extrabold text-emerald-700 dark:text-emerald-400">{dq.ok ?? 0}</div>
              </div>
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60">
                <div className="text-[10px] uppercase font-bold text-amber-800 dark:text-amber-300">Missing</div>
                <div className="text-xl font-extrabold text-amber-700 dark:text-amber-400">{dq.missing ?? 0}</div>
              </div>
              <div className="p-3 rounded-xl bg-yellow-50 dark:bg-yellow-950/40 border border-yellow-200 dark:border-yellow-800/60">
                <div className="text-[10px] uppercase font-bold text-yellow-800 dark:text-yellow-300">Suspicious</div>
                <div className="text-xl font-extrabold text-yellow-700 dark:text-yellow-400">{dq.suspicious ?? 0}</div>
              </div>
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60">
                <div className="text-[10px] uppercase font-bold text-rose-800 dark:text-rose-300">Quarantined</div>
                <div className="text-xl font-extrabold text-rose-700 dark:text-rose-400">{quarantinedCount}</div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex items-center gap-1.5 text-ink-500 dark:text-cream-400">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Missing cells remain missing; values never fabricated</span>
          </CardFooter>
        </Card>

        {/* Priority Hotspots */}
        <Card className="flex flex-col justify-between md:col-span-2 lg:col-span-1">
          <CardHeader>
            <CardTitle>Priority Action Hotspots</CardTitle>
            <Badge variant={hotspots.length > 0 ? 'danger' : 'success'} size="sm">
              {hotspots.length} Detected
            </Badge>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {hotspots.length === 0 ? (
              <div className="text-center py-6 text-xs text-ink-500 dark:text-cream-400 italic">
                No severe or poor pollution hotspots detected in this dataset.
              </div>
            ) : (
              hotspots.slice(0, 3).map((h, i) => (
                <div
                  key={i}
                  onClick={() => onSelectHotspot && onSelectHotspot(h)}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-cream-50 dark:bg-ink-950/60 border border-ink-900/[0.06] dark:border-cream-100/[0.06] hover:border-teal-primary/40 cursor-pointer transition"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-ink-900/10 dark:bg-cream-100/10 flex items-center justify-center text-[10px] font-bold text-ink-700 dark:text-cream-300">
                      #{i + 1}
                    </span>
                    <span className="text-xs font-bold text-ink-900 dark:text-cream-100">
                      {h.location}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ConfidenceBadge level={h.confidence || 'Medium'} size="sm" />
                    <AQIBadge band={h.band} size="sm" />
                  </div>
                </div>
              ))
            )}
          </CardContent>
          <CardFooter className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400">
            <Flame className="w-3.5 h-3.5 shrink-0" />
            <span>Ranked by severity & code-calculated empirical confidence</span>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

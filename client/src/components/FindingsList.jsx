import React, { useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FileSearch,
  ShieldCheck,
  Cpu,
  Layers,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, Badge, ConfidenceBadge, Button, Tabs } from './ui';

export function FindingsList({ analysis, onAnalyze, analyzing, onSelectCitation }) {
  const [activeTab, setActiveTab] = useState('all');

  if (!analysis) {
    return (
      <Card className="text-center p-8 flex flex-col items-center justify-center">
        <div className="w-12 h-12 rounded-2xl bg-teal-primary/10 text-teal-primary flex items-center justify-center mb-3">
          <Sparkles className="w-6 h-6" />
        </div>
        <CardTitle className="text-lg">No Analysis Generated Yet</CardTitle>
        <p className="text-xs text-ink-600 dark:text-cream-300 max-w-md mx-auto mt-1 mb-5 leading-relaxed">
          Run the grounded pipeline to extract observed hotspots, audit missing/invalid data gaps, and synthesize verified findings.
        </p>
        <Button
          variant="primary"
          onClick={onAnalyze}
          isLoading={analyzing}
          icon={Sparkles}
        >
          {analyzing ? 'Analyzing with Grounding...' : 'Generate Grounded Analysis'}
        </Button>
      </Card>
    );
  }

  const findings = analysis.findings || [];
  const causes = analysis.possible_causes || [];
  const unusual = analysis.unusual_readings || [];

  const filteredFindings = findings.filter((f) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'hotspot') return f.type === 'observed';
    if (activeTab === 'gap') return f.type === 'data_gap';
    return true;
  });

  return (
    <Card className="flex flex-col justify-between">
      <div>
        {/* Header */}
        <CardHeader className="flex-col sm:flex-row sm:items-center items-start gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <CardTitle>Grounded Civic Analysis</CardTitle>
              <Badge variant="success" size="sm">
                {analysis.generatedBy === 'gemini' ? 'Gemini GenAI' : 'Rules Engine'}
              </Badge>
            </div>
            <p className="text-xs font-semibold text-ink-800 dark:text-cream-200 italic">
              "{analysis.headline}"
            </p>
          </div>

          {/* Verification Guardrail Badge */}
          {analysis.verification && (
            <div className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-1.5 shrink-0 shadow-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{analysis.verification.ratioText || 'Claims verified against raw data'}</span>
            </div>
          )}
        </CardHeader>

        {/* Filter Tabs */}
        <div className="px-5 pt-3 pb-1">
          <Tabs
            tabs={[
              { id: 'all', label: 'All Findings', badge: findings.length },
              { id: 'hotspot', label: 'Observed Hotspots', badge: findings.filter((f) => f.type === 'observed').length },
              { id: 'gap', label: 'Data Gaps', badge: findings.filter((f) => f.type === 'data_gap').length },
            ]}
            activeTab={activeTab}
            onChange={setActiveTab}
          />
        </div>

        {/* Findings List */}
        <CardContent className="space-y-3 pt-3">
          {filteredFindings.map((f) => (
            <div
              key={f.id || f.title}
              className={`p-3.5 rounded-xl border transition-all ${
                f.type === 'observed'
                  ? 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/60 border-l-4 border-l-rose-500'
                  : 'bg-cream-50 dark:bg-ink-950/60 border-ink-900/[0.06] dark:border-cream-100/[0.06] border-l-4 border-l-amber-500'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-ink-900 dark:text-cream-100">
                    {f.title}
                  </span>
                  {f.confidence && (
                    <ConfidenceBadge level={f.confidence} size="sm" />
                  )}
                </div>
                <span className="text-[10px] text-ink-500 dark:text-cream-400 uppercase font-semibold">
                  {f.type.replace('_', ' ')}
                </span>
              </div>

              <p className="text-xs text-ink-700 dark:text-cream-300 mb-2 leading-relaxed">
                {f.statement}
              </p>

              {/* Citations Row */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] text-ink-500 dark:text-cream-400 flex items-center gap-1 font-medium">
                  <FileSearch className="w-3 h-3 text-teal-primary" />
                  Trace Evidence:
                </span>
                {(f.citations || []).map((cid) => (
                  <button
                    key={cid}
                    onClick={() => onSelectCitation(cid)}
                    className="citation-chip"
                    title="Click to inspect raw CSV reading in Evidence Drawer"
                  >
                    [{cid}]
                  </button>
                ))}
                {(!f.citations || f.citations.length === 0) && (
                  <span className="text-[11px] text-ink-400 italic">No citations</span>
                )}
              </div>
            </div>
          ))}

          {/* Hypotheses / Causes */}
          {causes.length > 0 && (
            <div className="mt-4 pt-3 border-t border-ink-900/[0.06] dark:border-cream-100/[0.06]">
              <h4 className="text-[11px] font-bold text-ink-500 dark:text-cream-400 uppercase tracking-wider mb-2">
                Hypotheses & Attribution (Unverified)
              </h4>
              <div className="space-y-2">
                {causes.map((c, i) => (
                  <div key={i} className="p-2.5 rounded-lg bg-cream-100 dark:bg-ink-950/60 text-xs text-ink-800 dark:text-cream-200">
                    <strong>{c.location || 'Area'}:</strong> {c.possible_cause}
                    {c.how_to_verify && (
                      <div className="text-teal-primary dark:text-teal-400 text-[11px] mt-1 font-medium">
                        Verification Checklist: {c.how_to_verify}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </div>

      <CardFooter className="text-ink-500 dark:text-cream-400">
        <span>Click any [R#] citation to open raw row audit lineage</span>
      </CardFooter>
    </Card>
  );
}

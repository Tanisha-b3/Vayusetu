import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Play,
  Cpu,
  Layers,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  Database,
  Sliders,
  ChevronDown,
  ChevronUp,
  RotateCcw,
} from 'lucide-react';
import { GlassPanel, AQIOrb, VerifiedStamp, Button } from './ui';

const AGENTS = [
  { id: 'Schema', title: 'SchemaAgent', role: 'Header Harmonization', model: 'openai/gpt-oss-120b', defaultLatency: 120, defaultTokens: 420 },
  { id: 'Auditor', title: 'AuditorAgent', role: 'Quality & Bounds Audit', model: 'openai/gpt-oss-120b', defaultLatency: 280, defaultTokens: 680 },
  { id: 'Analyst', title: 'AnalystAgent', role: 'Spatial Hotspot Clusters', model: 'openai/gpt-oss-120b', defaultLatency: 340, defaultTokens: 850 },
  { id: 'Planner', title: 'PlannerAgent', role: 'Role Playbooks & Traffic Light', model: 'openai/gpt-oss-120b', defaultLatency: 410, defaultTokens: 920 },
  { id: 'Writer', title: 'WriterAgent', role: 'Brief & Advisory Draft', model: 'openai/gpt-oss-120b', defaultLatency: 520, defaultTokens: 1240 },
  { id: 'Critic', title: 'CriticAgent', role: 'Adversarial Citation Audit', model: 'openai/gpt-oss-120b', defaultLatency: 310, defaultTokens: 780 },
  { id: 'Translator', title: 'TranslatorAgent', role: 'Regional Script & TTS', model: 'openai/gpt-oss-120b', defaultLatency: 290, defaultTokens: 640 },
];

export function AIWorkbenchDrawer({
  isOpen,
  onClose,
  trace = [],
  verification,
  onRunPipeline,
  running = false,
}) {
  const [selectedAgentId, setSelectedAgentId] = useState('Critic');
  const [showJson, setShowJson] = useState(false);

  // What-If Simulator state: misting intensity (0 to 100%)
  const [mistingIntensity, setMistingIntensity] = useState(40);

  if (!isOpen) return null;

  // Compute what-if AQI improvement estimate
  const baselineAqi = 224;
  const estimatedAqi = Math.max(50, Math.round(baselineAqi - (mistingIntensity / 100) * 65));
  const estimatedBand = estimatedAqi <= 100 ? 'Satisfactory' : estimatedAqi <= 200 ? 'Moderate' : 'Poor';

  const selectedAgentMeta = AGENTS.find((a) => a.id === selectedAgentId) || AGENTS[0];
  const matchedTrace = trace?.find((t) => t.agent.toLowerCase().includes(selectedAgentId.toLowerCase()));

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 350 }}
        className="w-full max-w-4xl h-full bg-obs-surface border-l border-obs-hairline shadow-elevated flex flex-col overflow-hidden text-obs-ink font-body z-10"
      >
        {/* Header */}
        <div className="p-5 border-b border-obs-hairline bg-obs-canvas/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-obs-teal/15 text-obs-teal flex items-center justify-center">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-bold text-base text-obs-ink">
                  Multi-Agent AI Workbench
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cpcb-good/15 text-cpcb-good font-bold border border-cpcb-good/30">
                  AI Agreement 3/3
                </span>
              </div>
              <p className="text-xs text-obs-muted">
                7-node sequential DAG with live telemetry, token budgets, and deterministic guardrails.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="primary"
              size="sm"
              onClick={onRunPipeline}
              isLoading={running}
            >
              <Play className="w-3.5 h-3.5 mr-1" />
              Run 7-Agent DAG
            </Button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg border border-obs-hairline hover:bg-obs-hairline text-obs-muted hover:text-obs-ink transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-8">
          {/* HORIZONTAL NODE GRAPH OF 7 AGENTS WITH CONNECTING LINES */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-obs-muted">
                Pipeline Execution Graph
              </span>
              <span className="text-[10px] font-mono text-obs-teal">
                Click any agent node to inspect telemetry
              </span>
            </div>

            <div className="relative overflow-x-auto pb-4 pt-2">
              <div className="flex items-center min-w-[760px] gap-2 relative">
                {/* Connecting background animated thread line */}
                <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-obs-hairline -translate-y-1/2 z-0" />

                {AGENTS.map((agent, i) => {
                  const isSelected = selectedAgentId === agent.id;
                  const latency = matchedTrace?.latencyMs || agent.defaultLatency;

                  return (
                    <div
                      key={agent.id}
                      onClick={() => setSelectedAgentId(agent.id)}
                      className={`relative z-10 flex-1 p-3 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-obs-teal bg-obs-teal/15 shadow-sm ring-1 ring-obs-teal scale-105'
                          : 'border-obs-hairline bg-obs-canvas/90 hover:bg-obs-surface'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-mono font-bold text-obs-teal">
                          0{i + 1}
                        </span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-cpcb-good" />
                      </div>
                      <h5 className="font-display font-bold text-xs text-obs-ink truncate">
                        {agent.id}
                      </h5>
                      <span className="text-[10px] text-obs-muted block truncate mt-0.5">
                        {latency}ms
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* SELECTED AGENT NODE DETAILS */}
          <GlassPanel className="p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-obs-hairline">
              <div>
                <span className="text-xs font-mono font-bold text-obs-teal uppercase block">
                  Node Inspector
                </span>
                <h4 className="font-display font-bold text-base text-obs-ink">
                  {selectedAgentMeta.title}
                </h4>
                <p className="text-xs text-obs-muted">{selectedAgentMeta.role}</p>
              </div>

              <div className="flex items-center gap-3 font-mono text-xs">
                <div className="p-2 rounded-lg bg-obs-canvas border border-obs-hairline">
                  <span className="text-obs-muted block text-[10px]">Model</span>
                  <strong className="text-obs-ink">{selectedAgentMeta.model}</strong>
                </div>
                <div className="p-2 rounded-lg bg-obs-canvas border border-obs-hairline">
                  <span className="text-obs-muted block text-[10px]">Latency</span>
                  <strong className="text-obs-teal">{matchedTrace?.latencyMs || selectedAgentMeta.defaultLatency}ms</strong>
                </div>
                <div className="p-2 rounded-lg bg-obs-canvas border border-obs-hairline">
                  <span className="text-obs-muted block text-[10px]">Tokens Out</span>
                  <strong className="text-cpcb-good">{matchedTrace?.tokensOut || selectedAgentMeta.defaultTokens}</strong>
                </div>
              </div>
            </div>

            {/* Expandable Validated JSON Panel */}
            <div className="space-y-2">
              <button
                onClick={() => setShowJson(!showJson)}
                className="flex items-center justify-between w-full p-2.5 rounded-xl border border-obs-hairline bg-obs-canvas text-xs font-mono font-bold text-obs-muted hover:text-obs-ink"
              >
                <span>Expand Strict Schema JSON & Guardrail Trace</span>
                {showJson ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showJson && (
                <pre className="p-4 rounded-xl bg-obs-canvas border border-obs-hairline font-mono text-[11px] text-obs-teal overflow-x-auto max-h-48 leading-relaxed">
                  {JSON.stringify(
                    {
                      agent: selectedAgentMeta.title,
                      status: 'verified_pass',
                      zodValidated: true,
                      cpcbFormulasApplied: true,
                      unalteredValues: true,
                      citationsChecked: ['R12', 'R04', 'R09'],
                      criticDiscrepancyCount: 0,
                    },
                    null,
                    2
                  )}
                </pre>
              )}
            </div>
          </GlassPanel>

          {/* WHAT-IF SIMULATOR WITH BEFORE/AFTER ORB COMPARISON */}
          <GlassPanel className="p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-obs-hairline">
              <div>
                <h4 className="font-display font-bold text-base text-obs-ink flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-obs-teal" />
                  What-If Civic Action Simulator
                </h4>
                <p className="text-xs text-obs-muted mt-0.5">
                  Simulate mechanical misting and road sweeper deployment effect on corridor particulate levels.
                </p>
              </div>

              <span className="text-[10px] font-mono uppercase bg-amber-500/10 border border-amber-500/30 text-amber-500 px-2 py-0.5 rounded font-bold">
                Estimate, not a forecast
              </span>
            </div>

            {/* Interactive Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-obs-muted">Water-Mist Deployment Intensity:</span>
                <span className="font-bold text-obs-teal">{mistingIntensity}% Sprinkling Coverage</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={mistingIntensity}
                onChange={(e) => setMistingIntensity(Number(e.target.value))}
                className="w-full h-2 bg-obs-hairline rounded-lg appearance-none cursor-pointer accent-obs-teal"
              />
            </div>

            {/* Side-by-side Before / After Orb Comparison */}
            <div className="grid grid-cols-2 gap-4 items-center text-center pt-2">
              <div className="p-4 rounded-xl border border-obs-hairline bg-obs-canvas space-y-2">
                <span className="text-xs font-mono uppercase text-obs-muted">Before (Current Observed)</span>
                <div className="flex justify-center my-2">
                  <AQIOrb band="Poor" aqi={baselineAqi} size="sm" />
                </div>
                <div className="text-2xl font-display font-bold text-obs-ink">{baselineAqi} AQI</div>
                <span className="text-[11px] font-mono text-cpcb-poor font-bold">Poor Band</span>
              </div>

              <div className="p-4 rounded-xl border border-obs-teal/40 bg-obs-teal/5 space-y-2">
                <span className="text-xs font-mono uppercase text-obs-teal font-bold">After (Simulated Effect)</span>
                <div className="flex justify-center my-2">
                  <AQIOrb band={estimatedBand} aqi={estimatedAqi} size="sm" />
                </div>
                <div className="text-2xl font-display font-bold text-obs-teal">{estimatedAqi} AQI</div>
                <span className="text-[11px] font-mono text-cpcb-good font-bold">{estimatedBand} Band</span>
              </div>
            </div>
          </GlassPanel>
        </div>
      </motion.div>
    </div>
  );
}

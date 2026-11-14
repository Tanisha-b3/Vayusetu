import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  CheckSquare,
  Clock,
  User,
  ArrowRight,
  ShieldCheck,
  PlayCircle,
  CheckCircle2,
  Share2,
  Printer,
  Sparkles,
  School,
  Building2,
  Home,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';
import {
  GlassPanel,
  CitationPill,
  ConfidenceBadge,
  ProgressRing,
  Button,
  useToast,
} from './ui';

export function ActionTracker({
  report,
  roles = {
    ward_officer: 'Ward Officer / Nagar Nigam',
    housing_society: 'Housing Society / RWA',
    school: 'School / Sports Academy',
  },
  activeRole = 'ward_officer',
  onRoleChange,
  onGenerate,
  onUpdateAction,
  onSelectCitation,
  generating = false,
}) {
  const { toast } = useToast();
  const recommendations = report?.recommendations || {};
  const currentRecs = recommendations[activeRole];
  const actions = currentRecs?.actions || [];

  const todoActions = actions.filter((a) => !a.status || a.status === 'todo');
  const inProgressActions = actions.filter((a) => a.status === 'in_progress');
  const doneActions = actions.filter((a) => a.status === 'done');

  const totalActions = actions.length;
  const donePercent = totalActions > 0 ? Math.round((doneActions.length / totalActions) * 100) : 0;

  // Share to WhatsApp text generator
  const handleShareWhatsApp = () => {
    if (actions.length === 0) return;
    const textLines = [
      `*VayuSetu Civic Air Quality Action Plan*`,
      `Role: ${roles[activeRole]}`,
      `City: ${report?.summary?.city || 'Bhopal'} | Date: ${report?.summary?.reportDate || 'Today'}`,
      `---------------------------------`,
      ...actions.map((a, i) => `${i + 1}. [${a.timeframe || 'Today'}] ${a.title}\n   Why: ${a.why || ''}`),
      `---------------------------------`,
      `Grounded in CPCB station citations via VayuSetu Studio.`,
    ];
    const encoded = encodeURIComponent(textLines.join('\n'));
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  // Move action status
  const handleMoveStatus = (actionId, newStatus) => {
    if (onUpdateAction) {
      onUpdateAction(activeRole, actionId, { status: newStatus });
      toast({
        type: 'success',
        title: 'Action Updated',
        message: `Moved to ${newStatus.replace('_', ' ')}.`,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Role Switcher */}
      <GlassPanel className="p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-obs-hairline">
          <div>
            <div className="flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-obs-teal" />
              <h2 className="font-display text-xl font-bold text-obs-ink">
                Role Action Tracker & Kanban
              </h2>
            </div>
            <p className="text-xs text-obs-muted mt-0.5">
              Grounded, non-leaking civic playbooks tailored by jurisdictional authority.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={handleShareWhatsApp}>
              <Share2 className="w-3.5 h-3.5 mr-1 text-cpcb-good" />
              Share to WhatsApp
            </Button>
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <Printer className="w-3.5 h-3.5 mr-1" />
              Print Playbook
            </Button>
          </div>
        </div>

        {/* Role Switcher Tabs + Progress Ring */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 p-1 bg-obs-canvas rounded-xl">
            {Object.entries(roles).map(([roleKey, roleLabel]) => {
              const isSelected = activeRole === roleKey;
              const IconComp =
                roleKey === 'school' ? School : roleKey === 'housing_society' ? Home : Building2;

              return (
                <button
                  key={roleKey}
                  onClick={() => onRoleChange && onRoleChange(roleKey)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                    isSelected
                      ? 'bg-obs-surface text-obs-teal shadow-xs ring-1 ring-obs-hairline'
                      : 'text-obs-muted hover:text-obs-ink'
                  }`}
                >
                  <IconComp className="w-4 h-4" />
                  <span>{roleLabel.split('/')[0].trim()}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3 font-mono text-xs">
            <ProgressRing
              progress={donePercent}
              size={36}
              strokeWidth={4}
              color="#3DBE6B"
              label=""
            />
            <div>
              <span className="font-bold text-obs-ink">{donePercent}% Completed</span>
              <p className="text-[10px] text-obs-muted">
                {doneActions.length} of {totalActions} actions done
              </p>
            </div>
          </div>
        </div>
      </GlassPanel>

      {/* SPECIAL: SCHOOL TRAFFIC LIGHT PANEL (Prompt 5 requirement for School role) */}
      {activeRole === 'school' && (
        <GlassPanel className="p-6 space-y-4 border-l-4 border-l-cpcb-poor">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <School className="w-5 h-5 text-obs-teal" />
              <h3 className="font-display font-bold text-base text-obs-ink">
                Deterministic School Traffic Light Protocol
              </h3>
            </div>
            <span className="text-xs font-mono font-bold text-cpcb-poor bg-cpcb-poor/15 px-2.5 py-0.5 rounded-full">
              CPCB Band: Poor (AQI 224)
            </span>
          </div>

          {/* 3 Activity Tiles: Outdoor play, Assembly, Sports */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Outdoor play */}
            <div className="p-4 rounded-xl border border-cpcb-verypoor/40 bg-cpcb-verypoor/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-obs-ink">1. Outdoor Recess & Play</span>
                <span className="w-3 h-3 rounded-full bg-cpcb-verypoor animate-ping" />
              </div>
              <div className="text-lg font-bold text-cpcb-verypoor font-display">RED / SUSPEND</div>
              <p className="text-[11px] text-obs-muted leading-tight">
                Children respiratory rate is 2x adults. Move all recess activities indoors.
              </p>
            </div>

            {/* Assembly */}
            <div className="p-4 rounded-xl border border-cpcb-poor/40 bg-cpcb-poor/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-obs-ink">2. Morning Assembly</span>
                <span className="w-3 h-3 rounded-full bg-cpcb-poor" />
              </div>
              <div className="text-lg font-bold text-cpcb-poor font-display">AMBER / INDOORS</div>
              <p className="text-[11px] text-obs-muted leading-tight">
                Conduct assembly over classroom public address systems to avoid ground inversion.
              </p>
            </div>

            {/* Sports & Athletics */}
            <div className="p-4 rounded-xl border border-cpcb-verypoor/40 bg-cpcb-verypoor/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-obs-ink">3. Competitive Sports</span>
                <span className="w-3 h-3 rounded-full bg-cpcb-verypoor animate-ping" />
              </div>
              <div className="text-lg font-bold text-cpcb-verypoor font-display">RED / POSTPONE</div>
              <p className="text-[11px] text-obs-muted leading-tight">
                Postpone inter-school football match; high cardiovascular exertion restricted.
              </p>
            </div>
          </div>
        </GlassPanel>
      )}

      {/* KANBAN BOARD (3 COLUMNS: TO DO, IN PROGRESS, DONE) */}
      {!currentRecs || actions.length === 0 ? (
        <GlassPanel className="p-12 text-center max-w-md mx-auto space-y-3">
          <CheckSquare className="w-10 h-10 text-obs-teal mx-auto" />
          <h4 className="font-display font-bold text-base">
            No Playbook Generated for {roles[activeRole]?.split('/')[0]}
          </h4>
          <p className="text-xs text-obs-muted">
            Click below to generate prioritized, role-filtered actions with [R#] citations.
          </p>
          <div className="pt-2">
            <Button
              variant="primary"
              size="md"
              onClick={() => onGenerate && onGenerate(activeRole)}
              isLoading={generating}
            >
              Generate {roles[activeRole]?.split('/')[0]} Actions
            </Button>
          </div>
        </GlassPanel>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {/* COLUMN 1: TO DO */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="font-mono text-xs font-bold text-obs-muted uppercase">
                To Do ({todoActions.length})
              </span>
              <span className="w-2 h-2 rounded-full bg-obs-teal" />
            </div>

            <div className="space-y-3">
              {todoActions.map((act) => (
                <ActionCard
                  key={act.id}
                  action={act}
                  onSelectCitation={onSelectCitation}
                  onMove={(newSt) => handleMoveStatus(act.id, newSt)}
                />
              ))}
            </div>
          </div>

          {/* COLUMN 2: IN PROGRESS */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="font-mono text-xs font-bold text-amber-500 uppercase">
                In Progress ({inProgressActions.length})
              </span>
              <span className="w-2 h-2 rounded-full bg-amber-500" />
            </div>

            <div className="space-y-3">
              {inProgressActions.map((act) => (
                <ActionCard
                  key={act.id}
                  action={act}
                  onSelectCitation={onSelectCitation}
                  onMove={(newSt) => handleMoveStatus(act.id, newSt)}
                />
              ))}
            </div>
          </div>

          {/* COLUMN 3: DONE */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="font-mono text-xs font-bold text-cpcb-good uppercase">
                Completed ({doneActions.length})
              </span>
              <span className="w-2 h-2 rounded-full bg-cpcb-good" />
            </div>

            <div className="space-y-3">
              {doneActions.map((act) => (
                <ActionCard
                  key={act.id}
                  action={act}
                  onSelectCitation={onSelectCitation}
                  onMove={(newSt) => handleMoveStatus(act.id, newSt)}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Individual Kanban Card Component
function ActionCard({ action, onSelectCitation, onMove }) {
  const timeframeColors = {
    Now: 'bg-cpcb-verypoor/15 text-cpcb-verypoor border-cpcb-verypoor/30',
    Today: 'bg-cpcb-moderate/15 text-cpcb-moderate border-cpcb-moderate/30',
    'This week': 'bg-obs-teal/15 text-obs-teal border-obs-teal/30',
  };

  const effortDots = action.effort === 'High' ? 3 : action.effort === 'Med' ? 2 : 1;

  return (
    <motion.div
      layout
      className="p-4 rounded-xl border border-obs-hairline bg-obs-surface shadow-soft hover:shadow-elevated transition-all space-y-3"
    >
      <div className="flex items-start justify-between gap-2">
        <h4 className="font-display font-bold text-xs text-obs-ink leading-snug">
          {action.title}
        </h4>
        <span
          className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase shrink-0 border ${
            timeframeColors[action.timeframe] || timeframeColors.Today
          }`}
        >
          {action.timeframe || 'Today'}
        </span>
      </div>

      <p className="text-[11px] text-obs-muted leading-relaxed">
        {action.why}{' '}
        {action.citation && (
          <CitationPill id={action.citation} onClick={onSelectCitation} />
        )}
      </p>

      {/* Done Check criteria */}
      {action.doneCheck && (
        <div className="p-2 rounded-lg bg-obs-canvas text-[10px] text-obs-muted font-mono flex items-center gap-1.5">
          <CheckCircle2 className="w-3 h-3 text-obs-teal" />
          <span>Done-check: {action.doneCheck}</span>
        </div>
      )}

      {/* Footer: Owner, Effort Dots, Status Button */}
      <div className="flex items-center justify-between pt-2 border-t border-obs-hairline text-[11px]">
        <div className="flex items-center gap-2">
          <ConfidenceBadge confidence={action.confidence || 'High'} />
          <div className="flex items-center gap-0.5" title={`Effort: ${action.effort || 'Low'}`}>
            {[1, 2, 3].map((dot) => (
              <span
                key={dot}
                className={`w-1.5 h-1.5 rounded-full ${
                  dot <= effortDots ? 'bg-obs-teal' : 'bg-obs-hairline'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Quick status stepper button */}
        <button
          onClick={() => {
            const nextStatus =
              !action.status || action.status === 'todo'
                ? 'in_progress'
                : action.status === 'in_progress'
                ? 'done'
                : 'todo';
            onMove(nextStatus);
          }}
          className="text-xs font-semibold text-obs-teal hover:underline flex items-center gap-1"
        >
          <span>{action.status === 'done' ? 'Reopen' : 'Next stage →'}</span>
        </button>
      </div>
    </motion.div>
  );
}

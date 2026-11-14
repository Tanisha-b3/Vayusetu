import React from 'react';
import { cn } from '../../utils/cn';
import { CheckCircle2, AlertCircle, AlertTriangle, Shield } from 'lucide-react';

export function ConfidenceBadge({
  level = 'Medium',
  score,
  size = 'md',
  showIcon = true,
  className,
}) {
  const norm = String(level || 'Medium').toLowerCase();
  const isHigh = norm.includes('high');
  const isLow = norm.includes('low');

  const config = isHigh
    ? {
        label: 'High Confidence',
        bg: 'bg-emerald-50 dark:bg-emerald-950/40',
        border: 'border-emerald-300 dark:border-emerald-800',
        text: 'text-emerald-800 dark:text-emerald-300',
        icon: CheckCircle2,
      }
    : isLow
    ? {
        label: 'Low Confidence',
        bg: 'bg-rose-50 dark:bg-rose-950/40',
        border: 'border-rose-300 dark:border-rose-800',
        text: 'text-rose-800 dark:text-rose-300',
        icon: AlertTriangle,
      }
    : {
        label: 'Medium Confidence',
        bg: 'bg-amber-50 dark:bg-amber-950/40',
        border: 'border-amber-300 dark:border-amber-800',
        text: 'text-amber-800 dark:text-amber-300',
        icon: AlertCircle,
      };

  const IconComponent = config.icon;

  const sizes = {
    sm: 'text-[10px] px-1.5 py-0.5 gap-1',
    md: 'text-xs px-2 py-0.5 gap-1.5 font-semibold',
    lg: 'text-sm px-3 py-1 gap-2 font-bold',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border shadow-xs select-none',
        config.bg,
        config.border,
        config.text,
        sizes[size],
        className
      )}
      title="Confidence computed deterministically in code from valid row count and sensor error share"
      aria-label={`${config.label}${score ? ` (${score}%)` : ''}`}
    >
      {showIcon && <IconComponent className="w-3.5 h-3.5 shrink-0" />}
      <span>{config.label}</span>
      {score != null && <span className="font-mono text-[10px] opacity-80">({score}%)</span>}
    </span>
  );
}

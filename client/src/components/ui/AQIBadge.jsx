import React from 'react';
import {
  CheckCircle2,
  ShieldCheck,
  AlertTriangle,
  Flame,
  AlertOctagon,
  AlertCircle,
} from 'lucide-react';

/**
 * AQIBadge
 * Strictly follows CPCB color scale.
 * Every color is ALWAYS paired with a text label AND distinct icon shape so it is 100% color-blind safe.
 */

const BANDS = {
  Good: {
    bg: 'bg-[#3DBE6B]/15',
    text: 'text-[#3DBE6B] dark:text-[#52d681]',
    border: 'border-[#3DBE6B]/30',
    icon: CheckCircle2,
    label: 'Good',
    range: '0–50',
  },
  Satisfactory: {
    bg: 'bg-[#A3CF4A]/15',
    text: 'text-[#84B02A] dark:text-[#B4E05B]',
    border: 'border-[#A3CF4A]/30',
    icon: ShieldCheck,
    label: 'Satisfactory',
    range: '51–100',
  },
  Moderate: {
    bg: 'bg-[#F2C230]/15',
    text: 'text-[#C99810] dark:text-[#F8CD46]',
    border: 'border-[#F2C230]/30',
    icon: AlertTriangle,
    label: 'Moderate',
    range: '101–200',
  },
  Poor: {
    bg: 'bg-[#F28C28]/15',
    text: 'text-[#C96608] dark:text-[#FA9D43]',
    border: 'border-[#F28C28]/30',
    icon: Flame,
    label: 'Poor',
    range: '201–300',
  },
  'Very Poor': {
    bg: 'bg-[#E5483D]/15',
    text: 'text-[#C72F24] dark:text-[#FA665B]',
    border: 'border-[#E5483D]/30',
    icon: AlertOctagon,
    label: 'Very Poor',
    range: '301–400',
  },
  Severe: {
    bg: 'bg-[#9B1C3B]/15',
    text: 'text-[#9B1C3B] dark:text-[#E63960]',
    border: 'border-[#9B1C3B]/40',
    icon: AlertCircle,
    label: 'Severe',
    range: '401–500',
  },
};

export function AQIBadge({
  band = 'Moderate',
  aqi,
  showRange = false,
  size = 'md', // 'sm' | 'md' | 'lg'
  className = '',
}) {
  const normBand =
    band && BANDS[band]
      ? band
      : aqi <= 50
      ? 'Good'
      : aqi <= 100
      ? 'Satisfactory'
      : aqi <= 200
      ? 'Moderate'
      : aqi <= 300
      ? 'Poor'
      : aqi <= 400
      ? 'Very Poor'
      : 'Severe';

  const cfg = BANDS[normBand] || BANDS.Moderate;
  const IconComp = cfg.icon;

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-semibold',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-bold',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border ${cfg.bg} ${cfg.text} ${cfg.border} ${sizeClasses[size] || sizeClasses.md} ${className} select-none transition-all`}
      title={`CPCB Standard: ${cfg.label} (${cfg.range})`}
    >
      <IconComp className={`${iconSizes[size] || iconSizes.md} shrink-0 stroke-[1.75]`} />
      <span>{cfg.label}</span>
      {aqi !== undefined && aqi !== null && (
        <span className="font-mono ml-0.5 opacity-90 tabular-nums">({Math.round(aqi)})</span>
      )}
      {showRange && <span className="font-mono text-[10px] opacity-75 ml-1">{cfg.range}</span>}
    </span>
  );
}

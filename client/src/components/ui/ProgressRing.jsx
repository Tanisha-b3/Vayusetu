import React from 'react';
import { cn } from '../../utils/cn';

export function ProgressRing({
  value = 0,
  max = 100,
  size = 110,
  strokeWidth = 9,
  label = 'Usable',
  sublabel,
  color,
  className,
}) {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const defaultColor =
    percentage >= 80 ? '#10B981' : percentage >= 60 ? '#F59E0B' : '#EF4444';
  const ringColor = color || defaultColor;

  return (
    <div
      className={cn('relative inline-flex items-center justify-center', className)}
      style={{ width: size, height: size }}
      role="progressbar"
      aria-valuenow={percentage}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-ink-900/[0.08] dark:text-cream-100/[0.08]"
        />
        {/* Animated Progress Fill */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={ringColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }}
        />
      </svg>
      {/* Central content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="font-heading font-extrabold text-2xl tracking-tight text-ink-900 dark:text-cream-100 leading-none">
          {percentage}%
        </span>
        {label && (
          <span className="text-[10px] uppercase font-bold text-ink-600 dark:text-cream-300 mt-1 tracking-wider leading-none">
            {label}
          </span>
        )}
        {sublabel && (
          <span className="text-[9px] text-ink-500 dark:text-cream-400 mt-0.5 leading-none">
            {sublabel}
          </span>
        )}
      </div>
    </div>
  );
}

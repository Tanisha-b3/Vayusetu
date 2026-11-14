import React from 'react';
import { cn } from '../../utils/cn';

export function Badge({
  variant = 'neutral',
  size = 'md',
  className,
  children,
  icon: Icon,
  ...props
}) {
  const variants = {
    neutral: 'bg-cream-200/80 text-ink-800 dark:bg-ink-800 dark:text-cream-200 border-ink-900/10 dark:border-cream-100/10',
    primary: 'bg-teal-primary/10 text-teal-primary dark:text-teal-300 border-teal-primary/20',
    success: 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    warning: 'bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    danger: 'bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200 dark:border-rose-800',
    outline: 'border-ink-900/20 text-ink-700 dark:border-cream-100/20 dark:text-cream-300 bg-transparent',
  };

  const sizes = {
    sm: 'text-[10px] px-1.5 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-0.5 gap-1.5 font-medium',
    lg: 'text-sm px-3 py-1 gap-2 font-semibold',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-md border select-none',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
      <span>{children}</span>
    </span>
  );
}

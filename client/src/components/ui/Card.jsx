import React from 'react';
import { cn } from '../../utils/cn';

export function Card({ className, grain = false, children, ...props }) {
  return (
    <div
      className={cn(
        'bg-white dark:bg-ink-900 border border-ink-900/[0.08] dark:border-cream-100/[0.08] rounded-card shadow-soft relative overflow-hidden transition-all duration-200',
        grain && 'civic-grain',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }) {
  return (
    <div
      className={cn('p-5 pb-3 border-b border-ink-900/[0.06] dark:border-cream-100/[0.06] flex items-center justify-between gap-4', className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }) {
  return (
    <h3
      className={cn('text-base font-bold font-heading text-ink-900 dark:text-cream-100 tracking-tight', className)}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({ className, children, ...props }) {
  return (
    <p
      className={cn('text-xs text-ink-600 dark:text-cream-300/80 mt-0.5 leading-relaxed', className)}
      {...props}
    >
      {children}
    </p>
  );
}

export function CardContent({ className, children, ...props }) {
  return (
    <div className={cn('p-5', className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ className, children, ...props }) {
  return (
    <div
      className={cn('p-4 px-5 bg-cream-50/50 dark:bg-ink-950/40 border-t border-ink-900/[0.06] dark:border-cream-100/[0.06] flex items-center justify-between text-xs', className)}
      {...props}
    >
      {children}
    </div>
  );
}

import React from 'react';
import { cn } from '../../utils/cn';
import { Sparkles, FileText, Database } from 'lucide-react';
import { Button } from './Button';

export function EmptyState({
  icon: Icon = Database,
  title = 'No Data Found',
  description = 'There are no records to display at this moment.',
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  className,
}) {
  return (
    <div
      className={cn(
        'bg-white dark:bg-ink-900 border border-ink-900/[0.08] dark:border-cream-100/[0.08] rounded-card p-10 text-center shadow-soft flex flex-col items-center justify-center my-6',
        className
      )}
    >
      <div className="w-14 h-14 rounded-2xl bg-teal-primary/10 dark:bg-teal-primary/20 text-teal-primary dark:text-teal-300 flex items-center justify-center mb-4 shadow-sm">
        <Icon className="w-7 h-7" />
      </div>

      <h3 className="text-base font-bold font-heading text-ink-900 dark:text-cream-100">
        {title}
      </h3>
      <p className="text-xs text-ink-600 dark:text-cream-300/80 max-w-md mx-auto mt-1 mb-6 leading-relaxed">
        {description}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        {actionLabel && (
          <Button variant="primary" size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        )}
        {secondaryActionLabel && (
          <Button variant="secondary" size="sm" onClick={onSecondaryAction}>
            {secondaryActionLabel}
          </Button>
        )}
      </div>
    </div>
  );
}

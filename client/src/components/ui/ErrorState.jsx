import React from 'react';
import { cn } from '../../utils/cn';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

export function ErrorState({
  title = 'Something went wrong',
  message = 'An unexpected error occurred while loading this section.',
  onRetry,
  className,
}) {
  return (
    <div
      className={cn(
        'bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/60 rounded-card p-6 text-center shadow-soft flex flex-col items-center justify-center my-4',
        className
      )}
      role="alert"
    >
      <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-3">
        <AlertTriangle className="w-5 h-5" />
      </div>

      <h4 className="text-sm font-bold font-heading text-rose-900 dark:text-rose-200">
        {title}
      </h4>
      <p className="text-xs text-rose-700/80 dark:text-rose-300/80 max-w-md mx-auto mt-0.5 mb-4 leading-relaxed">
        {message}
      </p>

      {onRetry && (
        <Button
          variant="secondary"
          size="xs"
          onClick={onRetry}
          icon={RefreshCw}
          className="border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300"
        >
          Try Again
        </Button>
      )}
    </div>
  );
}

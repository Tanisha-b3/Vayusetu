import React from 'react';
import { cn } from '../../utils/cn';

export function DataTable({ headers = [], children, className }) {
  return (
    <div className={cn('overflow-x-auto rounded-card border border-ink-900/[0.08] dark:border-cream-100/[0.08] bg-white dark:bg-ink-900 shadow-soft', className)}>
      <table className="w-full text-left text-xs border-collapse">
        <thead>
          <tr className="bg-cream-100/70 dark:bg-ink-950/70 border-b border-ink-900/[0.06] dark:border-cream-100/[0.06] text-ink-600 dark:text-cream-400 font-semibold uppercase tracking-wider text-[11px]">
            {headers.map((h, i) => (
              <th key={i} className={cn('py-3 px-3.5', h.className)}>
                {h.label || h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-900/[0.04] dark:divide-cream-100/[0.04] text-ink-800 dark:text-cream-200">
          {children}
        </tbody>
      </table>
    </div>
  );
}

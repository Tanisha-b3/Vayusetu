import React from 'react';
import { cn } from '../../utils/cn';

export function Tabs({ tabs = [], activeTab, onChange, className }) {
  return (
    <div
      className={cn(
        'flex items-center gap-1.5 p-1 bg-cream-200/60 dark:bg-ink-950/60 border border-ink-900/[0.06] dark:border-cream-100/[0.06] rounded-xl overflow-x-auto select-none',
        className
      )}
      role="tablist"
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;

        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={cn(
              'flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-primary',
              isActive
                ? 'bg-white dark:bg-ink-800 text-teal-primary dark:text-teal-300 shadow-soft'
                : 'text-ink-600 dark:text-cream-400 hover:text-ink-900 dark:hover:text-cream-100 hover:bg-cream-100 dark:hover:bg-ink-900/60'
            )}
          >
            {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
            <span>{tab.label}</span>
            {tab.badge != null && (
              <span
                className={cn(
                  'text-[10px] px-1.5 py-0.2 rounded-full font-bold',
                  isActive
                    ? 'bg-teal-primary/10 text-teal-primary dark:text-teal-300'
                    : 'bg-ink-900/5 dark:bg-cream-100/10 text-ink-600 dark:text-cream-400'
                )}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

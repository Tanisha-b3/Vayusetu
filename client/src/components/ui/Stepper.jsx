import React from 'react';
import { cn } from '../../utils/cn';
import { Check } from 'lucide-react';

export function Stepper({ steps = [], activeStep = 0, onStepClick, className }) {
  return (
    <div className={cn('w-full py-4', className)}>
      <div className="flex items-center justify-between max-w-2xl mx-auto">
        {steps.map((step, idx) => {
          const isCompleted = idx < activeStep;
          const isCurrent = idx === activeStep;

          return (
            <React.Fragment key={step.id || idx}>
              <div
                className={cn(
                  'flex items-center gap-2 cursor-pointer select-none group',
                  onStepClick ? 'pointer-events-auto' : 'pointer-events-none'
                )}
                onClick={() => onStepClick && onStepClick(idx)}
              >
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200 border-2',
                    isCompleted
                      ? 'bg-teal-primary text-white border-teal-primary'
                      : isCurrent
                      ? 'bg-white dark:bg-ink-900 text-teal-primary border-teal-primary shadow-sm ring-4 ring-teal-primary/10'
                      : 'bg-cream-200/80 dark:bg-ink-800 text-ink-500 dark:text-cream-400 border-transparent'
                  )}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : idx + 1}
                </div>
                <div className="hidden sm:block text-left">
                  <div
                    className={cn(
                      'text-xs font-bold font-heading leading-none',
                      isCurrent
                        ? 'text-ink-900 dark:text-cream-100'
                        : isCompleted
                        ? 'text-teal-primary dark:text-teal-400'
                        : 'text-ink-500 dark:text-cream-400'
                    )}
                  >
                    {step.title}
                  </div>
                  {step.description && (
                    <div className="text-[10px] text-ink-500 dark:text-cream-400 mt-0.5 leading-none">
                      {step.description}
                    </div>
                  )}
                </div>
              </div>

              {idx < steps.length - 1 && (
                <div
                  className={cn(
                    'flex-1 h-0.5 mx-3 transition-colors duration-200',
                    idx < activeStep
                      ? 'bg-teal-primary'
                      : 'bg-ink-900/[0.08] dark:bg-cream-100/[0.08]'
                  )}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

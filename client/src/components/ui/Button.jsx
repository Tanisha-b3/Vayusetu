import React from 'react';
import { cn } from '../../utils/cn';
import { Loader2 } from 'lucide-react';

export const Button = React.forwardRef(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled = false,
      children,
      icon: Icon,
      iconRight: IconRight,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-all duration-150 select-none rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]';

    const variants = {
      primary:
        'bg-teal-primary text-white hover:bg-teal-hover focus-visible:ring-teal-primary shadow-sm hover:shadow',
      secondary:
        'bg-white dark:bg-ink-800 text-ink-900 dark:text-cream-100 border border-ink-900/10 dark:border-cream-100/10 hover:bg-cream-50 dark:hover:bg-ink-700 shadow-soft',
      outline:
        'border border-teal-primary/40 text-teal-primary dark:text-teal-400 hover:bg-teal-primary/5 focus-visible:ring-teal-primary',
      ghost:
        'text-ink-700 dark:text-cream-200 hover:bg-ink-900/5 dark:hover:bg-cream-100/10',
      danger:
        'bg-rose-600 text-white hover:bg-rose-700 focus-visible:ring-rose-500 shadow-sm',
      editorial:
        'bg-ink-900 dark:bg-cream-100 text-cream-100 dark:text-ink-900 hover:bg-ink-800 dark:hover:bg-cream-200 font-heading font-semibold shadow-soft',
    };

    const sizes = {
      xs: 'text-xs px-2.5 py-1 gap-1.5',
      sm: 'text-xs px-3 py-1.5 gap-1.5',
      md: 'text-sm px-4 py-2 gap-2',
      lg: 'text-base px-5 py-2.5 gap-2.5 font-semibold',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
        ) : (
          Icon && <Icon className="w-4 h-4 shrink-0" />
        )}
        <span>{children}</span>
        {IconRight && !isLoading && <IconRight className="w-4 h-4 shrink-0" />}
      </button>
    );
  }
);

Button.displayName = 'Button';

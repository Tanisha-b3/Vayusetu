import React, { useEffect } from 'react';
import { cn } from '../../utils/cn';
import { X } from 'lucide-react';

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'max-w-xl',
  className,
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-ink-950/60 dark:bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Card */}
      <div
        className={cn(
          'relative w-full bg-white dark:bg-ink-900 border border-ink-900/[0.08] dark:border-cream-100/[0.1] rounded-card shadow-modal z-10 overflow-hidden transform transition-all duration-200 animate-in fade-in zoom-in-95',
          maxWidth,
          className
        )}
      >
        {/* Header */}
        {(title || onClose) && (
          <div className="p-5 pb-3 border-b border-ink-900/[0.06] dark:border-cream-100/[0.06] flex items-center justify-between">
            <div>
              {title && (
                <h3 className="text-base font-bold font-heading text-ink-900 dark:text-cream-100">
                  {title}
                </h3>
              )}
              {description && (
                <p className="text-xs text-ink-600 dark:text-cream-300 mt-0.5">
                  {description}
                </p>
              )}
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-ink-500 hover:text-ink-900 dark:text-cream-400 dark:hover:text-cream-100 hover:bg-cream-100 dark:hover:bg-ink-800 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-primary"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

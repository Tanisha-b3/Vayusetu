import React, { useEffect } from 'react';
import { cn } from '../../utils/cn';
import { X } from 'lucide-react';

export function Drawer({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'max-w-2xl',
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
      className="fixed inset-0 z-50 overflow-hidden"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-ink-950/60 dark:bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div
          className={cn(
            'w-screen bg-white dark:bg-ink-900 border-l border-ink-900/[0.08] dark:border-cream-100/[0.1] shadow-2xl flex flex-col transform transition-all duration-300 animate-in slide-in-from-right',
            maxWidth,
            className
          )}
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-ink-900/[0.06] dark:border-cream-100/[0.06] flex items-center justify-between bg-cream-50/50 dark:bg-ink-950/60">
            <div>
              {title && (
                <h3 className="text-base font-bold font-heading text-ink-900 dark:text-cream-100">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-xs text-ink-600 dark:text-cream-300 mt-0.5">
                  {subtitle}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-ink-500 hover:text-ink-900 dark:text-cream-400 dark:hover:text-cream-100 hover:bg-cream-200/60 dark:hover:bg-ink-800 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-primary"
              aria-label="Close drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6">{children}</div>
        </div>
      </div>
    </div>
  );
}

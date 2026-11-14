import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '../../utils/cn';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((toast) => {
    const id = Math.random().toString(36).slice(2, 9);
    const newToast = { id, type: 'info', duration: 4000, ...toast };
    setToasts((prev) => [...prev, newToast]);

    if (newToast.duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, newToast.duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full">
        {toasts.map((t) => {
          const icons = {
            success: CheckCircle2,
            warning: AlertTriangle,
            error: AlertCircle,
            info: Info,
          };
          const Icon = icons[t.type] || Info;

          const styles = {
            success: 'bg-emerald-50 dark:bg-emerald-950 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200',
            warning: 'bg-amber-50 dark:bg-amber-950 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200',
            error: 'bg-rose-50 dark:bg-rose-950 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200',
            info: 'bg-white dark:bg-ink-900 border-ink-900/[0.08] dark:border-cream-100/[0.1] text-ink-900 dark:text-cream-100',
          };

          return (
            <div
              key={t.id}
              className={cn(
                'pointer-events-auto p-3.5 rounded-xl border shadow-elevated flex items-start gap-3 transform transition-all animate-in slide-in-from-bottom-2 duration-200',
                styles[t.type]
              )}
            >
              <Icon className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1 text-xs">
                {t.title && <div className="font-bold font-heading">{t.title}</div>}
                <div className="opacity-90">{t.message}</div>
              </div>
              <button
                onClick={() => removeToast(t.id)}
                className="opacity-50 hover:opacity-100 transition p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    return {
      toast: (msg) => console.log('[Toast]', msg),
      addToast: (msg) => console.log('[Toast]', msg),
    };
  }
  return {
    toast: (opts) => ctx.addToast(typeof opts === 'string' ? { message: opts } : opts),
    addToast: ctx.addToast,
    removeToast: ctx.removeToast,
  };
}

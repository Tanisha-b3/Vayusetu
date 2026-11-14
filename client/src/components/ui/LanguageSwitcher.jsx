import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../../utils/cn';
import { Languages, ChevronDown, Check } from 'lucide-react';

export const INDIAN_LANGUAGES = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
  { code: 'mr', name: 'Marathi', native: 'मराठी' },
  { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'ml', name: 'Malayalam', native: 'മലയാളം' },
  { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
];

export function LanguageSwitcher({ activeLang = 'en', onChange, className }) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const current = INDIAN_LANGUAGES.find((l) => l.code === activeLang) || INDIAN_LANGUAGES[0];

  return (
    <div className={cn('relative inline-block text-left', className)} ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-ink-900/[0.08] dark:border-cream-100/[0.1] bg-white dark:bg-ink-900 text-xs font-semibold text-ink-800 dark:text-cream-200 hover:bg-cream-50 dark:hover:bg-ink-800 shadow-soft transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-primary"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <Languages className="w-3.5 h-3.5 text-teal-primary dark:text-teal-400" />
        <span>{current.native} ({current.name})</span>
        <ChevronDown className="w-3.5 h-3.5 text-ink-400 dark:text-cream-400" />
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-48 rounded-xl bg-white dark:bg-ink-900 border border-ink-900/[0.08] dark:border-cream-100/[0.1] shadow-elevated z-50 py-1.5 overflow-hidden animate-in fade-in zoom-in-95"
          role="menu"
        >
          <div className="px-3 py-1.5 text-[10px] uppercase font-bold tracking-wider text-ink-500 dark:text-cream-400 border-b border-ink-900/[0.06] dark:border-cream-100/[0.06]">
            Select Civic Language
          </div>
          <div className="max-h-60 overflow-y-auto py-1">
            {INDIAN_LANGUAGES.map((lang) => {
              const isSelected = lang.code === activeLang;
              return (
                <button
                  key={lang.code}
                  onClick={() => {
                    onChange(lang.code);
                    setIsOpen(false);
                  }}
                  className={cn(
                    'w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-cream-100 dark:hover:bg-ink-800 transition',
                    isSelected
                      ? 'font-bold text-teal-primary dark:text-teal-300 bg-teal-primary/5 dark:bg-teal-primary/10'
                      : 'text-ink-700 dark:text-cream-200'
                  )}
                  role="menuitem"
                >
                  <span className="font-devanagari">{lang.native} <span className="text-[11px] font-normal opacity-70">({lang.name})</span></span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-teal-primary" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

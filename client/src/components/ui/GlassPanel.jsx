import React from 'react';

/**
 * GlassPanel
 * Core component for The Air Observatory.
 * Backdrop blur at 16px, 1px inner highlight, and hairline border.
 */
export function GlassPanel({
  children,
  className = '',
  hoverEffect = false,
  onClick,
  ...props
}) {
  return (
    <div
      onClick={onClick}
      className={`glass-panel rounded-2xl p-6 transition-all duration-200 relative overflow-hidden ${
        hoverEffect
          ? 'hover:border-obs-teal/40 hover:shadow-elevated hover:-translate-y-0.5'
          : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

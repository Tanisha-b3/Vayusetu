import React, { useState } from 'react';

/**
 * Tooltip
 * Accessible hover/focus tooltip with 180ms ease.
 */
export function Tooltip({
  content,
  children,
  position = 'top',
  className = '',
}) {
  const [visible, setVisible] = useState(false);

  const posClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div
      className={`relative inline-flex items-center ${className}`}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}
      {visible && content && (
        <div
          role="tooltip"
          className={`absolute ${posClasses[position] || posClasses.top} z-50 px-2.5 py-1 text-xs font-medium text-obs-canvas bg-obs-ink rounded-lg shadow-elevated whitespace-nowrap pointer-events-none transition-all duration-150 animate-in fade-in`}
        >
          {content}
        </div>
      )}
    </div>
  );
}

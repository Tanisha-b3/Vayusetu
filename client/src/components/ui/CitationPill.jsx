import React from 'react';

/**
 * CitationPill: Signature Element 3 (Evidence Thread)
 * Small citation pill [R4]. On hover, emits an evidence thread highlight.
 * On click, triggers opening the Evidence Drawer.
 */
export function CitationPill({
  id,
  onClick,
  active = false,
  className = '',
}) {
  const displayId = id.startsWith('[') ? id : `[${id}]`;

  const handleClick = (e) => {
    e.stopPropagation();
    if (onClick) onClick(id);
    // Dispatch global custom event for interactive thread lines if active on screen
    window.dispatchEvent(
      new CustomEvent('vayusetu:citation-click', { detail: { id } })
    );
  };

  const handleMouseEnter = () => {
    window.dispatchEvent(
      new CustomEvent('vayusetu:citation-hover', { detail: { id, hover: true } })
    );
  };

  const handleMouseLeave = () => {
    window.dispatchEvent(
      new CustomEvent('vayusetu:citation-hover', { detail: { id, hover: false } })
    );
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      data-citation-id={id}
      aria-label={`Inspect evidence row ${id}`}
      className={`inline-flex items-center px-1.5 py-0.5 mx-0.5 rounded-md font-mono text-[11px] font-bold tracking-tight transition-all duration-150 cursor-pointer select-none ${
        active
          ? 'bg-obs-teal text-obs-canvas shadow-xs scale-105 ring-1 ring-obs-teal'
          : 'bg-[#EEF2F6] dark:bg-obs-surface text-obs-teal border border-obs-hairline hover:bg-obs-teal hover:text-white dark:hover:text-obs-canvas hover:scale-105'
      } ${className}`}
    >
      <span>{displayId}</span>
    </button>
  );
}

import React from 'react';

/**
 * IconButton
 * Circular or rounded icon button with consistent 1.5px stroke, accessible focus rings and tooltip aria.
 */
export function IconButton({
  icon: Icon,
  label,
  onClick,
  variant = 'ghost', // 'ghost' | 'outline' | 'filled'
  size = 'md', // 'sm' | 'md' | 'lg'
  disabled = false,
  className = '',
  ...props
}) {
  const sizeMap = {
    sm: 'w-8 h-8 p-1.5',
    md: 'w-9 h-9 p-2',
    lg: 'w-11 h-11 p-2.5',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-4.5 h-4.5',
    lg: 'w-5 h-5',
  };

  const variantMap = {
    ghost:
      'text-obs-muted hover:text-obs-ink hover:bg-obs-hairline/60 active:bg-obs-hairline',
    outline:
      'border border-obs-hairline text-obs-ink hover:border-obs-teal hover:text-obs-teal bg-obs-surface/60',
    filled:
      'bg-obs-teal text-obs-canvas hover:bg-obs-teal-hover shadow-xs',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`inline-flex items-center justify-center rounded-xl transition-all duration-150 select-none disabled:opacity-40 disabled:cursor-not-allowed ${sizeMap[size] || sizeMap.md} ${variantMap[variant] || variantMap.ghost} ${className}`}
      {...props}
    >
      {Icon && <Icon className={`${iconSizes[size] || iconSizes.md} stroke-[1.5]`} />}
    </button>
  );
}

import React from 'react';

/**
 * Sparkline
 * Precision SVG sparkline with fill gradient and peak marker.
 */
export function Sparkline({
  data = [],
  width = 120,
  height = 36,
  color = '#2DD4BF',
  peakColor = '#F28C28',
  className = '',
}) {
  if (!data || data.length < 2) {
    return (
      <div
        className={`flex items-center justify-center text-[10px] text-obs-muted ${className}`}
        style={{ width, height }}
      >
        --
      </div>
    );
  }

  const values = data.map((d) => (typeof d === 'number' ? d : d.value ?? 0));
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  // Build SVG path coordinates with padding
  const padding = 3;
  const innerW = width - padding * 2;
  const innerH = height - padding * 2;

  const points = values.map((val, idx) => {
    const x = padding + (idx / (values.length - 1)) * innerW;
    const y = height - padding - ((val - min) / range) * innerH;
    return { x, y, val, idx };
  });

  const pathD = points.reduce((acc, pt, i) => {
    if (i === 0) return `M ${pt.x} ${pt.y}`;
    // Simple smooth bezier
    const prev = points[i - 1];
    const cx = (prev.x + pt.x) / 2;
    return `${acc} C ${cx} ${prev.y}, ${cx} ${pt.y}, ${pt.x} ${pt.y}`;
  }, '');

  // Fill area path
  const areaD = `${pathD} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;

  // Find peak point
  const peak = points.reduce((prev, curr) => (curr.val > prev.val ? curr : prev), points[0]);

  const gradId = `spark-grad-${Math.random().toString(36).substring(2, 7)}`;

  return (
    <svg
      width={width}
      height={height}
      className={`overflow-visible select-none ${className}`}
      viewBox={`0 0 ${width} ${height}`}
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0.0" />
        </linearGradient>
      </defs>

      {/* Area fill */}
      <path d={areaD} fill={`url(#${gradId})`} />

      {/* Line path */}
      <path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Peak dot marker */}
      <circle
        cx={peak.x}
        cy={peak.y}
        r="2.5"
        fill={peakColor}
        stroke="#FFFFFF"
        strokeWidth="1"
      />
    </svg>
  );
}

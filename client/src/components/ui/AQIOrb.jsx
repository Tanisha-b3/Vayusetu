import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

/**
 * AQI Orb: Signature Element 1
 * A soft-glowing orb whose colour, size, turbulence, and particle density follow the current CPCB band.
 * It is the hero of the overview and a small version is the loading indicator everywhere.
 *
 * Bands: Good, Satisfactory, Moderate, Poor, Very Poor, Severe
 */

const BAND_CONFIGS = {
  Good: {
    color: '#3DBE6B',
    secondary: '#10B981',
    glow: 'rgba(61, 190, 107, 0.45)',
    particles: 12,
    turbulence: 0.015,
    speed: 0.8,
    label: 'Good',
  },
  Satisfactory: {
    color: '#A3CF4A',
    secondary: '#84CC16',
    glow: 'rgba(163, 207, 74, 0.45)',
    particles: 18,
    turbulence: 0.02,
    speed: 1.0,
    label: 'Satisfactory',
  },
  Moderate: {
    color: '#F2C230',
    secondary: '#EAB308',
    glow: 'rgba(242, 194, 48, 0.5)',
    particles: 26,
    turbulence: 0.03,
    speed: 1.3,
    label: 'Moderate',
  },
  Poor: {
    color: '#F28C28',
    secondary: '#F97316',
    glow: 'rgba(242, 140, 40, 0.55)',
    particles: 38,
    turbulence: 0.045,
    speed: 1.6,
    label: 'Poor',
  },
  'Very Poor': {
    color: '#E5483D',
    secondary: '#EF4444',
    glow: 'rgba(229, 72, 61, 0.65)',
    particles: 50,
    turbulence: 0.06,
    speed: 2.0,
    label: 'Very Poor',
  },
  Severe: {
    color: '#9B1C3B',
    secondary: '#881337',
    glow: 'rgba(155, 28, 59, 0.75)',
    particles: 65,
    turbulence: 0.08,
    speed: 2.5,
    label: 'Severe',
  },
};

export function AQIOrb({
  band = 'Moderate',
  aqi = 150,
  size = 'hero', // 'hero' | 'md' | 'sm' | 'indicator'
  interactive = true,
  className = '',
  loading = false,
}) {
  const canvasRef = useRef(null);
  const cfg = BAND_CONFIGS[band] || BAND_CONFIGS.Moderate;

  // Set the CSS variable on root for living haze sync
  useEffect(() => {
    document.documentElement.style.setProperty('--orb-glow-color', cfg.glow);
  }, [cfg]);

  // Dimensions based on size
  const sizeMap = {
    hero: { px: 280, canvasPx: 560 },
    md: { px: 160, canvasPx: 320 },
    sm: { px: 80, canvasPx: 160 },
    indicator: { px: 32, canvasPx: 64 },
  };

  const currentSize = sizeMap[size] || sizeMap.hero;

  // Particle simulation loop on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId;
    let time = 0;
    const count = cfg.particles;
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = width * 0.32;

    // Initialize particles
    const particles = Array.from({ length: count }, () => ({
      angle: Math.random() * Math.PI * 2,
      dist: radius * (0.2 + Math.random() * 0.8),
      speed: (0.005 + Math.random() * 0.01) * cfg.speed,
      size: (1.5 + Math.random() * 3.5) * (width / 280),
      alpha: 0.2 + Math.random() * 0.6,
      wobbleSpeed: 0.02 + Math.random() * 0.03,
    }));

    const render = () => {
      time += 1;
      ctx.clearRect(0, 0, width, height);

      // 1. Draw outer soft radial glow
      const glowGrad = ctx.createRadialGradient(
        centerX,
        centerY,
        radius * 0.2,
        centerX,
        centerY,
        radius * 1.5
      );
      glowGrad.addColorStop(0, cfg.color);
      glowGrad.addColorStop(0.5, cfg.secondary);
      glowGrad.addColorStop(0.85, cfg.glow);
      glowGrad.addColorStop(1, 'transparent');

      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 1.5, 0, Math.PI * 2);
      ctx.fill();

      // 2. Core inner luminous orb with organic turbulence wave
      const coreGrad = ctx.createRadialGradient(
        centerX - radius * 0.25,
        centerY - radius * 0.25,
        radius * 0.05,
        centerX,
        centerY,
        radius
      );
      coreGrad.addColorStop(0, '#FFFFFF');
      coreGrad.addColorStop(0.2, cfg.color);
      coreGrad.addColorStop(0.7, cfg.secondary);
      coreGrad.addColorStop(1, 'rgba(0,0,0,0.2)');

      ctx.save();
      ctx.beginPath();
      // Deformed circle with sine wave wobble
      const steps = 60;
      for (let i = 0; i <= steps; i++) {
        const theta = (i / steps) * Math.PI * 2;
        const wave = Math.sin(theta * 3 + time * cfg.turbulence * 3) * (radius * 0.06);
        const r = radius + wave;
        const x = centerX + Math.cos(theta) * r;
        const y = centerY + Math.sin(theta) * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fillStyle = coreGrad;
      ctx.shadowColor = cfg.color;
      ctx.shadowBlur = radius * 0.4;
      ctx.fill();
      ctx.restore();

      // 3. Render moving atmospheric particulate density
      particles.forEach((p) => {
        p.angle += p.speed;
        const wobble = Math.sin(time * p.wobbleSpeed) * 8;
        const currentDist = p.dist + wobble;
        const px = centerX + Math.cos(p.angle) * currentDist;
        const py = centerY + Math.sin(p.angle) * currentDist;

        ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, [cfg, currentSize]);

  return (
    <div
      className={`relative flex items-center justify-center select-none ${className}`}
      style={{ width: currentSize.px, height: currentSize.px }}
      role="img"
      aria-label={`Air Quality Orb representing ${band} band with AQI ${aqi}`}
    >
      {/* SVG noise texture overlay filter */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30 mix-blend-overlay">
        <filter id="orbNoise">
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#orbNoise)" />
      </svg>

      <canvas
        ref={canvasRef}
        width={currentSize.canvasPx}
        height={currentSize.canvasPx}
        className="w-full h-full transform-gpu"
        style={{
          filter: size === 'indicator' ? 'blur(0.5px)' : 'blur(1px)',
        }}
      />

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-white/60 border-t-transparent animate-spin" />
        </div>
      )}
    </div>
  );
}

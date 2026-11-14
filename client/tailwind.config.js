/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./client/index.html",
    "./client/src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // "The Air Observatory" Canvas & Surfaces
        obs: {
          canvas: 'var(--obs-canvas)',
          surface: 'var(--obs-surface)',
          raised: 'var(--obs-raised)',
          hairline: 'var(--obs-hairline)',
          ink: 'var(--obs-ink)',
          muted: 'var(--obs-muted)',
          subtle: 'var(--obs-subtle)',
          teal: 'var(--obs-teal)',
          'teal-glow': 'var(--obs-teal-glow)',
          amber: 'var(--obs-amber)',
        },
        // Legacy compatibility aliases
        cream: {
          50: '#FAF8F5',
          100: '#F6F3EC', // Light mode canvas
          200: '#EFECE4',
          300: '#E2DDCF',
        },
        ink: {
          950: '#0B1210', // Dark mode canvas
          900: '#121C19', // Dark mode surface
          800: '#1A2723', // Dark mode raised
          700: '#2A3A35', // Dark mode hairline
          600: '#526962',
          500: '#7E9790',
        },
        'teal-primary': 'var(--obs-teal)',
        'teal-hover': 'var(--obs-teal-hover)',

        // CPCB Band Standard Colors (Prompt 0)
        cpcb: {
          good: '#3DBE6B',
          satisfactory: '#A3CF4A',
          moderate: '#F2C230',
          poor: '#F28C28',
          verypoor: '#E5483D',
          severe: '#9B1C3B',
        },
        aqi: {
          good: '#3DBE6B',
          satisfactory: '#A3CF4A',
          moderate: '#F2C230',
          poor: '#F28C28',
          verypoor: '#E5483D',
          severe: '#9B1C3B',
        },
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        heading: ['Fraunces', 'Inter Tight', 'sans-serif'],
        ui: ['"Inter Tight"', 'Geist', 'Inter', 'sans-serif'],
        body: ['"Inter Tight"', 'Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
        devanagari: ['"Noto Sans Devanagari"', 'Inter', 'sans-serif'],
        tamil: ['"Noto Sans Tamil"', 'sans-serif'],
        bengali: ['"Noto Sans Bengali"', 'sans-serif'],
        telugu: ['"Noto Sans Telugu"', 'sans-serif'],
      },
      borderRadius: {
        'sm': '8px',
        'md': '14px',
        'lg': '20px',
        'xl': '28px',
        '2xl': '28px',
        'card': '20px',
      },
      boxShadow: {
        'soft': '0 2px 20px -4px rgba(0, 0, 0, 0.25)',
        'elevated': '0 12px 32px -8px rgba(0, 0, 0, 0.4)',
        'glass': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.08), 0 8px 32px 0 rgba(0, 0, 0, 0.35)',
        'glass-light': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.6), 0 4px 20px 0 rgba(16, 32, 28, 0.06)',
        'orb': '0 0 80px -10px var(--orb-glow-color)',
      },
      transitionTimingFunction: {
        'observatory': 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      animation: {
        'orb-drift': 'orbDrift 24s ease-in-out infinite alternate',
        'stamp-press': 'stampPress 0.35s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'pulse-glow': 'pulseGlow 4s ease-in-out infinite',
      },
      keyframes: {
        orbDrift: {
          '0%': { transform: 'scale(1) translate(0, 0)' },
          '50%': { transform: 'scale(1.04) translate(-2%, 2%)' },
          '100%': { transform: 'scale(0.98) translate(2%, -1%)' },
        },
        stampPress: {
          '0%': { transform: 'scale(1.25) rotate(-4deg)', opacity: '0.4' },
          '70%': { transform: 'scale(0.95) rotate(-1deg)', opacity: '1' },
          '100%': { transform: 'scale(1) rotate(-2deg)', opacity: '1' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '0.95' },
        },
      },
    },
  },
  plugins: [],
};

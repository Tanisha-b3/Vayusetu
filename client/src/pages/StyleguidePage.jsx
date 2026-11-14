import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Wind,
  Sun,
  Moon,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Flame,
  AlertOctagon,
  AlertCircle,
  FileText,
  RotateCcw,
} from 'lucide-react';
import {
  Button,
  IconButton,
  Card,
  GlassPanel,
  AQIBadge,
  AQIOrb,
  ConfidenceBadge,
  VerifiedStamp,
  CitationPill,
  Sparkline,
  CountUp,
  Tooltip,
  Tabs,
  ProgressRing,
  Skeleton,
  EmptyState,
  ErrorState,
} from '../components/ui';

export default function StyleguidePage() {
  const [isDark, setIsDark] = useState(true);
  const [selectedBand, setSelectedBand] = useState('Poor');
  const [verifiedCount, setVerifiedCount] = useState(18);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  const bands = ['Good', 'Satisfactory', 'Moderate', 'Poor', 'Very Poor', 'Severe'];

  const sampleSparkData = [45, 52, 48, 65, 88, 120, 145, 118, 95];

  return (
    <div className="min-h-screen bg-obs-canvas text-obs-ink p-6 sm:p-12 transition-colors duration-300 relative">
      <div className="living-haze-bg" />

      {/* Top Header */}
      <header className="relative z-10 max-w-6xl mx-auto flex items-center justify-between pb-8 border-b border-obs-hairline">
        <div className="flex items-center gap-3">
          <Link to="/app/dashboard" className="p-2 rounded-xl border border-obs-hairline hover:bg-obs-surface transition-colors">
            <ArrowLeft className="w-4 h-4 text-obs-muted" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-2xl tracking-tight text-obs-ink">
                VayuSetu
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-obs-teal/20 text-obs-teal font-mono uppercase font-bold">
                The Air Observatory Design System
              </span>
            </div>
            <p className="text-xs text-obs-muted mt-0.5">
              Live component catalog across Dark Default (#0B1210) and Light Mode (#F6F3EC).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={toggleTheme}>
            {isDark ? <Sun className="w-4 h-4 text-amber-400 mr-1.5" /> : <Moon className="w-4 h-4 mr-1.5" />}
            <span>{isDark ? 'Switch to Light' : 'Switch to Dark'}</span>
          </Button>
          <Link to="/app/dashboard">
            <Button variant="primary" size="sm">
              Open Studio
            </Button>
          </Link>
        </div>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto py-10 space-y-12">
        {/* SECTION 1: Signature Elements */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-bold text-obs-ink">
              1. Signature Identity Elements
            </h2>
            <div className="flex items-center gap-1.5">
              {bands.map((b) => (
                <button
                  key={b}
                  onClick={() => setSelectedBand(b)}
                  className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all ${
                    selectedBand === b
                      ? 'bg-obs-teal text-obs-canvas font-bold'
                      : 'bg-obs-surface text-obs-muted hover:text-obs-ink'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Signature 1: AQI Orb */}
            <GlassPanel className="flex flex-col items-center text-center space-y-4">
              <span className="text-xs font-mono font-bold text-obs-muted uppercase">
                AQI Orb ({selectedBand})
              </span>
              <AQIOrb band={selectedBand} aqi={224} size="md" />
              <div className="flex items-center gap-3">
                <AQIOrb band={selectedBand} size="sm" />
                <AQIOrb band={selectedBand} size="indicator" loading />
                <span className="text-[11px] text-obs-muted">Hero, Medium & Indicator</span>
              </div>
            </GlassPanel>

            {/* Signature 2: Verified Stamp & Citations */}
            <GlassPanel className="flex flex-col justify-between space-y-4">
              <div>
                <span className="text-xs font-mono font-bold text-obs-muted uppercase block mb-3">
                  Verified Stamp & Evidence Pills
                </span>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <VerifiedStamp
                      verified={verifiedCount}
                      total={19}
                      onClick={() => setVerifiedCount((prev) => (prev === 19 ? 18 : 19))}
                    />
                    <span className="text-[10px] text-obs-muted">Click to toggle press</span>
                  </div>

                  <p className="text-xs text-obs-ink leading-relaxed">
                    "Hamidia Road registered PM2.5 of 118 µg/m³{' '}
                    <CitationPill id="R12" onClick={(id) => alert(`Opened Evidence Drawer for ${id}`)} />{' '}
                    while Arera sensor stalled at zero{' '}
                    <CitationPill id="R18" active />."
                  </p>
                </div>
              </div>
              <p className="text-[11px] text-obs-teal font-mono">
                ✓ Sentence cited row, value & station verified in code
              </p>
            </GlassPanel>

            {/* Signature 3: Big Editorial Numbers with Count-up */}
            <GlassPanel className="flex flex-col justify-between space-y-4">
              <div>
                <span className="text-xs font-mono font-bold text-obs-muted uppercase block mb-2">
                  Big Editorial Numbers
                </span>
                <div className="space-y-2">
                  <div>
                    <span className="text-xs text-obs-muted uppercase tracking-wider block">Station AQI</span>
                    <CountUp value={224} duration={1400} className="text-5xl font-bold text-obs-ink" />
                  </div>
                  <div>
                    <span className="text-xs text-obs-muted uppercase tracking-wider block">Data Usability</span>
                    <CountUp value={94.2} decimals={1} suffix="%" duration={1200} className="text-3xl font-bold text-cpcb-good" />
                  </div>
                </div>
              </div>
              <div className="text-[11px] text-obs-muted">
                Font: Fraunces display serif with tabular-nums
              </div>
            </GlassPanel>
          </div>
        </section>

        {/* SECTION 2: CPCB Colorblind Safe Badges */}
        <section className="space-y-4">
          <h2 className="font-display text-xl font-bold text-obs-ink">
            2. CPCB Scale (Icon + Text Label + Color)
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {bands.map((band) => (
              <GlassPanel key={band} className="p-4 text-center space-y-2">
                <AQIBadge band={band} showRange size="md" />
                <span className="block text-[10px] font-mono text-obs-muted uppercase">
                  {band === 'Good' ? '#3DBE6B' : band === 'Satisfactory' ? '#A3CF4A' : band === 'Moderate' ? '#F2C230' : band === 'Poor' ? '#F28C28' : band === 'Very Poor' ? '#E5483D' : '#9B1C3B'}
                </span>
              </GlassPanel>
            ))}
          </div>
        </section>

        {/* SECTION 3: Component Library */}
        <section className="space-y-4">
          <h2 className="font-display text-xl font-bold text-obs-ink">
            3. Foundation Component Library
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Buttons & Icons */}
            <GlassPanel className="space-y-4">
              <span className="text-xs font-mono font-bold text-obs-muted uppercase">
                Buttons & IconButtons
              </span>
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="primary">Primary Action</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
              </div>
              <div className="flex items-center gap-2 pt-2 border-t border-obs-hairline">
                <IconButton icon={Wind} label="Wind" variant="filled" />
                <IconButton icon={ShieldCheck} label="Verify" variant="outline" />
                <IconButton icon={Sparkles} label="AI" variant="ghost" />
                <IconButton icon={RotateCcw} label="Refresh" variant="ghost" />
              </div>
            </GlassPanel>

            {/* Sparklines & Confidence Badges */}
            <GlassPanel className="space-y-4">
              <span className="text-xs font-mono font-bold text-obs-muted uppercase">
                Sparklines & Confidence Badges
              </span>
              <div className="flex items-center justify-between p-3 rounded-xl bg-obs-surface border border-obs-hairline">
                <div>
                  <span className="text-xs font-bold block">Hamidia 24h Trend</span>
                  <ConfidenceBadge confidence="High" />
                </div>
                <Sparkline data={sampleSparkData} width={140} height={32} />
              </div>

              <div className="flex items-center gap-3">
                <ConfidenceBadge confidence="High" />
                <ConfidenceBadge confidence="Medium" />
                <ConfidenceBadge confidence="Low" />
              </div>
            </GlassPanel>
          </div>
        </section>

        {/* SECTION 4: Indian Multi-Script Support */}
        <section className="space-y-4">
          <h2 className="font-display text-xl font-bold text-obs-ink">
            4. Indian Typography & Script Fidelity
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <GlassPanel className="space-y-2">
              <span className="text-xs font-mono text-obs-teal font-bold uppercase">Devanagari (Hindi / Marathi)</span>
              <p className="font-devanagari text-base leading-relaxed">
                वायुसेतु: नगर निगम वार्डों के लिए सत्यापित वायु गुणवत्ता निर्णय प्रणाली।
              </p>
            </GlassPanel>

            <GlassPanel className="space-y-2">
              <span className="text-xs font-mono text-obs-teal font-bold uppercase">Tamil (தமிழ்)</span>
              <p className="font-tamil text-base leading-relaxed">
                வாயுசேது: நகராட்சி வார்டுகளுக்கான காற்றுத் தர மேலாண்மை அமைப்பு.
              </p>
            </GlassPanel>

            <GlassPanel className="space-y-2">
              <span className="text-xs font-mono text-obs-teal font-bold uppercase">English (Geist / Inter Tight)</span>
              <p className="font-ui text-base leading-relaxed">
                The Air Observatory: calm, precise instrument that makes invisible air visible.
              </p>
            </GlassPanel>
          </div>
        </section>
      </main>
    </div>
  );
}

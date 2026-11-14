import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Wind,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  FileSpreadsheet,
  MapPin,
  FileText,
  Volume2,
  VolumeX,
  Languages,
  Check,
  Building2,
  School,
  Home,
  UserCheck,
  Sliders,
  History,
  Activity,
  Layers,
  ChevronRight,
  ExternalLink,
  Info,
  Clock,
  Sparkle,
  Sun,
  Moon,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { Badge, AQIBadge, ConfidenceBadge, Button } from '../components/ui';

export default function LandingPage() {
  const navigate = useNavigate();
  const { demoLogin, isAuthenticated } = useAuthStore();
  const [selectedAudience, setSelectedAudience] = useState('ward');
  const [selectedLang, setSelectedLang] = useState('en');
  const [readingLevel, setReadingLevel] = useState('standard');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isDark, setIsDark] = useState(false);

  // Toggle Theme
  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  const handleLaunchDemo = (role = 'ward_officer') => {
    demoLogin(role);
    navigate('/app/dashboard');
  };

  // Multilingual sample advisories
  const sampleAdvisories = {
    en: {
      standard:
        'Air Quality in Ward 42 has crossed Moderate levels into Poor (AQI 224, PM2.5: 118 Âµg/mÂ³). Outdoor municipal sweepers must deploy wet-mist dampening along Hamidia Road immediately [R12]. Residents with asthma and young children should avoid unmasked morning exertion.',
      simple:
        'The air outside today is unhealthy to breathe. If you have breathing trouble or elders at home, keep windows shut between 6 AM and 10 AM. Wear a mask if stepping onto dusty main roads.',
    },
    hi: {
      standard:
        'à¤µà¤¾à¤°à¥à¤¡ 42 à¤®à¥‡à¤‚ à¤µà¤¾à¤¯à¥ à¤—à¥à¤£à¤µà¤¤à¥à¤¤à¤¾ à¤®à¤§à¥à¤¯à¤® à¤¸à¥à¤¤à¤° à¤•à¥‹ à¤ªà¤¾à¤° à¤•à¤° "à¤–à¤°à¤¾à¤¬" à¤¶à¥à¤°à¥‡à¤£à¥€ (AQI 224, PM2.5: 118 Âµg/mÂ³) à¤®à¥‡à¤‚ à¤ªà¤¹à¥à¤‚à¤š à¤—à¤ˆ à¤¹à¥ˆà¥¤ à¤¹à¤®à¥€à¤¦à¤¿à¤¯à¤¾ à¤°à¥‹à¤¡ à¤ªà¤° à¤¨à¤—à¤° à¤¨à¤¿à¤—à¤® à¤¦à¥à¤µà¤¾à¤°à¤¾ à¤¤à¤¤à¥à¤•à¤¾à¤² à¤ªà¤¾à¤¨à¥€ à¤•à¤¾ à¤›à¤¿à¤¡à¤¼à¤•à¤¾à¤µ à¤•à¤¿à¤¯à¤¾ à¤œà¤¾à¤¨à¤¾ à¤šà¤¾à¤¹à¤¿à¤ [R12]à¥¤ à¤…à¤¸à¥à¤¥à¤®à¤¾ à¤ªà¥€à¤¡à¤¼à¤¿à¤¤ à¤”à¤° à¤¬à¤šà¥à¤šà¥‡ à¤¸à¥à¤¬à¤¹ à¤¬à¤¾à¤¹à¤° à¤œà¤¾à¤¨à¥‡ à¤¸à¥‡ à¤¬à¤šà¥‡à¤‚à¥¤',
      simple:
        'à¤†à¤œ à¤¹à¤µà¤¾ à¤®à¥‡à¤‚ à¤§à¥‚à¤² à¤”à¤° à¤§à¥à¤†à¤‚ à¤œà¥à¤¯à¤¾à¤¦à¤¾ à¤¹à¥ˆà¥¤ à¤¬à¥à¤œà¥à¤°à¥à¤— à¤”à¤° à¤¬à¤šà¥à¤šà¥‡ à¤¸à¥à¤¬à¤¹ à¤Ÿà¤¹à¤²à¤¨à¥‡ à¤¸à¥‡ à¤¬à¤šà¥‡à¤‚à¥¤ à¤˜à¤° à¤•à¥€ à¤–à¤¿à¤¡à¤¼à¤•à¤¿à¤¯à¤¾à¤‚ à¤¬à¤‚à¤¦ à¤°à¤–à¥‡à¤‚ à¤”à¤° à¤¬à¤¾à¤¹à¤° à¤¨à¤¿à¤•à¤²à¤¤à¥‡ à¤¸à¤®à¤¯ à¤®à¤¾à¤¸à¥à¤• à¤…à¤µà¤¶à¥à¤¯ à¤ªà¤¹à¤¨à¥‡à¤‚à¥¤',
    },
    mr: {
      standard:
        'à¤ªà¥à¤°à¤­à¤¾à¤— à¤•à¥à¤°. 42 à¤®à¤§à¥€à¤² à¤¹à¤µà¥‡à¤šà¥€ à¤—à¥à¤£à¤µà¤¤à¥à¤¤à¤¾ "à¤…à¤¸à¥à¤µà¤¸à¥à¤¥" à¤¶à¥à¤°à¥‡à¤£à¥€à¤¤ (AQI 224, PM2.5: 118 Âµg/mÂ³) à¤ªà¥‹à¤¹à¥‹à¤šà¤²à¥€ à¤†à¤¹à¥‡. à¤¹à¤®à¥€à¤¦à¤¿à¤¯à¤¾ à¤®à¤¾à¤°à¥à¤—à¤¾à¤µà¤° à¤¤à¤¾à¤¤à¥à¤•à¤¾à¤³ à¤§à¥‚à¤³ à¤ªà¥à¤°à¤¤à¤¿à¤¬à¤‚à¤§à¤• à¤ªà¤¾à¤£à¥à¤¯à¤¾à¤šà¥‡ à¤«à¤µà¤¾à¤°à¥‡ à¤®à¤¾à¤°à¤¾à¤µà¥‡à¤¤ [R12]. à¤¶à¥à¤µà¤¸à¤¨à¤¾à¤šà¥‡ à¤µà¤¿à¤•à¤¾à¤° à¤…à¤¸à¤²à¥‡à¤²à¥à¤¯à¤¾ à¤¨à¤¾à¤—à¤°à¤¿à¤•à¤¾à¤‚à¤¨à¥€ à¤µ à¤¬à¤¾à¤²à¤•à¤¾à¤‚à¤¨à¥€ à¤¬à¤¾à¤¹à¥‡à¤° à¤«à¤¿à¤°à¤£à¥‡ à¤Ÿà¤¾à¤³à¤¾à¤µà¥‡.',
      simple:
        'à¤†à¤œ à¤¹à¤µà¥‡à¤¤à¥€à¤² à¤ªà¥à¤°à¤¦à¥‚à¤·à¤£ à¤µà¤¾à¤¢à¤²à¥‡ à¤†à¤¹à¥‡. à¤²à¤¹à¤¾à¤¨ à¤®à¥à¤²à¥‡ à¤†à¤£à¤¿ à¤µà¥ƒà¤¦à¥à¤§ à¤µà¥à¤¯à¤•à¥à¤¤à¥€à¤‚à¤¨à¥€ à¤¸à¤•à¤¾à¤³à¥€ à¤®à¥‹à¤•à¤³à¥à¤¯à¤¾ à¤¹à¤µà¥‡à¤¤ à¤œà¤¾à¤£à¥‡ à¤Ÿà¤¾à¤³à¤¾à¤µà¥‡. à¤˜à¤°à¤¾à¤¬à¤¾à¤¹à¥‡à¤° à¤ªà¤¡à¤¤à¤¾à¤¨à¤¾ à¤®à¤¾à¤¸à¥à¤• à¤µà¤¾à¤ªà¤°à¤¾.',
    },
    ta: {
      standard:
        'à®µà®¾à®°à¯à®Ÿà¯ 42-à®²à¯ à®•à®¾à®±à¯à®±à®¿à®©à¯ à®¤à®°à®®à¯ "à®®à¯‹à®šà®®à®¾à®©à®¤à¯" à®Žà®©à¯à®± à®¨à®¿à®²à¯ˆà®¯à¯ˆ à®Žà®Ÿà¯à®Ÿà®¿à®¯à¯à®³à¯à®³à®¤à¯ (AQI 224, PM2.5: 118 Âµg/mÂ³). à®¹à®®à®¿à®¤à®¿à®¯à®¾ à®šà®¾à®²à¯ˆà®¯à®¿à®²à¯ à®‰à®Ÿà®©à®Ÿà®¿à®¯à®¾à®• à®¨à¯€à®°à¯à®¤à¯à®¤à¯à®³à®¿à®•à®³à¯ à®¤à¯†à®³à®¿à®•à¯à®•à®ªà¯à®ªà®Ÿ à®µà¯‡à®£à¯à®Ÿà¯à®®à¯ [R12]. à®†à®¸à¯à®¤à¯à®®à®¾ à®ªà®¾à®¤à®¿à®ªà¯à®ªà¯ à®‰à®³à¯à®³à®µà®°à¯à®•à®³à¯ à®•à®¾à®²à¯ˆ à®¨à®Ÿà¯ˆà®ªà¯à®ªà®¯à®¿à®±à¯à®šà®¿à®¯à¯ˆ à®¤à®µà®¿à®°à¯à®•à¯à®•à®µà¯à®®à¯.',
      simple:
        'à®‡à®©à¯à®±à¯ˆà®¯ à®•à®¾à®±à¯à®±à¯ à®šà¯à®µà®¾à®šà®¿à®•à¯à®• à®¨à®²à¯à®²à®¤à®²à¯à®². à®•à¯à®´à®¨à¯à®¤à¯ˆà®•à®³à¯ à®®à®±à¯à®±à¯à®®à¯ à®®à¯à®¤à®¿à®¯à®µà®°à¯à®•à®³à¯ à®•à®¾à®²à¯ˆà®¯à®¿à®²à¯ à®µà¯†à®³à®¿à®¯à¯‡ à®šà¯†à®²à¯à®µà®¤à¯ˆ à®¤à®µà®¿à®°à¯à®•à¯à®•à®µà¯à®®à¯. à®¤à¯‚à®šà®¿ à®¨à®¿à®±à¯ˆà®¨à¯à®¤ à®‡à®Ÿà®™à¯à®•à®³à¯à®•à¯à®•à¯à®šà¯ à®šà¯†à®²à¯à®²à¯à®®à¯à®ªà¯‹à®¤à¯ à®®à¯à®•à®•à¯à®•à®µà®šà®®à¯ à®…à®£à®¿à®¯à¯à®™à¯à®•à®³à¯.',
    },
  };

  // Text-to-speech handler
  const handleReadAloud = () => {
    if ('speechSynthesis' in window) {
      if (isPlayingAudio) {
        window.speechSynthesis.cancel();
        setIsPlayingAudio(false);
        return;
      }
      const textToSpeak = sampleAdvisories[selectedLang][readingLevel];
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      const langCodes = { en: 'en-IN', hi: 'hi-IN', mr: 'mr-IN', ta: 'ta-IN' };
      utterance.lang = langCodes[selectedLang] || 'en-IN';
      utterance.rate = 0.9;
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      setIsPlayingAudio(true);
      window.speechSynthesis.speak(utterance);
    } else {
      alert('Text to speech is not supported in this browser.');
    }
  };

  const audienceContent = {
    ward: {
      title: 'Zonal & Ward Officers',
      subtitle: 'Target mechanical misting and road sweepers where PM10 peaks, with legal-grade row citations.',
      badge: 'Municipal Authority',
      actions: [
        { title: 'Deploy Water Mist Sprinkler to Hamidia Road', why: 'PM10 hit 248 Âµg/mÂ³ at 08:30 during morning peak [R12]', timeframe: 'Now', effort: 'Low' },
        { title: 'Inspect Uncovered Sand Dumps at MP Nagar Zone II', why: 'Suspended dust increased by +34% over baseline [R45]', timeframe: 'Today', effort: 'Med' },
        { title: 'Enforce Construction Dust Barricades at Metro Pillar 14', why: 'Downwind sensor logged 3 consecutive severe spikes [R88]', timeframe: 'This week', effort: 'High' },
      ],
    },
    housing: {
      title: 'Housing Societies & RWAs',
      subtitle: 'Schedule DG generator limits, inform morning walkers, and prioritize green belt dampening.',
      badge: 'Residential Community',
      actions: [
        { title: 'Postpone Lawn Mowing and Dry Leaf Blowing to Afternoon', why: 'Ground-level particulate traps are strongest before 10 AM [R14]', timeframe: 'Now', effort: 'Low' },
        { title: 'Limit Diesel Generator Testing to 12 PM - 3 PM Window', why: 'Early morning inversion height is under 150m [R31]', timeframe: 'Today', effort: 'Low' },
        { title: 'Turn on Perimeter Drip Mist along Boundary Wall', why: 'Traps arterial road dust ingress into children play zone [R62]', timeframe: 'This week', effort: 'Med' },
      ],
    },
    school: {
      title: 'Schools & Sports Academies',
      subtitle: 'Deterministic 3-color traffic light for outdoor PE assembly and athletic matches.',
      badge: 'Child Health Protocol',
      actions: [
        { title: 'Move Morning PE Assembly Indoors / Auditoriums', why: 'Children respiratory rate 2x adults; AQI 224 triggers Red Band [R09]', timeframe: 'Now', effort: 'Low' },
        { title: 'Postpone Inter-School Football Match to Friday', why: 'Forecasted surface wind calm; severe stagnation expected [R27]', timeframe: 'Today', effort: 'Med' },
        { title: 'Verify Classroom HEPA Filter Cleanliness in Junior Block', why: 'Ambient PM2.5 ingress risk elevated [R53]', timeframe: 'This week', effort: 'Med' },
      ],
    },
    citizen: {
      title: 'Citizens & Families',
      subtitle: 'Clear, compassionate advice for asthmatic parents, children and elderly family members.',
      badge: 'Family Wellbeing',
      actions: [
        { title: 'Reschedule Morning Jog to Evening 5 PM', why: 'Surface air cooler and particulate density highest 6 AM - 8 AM [R04]', timeframe: 'Now', effort: 'Low' },
        { title: 'Seal South-Facing Windows Facing Main Arterial Road', why: 'Localized vehicle emissions peak during rush hour [R18]', timeframe: 'Today', effort: 'Low' },
        { title: 'Equip Vulnerable Elders with Rated N95 Respirators', why: 'Sub-2.5 micron particles bypass airway cilia [R72]', timeframe: 'This week', effort: 'Low' },
      ],
    },
  };

  return (
    <div className="min-h-screen bg-[#F7F5F0] dark:bg-[#0B1513] text-[#10201C] dark:text-[#F7F5F0] transition-colors duration-300 relative overflow-hidden font-body selection:bg-teal-primary selection:text-white">
      {/* Background Animated Atmosphere */}
      <div className="atmospheric-haze" />

      {/* Sticky Top Navigation */}
      <nav className="sticky top-0 z-40 backdrop-blur-md bg-[#F7F5F0]/85 dark:bg-[#0B1513]/85 border-b border-[#10201C]/10 dark:border-white/10 px-4 sm:px-8 py-3.5 transition-colors">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-primary flex items-center justify-center text-white shadow-md shadow-teal-primary/20">
              <Wind className="w-5 h-5 animate-pulse-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading font-bold text-xl tracking-tight text-[#10201C] dark:text-white">
                  VayuSetu
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-teal-primary/10 text-teal-primary dark:bg-teal-primary/20 dark:text-teal-400 font-semibold font-devanagari">
                  à¤µà¤¾à¤¯à¥à¤¸à¥‡à¤¤à¥
                </span>
              </div>
              <p className="text-[10px] text-ink-600 dark:text-cream-400 uppercase tracking-wider font-semibold">
                AI Civic Air Studio â€¢ CPCB Guardrails
              </p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-ink-700 dark:text-cream-300">
            <a href="#how-it-works" className="hover:text-teal-primary dark:hover:text-teal-400 transition-colors">
              How It Works
            </a>
            <a href="#audiences" className="hover:text-teal-primary dark:hover:text-teal-400 transition-colors">
              Roles & Actions
            </a>
            <a href="#guardrails" className="hover:text-teal-primary dark:hover:text-teal-400 transition-colors">
              Citation Guardrails
            </a>
            <a href="#multilingual" className="hover:text-teal-primary dark:hover:text-teal-400 transition-colors">
              Languages
            </a>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-2 rounded-lg border border-[#10201C]/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-ink-700 dark:text-cream-300"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {isAuthenticated ? (
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/app/dashboard')}
                className="shadow-sm"
              >
                Go to Studio
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-medium text-ink-700 dark:text-cream-300 hover:text-teal-primary px-3 py-1.5 rounded-lg transition-colors"
                >
                  Sign In
                </Link>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleLaunchDemo('ward_officer')}
                  className="shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5 mr-1" />
                  Instant Demo
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-4 pb-10 pt-6 sm:px-8 sm:pt-8">
        <div className="relative mx-auto min-h-[560px] max-w-7xl overflow-hidden rounded-[30px] bg-[#17332D] text-white shadow-[0_24px_70px_-30px_rgba(14,45,36,0.55)] sm:min-h-[600px]">
          <img src="/images/bhopal-air-quality-hero.png" alt="Morning light over Bhopal with a rooftop air quality monitoring station" className="absolute inset-0 h-full w-full object-cover object-center" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#102923]/95 via-[#102923]/75 to-[#102923]/15" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#102923]/50 via-transparent to-[#102923]/10" />
          <div className="relative z-10 grid min-h-[560px] items-center gap-10 p-7 sm:min-h-[600px] sm:p-12 lg:grid-cols-12 lg:p-16">
            <div className="space-y-6 lg:col-span-7">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3.5 py-2 text-[11px] font-semibold tracking-wide text-white/90 backdrop-blur-sm">
                <ShieldCheck className="h-4 w-4 text-emerald-200" /> Evidence-led civic air quality
              </div>
              <h1 className="max-w-3xl font-heading text-4xl font-semibold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl">
                Make air data useful for the people who need to act.
              </h1>
              <p className="max-w-xl text-base leading-7 text-white/80 sm:text-lg">
                Turn messy monitoring files into clear ward briefings, verified priorities, and practical guidance for residents.
              </p>
              <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center">
                <Button variant="primary" size="lg" onClick={() => handleLaunchDemo('ward_officer')} className="justify-center bg-[#D8F06A] text-[#18352E] shadow-lg shadow-black/15 hover:bg-[#CBE85D]">
                  <Sparkles className="h-4 w-4" /> Explore the live demo <ArrowRight className="h-4 w-4" />
                </Button>
                <Link to="/signup">
                  <Button variant="secondary" size="lg" className="w-full justify-center border-white/30 bg-white/10 text-white shadow-none backdrop-blur-sm hover:bg-white/20 dark:bg-white/10 dark:text-white sm:w-auto">
                    Create an account <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
              <div className="flex flex-wrap gap-x-5 gap-y-2 pt-2 text-xs font-medium text-white/75">
                <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-200" /> Every claim tied to source rows</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-200" /> Built for local teams</span>
              </div>
            </div>
            <div className="lg:col-span-5 lg:justify-self-end">
              <div className="w-full max-w-sm rounded-3xl border border-white/25 bg-[#102923]/55 p-5 shadow-2xl backdrop-blur-xl sm:p-6">
                <div className="flex items-center justify-between border-b border-white/15 pb-4">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/65">Sample city snapshot</p>
                    <h2 className="mt-1 text-lg font-semibold">Bhopal, MP</h2>
                  </div>
                  <span className="rounded-full border border-orange-200/30 bg-orange-300/15 px-3 py-1 text-xs font-semibold text-orange-100">Poor</span>
                </div>
                <div className="flex items-end gap-3 py-6">
                  <span className="font-mono text-6xl font-semibold tracking-tight">224</span>
                  <div className="pb-2 text-xs text-white/70">AQI<br /><span className="text-white">Hamidia Road</span></div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between rounded-xl bg-white/10 px-3.5 py-3 text-xs"><span className="text-white/70">PM2.5</span><strong>118.4 µg/m³</strong></div>
                  <div className="flex items-center justify-between rounded-xl bg-white/10 px-3.5 py-3 text-xs"><span className="text-white/70">Usable readings</span><strong className="text-emerald-200">94.2%</strong></div>
                </div>
                <div className="mt-4 flex items-center gap-2 border-t border-white/15 pt-4 text-[11px] text-white/70"><ShieldCheck className="h-4 w-4 text-emerald-200" /> Example view · claims linked to readings</div>
              </div>
            </div>
          </div>
          <div className="absolute bottom-5 left-7 hidden items-center gap-2 text-[10px] font-medium uppercase tracking-[0.18em] text-white/55 sm:flex sm:left-12 lg:left-16"><span className="h-px w-8 bg-white/45" /> VayuSetu · Civic air quality studio</div>
        </div>
      </section>
      {/* Trust Strip */}
      <section className="border-y border-[#10201C]/10 dark:border-white/10 bg-white/50 dark:bg-ink-950/50 py-6 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-teal-primary/10 text-teal-primary flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-ink-900 dark:text-white">Every Claim Cited [R#]</h4>
              <p className="text-xs text-ink-600 dark:text-cream-400">Strict sentence guardrail checks row IDs and values.</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center md:items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-ink-900 dark:text-white">Bad Data Flagged</h4>
              <p className="text-xs text-ink-600 dark:text-cream-400">Flatlines and spikes quarantined, never silently removed.</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center md:items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-ink-900 dark:text-white">Deterministic Fallback</h4>
              <p className="text-xs text-ink-600 dark:text-cream-400">Calculations run in verified code; LLM interprets only.</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center md:items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
              <Languages className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-ink-900 dark:text-white">10 Indian Languages</h4>
              <p className="text-xs text-ink-600 dark:text-cream-400">Devanagari, Dravidian and Bengali script fidelity.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Problem to Solution Split View */}
      <section className="py-20 px-4 sm:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <Badge variant="outline" className="text-xs uppercase tracking-wider text-teal-primary border-teal-primary/30">
            The Civic Challenge
          </Badge>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight text-ink-900 dark:text-white">
            Raw CSVs paralyze ward officers. Clear briefings mobilize them.
          </h2>
          <p className="text-base text-ink-600 dark:text-cream-300">
            When morning pollution spikes occur, officers don't have 3 hours to clean broken headers or trace uncalibrated sensor drift.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          {/* Before: The Chaos */}
          <div className="rounded-2xl border border-red-500/20 bg-red-50/30 dark:bg-red-950/10 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-red-500/20">
              <span className="font-mono text-xs font-bold text-red-600 dark:text-red-400 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" /> BEFORE: Messy Raw Sheet
              </span>
              <span className="text-[10px] bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 px-2 py-0.5 rounded font-mono">
                No citations â€¢ High error risk
              </span>
            </div>
            <div className="font-mono text-xs text-ink-700 dark:text-cream-400 bg-white/70 dark:bg-black/40 p-4 rounded-xl border border-red-500/10 space-y-2 overflow-x-auto">
              <p className="text-gray-400">Date/Time, Stn, Param1, Unit, Val</p>
              <p className="text-red-600">2026-11-14 06:00, "Hamidia Rd", PM2.5, ug/m3, 999.0 &lt;-- Sensor Glitch?</p>
              <p>2026-11-14 06:15, "à¤¹à¤®à¥€à¤¦à¤¿à¤¯à¤¾", à¤ªà¥€à¤à¤®à¥¨.à¥«, ?, 118</p>
              <p className="text-amber-600">2026-11-14 07:00, "Arera", "PM10", ug, 0.0 &lt;-- Stuck flatline</p>
            </div>
            <ul className="text-xs space-y-2 text-ink-700 dark:text-cream-300">
              <li className="flex items-center gap-2 text-red-600 dark:text-red-400">
                âœ• Mixed English and Hindi column headers fail typical scripts
              </li>
              <li className="flex items-center gap-2 text-red-600 dark:text-red-400">
                âœ• Extreme outliers bias the ward average if left unquarantined
              </li>
              <li className="flex items-center gap-2 text-red-600 dark:text-red-400">
                âœ• Generic LLM summaries hallucinate station numbers and advice
              </li>
            </ul>
          </div>

          {/* After: VayuSetu Studio */}
          <div className="rounded-2xl border border-teal-primary/30 bg-teal-primary/5 dark:bg-teal-primary/10 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-teal-primary/20">
              <span className="font-mono text-xs font-bold text-teal-primary dark:text-teal-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> AFTER: VayuSetu Studio
              </span>
              <span className="text-[10px] bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300 px-2 py-0.5 rounded font-mono font-bold">
                100% Deterministic Math
              </span>
            </div>
            <div className="bg-white dark:bg-ink-900 p-4 rounded-xl border border-teal-primary/20 space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-ink-900 dark:text-white">Zone 8 (Ward 42) Action Brief</span>
                  <ConfidenceBadge confidence="High" />
                </div>
                <AQIBadge band="Poor" aqi={224} />
              </div>
              <p className="text-xs text-ink-700 dark:text-cream-300 leading-relaxed">
                "Hamidia Road logged verified PM2.5 of 118 Âµg/mÂ³ <span className="citation-chip">[R12]</span>.
                Sensors at Arera were quarantined due to zero variance <span className="citation-chip">[R18]</span>.
                Action needed: Deploy mechanical mist sweepers between 7 AM and 10 AM."
              </p>
            </div>
            <ul className="text-xs space-y-2 text-ink-700 dark:text-cream-300">
              <li className="flex items-center gap-2 text-teal-primary dark:text-teal-400 font-medium">
                âœ“ SchemaAgent maps Hindi headers without touching raw readings
              </li>
              <li className="flex items-center gap-2 text-teal-primary dark:text-teal-400 font-medium">
                âœ“ Every sentence verified: cited row, station, and number checked
              </li>
              <li className="flex items-center gap-2 text-teal-primary dark:text-teal-400 font-medium">
                âœ“ WhatsApp ready plain-text and A4 notice-board printable PDF
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* How It Works - 5 Animated Steps */}
      <section id="how-it-works" className="py-20 px-4 sm:px-8 border-t border-[#10201C]/10 dark:border-white/10 bg-white/40 dark:bg-ink-950/40">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <Badge variant="outline" className="text-xs uppercase tracking-wider text-teal-primary border-teal-primary/30">
              Pipeline Architecture
            </Badge>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight text-ink-900 dark:text-white">
              Five transparent steps from upload to civic action
            </h2>
            <p className="text-sm sm:text-base text-ink-600 dark:text-cream-300">
              Built on a 7-agent pipeline where deterministic mathematical code calculates, and LLMs interpret with guardrails.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[
              {
                step: '01',
                title: 'Upload & Parse',
                desc: 'Accepts ugly CSVs, multi-space text dumps, and Hindi headers with automatic fallback.',
                icon: FileSpreadsheet,
              },
              {
                step: '02',
                title: 'Clean & Flag',
                desc: 'AuditorAgent quarantines stuck flatlines, spikes, and missing hours into an open health ledger.',
                icon: ShieldCheck,
              },
              {
                step: '03',
                title: 'Find Hotspots',
                desc: 'Spatial clustering detects arterial roads, industrial corridors, and school-zone vulnerabilities.',
                icon: MapPin,
              },
              {
                step: '04',
                title: 'Plan by Role',
                desc: 'Ward Officer, Housing Society, and School playbooks prevent municipal-only role leakage.',
                icon: CheckCircle2,
              },
              {
                step: '05',
                title: 'Brief & Advise',
                desc: 'Sentence-level [R#] citation checker + 10-language advisory with TTS read aloud.',
                icon: FileText,
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="rounded-xl p-5 bg-white dark:bg-ink-900 border border-[#10201C]/10 dark:border-white/10 hover:border-teal-primary/40 transition-all hover:shadow-md space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-2xl font-bold text-teal-primary/30 dark:text-teal-400/30">
                    {item.step}
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-teal-primary/10 text-teal-primary flex items-center justify-center">
                    <item.icon className="w-4 h-4" />
                  </div>
                </div>
                <h3 className="font-heading text-base font-bold text-ink-900 dark:text-white">{item.title}</h3>
                <p className="text-xs text-ink-600 dark:text-cream-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Audience Tabs Section */}
      <section id="audiences" className="py-20 px-4 sm:px-8 max-w-7xl mx-auto space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <Badge variant="outline" className="text-xs uppercase tracking-wider text-teal-primary border-teal-primary/30">
            Tailored Playbooks
          </Badge>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight text-ink-900 dark:text-white">
            Actions tailored to who you are. Zero role leakage.
          </h2>
          <p className="text-sm sm:text-base text-ink-600 dark:text-cream-300">
            A school principal never receives road sprinkling orders; a ward officer gets enforcement powers.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex flex-wrap justify-center gap-2 p-1.5 bg-black/5 dark:bg-white/5 rounded-2xl max-w-2xl mx-auto">
          {[
            { id: 'ward', label: 'Ward Officer', icon: Building2 },
            { id: 'housing', label: 'Housing Society', icon: Home },
            { id: 'school', label: 'School Principal', icon: School },
            { id: 'citizen', label: 'Citizen & Family', icon: UserCheck },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedAudience(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                selectedAudience === tab.id
                  ? 'bg-white dark:bg-ink-900 text-teal-primary shadow-sm'
                  : 'text-ink-600 dark:text-cream-400 hover:text-ink-900 dark:hover:text-white'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Selected Audience Card */}
        <div className="max-w-4xl mx-auto rounded-2xl bg-white dark:bg-ink-900 border border-[#10201C]/10 dark:border-white/10 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#10201C]/10 dark:border-white/10">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading text-xl font-bold text-ink-900 dark:text-white">
                  {audienceContent[selectedAudience].title}
                </h3>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-primary/10 text-teal-primary dark:text-teal-300 font-semibold">
                  {audienceContent[selectedAudience].badge}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-ink-600 dark:text-cream-400 mt-1">
                {audienceContent[selectedAudience].subtitle}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleLaunchDemo(selectedAudience === 'housing' ? 'housing_society' : selectedAudience === 'school' ? 'school' : 'ward_officer')}
              className="text-xs font-semibold text-teal-primary border-teal-primary/30"
            >
              Launch As This Role
            </Button>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-ink-500 dark:text-cream-400">
              Sample Action Checklist with [R#] Citations
            </h4>
            <div className="grid grid-cols-1 gap-3">
              {audienceContent[selectedAudience].actions.map((act, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl border border-[#10201C]/10 dark:border-white/10 bg-cream-50 dark:bg-ink-950/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-teal-primary/30 transition-all"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-ink-900 dark:text-white">{act.title}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                        act.timeframe === 'Now' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                      }`}>
                        {act.timeframe}
                      </span>
                    </div>
                    <p className="text-xs text-ink-600 dark:text-cream-400">{act.why}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] text-ink-500 font-medium">Effort: {act.effort}</span>
                    <button className="px-2.5 py-1 rounded bg-teal-primary/10 text-teal-primary hover:bg-teal-primary hover:text-white transition-colors text-xs font-medium">
                      Copy Text
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How We Keep AI Honest (Verification Guardrails) */}
      <section id="guardrails" className="py-20 px-4 sm:px-8 border-y border-[#10201C]/10 dark:border-white/10 bg-white/40 dark:bg-ink-950/40">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <Badge variant="outline" className="text-xs uppercase tracking-wider text-teal-primary border-teal-primary/30">
              Citation Verification Engine
            </Badge>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight text-ink-900 dark:text-white">
              Every sentence checked against real rows in code.
            </h2>
            <p className="text-base text-ink-600 dark:text-cream-300 leading-relaxed">
              In VayuSetu, the LLM does not perform math. Deterministic code aggregates PM2.5, computes CPCB AQI sub-indices, and audits row integrity. Then, verify.js inspects every generated claim:
            </p>

            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-white dark:bg-ink-900 border border-[#10201C]/10 dark:border-white/10">
                <CheckCircle2 className="w-5 h-5 text-teal-primary shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-ink-900 dark:text-white">Row Existence Check</h4>
                  <p className="text-xs text-ink-600 dark:text-cream-400">If a model cites [R99] and row 99 does not exist in the upload, the claim is flagged as unverified.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-white dark:bg-ink-900 border border-[#10201C]/10 dark:border-white/10">
                <CheckCircle2 className="w-5 h-5 text-teal-primary shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-ink-900 dark:text-white">Numeric Accuracy Check</h4>
                  <p className="text-xs text-ink-600 dark:text-cream-400">If the sentence states 118 Âµg/mÂ³, the cited row must match within Â±2% rounding tolerance.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-white dark:bg-ink-900 border border-[#10201C]/10 dark:border-white/10">
                <CheckCircle2 className="w-5 h-5 text-teal-primary shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-ink-900 dark:text-white">Station Matching Check</h4>
                  <p className="text-xs text-ink-600 dark:text-cream-400">The named monitoring location must match the geographic coordinate of the cited record.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="rounded-2xl bg-white dark:bg-ink-900 border border-[#10201C]/15 dark:border-white/15 p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#10201C]/10 dark:border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-teal-primary animate-pulse" />
                  <span className="text-xs font-bold font-mono uppercase text-ink-700 dark:text-cream-300">
                    Live Claim Verifier
                  </span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>18/19 Claims Verified (94.7%)</span>
                </div>
              </div>

              <div className="space-y-3 font-mono text-xs">
                <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-500/20 text-emerald-900 dark:text-emerald-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-[10px] uppercase text-emerald-600 dark:text-emerald-400">Verified Sentence</span>
                    <span className="text-[10px] bg-emerald-200 dark:bg-emerald-900 px-1.5 py-0.2 rounded font-bold">Passed 3/3</span>
                  </div>
                  <p className="text-xs font-sans">
                    "Hamidia Road experienced peak PM2.5 of 118 Âµg/mÂ³ at 08:30 <span className="citation-chip">[R12]</span>."
                  </p>
                  <p className="text-[10px] text-emerald-700 dark:text-emerald-400 mt-1 font-mono">
                    âœ“ Row R12 exists | Value 118 matches 118.4 | Stn "Hamidia Rd" matches
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-500/20 text-amber-900 dark:text-amber-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-[10px] uppercase text-amber-600 dark:text-amber-400">Unverified Warning</span>
                    <span className="text-[10px] bg-amber-200 dark:bg-amber-900 px-1.5 py-0.2 rounded font-bold">Removed from Output</span>
                  </div>
                  <p className="text-xs font-sans line-through opacity-70">
                    "Citywide PM2.5 jumped to 450 Âµg/mÂ³ across all residential wards."
                  </p>
                  <p className="text-[10px] text-amber-700 dark:text-amber-400 mt-1 font-mono">
                    âœ• No citation provided for extreme claim; automatically scrubbed by verify.js
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Multilingual Showcase Section */}
      <section id="multilingual" className="py-20 px-4 sm:px-8 max-w-7xl mx-auto space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <Badge variant="outline" className="text-xs uppercase tracking-wider text-teal-primary border-teal-primary/30">
            Multilingual Citizen Advisories
          </Badge>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight text-ink-900 dark:text-white">
            One advisory, morphing across 10 Indian languages.
          </h2>
          <p className="text-sm sm:text-base text-ink-600 dark:text-cream-300">
            Toggle reading levels between Technical/Standard and Simple Community terms, with audio read aloud.
          </p>
        </div>

        <div className="max-w-3xl mx-auto rounded-2xl bg-white dark:bg-ink-900 border border-[#10201C]/15 dark:border-white/15 p-6 sm:p-8 shadow-md space-y-6">
          {/* Controls: Language Buttons + Reading Level + Audio */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#10201C]/10 dark:border-white/10">
            <div className="flex items-center gap-1.5">
              {[
                { id: 'en', label: 'English' },
                { id: 'hi', label: 'à¤¹à¤¿à¤‚à¤¦à¥€ (Hindi)' },
                { id: 'mr', label: 'à¤®à¤°à¤¾à¤ à¥€ (Marathi)' },
                { id: 'ta', label: 'à®¤à®®à®¿à®´à¯ (Tamil)' },
              ].map((lang) => (
                <button
                  key={lang.id}
                  onClick={() => {
                    setSelectedLang(lang.id);
                    if (isPlayingAudio) window.speechSynthesis.cancel();
                    setIsPlayingAudio(false);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    selectedLang === lang.id
                      ? 'bg-teal-primary text-white shadow-sm'
                      : 'bg-black/5 dark:bg-white/5 text-ink-700 dark:text-cream-300 hover:bg-black/10'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <div className="inline-flex p-1 bg-black/5 dark:bg-white/5 rounded-lg text-xs">
                <button
                  onClick={() => setReadingLevel('standard')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                    readingLevel === 'standard' ? 'bg-white dark:bg-ink-900 text-teal-primary shadow-xs' : 'text-ink-600 dark:text-cream-400'
                  }`}
                >
                  Standard
                </button>
                <button
                  onClick={() => setReadingLevel('simple')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                    readingLevel === 'simple' ? 'bg-white dark:bg-ink-900 text-teal-primary shadow-xs' : 'text-ink-600 dark:text-cream-400'
                  }`}
                >
                  Simple (Ward)
                </button>
              </div>

              <button
                onClick={handleReadAloud}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-primary/10 text-teal-primary hover:bg-teal-primary hover:text-white transition-colors text-xs font-semibold"
                aria-label="Read advisory aloud"
              >
                {isPlayingAudio ? <VolumeX className="w-4 h-4 text-red-500" /> : <Volume2 className="w-4 h-4" />}
                <span>{isPlayingAudio ? 'Stop' : 'Read Aloud'}</span>
              </button>
            </div>
          </div>

          {/* Rendered Morphing Advisory Text */}
          <div className="p-5 rounded-xl bg-cream-50 dark:bg-ink-950/80 border border-teal-primary/20 space-y-3">
            <div className="flex items-center justify-between text-xs text-ink-500 dark:text-cream-400">
              <span className="font-semibold uppercase tracking-wider text-teal-primary">
                Civic Advisory Broadcast
              </span>
              <AQIBadge band="Poor" aqi={224} />
            </div>
            <p className="text-base sm:text-lg font-serif dark:font-sans leading-relaxed text-ink-900 dark:text-white">
              {sampleAdvisories[selectedLang][readingLevel]}
            </p>
          </div>

          {/* Vetted Safety Block (Always Appended) */}
          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-500/20 text-xs text-amber-900 dark:text-amber-200 space-y-1">
            <span className="font-bold flex items-center gap-1.5 text-amber-700 dark:text-amber-400">
              <ShieldCheck className="w-4 h-4" /> Vetted Medical Safety Notice (Non-LLM Guaranteed)
            </span>
            <p>
              Use rated N95 respirators if stepping into traffic corridors. Seek immediate medical attention if experiencing persistent wheezing or chest tightness. This is an environmental advisory, not individual medical advice.
            </p>
          </div>
        </div>
      </section>

      {/* Vulnerable Groups Caring Section */}
      <section className="py-20 px-4 sm:px-8 border-t border-[#10201C]/10 dark:border-white/10 bg-white/40 dark:bg-ink-950/40">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <Badge variant="outline" className="text-xs uppercase tracking-wider text-teal-primary border-teal-primary/30">
              High-Risk Protection
            </Badge>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight text-ink-900 dark:text-white">
              Specialized protocols for vulnerable residents
            </h2>
            <p className="text-sm sm:text-base text-ink-600 dark:text-cream-300">
              Every briefing automatically splits safety recommendations by physiological risk category.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white dark:bg-ink-900 border border-[#10201C]/10 dark:border-white/10 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold text-lg">
                ðŸ‘¶
              </div>
              <h3 className="font-heading text-lg font-bold text-ink-900 dark:text-white">Children & Infants</h3>
              <p className="text-xs text-ink-600 dark:text-cream-400 leading-relaxed">
                Higher inhalation per kg of body weight. Outdoor school sports canceled when AQI crosses Moderate band (&gt;100).
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-ink-900 border border-[#10201C]/10 dark:border-white/10 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold text-lg">
                ðŸ‘µ
              </div>
              <h3 className="font-heading text-lg font-bold text-ink-900 dark:text-white">Older Adults</h3>
              <p className="text-xs text-ink-600 dark:text-cream-400 leading-relaxed">
                Cardiovascular stress during morning thermal inversions. Shift walking routines to well-ventilated afternoons.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-ink-900 border border-[#10201C]/10 dark:border-white/10 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center font-bold text-lg">
                ðŸ«
              </div>
              <h3 className="font-heading text-lg font-bold text-ink-900 dark:text-white">Asthma & Respiratory</h3>
              <p className="text-xs text-ink-600 dark:text-cream-400 leading-relaxed">
                Fine particulate penetration triggers bronchospasm. Recommended N95 respirator seal and inhaler readiness.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Honest Limits Disclaimer */}
      <section className="py-12 px-4 sm:px-8 max-w-4xl mx-auto text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 text-xs text-ink-500 dark:text-cream-400">
          <Info className="w-4 h-4 text-teal-primary" />
          <strong className="text-ink-700 dark:text-cream-200">Honest Civic Limits:</strong>
          <span>Sample datasets in the studio are illustrative benchmarks modeled after Bhopal/Delhi station formats. Official regulatory citations require authorized CPCB/SPCB portal data feeds.</span>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="py-20 px-4 sm:px-8 bg-teal-primary text-white text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto space-y-6 relative z-10">
          <h2 className="font-heading text-3xl sm:text-5xl font-bold tracking-tight">
            Ready to upgrade your ward's air quality response?
          </h2>
          <p className="text-base sm:text-lg text-teal-100 max-w-2xl mx-auto font-normal">
            Test the live multi-agent studio with sample Bhopal readings or paste your own spreadsheet right now.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button
              variant="secondary"
              size="lg"
              onClick={() => handleLaunchDemo('ward_officer')}
              className="bg-white text-teal-900 hover:bg-cream-100 font-bold px-8 py-3.5 shadow-xl"
            >
              <Sparkles className="w-5 h-5 mr-2 text-teal-primary" />
              Launch Instant Demo
            </Button>
            <Link to="/signup">
              <button className="px-6 py-3.5 rounded-xl border border-white/40 hover:bg-white/10 text-white font-semibold transition-colors text-sm">
                Create Free Account
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#10201C]/10 dark:border-white/10 py-12 px-4 sm:px-8 bg-[#F7F5F0] dark:bg-[#0B1513] text-xs text-ink-600 dark:text-cream-400">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-teal-primary flex items-center justify-center text-white">
              <Wind className="w-4 h-4" />
            </div>
            <div>
              <span className="font-heading font-bold text-sm text-[#10201C] dark:text-white">
                VayuSetu (à¤µà¤¾à¤¯à¥à¤¸à¥‡à¤¤à¥)
              </span>
              <p className="text-[11px] text-ink-500">AI Civic Air Quality Studio for India</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <a href="#how-it-works" className="hover:text-teal-primary transition-colors">How It Works</a>
            <a href="#audiences" className="hover:text-teal-primary transition-colors">Roles</a>
            <a href="#guardrails" className="hover:text-teal-primary transition-colors">Citations</a>
            <Link to="/login" className="hover:text-teal-primary transition-colors">Login</Link>
            <Link to="/signup" className="hover:text-teal-primary transition-colors">Sign Up</Link>
          </div>

          <p className="text-[11px] text-ink-500">
            Â© 2026 VayuSetu Project. Open civic-tech.
          </p>
        </div>
      </footer>
    </div>
  );
}

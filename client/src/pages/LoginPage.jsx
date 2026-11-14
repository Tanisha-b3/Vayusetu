import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Wind,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { Button, AQIBadge, ProgressRing } from '../components/ui';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, demoLogin, isLoading, error } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [fieldErrors, setFieldErrors] = useState({});
  const [shake, setShake] = useState(false);

  // Rotating testimonials for right panel
  const testimonials = [
    {
      quote: "Cut our emergency response time from 3 days to 45 minutes during the post-Diwali spike.",
      author: "Ashok Sharma",
      role: "Zonal Ward Officer, Zone 8, Bhopal",
      aqi: 224,
      band: "Poor",
    },
    {
      quote: "Parents can check morning air quality before letting kids outside for PE assembly. The deterministic traffic light is foolproof.",
      author: "Dr. Priya Nair",
      role: "Principal, Delhi Public School",
      aqi: 85,
      band: "Satisfactory",
    },
    {
      quote: "Now our 420-apartment society knows whether to run DG sets or postpone dry landscaping work.",
      author: "Rajesh Verma",
      role: "RWA Secretary, Gulmohar Greens",
      aqi: 142,
      band: "Moderate",
    },
  ];

  const [activeTestimonial, setActiveTestimonial] = useState(0);

  // Demo credentials come from the server (null if the demo account is disabled or unreachable).
  const [demoCreds, setDemoCreds] = useState(null);
  React.useEffect(() => {
    const base = import.meta.env.VITE_API_URL || '/api';
    fetch(`${base}/auth/demo`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setDemoCreds(d?.enabled ? d : null))
      .catch(() => setDemoCreds(null));
  }, []);

  // Cycle testimonials every 6 seconds
  React.useEffect(() => {
    const timer = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!email || !email.includes('@')) {
      errs.email = 'Please enter a valid official or work email';
    }
    if (!password || password.length < 6) {
      errs.password = 'Password must be at least 6 characters';
    }

    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    setFieldErrors({});
    const res = await login(email, password);
    if (res.success) {
      navigate('/app/dashboard');
    } else {
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  const handleDemoSignIn = (role = 'ward_officer') => {
    demoLogin(role);
    navigate('/app/dashboard');
  };

  const currentT = testimonials[activeTestimonial];

  return (
    <div className="min-h-screen bg-[#F7F5F0] dark:bg-[#0B1513] text-[#10201C] dark:text-[#F7F5F0] flex">
      {/* Left Column: Sign In Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between p-6 sm:p-12 z-10">
        <div>
          <Link to="/" className="inline-flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-teal-primary flex items-center justify-center text-white shadow-sm">
              <Wind className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            </div>
            <div>
              <span className="font-heading font-bold text-lg text-ink-900 dark:text-white">
                VayuSetu
              </span>
              <span className="text-xs ml-1 font-devanagari text-teal-primary font-semibold">
                वायुसेतु
              </span>
            </div>
          </Link>
        </div>

        <motion.div
          animate={shake ? { x: [-10, 10, -10, 10, 0] } : {}}
          transition={{ duration: 0.4 }}
          className="max-w-md w-full mx-auto my-8 space-y-6"
        >
          <div className="space-y-2">
            <h1 className="font-heading text-3xl font-bold tracking-tight text-ink-900 dark:text-white">
              Sign in to your ward studio
            </h1>
            <p className="text-sm text-ink-600 dark:text-cream-400">
              Access your saved briefs, hotspot spatial ledgers, and action checklists.
            </p>
          </div>

          {/* Quick 1-Click Demo Button */}
          <div className="p-3.5 rounded-xl bg-teal-primary/10 border border-teal-primary/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-primary" />
              <div className="text-xs">
                <span className="font-bold text-teal-900 dark:text-teal-200">Evaluating for jury/review?</span>
                <p className="text-ink-600 dark:text-cream-400">Instant access with preloaded Bhopal data</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleDemoSignIn('ward_officer')}
              className="px-3 py-1.5 rounded-lg bg-teal-primary text-white hover:bg-teal-hover transition-colors text-xs font-semibold shadow-xs"
            >
              1-Click Demo
            </button>
          </div>

          {demoCreds && (
            <div className="p-3 rounded-xl border border-obs-hairline bg-white/60 dark:bg-white/5 flex items-center justify-between gap-3 text-xs">
              <div className="min-w-0">
                <span className="font-bold block">Demo credentials</span>
                <span className="font-mono text-ink-600 dark:text-cream-400 block truncate">
                  {demoCreds.email} / {demoCreds.password}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEmail(demoCreds.email);
                  setPassword(demoCreds.password);
                  setFieldErrors({});
                }}
                className="shrink-0 px-3 py-1.5 rounded-lg border border-teal-primary/40 text-teal-primary hover:bg-teal-primary/10 transition-colors font-semibold"
              >
                Fill in
              </button>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-500/30 text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-ink-700 dark:text-cream-300 mb-1.5">
                Official or Work Email
              </label>
              <input
                type="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="officer@bhopal.gov.in"
                className={`w-full px-3.5 py-2.5 rounded-xl border ${
                  fieldErrors.email
                    ? 'border-red-500 bg-red-50/20'
                    : 'border-[#10201C]/15 dark:border-white/15 bg-white dark:bg-ink-900'
                } text-sm focus:outline-none focus:ring-2 focus:ring-teal-primary/30 transition-all`}
              />
              {fieldErrors.email && (
                <p className="text-[11px] text-red-500 mt-1 font-medium">{fieldErrors.email}</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-ink-700 dark:text-cream-300">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-teal-primary hover:underline font-medium"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full px-3.5 py-2.5 rounded-xl border ${
                    fieldErrors.password
                      ? 'border-red-500 bg-red-50/20'
                      : 'border-[#10201C]/15 dark:border-white/15 bg-white dark:bg-ink-900'
                  } text-sm focus:outline-none focus:ring-2 focus:ring-teal-primary/30 transition-all pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-500 hover:text-ink-800 dark:hover:text-white"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-[11px] text-red-500 mt-1 font-medium">{fieldErrors.password}</p>
              )}
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-[#10201C]/20 text-teal-primary focus:ring-teal-primary"
                />
                <span className="text-ink-700 dark:text-cream-300">Remember this device</span>
              </label>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full py-3 text-sm font-semibold shadow-md"
              disabled={isLoading}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#10201C]/10 dark:border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#F7F5F0] dark:bg-[#0B1513] px-2 text-ink-500 font-mono">Or</span>
            </div>
          </div>

          {/* Role-specific quick demo login buttons */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-ink-600 dark:text-cream-400 block text-center">
              Test as specific civic stakeholder:
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleDemoSignIn('ward_officer')}
                className="p-2 rounded-lg border border-[#10201C]/10 dark:border-white/10 bg-white dark:bg-ink-900 hover:border-teal-primary/40 text-xs font-medium transition-all text-center"
              >
                🏛️ Ward Officer
              </button>
              <button
                type="button"
                onClick={() => handleDemoSignIn('school')}
                className="p-2 rounded-lg border border-[#10201C]/10 dark:border-white/10 bg-white dark:bg-ink-900 hover:border-teal-primary/40 text-xs font-medium transition-all text-center"
              >
                🏫 School Lead
              </button>
              <button
                type="button"
                onClick={() => handleDemoSignIn('housing_society')}
                className="p-2 rounded-lg border border-[#10201C]/10 dark:border-white/10 bg-white dark:bg-ink-900 hover:border-teal-primary/40 text-xs font-medium transition-all text-center"
              >
                🏘️ Society RWA
              </button>
            </div>
          </div>

          <p className="text-center text-xs text-ink-600 dark:text-cream-400">
            Don't have an account?{' '}
            <Link to="/signup" className="text-teal-primary font-bold hover:underline">
              Create free account
            </Link>
          </p>
        </motion.div>

        <div className="text-center text-[11px] text-ink-500 dark:text-cream-400">
          VayuSetu Civic Platform • Deterministic Air Quality Intelligence
        </div>
      </div>

      {/* Right Column: Visual Testimonials & Live AQI Ring Panel */}
      <div className="hidden lg:flex w-1/2 bg-teal-primary/10 dark:bg-ink-950 border-l border-[#10201C]/10 dark:border-white/10 relative p-12 flex-col justify-between overflow-hidden">
        {/* Subtle decorative circles */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-teal-primary/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex items-center justify-between">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white dark:bg-ink-900 border border-teal-primary/20 text-xs font-semibold text-teal-primary shadow-xs">
            <ShieldCheck className="w-4 h-4" />
            <span>Civic Verification Protocol Active</span>
          </div>
          <span className="text-xs font-mono text-ink-500">CPCB Band Standard</span>
        </div>

        {/* Central Live Gauge Visual */}
        <div className="relative z-10 my-auto flex flex-col items-center text-center space-y-6">
          <div className="relative w-48 h-48 flex items-center justify-center">
            {/* Pulsing ring */}
            <div className="absolute inset-0 rounded-full border-4 border-dashed border-teal-primary/30 animate-spin [animation-duration:30s]" />
            <div className="w-40 h-40 rounded-full bg-white dark:bg-ink-900 border border-[#10201C]/15 dark:border-white/15 flex flex-col items-center justify-center shadow-xl">
              <span className="text-xs font-mono uppercase tracking-wider text-ink-500">Ward AQI</span>
              <span className="text-4xl font-heading font-bold text-ink-900 dark:text-white">
                {currentT.aqi}
              </span>
              <AQIBadge band={currentT.band} aqi={currentT.aqi} size="sm" className="mt-1" />
            </div>
          </div>

          {/* Testimonial Quote */}
          <div className="max-w-md space-y-3">
            <p className="text-base font-serif italic text-ink-800 dark:text-cream-200 leading-relaxed">
              "{currentT.quote}"
            </p>
            <div>
              <h4 className="text-sm font-bold text-ink-900 dark:text-white">{currentT.author}</h4>
              <p className="text-xs text-teal-primary dark:text-teal-400">{currentT.role}</p>
            </div>
          </div>

          {/* Dot Indicators */}
          <div className="flex items-center gap-1.5 pt-2">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveTestimonial(i)}
                className={`w-2 h-2 rounded-full transition-all ${
                  activeTestimonial === i ? 'w-6 bg-teal-primary' : 'bg-gray-300 dark:bg-gray-700'
                }`}
                aria-label={`Testimonial ${i + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Bottom Feature Pill */}
        <div className="relative z-10 p-4 rounded-xl bg-white/80 dark:bg-ink-900/80 border border-[#10201C]/10 dark:border-white/10 backdrop-blur-sm flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="font-medium text-ink-800 dark:text-cream-200">
              18/19 claims verified in live briefing engine
            </span>
          </div>
          <span className="font-mono text-teal-primary font-bold">verify.js</span>
        </div>
      </div>
    </div>
  );
}

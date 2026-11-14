import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wind,
  Eye,
  EyeOff,
  Building2,
  Home,
  School,
  UserCheck,
  Check,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Languages,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/ui';

export default function SignupPage() {
  const navigate = useNavigate();
  const { signup, isLoading } = useAuthStore();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'ward_officer',
    organization: '',
    city: 'Bhopal',
    ward: '',
    language: 'hi',
    agreedToTerms: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  // Password Strength Calculation
  const getPasswordStrength = (pass) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score; // 0 to 4
  };

  const passwordScore = getPasswordStrength(formData.password);

  const roles = [
    {
      id: 'ward_officer',
      title: 'Ward Officer / Nagar Nigam',
      description: 'Zonal health officers, sanitary inspectors & road sweeping supervisors.',
      icon: Building2,
      badge: 'Municipal Enforcement',
    },
    {
      id: 'housing_society',
      title: 'Housing Society (RWA)',
      description: 'Apartment managers, managing committees, DG operators & facility leads.',
      icon: Home,
      badge: 'Community Action',
    },
    {
      id: 'school',
      title: 'School / Sports Academy',
      description: 'Principals, physical education instructors & student health coordinators.',
      icon: School,
      badge: 'Child Protection',
    },
    {
      id: 'citizen',
      title: 'Citizen / Researcher',
      description: 'Parents of asthmatic children, morning walkers & civic researchers.',
      icon: UserCheck,
      badge: 'Personal Health',
    },
  ];

  const indianLanguages = [
    { code: 'hi', name: 'हिंदी (Hindi)' },
    { code: 'en', name: 'English' },
    { code: 'mr', name: 'मराठी (Marathi)' },
    { code: 'ta', name: 'தமிழ் (Tamil)' },
    { code: 'bn', name: 'বাংলা (Bengali)' },
    { code: 'te', name: 'తెలుగు (Telugu)' },
    { code: 'kn', name: 'ಕನ್ನಡ (Kannada)' },
    { code: 'gu', name: 'ગુજરાતી (Gujarati)' },
    { code: 'ml', name: 'മലയാളം (Malayalam)' },
    { code: 'or', name: 'ଓଡ଼ିଆ (Odia)' },
  ];

  const handleNext = () => {
    const errs = {};
    if (step === 1) {
      if (!formData.name.trim()) errs.name = 'Full name is required';
      if (!formData.email || !formData.email.includes('@')) errs.email = 'Valid email required';
      if (formData.password.length < 8) errs.password = 'Password must be at least 8 characters';
      if (formData.password !== formData.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    } else if (step === 2) {
      if (!formData.role) errs.role = 'Please select your civic role';
    } else if (step === 3) {
      if (!formData.organization.trim()) errs.organization = 'Organization or community name required';
      if (!formData.city.trim()) errs.city = 'City is required';
    }

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setStep((prev) => Math.min(prev + 1, 4));
  };

  const handleCompleteSignup = async () => {
    if (!formData.agreedToTerms) {
      setErrors({ terms: 'Please agree to the civic data guidelines to continue' });
      return;
    }
    const res = await signup(formData);
    if (res.success) {
      navigate('/app/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F5F0] dark:bg-[#0B1513] text-[#10201C] dark:text-[#F7F5F0] flex">
      {/* Left Column: Multi-step Signup Form */}
      <div className="w-full lg:w-3/5 flex flex-col justify-between p-6 sm:p-12 z-10 overflow-y-auto">
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

        <div className="max-w-xl w-full mx-auto my-8 space-y-6">
          {/* Progress Stepper */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-ink-600 dark:text-cream-400">
              <span>Step {step} of 4</span>
              <span>
                {step === 1 && 'Account Credentials'}
                {step === 2 && 'Select Your Role'}
                {step === 3 && 'Locality & Language'}
                {step === 4 && 'Verification & Launch'}
              </span>
            </div>
            <div className="w-full h-1.5 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden flex">
              <div
                className="h-full bg-teal-primary transition-all duration-300"
                style={{ width: `${(step / 4) * 100}%` }}
              />
            </div>
          </div>

          <AnimatePresence mode="wait">
            {/* Step 1: Credentials */}
            {step === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div>
                  <h2 className="font-heading text-2xl font-bold text-ink-900 dark:text-white">
                    Create your VayuSetu account
                  </h2>
                  <p className="text-xs text-ink-600 dark:text-cream-400 mt-1">
                    Free for municipal staff, RWAs, schools and civic volunteers.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-ink-700 dark:text-cream-300 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Ashok Sharma"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#10201C]/15 dark:border-white/15 bg-white dark:bg-ink-900 text-sm focus:ring-2 focus:ring-teal-primary/30 outline-none"
                  />
                  {errors.name && <p className="text-[11px] text-red-500 mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-ink-700 dark:text-cream-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="e.g. ashok@bhopal.gov.in"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#10201C]/15 dark:border-white/15 bg-white dark:bg-ink-900 text-sm focus:ring-2 focus:ring-teal-primary/30 outline-none"
                  />
                  {errors.email && <p className="text-[11px] text-red-500 mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-ink-700 dark:text-cream-300 mb-1">
                    Password (min. 8 characters)
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#10201C]/15 dark:border-white/15 bg-white dark:bg-ink-900 text-sm focus:ring-2 focus:ring-teal-primary/30 outline-none pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-500"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {/* Password strength meter */}
                  {formData.password && (
                    <div className="mt-2 space-y-1">
                      <div className="flex gap-1 h-1">
                        {[1, 2, 3, 4].map((bar) => (
                          <div
                            key={bar}
                            className={`flex-1 rounded-full ${
                              bar <= passwordScore
                                ? passwordScore <= 1
                                  ? 'bg-red-500'
                                  : passwordScore <= 3
                                  ? 'bg-amber-500'
                                  : 'bg-emerald-500'
                                : 'bg-black/10 dark:bg-white/10'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-[10px] text-ink-500">
                        {passwordScore < 2 ? 'Weak' : passwordScore < 4 ? 'Moderate' : 'Strong'}
                      </span>
                    </div>
                  )}
                  {errors.password && <p className="text-[11px] text-red-500 mt-1">{errors.password}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-ink-700 dark:text-cream-300 mb-1">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#10201C]/15 dark:border-white/15 bg-white dark:bg-ink-900 text-sm focus:ring-2 focus:ring-teal-primary/30 outline-none"
                  />
                  {errors.confirmPassword && (
                    <p className="text-[11px] text-red-500 mt-1">{errors.confirmPassword}</p>
                  )}
                </div>
              </motion.div>
            )}

            {/* Step 2: Role Selection Cards */}
            {step === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div>
                  <h2 className="font-heading text-2xl font-bold text-ink-900 dark:text-white">
                    Choose your civic role
                  </h2>
                  <p className="text-xs text-ink-600 dark:text-cream-400 mt-1">
                    VayuSetu tailors your action checklists and keeps municipal duties separated from schools.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {roles.map((r) => {
                    const isSelected = formData.role === r.id;
                    const IconComp = r.icon;
                    return (
                      <div
                        key={r.id}
                        onClick={() => setFormData({ ...formData, role: r.id })}
                        className={`p-4 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'border-teal-primary bg-teal-primary/10 shadow-sm ring-1 ring-teal-primary'
                            : 'border-[#10201C]/15 dark:border-white/15 bg-white dark:bg-ink-900 hover:border-teal-primary/40'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="w-8 h-8 rounded-lg bg-teal-primary/10 text-teal-primary flex items-center justify-center">
                            <IconComp className="w-4 h-4" />
                          </div>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-teal-primary" />}
                        </div>
                        <h3 className="font-heading text-sm font-bold text-ink-900 dark:text-white">
                          {r.title}
                        </h3>
                        <p className="text-[11px] text-ink-600 dark:text-cream-400 mt-1 leading-relaxed">
                          {r.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Step 3: Organization & Preferred Language */}
            {step === 3 && (
              <motion.div
                key="step-3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div>
                  <h2 className="font-heading text-2xl font-bold text-ink-900 dark:text-white">
                    Locality & language preferences
                  </h2>
                  <p className="text-xs text-ink-600 dark:text-cream-400 mt-1">
                    Ensure advisories are generated in the native language spoken by your ward's citizens.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-ink-700 dark:text-cream-300 mb-1">
                    Organization / Institution Name
                  </label>
                  <input
                    type="text"
                    value={formData.organization}
                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                    placeholder="e.g. Bhopal Municipal Corp / Gulmohar Greens RWA"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#10201C]/15 dark:border-white/15 bg-white dark:bg-ink-900 text-sm focus:ring-2 focus:ring-teal-primary/30 outline-none"
                  />
                  {errors.organization && <p className="text-[11px] text-red-500 mt-1">{errors.organization}</p>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-ink-700 dark:text-cream-300 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="e.g. Bhopal, Delhi, Mumbai"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#10201C]/15 dark:border-white/15 bg-white dark:bg-ink-900 text-sm focus:ring-2 focus:ring-teal-primary/30 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase text-ink-700 dark:text-cream-300 mb-1">
                      Ward / Sector (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.ward}
                      onChange={(e) => setFormData({ ...formData, ward: e.target.value })}
                      placeholder="e.g. Zone 8, Ward 42"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#10201C]/15 dark:border-white/15 bg-white dark:bg-ink-900 text-sm focus:ring-2 focus:ring-teal-primary/30 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-ink-700 dark:text-cream-300 mb-1.5 flex items-center gap-1.5">
                    <Languages className="w-4 h-4 text-teal-primary" />
                    <span>Primary Regional Language</span>
                  </label>
                  <select
                    value={formData.language}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#10201C]/15 dark:border-white/15 bg-white dark:bg-ink-900 text-sm focus:ring-2 focus:ring-teal-primary/30 outline-none"
                  >
                    {indianLanguages.map((l) => (
                      <option key={l.code} value={l.code}>
                        {l.name}
                      </option>
                    ))}
                  </select>
                </div>
              </motion.div>
            )}

            {/* Step 4: Consent & Verification */}
            {step === 4 && (
              <motion.div
                key="step-4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div>
                  <h2 className="font-heading text-2xl font-bold text-ink-900 dark:text-white">
                    Civic Data Agreement
                  </h2>
                  <p className="text-xs text-ink-600 dark:text-cream-400 mt-1">
                    VayuSetu upholds transparency: calculations remain open, and claims are checked against citations.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-cream-50 dark:bg-ink-950 border border-teal-primary/20 space-y-2 text-xs text-ink-700 dark:text-cream-300">
                  <div className="flex items-center gap-2 text-teal-primary font-bold">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Our AI Guardrail Commitment:</span>
                  </div>
                  <ul className="list-disc pl-5 space-y-1 text-[11px]">
                    <li>All sensor calculations follow deterministic CPCB formulas.</li>
                    <li>LLMs only generate plain-language interpretations under [R#] citation checks.</li>
                    <li>Flawed, flatlined or out-of-range sensor readings are quarantined with open reasons.</li>
                  </ul>
                </div>

                <label className="flex items-start gap-2.5 cursor-pointer pt-2">
                  <input
                    type="checkbox"
                    checked={formData.agreedToTerms}
                    onChange={(e) => setFormData({ ...formData, agreedToTerms: e.target.checked })}
                    className="mt-0.5 rounded border-[#10201C]/20 text-teal-primary focus:ring-teal-primary"
                  />
                  <span className="text-xs text-ink-700 dark:text-cream-300 leading-normal">
                    I agree to the VayuSetu Civic Data Guidelines and understand that generated advisories are environmental guidance, not individualized clinical medical advice.
                  </span>
                </label>
                {errors.terms && <p className="text-[11px] text-red-500">{errors.terms}</p>}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Stepper Navigation Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-[#10201C]/10 dark:border-white/10">
            {step > 1 ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setStep((prev) => Math.max(prev - 1, 1))}
                className="text-xs font-semibold"
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                Back
              </Button>
            ) : (
              <Link to="/login" className="text-xs text-ink-500 hover:text-teal-primary">
                Already registered? Sign in
              </Link>
            )}

            {step < 4 ? (
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleNext}
                className="text-xs font-semibold"
              >
                Continue
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            ) : (
              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={handleCompleteSignup}
                disabled={isLoading}
                className="text-xs font-semibold px-6 shadow-md"
              >
                {isLoading ? 'Creating Account...' : 'Complete & Open Studio'}
              </Button>
            )}
          </div>
        </div>

        <div className="text-center text-[11px] text-ink-500 dark:text-cream-400">
          VayuSetu Open Civic-Tech Studio
        </div>
      </div>

      {/* Right Column: Visual Summary */}
      <div className="hidden lg:flex w-2/5 bg-teal-primary/10 dark:bg-ink-950 border-l border-[#10201C]/10 dark:border-white/10 p-12 flex-col justify-between">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-primary/10 text-teal-primary text-xs font-bold">
            <Sparkles className="w-4 h-4" />
            <span>Civic Air Intelligence Studio</span>
          </div>
          <h2 className="font-heading text-3xl font-bold text-ink-900 dark:text-white leading-snug">
            Equipping local leadership with unhallucinated air briefings.
          </h2>
          <p className="text-xs text-ink-600 dark:text-cream-400 leading-relaxed">
            By registering, your ward, society or school gains an offline-capable, multilingual studio with verified row citations.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-ink-900 border border-[#10201C]/10 dark:border-white/10 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-teal-primary text-xs font-bold">
            <ShieldCheck className="w-4 h-4" />
            <span>Account Benefits</span>
          </div>
          <div className="space-y-2 text-xs text-ink-700 dark:text-cream-300">
            <div className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-teal-primary" />
              <span>Unlimited ugly CSV, TXT & Hindi table uploads</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-teal-primary" />
              <span>A4 notice-board printable posters</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-teal-primary" />
              <span>WhatsApp ready bullet summaries</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-teal-primary" />
              <span>Multi-brief temporal delta comparisons</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

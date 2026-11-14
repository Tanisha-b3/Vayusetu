import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Wind, ArrowLeft, Mail, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/ui';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#F7F5F0] dark:bg-[#0B1513] text-[#10201C] dark:text-[#F7F5F0] flex flex-col justify-between p-6 sm:p-12">
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

      <div className="max-w-md w-full mx-auto my-8 p-6 rounded-2xl bg-white dark:bg-ink-900 border border-[#10201C]/15 dark:border-white/15 shadow-sm space-y-6">
        <div className="space-y-2">
          <h1 className="font-heading text-2xl font-bold text-ink-900 dark:text-white">
            Reset your password
          </h1>
          <p className="text-xs text-ink-600 dark:text-cream-400">
            Enter the email address registered with your ward or school to receive a secure reset link.
          </p>
        </div>

        {submitted ? (
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 text-emerald-800 dark:text-emerald-200 space-y-2 text-xs">
            <div className="flex items-center gap-2 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Password reset instructions sent!</span>
            </div>
            <p>
              If an account exists for <strong>{email}</strong>, a password reset email has been dispatched.
            </p>
            <div className="pt-2">
              <Link to="/login">
                <Button variant="outline" size="sm" className="w-full text-xs">
                  Return to sign in
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-ink-700 dark:text-cream-300 mb-1.5">
                Official Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="officer@bhopal.gov.in"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-[#10201C]/15 dark:border-white/15 bg-white dark:bg-ink-900 text-sm focus:ring-2 focus:ring-teal-primary/30 outline-none"
                />
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
              </div>
            </div>

            <Button type="submit" variant="primary" className="w-full py-2.5 text-xs font-semibold">
              Send Reset Link
            </Button>

            <div className="text-center">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-xs text-ink-600 dark:text-cream-400 hover:text-teal-primary"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to login</span>
              </Link>
            </div>
          </form>
        )}
      </div>

      <div className="text-center text-[11px] text-ink-500">
        VayuSetu Open Civic Platform
      </div>
    </div>
  );
}

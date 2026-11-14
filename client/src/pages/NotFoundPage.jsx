import React from 'react';
import { Link } from 'react-router-dom';
import { Wind, Home, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[#F7F5F0] dark:bg-[#0B1513] text-[#10201C] dark:text-[#F7F5F0] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-teal-primary/10 text-teal-primary flex items-center justify-center mb-6">
        <Wind className="w-8 h-8 animate-pulse-slow" />
      </div>
      <span className="font-mono text-sm font-bold text-teal-primary uppercase tracking-wider mb-2">
        Error 404 • Lost in the Haze
      </span>
      <h1 className="font-heading text-4xl sm:text-5xl font-bold tracking-tight text-ink-900 dark:text-white mb-4">
        Page Not Found
      </h1>
      <p className="text-sm text-ink-600 dark:text-cream-400 max-w-md mb-8">
        The atmospheric route you were navigating does not exist or has been shifted in the civic registry.
      </p>
      <div className="flex items-center gap-3">
        <Link to="/">
          <Button variant="outline" size="sm" className="text-xs">
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            Home
          </Button>
        </Link>
        <Link to="/app/dashboard">
          <Button variant="primary" size="sm" className="text-xs">
            <Home className="w-3.5 h-3.5 mr-1" />
            Studio Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}

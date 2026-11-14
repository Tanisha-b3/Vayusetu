import React, { useState, useEffect } from 'react';
import {
  Wind,
  LayoutDashboard,
  PlusCircle,
  Activity,
  MapPin,
  CheckSquare,
  GitCompare,
  FileText,
  MessageSquare,
  Cpu,
  Search,
  Moon,
  Sun,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Database,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  Command,
} from 'lucide-react';
import { LanguageSwitcher, Button, Badge } from '../ui';
import { cn } from '../../utils/cn';

export const NAV_ITEMS = [
  { id: 'overview', label: 'Studio Overview', icon: LayoutDashboard, badge: null },
  { id: 'new-brief', label: 'New Brief / Upload', icon: PlusCircle, badge: 'Input' },
  { id: 'data-health', label: 'Data Health & Ledger', icon: Activity, badge: null },
  { id: 'hotspots', label: 'Hotspots & Map', icon: MapPin, badge: null },
  { id: 'actions', label: 'Action Tracker', icon: CheckSquare, badge: null },
  { id: 'compare', label: 'Temporal Compare', icon: GitCompare, badge: null },
  { id: 'documents', label: 'Document Studio', icon: FileText, badge: 'A4' },
  { id: 'assistant', label: 'Grounded Assistant', icon: MessageSquare, badge: 'RAG' },
  { id: 'workbench', label: 'AI Workbench', icon: Cpu, badge: '7 Agents' },
  { id: 'styleguide', label: 'Design Observatory', icon: Sparkles, badge: 'Tokens' },
];

export function AppShell({
  activeTab,
  onTabChange,
  reports = [],
  activeReportId,
  onSelectReport,
  onOpenUpload,
  onOpenWorkbench,
  onRefresh,
  loading,
  health,
  children,
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [language, setLanguage] = useState('en');

  // Toggle dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Ctrl+K command palette shortcut
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setCmdOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const activeReport = reports.find((r) => r.id === activeReportId);

  return (
    <div className="min-h-screen flex flex-col bg-cream-100 dark:bg-ink-950 text-ink-900 dark:text-cream-100 relative transition-colors duration-200">
      {/* Animated Atmospheric Haze */}
      <div className="atmospheric-haze" />

      {/* Main Layout Container */}
      <div className="flex flex-1 z-10">
        {/* Desktop Sidebar */}
        <aside
          className={cn(
            'hidden lg:flex flex-col bg-white/95 dark:bg-ink-900/95 backdrop-blur-md border-r border-ink-900/[0.08] dark:border-cream-100/[0.08] transition-all duration-300 shadow-soft sticky top-0 h-screen z-30 select-none',
            collapsed ? 'w-20' : 'w-64'
          )}
        >
          {/* Brand Header */}
          <div className="p-4 border-b border-ink-900/[0.06] dark:border-cream-100/[0.06] flex items-center justify-between">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-primary to-teal-hover text-white flex items-center justify-center shrink-0 shadow-md shadow-teal-primary/20">
                <Wind className="w-5 h-5" />
              </div>
              {!collapsed && (
                <div>
                  <div className="flex items-center gap-1.5">
                    <h1 className="font-heading font-extrabold text-base tracking-tight text-ink-900 dark:text-cream-100 leading-none">
                      VayuSetu
                    </h1>
                    <span className="text-[10px] font-devanagari font-bold px-1.5 py-0.2 rounded bg-teal-primary/10 text-teal-primary dark:text-teal-300">
                      वायुसेतु
                    </span>
                  </div>
                  <p className="text-[10px] text-ink-500 dark:text-cream-400 mt-1 leading-none">
                    Civic Air Quality Studio
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-1 rounded-lg text-ink-400 hover:text-ink-800 dark:text-cream-400 dark:hover:text-cream-100 hover:bg-cream-100 dark:hover:bg-ink-800 transition"
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto p-3 space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 group relative',
                    isActive
                      ? 'bg-teal-primary text-white shadow-sm shadow-teal-primary/25'
                      : 'text-ink-700 dark:text-cream-300 hover:bg-cream-100 dark:hover:bg-ink-800/80 hover:text-ink-900 dark:hover:text-cream-100'
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon className={cn('w-4 h-4 shrink-0', isActive ? 'text-white' : 'text-teal-primary dark:text-teal-400')} />
                  {!collapsed && (
                    <span className="flex-1 text-left truncate">{item.label}</span>
                  )}
                  {!collapsed && item.badge && (
                    <span
                      className={cn(
                        'text-[10px] px-1.5 py-0.2 rounded-full font-bold',
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-ink-900/5 dark:bg-cream-100/10 text-ink-600 dark:text-cream-400'
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Sidebar Footer (Provider status & Collapsed hint) */}
          <div className="p-3 border-t border-ink-900/[0.06] dark:border-cream-100/[0.06] bg-cream-50/50 dark:bg-ink-950/40">
            {!collapsed ? (
              <div className="space-y-2">
                <div className="p-2.5 rounded-xl bg-white dark:bg-ink-900 border border-ink-900/[0.06] dark:border-cream-100/[0.06] text-xs">
                  <div className="flex items-center justify-between text-[10px] text-ink-500 dark:text-cream-400 uppercase font-bold tracking-wider mb-1">
                    <span>Engine Status</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                  <div className="font-semibold text-ink-900 dark:text-cream-100 truncate">
                    {health?.provider === 'groq' ? `Groq (${health.model?.split('/')[1] || '120B'})` : 'Deterministic Rules'}
                  </div>
                  <div className="text-[10px] text-ink-500 dark:text-cream-400 mt-0.5">
                    Citation Guardrail Active
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex justify-center py-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" title="Engine Active" />
              </div>
            )}
          </div>
        </aside>

        {/* Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Bar */}
          <header className="sticky top-0 z-20 bg-white/95 dark:bg-ink-900/95 backdrop-blur-md border-b border-ink-900/[0.08] dark:border-cream-100/[0.08] px-4 sm:px-6 py-3 shadow-xs">
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
              {/* Left: Mobile hamburger & Global Search Button */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setMobileMenuOpen(true)}
                  className="lg:hidden p-2 rounded-xl text-ink-600 dark:text-cream-300 hover:bg-cream-100 dark:hover:bg-ink-800 transition"
                  aria-label="Open navigation menu"
                >
                  <Menu className="w-5 h-5" />
                </button>

                {/* Global Search / Command Bar Trigger */}
                <button
                  onClick={() => setCmdOpen(true)}
                  className="hidden sm:flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-cream-100 dark:bg-ink-950 border border-ink-900/[0.08] dark:border-cream-100/[0.08] text-xs text-ink-500 dark:text-cream-400 hover:border-teal-primary/40 transition w-56 md:w-64"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span className="flex-1 text-left truncate">Search or jump to...</span>
                  <kbd className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-white dark:bg-ink-900 border border-ink-900/10 dark:border-cream-100/10 shadow-2xs">
                    Ctrl K
                  </kbd>
                </button>
              </div>

              {/* Center: Active Report Selector */}
              <div className="flex items-center gap-2 max-w-xs sm:max-w-sm truncate">
                <select
                  value={activeReportId || ''}
                  onChange={(e) => onSelectReport(e.target.value)}
                  className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-ink-900/[0.08] dark:border-cream-100/[0.1] bg-white dark:bg-ink-900 text-ink-900 dark:text-cream-100 shadow-soft focus:outline-none focus:ring-2 focus:ring-teal-primary max-w-full truncate"
                  title="Select current briefing report"
                >
                  {reports.length === 0 && <option value="">No reports loaded</option>}
                  {reports.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.city ? `${r.city} • ` : ''}{r.reportDate || r.sourceFile} ({r.readingCount || 0} rows)
                    </option>
                  ))}
                </select>

                <button
                  onClick={onRefresh}
                  disabled={loading}
                  className="p-1.5 rounded-xl border border-ink-900/[0.08] dark:border-cream-100/[0.1] bg-white dark:bg-ink-900 text-ink-600 dark:text-cream-300 hover:text-ink-900 dark:hover:text-cream-100 shadow-soft transition disabled:opacity-50"
                  title="Refresh active dataset"
                >
                  <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
                </button>
              </div>

              {/* Right: Actions, Language & Theme Toggle */}
              <div className="flex items-center gap-2.5">
                <LanguageSwitcher
                  activeLang={language}
                  onChange={setLanguage}
                  className="hidden md:inline-block"
                />

                {/* Dark Mode Toggle */}
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className="p-2 rounded-xl border border-ink-900/[0.08] dark:border-cream-100/[0.1] bg-white dark:bg-ink-900 text-ink-700 dark:text-cream-300 hover:bg-cream-50 dark:hover:bg-ink-800 shadow-soft transition"
                  aria-label="Toggle visual theme"
                  title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                >
                  {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-ink-700" />}
                </button>

                {/* AI Workbench Trigger */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onOpenWorkbench}
                  icon={Cpu}
                  className="hidden sm:inline-flex bg-gradient-to-r from-teal-primary/10 to-indigo-500/10 border-teal-primary/30 text-teal-primary dark:text-teal-300 font-bold"
                >
                  AI Workbench
                </Button>

                {/* Upload Dataset Trigger */}
                <Button
                  variant="primary"
                  size="sm"
                  onClick={onOpenUpload}
                  icon={PlusCircle}
                >
                  Upload
                </Button>
              </div>
            </div>
          </header>

          {/* Page Body View */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
            {children}
          </main>
        </div>
      </div>

      {/* Mobile Drawer Navigation Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-ink-950/60 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-72 bg-white dark:bg-ink-900 flex flex-col p-4 shadow-2xl z-10">
            <div className="flex items-center justify-between pb-4 border-b border-ink-900/[0.08] dark:border-cream-100/[0.08]">
              <div className="flex items-center gap-2">
                <Wind className="w-6 h-6 text-teal-primary" />
                <span className="font-heading font-extrabold text-base">VayuSetu</span>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="p-1 text-ink-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 py-4 space-y-1">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onTabChange(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-left',
                    activeTab === item.id
                      ? 'bg-teal-primary text-white'
                      : 'text-ink-700 dark:text-cream-300 hover:bg-cream-100 dark:hover:bg-ink-800'
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
            <div className="pt-3 border-t border-ink-900/[0.08] dark:border-cream-100/[0.08]">
              <LanguageSwitcher activeLang={language} onChange={setLanguage} className="w-full" />
            </div>
          </div>
        </div>
      )}

      {/* Ctrl+K Command Palette Modal */}
      {cmdOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4">
          <div className="fixed inset-0 bg-ink-950/60 backdrop-blur-sm" onClick={() => setCmdOpen(false)} />
          <div className="relative w-full max-w-lg bg-white dark:bg-ink-900 rounded-card shadow-2xl border border-ink-900/[0.08] dark:border-cream-100/[0.1] overflow-hidden z-10 animate-in fade-in zoom-in-95">
            <div className="p-3.5 border-b border-ink-900/[0.06] dark:border-cream-100/[0.06] flex items-center gap-2.5">
              <Search className="w-4 h-4 text-ink-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type a command or jump to screen..."
                className="flex-1 bg-transparent text-sm text-ink-900 dark:text-cream-100 focus:outline-none placeholder:text-ink-400"
                autoFocus
              />
              <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cream-100 dark:bg-ink-800 text-ink-500">
                ESC
              </kbd>
            </div>
            <div className="max-h-72 overflow-y-auto p-2 space-y-1">
              {NAV_ITEMS.filter((item) => item.label.toLowerCase().includes(searchQuery.toLowerCase())).map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onTabChange(item.id);
                    setCmdOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-ink-700 dark:text-cream-300 hover:bg-cream-100 dark:hover:bg-ink-800 transition text-left"
                >
                  <item.icon className="w-4 h-4 text-teal-primary" />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

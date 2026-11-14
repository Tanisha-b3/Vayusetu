import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useParams, Navigate } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { DataQualityCard } from './components/DataQualityCard';
import { AirQualityMap } from './components/AirQualityMap';
import { FindingsList } from './components/FindingsList';
import { EvidenceDrawer } from './components/EvidenceDrawer';
import { ComparisonView } from './components/ComparisonView';
import { ActionTracker } from './components/ActionTracker';
import { DocumentStudio } from './components/DocumentStudio';
import { GroundedChat } from './components/GroundedChat';
import { ReadingsTable } from './components/ReadingsTable';
import { UploadModal } from './components/UploadModal';
import { AIWorkbenchDrawer } from './components/AIWorkbenchDrawer';
import { TableInterpretationPanel } from './components/TableInterpretationPanel';
import { Card, Button, EmptyState, useToast } from './components/ui';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import NotFoundPage from './pages/NotFoundPage';
import StyleguidePage from './pages/StyleguidePage';
import { StudioOverview } from './components/StudioOverview';
import { useAuthStore } from './store/authStore';

import {
  fetchHealth,
  fetchReports,
  fetchReport,
  fetchSamples,
  uploadReportText,
  triggerAnalyze,
  fetchReading,
  fetchRecommendations,
  updateActionStatus,
  triggerCompare,
  generateDoc,
  askQuestion,
  triggerPipeline,
  remapColumns,
} from './api';

import {
  Sparkles,
  PlusCircle,
  Cpu,
  Layers,
  Database,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

function StudioApp() {
  const { tab } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAuthenticated, demoLogin } = useAuthStore();

  // Map URL param to tab id
  const tabSlugMap = {
    dashboard: 'overview',
    overview: 'overview',
    'new-brief': 'new-brief',
    'data-health': 'data-health',
    hotspots: 'hotspots',
    actions: 'actions',
    compare: 'compare',
    documents: 'documents',
    assistant: 'assistant',
    workbench: 'workbench',
    evals: 'workbench',
    settings: 'overview',
  };

  const activeTab = tabSlugMap[tab] || 'overview';

  const [health, setHealth] = useState(null);
  const [reports, setReports] = useState([]);
  const [activeReportId, setActiveReportId] = useState(null);
  const [activeReport, setActiveReport] = useState(null);
  const [samples, setSamples] = useState([]);

  const [activeRole, setActiveRole] = useState(user?.role || 'ward_officer');
  const [evidenceReading, setEvidenceReading] = useState(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isWorkbenchOpen, setIsWorkbenchOpen] = useState(false);

  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [comparing, setComparing] = useState(false);
  const [generatingRecs, setGeneratingRecs] = useState(false);
  const [generatingDoc, setGeneratingDoc] = useState(false);
  const [asking, setAsking] = useState(false);
  const [runningPipeline, setRunningPipeline] = useState(false);
  const [remapping, setRemapping] = useState(false);

  // Auto-init user if none
  useEffect(() => {
    if (!isAuthenticated) {
      demoLogin('ward_officer');
    }
  }, [isAuthenticated, demoLogin]);

  // Open upload modal if route is /app/new-brief
  useEffect(() => {
    if (tab === 'new-brief') {
      setIsUploadOpen(true);
    }
  }, [tab]);

  // Initialize app data
  useEffect(() => {
    async function init() {
      try {
        setLoading(true);
        const [h, rList, sList] = await Promise.all([
          fetchHealth().catch(() => null),
          fetchReports().catch(() => []),
          fetchSamples().catch(() => []),
        ]);
        setHealth(h);
        setReports(rList);
        setSamples(sList);

        if (rList.length > 0) {
          setActiveReportId(rList[0].id);
        } else if (sList.length > 0) {
          setIsUploadOpen(true);
        }
      } catch (err) {
        console.error('Initialization error:', err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  // Fetch full active report when ID changes
  useEffect(() => {
    if (!activeReportId) {
      setActiveReport(null);
      return;
    }
    async function loadActive() {
      try {
        setLoading(true);
        const rep = await fetchReport(activeReportId);
        setActiveReport(rep);
      } catch (err) {
        console.error('Failed to load report:', err);
      } finally {
        setLoading(false);
      }
    }
    loadActive();
  }, [activeReportId]);

  // Handle citation click -> open Evidence Drawer
  const handleSelectCitation = async (citationId) => {
    if (!activeReport) return;
    const cleanId = citationId.replace(/^(curr|prev)\./, '');
    const found = activeReport.readings?.find((r) => r.id === cleanId);
    if (found) {
      setEvidenceReading(found);
      return;
    }

    try {
      const fetched = await fetchReading(activeReport.id, cleanId);
      setEvidenceReading(fetched);
    } catch (err) {
      console.warn('Could not fetch reading:', cleanId, err);
    }
  };

  // Run 7-Agent Autonomous Pipeline
  const handleRunPipeline = async () => {
    if (!activeReport) return;
    setRunningPipeline(true);
    try {
      const res = await triggerPipeline(activeReport.id, {
        roles: ['ward_officer', 'school', 'housing_society'],
        languages: ['hi'],
      });
      const updated = await fetchReport(activeReport.id);
      setActiveReport(updated);
      toast({
        type: 'success',
        title: '7-Agent Pipeline Completed',
        message: `Verified ${res.verification?.ratioText || 'all claims against data'}.`,
      });
    } catch (err) {
      toast({
        type: 'error',
        title: 'Pipeline Error',
        message: err.message,
      });
    } finally {
      setRunningPipeline(false);
    }
  };

  // Remap columns with manual user overrides
  const handleRemap = async (overrides) => {
    if (!activeReport) return;
    setRemapping(true);
    try {
      const updated = await remapColumns(activeReport.id, overrides);
      setActiveReport(updated);
      toast({
        type: 'success',
        title: 'Column Overrides Applied',
        message: 'Normalizer recomputed all readings and metrics.',
      });
    } catch (err) {
      toast({
        type: 'error',
        title: 'Remapping Failed',
        message: err.message,
      });
    } finally {
      setRemapping(false);
    }
  };

  // Trigger analysis
  const handleAnalyze = async () => {
    if (!activeReport) return;
    setAnalyzing(true);
    try {
      const analysis = await triggerAnalyze(activeReport.id);
      setActiveReport((prev) => ({ ...prev, analysis }));
      toast({
        type: 'success',
        title: 'Analysis Generated',
        message: 'Grounded findings synthesized with row-level citations.',
      });
    } catch (err) {
      toast({
        type: 'error',
        title: 'Analysis Failed',
        message: err.message,
      });
    } finally {
      setAnalyzing(false);
    }
  };

  // Trigger comparison
  const handleCompare = async (prevId) => {
    if (!activeReport) return;
    setComparing(true);
    try {
      const comparison = await triggerCompare(activeReport.id, prevId);
      if (comparison.message && !comparison.diff) {
        toast({ type: 'warning', title: 'Comparison Notice', message: comparison.message });
      } else {
        toast({ type: 'success', title: 'Comparison Ready', message: 'Temporal metric deltas computed.' });
      }
      setActiveReport((prev) => ({ ...prev, comparison }));
    } catch (err) {
      toast({ type: 'error', title: 'Comparison Failed', message: err.message });
    } finally {
      setComparing(false);
    }
  };

  const handleLoadSampleAndCompare = async (sample) => {
    if (!activeReport) return;
    setComparing(true);
    try {
      const newReport = await uploadReportText({
        text: sample.content,
        city: sample.city,
        name: sample.name,
      });
      setReports((prev) => [newReport, ...prev.filter((r) => r.id !== newReport.id)]);
      const comparison = await triggerCompare(activeReport.id, newReport.id);
      setActiveReport((prev) => ({ ...prev, comparison }));
      toast({ type: 'success', title: 'Sample Compared', message: `Comparing against ${sample.name}` });
    } catch (err) {
      toast({ type: 'error', title: 'Load Failed', message: err.message });
    } finally {
      setComparing(false);
    }
  };

  // Generate recommendations for role
  const handleGenerateRecommendations = async (role) => {
    if (!activeReport) return;
    setGeneratingRecs(true);
    try {
      const recs = await fetchRecommendations(activeReport.id, role);
      setActiveReport((prev) => ({
        ...prev,
        recommendations: { ...(prev.recommendations || {}), [role]: recs },
      }));
      toast({
        type: 'success',
        title: 'Role Playbook Ready',
        message: `Generated action plan for ${health?.roles?.[role] || role}.`,
      });
    } catch (err) {
      toast({ type: 'error', title: 'Recommendation Failed', message: err.message });
    } finally {
      setGeneratingRecs(false);
    }
  };

  // Update action status
  const handleUpdateAction = async (role, actionId, update) => {
    if (!activeReport) return;
    try {
      const updated = await updateActionStatus(activeReport.id, role, actionId, update);
      setActiveReport((prev) => {
        const roleRecs = prev.recommendations?.[role];
        if (!roleRecs) return prev;
        const newActions = roleRecs.actions.map((a) => (a.id === actionId ? { ...a, ...updated } : a));
        return {
          ...prev,
          recommendations: {
            ...prev.recommendations,
            [role]: { ...roleRecs, actions: newActions },
          },
        };
      });
      toast({ type: 'success', message: 'Action status updated.' });
    } catch (err) {
      toast({ type: 'error', title: 'Update Failed', message: err.message });
    }
  };

  // Generate document
  const handleGenerateDoc = async (kind, params) => {
    if (!activeReport) return;
    setGeneratingDoc(true);
    try {
      const doc = await generateDoc(activeReport.id, kind, params);
      setActiveReport((prev) => ({
        ...prev,
        documents: [doc, ...(prev.documents || []).filter((d) => d.id !== doc.id)],
      }));
      toast({ type: 'success', title: 'Document Created', message: `${kind === 'briefing' ? 'Internal Brief' : 'Citizen Advisory'} generated.` });
    } catch (err) {
      toast({ type: 'error', title: 'Generation Failed', message: err.message });
    } finally {
      setGeneratingDoc(false);
    }
  };

  // Ask-the-data RAG assistant
  const handleAsk = async (question) => {
    if (!activeReport) throw new Error('No active report');
    setAsking(true);
    try {
      return await askQuestion(activeReport.id, question, activeRole);
    } finally {
      setAsking(false);
    }
  };

  // New report uploaded
  const handleUploadSuccess = (newReport) => {
    setReports((prev) => [newReport, ...prev.filter((r) => r.id !== newReport.id)]);
    setActiveReportId(newReport.id);
    setActiveReport(newReport);
    toast({
      type: 'success',
      title: 'Dataset Ingested',
      message: `Parsed ${newReport.readings?.length || 0} readings from ${newReport.sourceFile}.`,
    });
  };

  const handleTabChange = (newTab) => {
    if (newTab === 'styleguide') {
      navigate('/styleguide');
      return;
    }
    const slug = newTab === 'overview' ? 'dashboard' : newTab;
    navigate(`/app/${slug}`);
  };

  return (
    <AppShell
      activeTab={activeTab}
      onTabChange={handleTabChange}
      reports={reports}
      activeReportId={activeReportId}
      onSelectReport={setActiveReportId}
      onOpenUpload={() => setIsUploadOpen(true)}
      onOpenWorkbench={() => setIsWorkbenchOpen(true)}
      onRefresh={() => {
        if (activeReportId) {
          setLoading(true);
          fetchReport(activeReportId)
            .then(setActiveReport)
            .finally(() => setLoading(false));
        }
      }}
      loading={loading}
      health={health}
    >
      {!activeReport ? (
        <EmptyState
          title="Welcome to VayuSetu Briefing Studio"
          description="Upload an air quality CSV/XLSX dataset or load one of the pre-built sample Bhopal datasets to explore deterministic cleaning, grounded citations, and multi-role advisories."
          actionLabel="Load Sample Dataset"
          onAction={() => setIsUploadOpen(true)}
        />
      ) : (
        <div className="space-y-6">
          {/* TAB 1: Studio Overview (Prompt 1: 12-Column Asymmetric Bento Grid) */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <TableInterpretationPanel
                report={activeReport}
                onRemap={handleRemap}
                remapping={remapping}
              />

              <StudioOverview
                report={activeReport}
                onSelectCitation={handleSelectCitation}
                onSelectHotspot={(h) => {
                  if (h.evidenceIds?.[0]) handleSelectCitation(h.evidenceIds[0]);
                }}
                onFilterLedger={(status) => {
                  navigate('/app/data-health');
                }}
                onOpenUpload={() => setIsUploadOpen(true)}
                onLoadSample={(sampleName) => {
                  const s = samples.find((x) => x.name === sampleName);
                  if (s) handleLoadSampleAndCompare(s);
                }}
                onNavigateTab={(targetTab) => handleTabChange(targetTab)}
              />

              <div className="flex items-center justify-between pt-4 border-t border-obs-hairline">
                <div>
                  <h2 className="text-xl font-bold font-heading text-obs-ink">
                    Executive Briefing & Key Findings
                  </h2>
                  <p className="text-xs text-obs-muted mt-0.5">
                    Synthesized findings with verifiable row-level citations [R#].
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    icon={Cpu}
                    onClick={handleRunPipeline}
                    isLoading={runningPipeline}
                  >
                    Run 7-Agent Pipeline
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    icon={Sparkles}
                    onClick={handleAnalyze}
                    isLoading={analyzing}
                  >
                    {activeReport.analysis ? 'Regenerate Analysis' : 'Generate Analysis'}
                  </Button>
                </div>
              </div>

              <FindingsList
                analysis={activeReport.analysis}
                onSelectCitation={handleSelectCitation}
              />
            </div>
          )}

          {/* TAB 2: New Brief / Upload */}
          {activeTab === 'new-brief' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <Card className="p-8 text-center max-w-2xl mx-auto space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-teal-primary/10 text-teal-primary flex items-center justify-center mx-auto">
                  <PlusCircle className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold font-heading text-ink-900 dark:text-cream-100">
                  Upload Air Quality Dataset
                </h2>
                <p className="text-sm text-ink-600 dark:text-cream-300">
                  Drop CSV, TXT, Excel or whitespace-delimited logs. SchemaAgent handles Hindi headers and unit discrepancies deterministically.
                </p>
                <div className="pt-2">
                  <Button variant="primary" size="lg" onClick={() => setIsUploadOpen(true)}>
                    Open Dataset Ingestion Wizard
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {/* TAB 3: Data Health & Ledger */}
          {activeTab === 'data-health' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <TableInterpretationPanel
                report={activeReport}
                onRemap={handleRemap}
                remapping={remapping}
              />

              <DataQualityCard
                summary={activeReport.summary}
                dataHealth={activeReport.dataHealth}
                onSelectHotspot={(h) => {
                  if (h.evidenceIds?.[0]) handleSelectCitation(h.evidenceIds[0]);
                }}
              />

              <ReadingsTable
                readings={activeReport.readings || []}
                onSelectReading={setEvidenceReading}
              />
            </div>
          )}

          {/* TAB 4: Hotspots & Spatial Map */}
          {activeTab === 'hotspots' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <AirQualityMap
                locations={activeReport.summary?.locations || []}
                onSelectEvidence={handleSelectCitation}
              />

              <FindingsList
                analysis={activeReport.analysis}
                onSelectCitation={handleSelectCitation}
              />
            </div>
          )}

          {/* TAB 5: Role Action Tracker */}
          {activeTab === 'actions' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <ActionTracker
                report={activeReport}
                roles={health?.roles || { ward_officer: 'Ward Officer', housing_society: 'Housing Society', school: 'School' }}
                activeRole={activeRole}
                onRoleChange={setActiveRole}
                onGenerate={handleGenerateRecommendations}
                onUpdateAction={handleUpdateAction}
                onSelectCitation={handleSelectCitation}
                generating={generatingRecs}
              />
            </div>
          )}

          {/* TAB 6: Temporal Comparison */}
          {activeTab === 'compare' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <ComparisonView
                currentReport={activeReport}
                allReports={reports}
                samples={samples}
                comparison={activeReport.comparison}
                onCompare={handleCompare}
                onLoadSampleAndCompare={handleLoadSampleAndCompare}
                comparing={comparing}
                onSelectCitation={handleSelectCitation}
              />
            </div>
          )}

          {/* TAB 7: Document Studio */}
          {activeTab === 'documents' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <DocumentStudio
                languages={health?.languages || { en: 'English', hi: 'Hindi' }}
                levels={health?.levels || ['simple', 'standard', 'detailed']}
                roles={health?.roles || { ward_officer: 'Ward Officer', housing_society: 'Housing Society', school: 'School' }}
                onGenerate={handleGenerateDoc}
                generating={generatingDoc}
                documents={activeReport.documents || []}
                onSelectCitation={handleSelectCitation}
              />
            </div>
          )}

          {/* TAB 8: Grounded Assistant (RAG Chat) */}
          {activeTab === 'assistant' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <GroundedChat
                onAsk={handleAsk}
                asking={asking}
                onSelectCitation={handleSelectCitation}
              />
            </div>
          )}

          {/* TAB 9: AI Workbench */}
          {activeTab === 'workbench' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <Card className="p-6">
                <div className="flex items-center justify-between pb-4 border-b border-ink-900/[0.08] dark:border-cream-100/[0.08]">
                  <div>
                    <h2 className="text-lg font-bold font-heading text-ink-900 dark:text-cream-100 flex items-center gap-2">
                      <Cpu className="w-5 h-5 text-teal-primary" />
                      Multi-Agent Pipeline Workspace
                    </h2>
                    <p className="text-xs text-ink-600 dark:text-cream-300 mt-0.5">
                      Inspect execution telemetry, latency, token consumption, and code guardrails across all 7 autonomous agents.
                    </p>
                  </div>
                  <Button variant="primary" icon={Cpu} onClick={handleRunPipeline} isLoading={runningPipeline}>
                    Run All 7 Agents
                  </Button>
                </div>

                <div className="mt-4 flex items-center gap-3">
                  <Button variant="secondary" size="sm" onClick={() => setIsWorkbenchOpen(true)}>
                    Open Full-Screen AI Workbench Drawer
                  </Button>
                </div>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* Slide-over Evidence Traceability Drawer */}
      <EvidenceDrawer
        reading={evidenceReading}
        onClose={() => setEvidenceReading(null)}
      />

      {/* Multi-Agent AI Workbench Drawer */}
      <AIWorkbenchDrawer
        isOpen={isWorkbenchOpen}
        onClose={() => setIsWorkbenchOpen(false)}
        trace={activeReport?.pipelineTrace}
        verification={activeReport?.verification}
        onRunPipeline={handleRunPipeline}
        running={runningPipeline}
      />

      {/* Dataset Upload Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={handleUploadSuccess}
        samples={samples}
      />
    </AppShell>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/styleguide" element={<StyleguidePage />} />
        <Route path="/app" element={<Navigate to="/app/dashboard" replace />} />
        <Route path="/app/:tab" element={<StudioApp />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

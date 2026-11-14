import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
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
} from './api';

import {
  LayoutDashboard,
  Sparkles,
  GitCompare,
  CheckSquare,
  FileText,
  TableProperties,
  MessageSquare,
  Flame,
  AlertCircle,
} from 'lucide-react';

export default function App() {
  const [health, setHealth] = useState(null);
  const [reports, setReports] = useState([]);
  const [activeReportId, setActiveReportId] = useState(null);
  const [activeReport, setActiveReport] = useState(null);
  const [samples, setSamples] = useState([]);

  const [activeTab, setActiveTab] = useState('overview'); // overview, analysis, comparison, actions, documents, ledger, chat
  const [activeRole, setActiveRole] = useState('ward_officer');
  const [evidenceReading, setEvidenceReading] = useState(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [comparing, setComparing] = useState(false);
  const [generatingRecs, setGeneratingRecs] = useState(false);
  const [generatingDoc, setGeneratingDoc] = useState(false);
  const [asking, setAsking] = useState(false);

  // Initialize app
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
          // If no reports uploaded yet, auto-load first demo sample
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

    // Handle "curr.R3" or "prev.R3" prefix
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

  // Trigger analysis
  const handleAnalyze = async () => {
    if (!activeReport) return;
    setAnalyzing(true);
    try {
      const analysis = await triggerAnalyze(activeReport.id);
      setActiveReport((prev) => ({ ...prev, analysis }));
    } catch (err) {
      alert(`Analysis failed: ${err.message}`);
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
        alert(comparison.message);
      }
      setActiveReport((prev) => ({ ...prev, comparison }));
    } catch (err) {
      alert(`Comparison failed: ${err.message}`);
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
    } catch (err) {
      alert(`Load sample failed: ${err.message}`);
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
    } catch (err) {
      alert(`Recommendation failed: ${err.message}`);
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
    } catch (err) {
      alert(`Update failed: ${err.message}`);
    }
  };

  // Generate document
  const handleGenerateDoc = async (kind, params) => {
    if (!activeReport) return null;
    setGeneratingDoc(true);
    try {
      const doc = await generateDoc(activeReport.id, kind, params);
      setActiveReport((prev) => ({
        ...prev,
        documents: [...(prev.documents || []), doc],
      }));
      return doc;
    } catch (err) {
      alert(`Document generation failed: ${err.message}`);
      return null;
    } finally {
      setGeneratingDoc(false);
    }
  };

  // Grounded Ask
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
  };

  const navTabs = [
    { id: 'overview', label: 'Studio Overview', icon: LayoutDashboard },
    { id: 'analysis', label: 'Grounded Findings', icon: Sparkles },
    { id: 'comparison', label: 'Report Comparison', icon: GitCompare },
    { id: 'actions', label: 'Action Tracker', icon: CheckSquare },
    { id: 'documents', label: 'Document Studio', icon: FileText },
    { id: 'ledger', label: 'Readings Ledger', icon: TableProperties },
    { id: 'chat', label: 'Grounded Assistant', icon: MessageSquare },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header
        reports={reports}
        activeReportId={activeReportId}
        onSelectReport={setActiveReportId}
        onOpenUpload={() => setIsUploadOpen(true)}
        onRefresh={() => {
          if (activeReportId) {
            setLoading(true);
            fetchReport(activeReportId)
              .then(setActiveReport)
              .finally(() => setLoading(false));
          }
        }}
        health={health}
        loading={loading}
      />

      {/* Main navigation tabs */}
      <div style={{
        background: '#ffffff',
        borderBottom: '1px solid var(--border)',
        padding: '0 1.5rem'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'flex',
          gap: '0.25rem',
          overflowX: 'auto'
        }}>
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.75rem 1rem',
                  border: 'none',
                  background: 'none',
                  borderBottom: isActive ? '3px solid var(--primary)' : '3px solid transparent',
                  color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease'
                }}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Page Content */}
      <main style={{ flex: 1, padding: '1.5rem', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
        {!activeReport ? (
          <div className="card" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              Welcome to VayuSetu Briefing Studio
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '480px', margin: '0 auto 1.5rem auto' }}>
              Upload an air quality CSV/XLSX dataset or load one of the pre-built sample Bhopal datasets to explore deterministic cleaning, grounded citations, and multi-role advisories.
            </p>
            <button
              onClick={() => setIsUploadOpen(true)}
              className="btn btn-primary"
            >
              Open Dataset Loader
            </button>
          </div>
        ) : (
          <div>
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="fade-in">
                <DataQualityCard
                  summary={activeReport.summary}
                  onSelectHotspot={(h) => {
                    if (h.evidenceIds?.[0]) handleSelectCitation(h.evidenceIds[0]);
                  }}
                />

                <AirQualityMap
                  locations={activeReport.summary?.locations || []}
                  onSelectEvidence={handleSelectCitation}
                />

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1.5rem' }}>
                  <FindingsList
                    analysis={activeReport.analysis}
                    onAnalyze={handleAnalyze}
                    analyzing={analyzing}
                    onSelectCitation={handleSelectCitation}
                  />

                  <ActionTracker
                    recommendations={activeReport.recommendations || {}}
                    roles={health?.roles || { ward_officer: 'Ward Officer', housing_society: 'Housing Society', school: 'School' }}
                    activeRole={activeRole}
                    onSelectRole={setActiveRole}
                    onGenerateRecommendations={handleGenerateRecommendations}
                    generating={generatingRecs}
                    onUpdateAction={handleUpdateAction}
                    onSelectCitation={handleSelectCitation}
                  />
                </div>
              </div>
            )}

            {/* Grounded Findings Tab */}
            {activeTab === 'analysis' && (
              <div className="fade-in">
                <FindingsList
                  analysis={activeReport.analysis}
                  onAnalyze={handleAnalyze}
                  analyzing={analyzing}
                  onSelectCitation={handleSelectCitation}
                />
              </div>
            )}

            {/* Comparison Tab */}
            {activeTab === 'comparison' && (
              <div className="fade-in">
                <ComparisonView
                  comparison={activeReport.comparison}
                  reports={reports}
                  currentReportId={activeReport.id}
                  onCompare={handleCompare}
                  comparing={comparing}
                  onSelectCitation={handleSelectCitation}
                  onOpenUpload={() => setIsUploadOpen(true)}
                  samples={samples}
                  onLoadSample={handleLoadSampleAndCompare}
                />
              </div>
            )}

            {/* Action Tracker Tab */}
            {activeTab === 'actions' && (
              <div className="fade-in">
                <ActionTracker
                  recommendations={activeReport.recommendations || {}}
                  roles={health?.roles || { ward_officer: 'Ward Officer', housing_society: 'Housing Society', school: 'School' }}
                  activeRole={activeRole}
                  onSelectRole={setActiveRole}
                  onGenerateRecommendations={handleGenerateRecommendations}
                  generating={generatingRecs}
                  onUpdateAction={handleUpdateAction}
                  onSelectCitation={handleSelectCitation}
                />
              </div>
            )}

            {/* Document Studio Tab */}
            {activeTab === 'documents' && (
              <div className="fade-in">
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

            {/* Readings Ledger Tab */}
            {activeTab === 'ledger' && (
              <div className="fade-in">
                <ReadingsTable
                  readings={activeReport.readings || []}
                  onSelectReading={(r) => setEvidenceReading(r)}
                />
              </div>
            )}

            {/* Grounded Chat Tab */}
            {activeTab === 'chat' && (
              <div className="fade-in">
                <GroundedChat
                  onAsk={handleAsk}
                  asking={asking}
                  onSelectCitation={handleSelectCitation}
                />
              </div>
            )}
          </div>
        )}
      </main>

      {/* Slide-over Evidence Traceability Drawer */}
      <EvidenceDrawer
        reading={evidenceReading}
        onClose={() => setEvidenceReading(null)}
      />

      {/* Dataset Upload Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={handleUploadSuccess}
        samples={samples}
      />
    </div>
  );
}

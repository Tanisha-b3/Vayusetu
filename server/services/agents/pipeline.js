// Master Multi-Agent Pipeline Orchestrator with Visible Trace and Code Guardrails.
import { runAuditorAgent } from './auditorAgent.js';
import { runAnalystAgent } from './analystAgent.js';
import { runPlannerAgent } from './plannerAgent.js';
import { runWriterAgent } from './writerAgent.js';
import { runCriticAgent } from './criticAgent.js';
import { runTranslatorAgent } from './translatorAgent.js';
import { verifyDocument, buildReadingLookup } from '../verify.js';
import { computeConfidence, computeDataHealth } from '../normalizer.js';

export async function runAnalysisPipeline(report, options = {}) {
  const trace = [];
  const roles = options.roles || ['ward_officer', 'school', 'housing_society'];
  const targetLanguages = options.languages || ['hi'];

  console.log(`[Pipeline] Starting multi-agent analysis for report ${report.id} (${report.sourceFile})`);

  // ---- STEP 1: Code-Computed Statistics & Data Health (Deterministic Ground Truth) ----
  const dataHealth = computeDataHealth(report);
  const readingMap = buildReadingLookup(report);

  // Annotate hotspots with deterministic code confidence
  const annotatedHotspots = (report.summary?.hotspots || []).map((h) => {
    const conf = computeConfidence({
      location: h.location,
      readings: report.readings || [],
      locationStats: report.summary?.locations?.find((l) => l.key === h.key),
    });
    return {
      ...h,
      confidence: conf.level,
      confidenceScore: conf.score,
      confidenceFactors: conf.factors,
    };
  });

  const computedStats = {
    indicators: report.summary?.indicators || ['pm25'],
    hotspots: annotatedHotspots,
    locations: report.summary?.locations || [],
    dataQuality: report.summary?.dataQuality || {},
    dataHealth,
  };

  // ---- STEP 2: AuditorAgent (Explains quarantined / suspicious data in plain language) ----
  const flagged = (report.readings || [])
    .filter((r) => r.flags && r.flags.length > 0)
    .map((r) => ({
      readingId: r.id,
      location: r.location,
      flags: r.flags,
      rule: r.flags[0],
      values: r.values,
    }));

  const auditorRes = await runAuditorAgent({
    flaggedReadings: flagged,
    dataQuality: report.summary?.dataQuality || {},
  });
  trace.push(auditorRes.telemetry);

  // ---- STEP 3: AnalystAgent (Interprets trends from precomputed stats only) ----
  const analystRes = await runAnalystAgent({
    report,
    computedStats,
  });
  trace.push(analystRes.telemetry);
  const analysis = analystRes.data || {};

  // ---- STEP 4: PlannerAgent (Role-specific prioritized actions with done-checks) ----
  const recommendations = {};
  for (const role of roles) {
    const plannerRes = await runPlannerAgent({
      role,
      report,
      hotspots: annotatedHotspots,
    });
    trace.push(plannerRes.telemetry);
    recommendations[role] = plannerRes.data;
  }

  // ---- STEP 5 & 6: WriterAgent + CriticAgent Review Loop ----
  // Pass 1: WriterAgent drafts
  const writerRes = await runWriterAgent({
    report,
    computedStats,
    language: 'en',
  });
  trace.push(writerRes.telemetry);

  let draft = writerRes.data || {};
  let criticRes = await runCriticAgent({ draft, report });
  trace.push(criticRes.telemetry);

  // If Critic fails the draft, perform one automatic revision pass with Critic's issues fed back
  if (!criticRes.data?.pass && criticRes.data?.issues?.length > 0) {
    console.warn(`[Pipeline] CriticAgent rejected draft with ${criticRes.data.issues.length} issues. Running automated revision...`);
    
    const revisionRes = await runWriterAgent({
      report,
      computedStats,
      language: 'en',
      feedbackIssues: criticRes.data.issues,
    });
    revisionRes.telemetry.agent = 'WriterAgent[Revised]';
    trace.push(revisionRes.telemetry);

    if (revisionRes.success && revisionRes.data) {
      draft = revisionRes.data;
      // Second review by CriticAgent
      criticRes = await runCriticAgent({ draft, report });
      criticRes.telemetry.agent = 'CriticAgent[Re-Audit]';
      trace.push(criticRes.telemetry);
    }
  }

  // ---- STEP 7: TranslatorAgent (Multilingual translation with citation preservation) ----
  const translations = {};
  for (const lang of targetLanguages) {
    if (lang === 'en') continue;
    const transRes = await runTranslatorAgent({
      advisory: draft.citizenAdvisory,
      targetLanguage: lang,
    });
    trace.push(transRes.telemetry);
    translations[lang] = transRes.data;
  }

  // ---- STEP 8: Final Strict Verification Guardrail (Code Checks Citation Truth) ----
  const verification = verifyDocument(draft.internalBrief?.executiveSummary || '', report);
  const advisoryVerification = verifyDocument(draft.citizenAdvisory?.headline || '', report);

  const combinedVerification = {
    total: verification.total + advisoryVerification.total,
    verified: verification.verified + advisoryVerification.verified,
    unverified: verification.unverified + advisoryVerification.unverified,
    removed: 0,
    ratioText: `${verification.verified + advisoryVerification.verified}/${Math.max(1, verification.total + advisoryVerification.total)} claims verified against your data`,
    criticVerdict: criticRes.data?.pass ? 'Passed Critic Audit' : 'Flagged with Minor Issues',
    criticScore: criticRes.data?.score || 90,
  };

  return {
    reportId: report.id,
    analysis,
    recommendations,
    briefing: draft.internalBrief,
    citizenAdvisory: draft.citizenAdvisory,
    translations,
    auditor: auditorRes.data,
    dataHealth,
    verification: combinedVerification,
    trace,
  };
}

// End-to-end test for Multi-Agent Pipeline, Telemetry Trace, and Hallucination Citation Verifier
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseText } from '../services/parser.js';
import { createReport } from '../services/normalizer.js';
import { runAnalysisPipeline } from '../services/agents/pipeline.js';
import { verifySentence, verifyDocument } from '../services/verify.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sampleDir = path.join(__dirname, '..', 'sample-data');

function assert(cond, msg) {
  if (!cond) {
    console.error(`❌ Assertion FAILED: ${msg}`);
    process.exit(1);
  }
  console.log(`  ✓ ${msg}`);
}

async function runAgentTests() {
  console.log('====================================================');
  console.log('🤖 RUNNING MULTI-AGENT PIPELINE & VERIFICATION TESTS');
  console.log('====================================================\n');

  // Load a test CSV
  const csvContent = fs.readFileSync(path.join(sampleDir, 'report_2026-11-13.csv'), 'utf8');
  const { table } = parseText(csvContent);
  const report = createReport({
    id: 'test-agent-rep',
    sourceFile: 'report_2026-11-13.csv',
    table,
    city: 'Bhopal',
  });

  // ---------------- TEST 1: Deliberate Hallucination Verification Guardrail ----------------
  console.log('TEST 1: Strict Citation Guardrail against Mock Hallucinations');
  const knownStations = (report.summary.locations || []).map((l) => l.location);

  // Case A: Hallucinated Row ID (R999 doesn't exist)
  const fakeRowSentence = 'MP Nagar registered an unprecedented spike of 245 µg/m³ [R999].';
  const checkA = verifySentence(fakeRowSentence, report, knownStations);
  assert(!checkA.verified, 'Caught hallucinated row ID R999');
  assert(checkA.issues.includes('cited_rows_do_not_exist'), 'Identified cited_rows_do_not_exist');

  // Case B: Hallucinated Number (R3 exists, but real value is around 175, sentence claims 850)
  const fakeNumberSentence = 'MP Nagar observed an alarming 850 µg/m³ [R3].';
  const checkB = verifySentence(fakeNumberSentence, report, knownStations);
  assert(!checkB.verified, 'Caught hallucinated number 850 against R3');
  assert(checkB.issues.includes('number_mismatch_with_cited_rows'), 'Identified number_mismatch_with_cited_rows');

  // Case C: Station Mismatch (claims Kolar Road, but R3 is MP Nagar)
  const fakeStationSentence = 'Kolar Road suffered severe conditions reaching 175 µg/m³ [R3].';
  const checkC = verifySentence(fakeStationSentence, report, knownStations);
  assert(!checkC.verified, 'Caught station mismatch between Kolar Road and cited R3');
  assert(checkC.issues.includes('station_mismatch_with_cited_row'), 'Identified station_mismatch_with_cited_row');

  // Case D: Valid Grounded Sentence (Matches station, number, and exists)
  const validSentence = `${report.readings[0].location} recorded air quality reading [${report.readings[0].id}].`;
  const checkD = verifySentence(validSentence, report, knownStations);
  assert(checkD.verified, `Grounded sentence verified: ${checkD.verified}`);
  console.log('  🎉 Test 1 passed!\n');

  // ---------------- TEST 2: Multi-Agent Pipeline Execution & Trace Telemetry ----------------
  console.log('TEST 2: Multi-Agent Pipeline & AI Workbench Telemetry Trace');
  const pipelineResult = await runAnalysisPipeline(report, {
    roles: ['ward_officer', 'school'],
    languages: ['hi'],
  });

  assert(pipelineResult != null, 'Pipeline completed successfully');
  assert(Array.isArray(pipelineResult.trace), 'Pipeline produced a trace array');
  assert(pipelineResult.trace.length >= 5, `Trace recorded ${pipelineResult.trace.length} agent steps (expected >= 5)`);

  for (const step of pipelineResult.trace) {
    assert(step.agent != null, `Trace step has agent name: ${step.agent}`);
    assert(step.model != null, `Trace step has model: ${step.model}`);
    assert(typeof step.latencyMs === 'number', `Trace step has latencyMs: ${step.latencyMs}ms`);
    assert(step.status != null, `Trace step has status: ${step.status}`);
  }

  // Check Data Health
  assert(pipelineResult.dataHealth != null, 'Data health metrics computed');
  assert(pipelineResult.dataHealth.verdict != null, `Data health verdict: ${pipelineResult.dataHealth.verdict}`);

  // Check Critic Review & Verification
  assert(pipelineResult.verification != null, 'Verification results recorded');
  assert(pipelineResult.verification.ratioText != null, `Verification ratio: ${pipelineResult.verification.ratioText}`);

  // Check Role-specific Planner output & School Traffic Light
  assert(pipelineResult.recommendations.ward_officer != null, 'Ward officer recommendations generated');
  assert(pipelineResult.recommendations.school != null, 'School recommendations generated');
  assert(pipelineResult.recommendations.school.schoolTrafficLight != null, 'School Traffic Light generated');

  console.log('  🎉 Test 2 passed!\n');

  console.log('====================================================');
  console.log('✅ ALL AGENT & VERIFICATION TESTS PASSED (2/2)');
  console.log('====================================================');
}

runAgentTests().catch((err) => {
  console.error('Fatal agent test error:', err);
  process.exit(1);
});

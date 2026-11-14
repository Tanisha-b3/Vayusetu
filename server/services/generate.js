// Orchestrates: retrieve (RAG) -> build prompt -> LLM (Groq / Gemini) -> verify citations -> return.
import { getReadingIndex, getKnowledgeIndex } from './rag/indexer.js';
import { gather } from './rag/retriever.js';
import { generateJSON, hasKey, activeProvider } from './gemini.js';
import { verifyCitations, validIdsFor } from './verify.js';
import { compareReports } from './compare.js';
import { analysisPrompt, recommendationsPrompt, comparisonPrompt, briefingPrompt, advisoryPrompt, qaPrompt } from '../prompts/index.js';

const fmt = (docs) => docs.map((d) => d.text).join('\n');

export function computedFor(report) {
  const s = report.summary;
  return {
    dataQuality: s.dataQuality,
    locations: s.locations.map((l) => ({
      location: l.location, band: l.band, pm25: l.pm25.value, pm10: l.pm10.value, aqi: l.aqi.value,
      evidence: [...new Set([...l.pm25.okIds, ...l.pm10.okIds, ...l.aqi.okIds])],
      unusableReadings: [...new Set([...l.pm25.problemIds, ...l.pm10.problemIds, ...l.aqi.problemIds])],
    })),
    hotspots: s.hotspots.map((h) => ({ location: h.location, band: h.band, pm25: h.pm25, pm10: h.pm10, aqi: h.aqi, evidence: h.evidenceIds })),
  };
}

async function context(report, queries, { kQueries, kFilter, k = 4 } = {}) {
  const idx = await getReadingIndex(report);
  const kidx = await getKnowledgeIndex();
  const data = await gather(idx, queries, { k, always: (d) => d.meta.flagged || d.meta.hotspot });
  let know = [];
  for (const q of kQueries) know.push(...(await gather(kidx, [q], { k: 2, always: kFilter })));
  know = [...new Map(know.map((d) => [d.id, d])).values()];
  return { dataDocs: data, dataText: fmt(data), knowledgeDocs: know, knowledgeText: fmt(know) };
}

const ids = (docs) => docs.map((d) => d.id);
const withMeta = (result, ctx, v, by = null) => {
  const providerInfo = activeProvider();
  const generatedBy = by || providerInfo.provider;
  return {
    ...result,
    generatedBy,
    model: providerInfo.model,
    generatedAt: new Date().toISOString(),
    retrieval: { readings: ids(ctx.dataDocs), knowledge: ids(ctx.knowledgeDocs) },
    verification: v,
  };
};

// ---------- 1. analysis ----------
function rulesAnalysis(report) {
  const s = report.summary;
  const findings = s.hotspots.map((h, i) => ({
    id: `F${i + 1}`, type: 'observed', title: `Potential hotspot: ${h.location}`,
    statement: `${h.location} is in the ${h.band} band (PM2.5 ${h.pm25 ?? 'n/a'}, PM10 ${h.pm10 ?? 'n/a'}, AQI ${h.aqi ?? 'n/a'}).`,
    citations: h.evidenceIds, confidence: 'high',
  }));
  s.gaps.forEach((g) => findings.push({
    id: `F${findings.length + 1}`, type: 'data_gap', title: `${g.location}: ${g.field} ${g.status}`,
    statement: `${g.field} at ${g.location} is ${g.status} (raw value "${g.raw}").`, citations: [g.readingId], confidence: 'high',
  }));
  return { headline: `${s.hotspots.length} potential hotspot(s); data reliability ${s.dataQuality.reliability}.`,
    reliability: { level: s.dataQuality.reliability, explanation: `${s.dataQuality.usableShare}% of readings are usable.` },
    findings, possible_causes: [], area_comparison: [], unusual_readings: [] };
}

export async function analyzeReport(report) {
  const ctx = await context(report,
    ['highest pollution potential hotspot locations', 'missing invalid or suspicious readings', 'unusual or extreme readings PM2.5 PM10 AQI'],
    { kQueries: ['AQI categories health meaning', 'possible pollution sources observed versus cause PM2.5 PM10 ratio'] });
  if (!hasKey()) return withMeta(rulesAnalysis(report), ctx, { droppedCitations: 0, unverifiedItems: 0 }, 'rules');
  try {
    const { system, prompt } = analysisPrompt({ computed: computedFor(report), report, dataText: ctx.dataText, knowledgeText: ctx.knowledgeText });
    const out = await generateJSON({ system, prompt });
    out.reliability = { ...out.reliability, level: report.summary.dataQuality.reliability }; // code is the source of truth
    return withMeta(out, ctx, verifyCitations(out, validIdsFor([null, report])));
  } catch (e) {
    console.warn('[analysis] LLM failed, using rules fallback:', e.message);
    return { ...withMeta(rulesAnalysis(report), ctx, { droppedCitations: 0, unverifiedItems: 0 }, 'rules'), warning: e.message };
  }
}

// ---------- 2. role-based recommendations ----------
function rulesRecommendations(report, role) {
  const s = report.summary;
  const hotspots = s.hotspots || [];
  const top = hotspots[0];
  const cite = top?.evidenceIds || [];

  const playbooks = {
    ward_officer: [
      { id: 'A1', priority: 'urgent', timeframe: 'Immediate (2h)', action: `Deploy mechanical street sweepers and anti-smog water sprinklers across ${top ? top.location : 'monitored hotspot zones'}.`, target_location: top?.location || 'Hotspot Areas', citations: cite, playbook_ref: 'K:role_playbooks#1' },
      { id: 'A2', priority: 'high', timeframe: 'Same-day', action: 'Enforce construction dust cover guidelines and prohibit unpaved material transit.', target_location: 'City-wide', citations: [], playbook_ref: 'K:role_playbooks#1' },
      { id: 'A3', priority: 'medium', timeframe: '24-48h', action: 'Inspect commercial diesel generator sets and strictly ban open municipal waste burning.', target_location: 'Ward Perimeter', citations: [], playbook_ref: 'K:role_playbooks#1' }
    ],
    housing_society: [
      { id: 'A1', priority: 'urgent', timeframe: 'Immediate', action: 'Issue resident advisory restricting outdoor morning jogging and strenuous exercise during peak particulate hours.', target_location: top?.location || 'Residential Area', citations: cite, playbook_ref: 'K:role_playbooks#2' },
      { id: 'A2', priority: 'high', timeframe: 'Same-day', action: 'Prohibit open leaf, garden trimmings, and trash burning in society premises; activate internal water misting.', target_location: 'Society Grounds', citations: [], playbook_ref: 'K:role_playbooks#2' },
      { id: 'A3', priority: 'medium', timeframe: 'Ongoing', action: 'Ensure diesel backup generators are run only for essential life-safety power.', target_location: 'Generator Facility', citations: [], playbook_ref: 'K:role_playbooks#2' }
    ],
    school: [
      { id: 'A1', priority: 'urgent', timeframe: 'Immediate morning', action: 'Shift morning student assemblies and physical education sports classes indoors.', target_location: top?.location || 'Campus', citations: cite, playbook_ref: 'K:role_playbooks#3' },
      { id: 'A2', priority: 'high', timeframe: 'Same-day', action: 'Keep classroom windows closed during peak traffic hours; turn on classroom air filtration or HEPA purifiers.', target_location: 'Classrooms', citations: [], playbook_ref: 'K:role_playbooks#3' },
      { id: 'A3', priority: 'medium', timeframe: 'Next morning', action: 'Advise parents of students with respiratory ailments (asthma, bronchitis) to equip children with protective N95 masks for commute.', target_location: 'Transit & Gates', citations: [], playbook_ref: 'K:role_playbooks#3' }
    ]
  };

  const actions = (playbooks[role] || playbooks.ward_officer).map((a) => ({ ...a, status: 'todo' }));
  return {
    role,
    summary: `Playbook recommendations for ${role.replace('_', ' ')} based on ${hotspots.length} identified hotspot(s).`,
    actions
  };
}

export async function recommend(report, role) {
  const analysis = report.analysis || (await analyzeReport(report));
  const ctx = await context(report,
    ['highest pollution potential hotspot locations', 'missing invalid or suspicious readings'],
    { kQueries: [`${role.replace('_', ' ')} actions role playbook`, 'AQI categories health meaning'], kFilter: (d) => d.meta.role === role });

  if (!hasKey()) {
    return withMeta(rulesRecommendations(report, role), ctx, { droppedCitations: 0, unverifiedItems: 0 }, 'rules');
  }

  try {
    const { system, prompt } = recommendationsPrompt({ role, computed: computedFor(report), dataText: ctx.dataText, knowledgeText: ctx.knowledgeText, analysis, report });
    const out = await generateJSON({ system, prompt });
    out.role = role;
    out.actions = (out.actions || []).map((a, i) => ({ ...a, id: a.id || `A${i + 1}`, status: 'todo' }));
    return withMeta(out, ctx, verifyCitations(out, validIdsFor([null, report])));
  } catch (err) {
    console.warn('[recommend] LLM failed, using playbook fallback:', err.message);
    return withMeta(rulesRecommendations(report, role), ctx, { droppedCitations: 0, unverifiedItems: 0 }, 'rules');
  }
}

// ---------- 3. comparison ----------
export async function compare(prev, curr) {
  const diff = compareReports(prev, curr);
  const ctx = await context(curr, ['highest pollution potential hotspot locations', 'missing invalid or suspicious readings'], { kQueries: ['AQI categories health meaning', 'possible pollution sources observed versus cause'] });
  const prevCtx = await context(prev, ['highest pollution potential hotspot locations'], { kQueries: ['AQI categories'] });
  const dataText = fmt(prevCtx.dataDocs).replace(/^\[/gm, '[prev.') + '\n' + fmt(ctx.dataDocs).replace(/^\[/gm, '[curr.');
  if (!hasKey()) return { diff, explanation: null, generatedBy: 'rules' };
  try {
    const { system, prompt } = comparisonPrompt({ diff, dataText, knowledgeText: ctx.knowledgeText });
    const out = await generateJSON({ system, prompt });
    return { diff, explanation: withMeta(out, ctx, verifyCitations(out, validIdsFor(['prev', prev], ['curr', curr]))) };
  } catch (e) {
    return { diff, explanation: null, warning: e.message };
  }
}

// ---------- 4/5. documents ----------
async function docContext(report) {
  return context(report, ['highest pollution potential hotspot locations', 'missing invalid or suspicious readings'],
    { kQueries: ['health precautions children older adults sensitive people', 'writing for languages and reading levels', 'AQI categories health meaning'] });
}

function rulesDoc(kind, report, { language = 'en' }) {
  const s = report.summary;
  const hotspots = (s.hotspots || []).map(h => `${h.location} (${h.band})`).join(', ') || 'None';
  return {
    title: kind === 'briefing' ? 'Air Quality Briefing Report' : 'Public Air Quality Advisory',
    subtitle: `${report.city || 'City'} - ${report.reportDate || 'Today'}`,
    sections: [
      {
        key: 'overview',
        heading: 'Air Quality Status & Hotspots',
        paragraphs: [`Current air quality audit indicates data reliability is ${s.dataQuality.reliability} with ${s.dataQuality.usableShare}% usable readings. Priority hotspots: ${hotspots}.`],
        citations: (s.hotspots || []).flatMap(h => h.evidenceIds || []).slice(0, 4)
      },
      {
        key: 'guidance',
        heading: 'Actionable Health Guidance',
        bullets: [
          'Vulnerable individuals (children, elderly) should restrict outdoor exertion.',
          'Dust suppression and mechanical misting prioritized in identified hotspots.',
          'Open waste and biomass burning strictly prohibited.'
        ]
      }
    ],
    footer_note: 'Generated in accordance with civic air quality health standards.'
  };
}

export async function briefing(report, { language = 'en', level = 'standard', recommendations, comparison }) {
  const analysis = report.analysis || (await analyzeReport(report));
  const ctx = await docContext(report);
  if (!hasKey()) return withMeta(rulesDoc('briefing', report, { language }), ctx, { droppedCitations: 0, unverifiedItems: 0 }, 'rules');

  try {
    const { system, prompt } = briefingPrompt({ language, level, computed: computedFor(report), analysis, recommendations, comparison: comparison?.explanation ? { diff: comparison.diff, explanation: comparison.explanation } : comparison?.diff, knowledgeText: ctx.knowledgeText, report });
    const out = await generateJSON({ system, prompt, temperature: 0.3 });
    return withMeta(out, ctx, verifyCitations(out, validIdsFor([null, report], ['prev', report], ['curr', report])));
  } catch (err) {
    console.warn('[briefing] LLM failed, using template fallback:', err.message);
    return withMeta(rulesDoc('briefing', report, { language }), ctx, { droppedCitations: 0, unverifiedItems: 0 }, 'rules');
  }
}

export async function advisory(report, { language = 'en', level = 'simple', comparison }) {
  const ctx = await docContext(report);
  if (!hasKey()) return withMeta(rulesDoc('advisory', report, { language }), ctx, { droppedCitations: 0, unverifiedItems: 0 }, 'rules');

  try {
    const { system, prompt } = advisoryPrompt({ language, level, computed: computedFor(report), comparison: comparison?.diff ? { totals: comparison.diff.totals, newHotspots: comparison.diff.newHotspots.map((h) => h.location), resolvedHotspots: comparison.diff.resolvedHotspots.map((h) => h.location) } : null, knowledgeText: ctx.knowledgeText, report });
    const out = await generateJSON({ system, prompt, temperature: 0.4 });
    return withMeta(out, ctx, verifyCitations(out, validIdsFor([null, report])));
  } catch (err) {
    console.warn('[advisory] LLM failed, using template fallback:', err.message);
    return withMeta(rulesDoc('advisory', report, { language }), ctx, { droppedCitations: 0, unverifiedItems: 0 }, 'rules');
  }
}

// ---------- 6. grounded Q&A ----------
export async function ask(report, question, role) {
  const ctx = await context(report, [question, 'highest pollution potential hotspot locations'], { kQueries: [question], k: 5 });
  if (!hasKey()) {
    const s = report.summary;
    const top = s.hotspots?.[0];
    return withMeta({
      answerable: true,
      answer: `Based on the current report, ${s.hotspots?.length || 0} hotspots are detected (${(s.hotspots || []).map(h => h.location).join(', ')}). Data quality is ${s.dataQuality.reliability}.`,
      citations: top?.evidenceIds || [],
      confidence: 'high'
    }, ctx, { droppedCitations: 0, unverifiedItems: 0 }, 'rules');
  }

  try {
    const { system, prompt } = qaPrompt({ question, role, computed: computedFor(report), dataText: ctx.dataText, knowledgeText: ctx.knowledgeText });
    const out = await generateJSON({ system, prompt });
    return withMeta(out, ctx, verifyCitations(out, validIdsFor([null, report])));
  } catch (err) {
    console.warn('[ask] LLM failed, using fallback:', err.message);
    return withMeta({
      answerable: true,
      answer: `Verified reading evidence indicates ${(report.summary.hotspots || []).map(h => `${h.location} (${h.band})`).join(', ') || 'no active hotspots'}.`,
      citations: (report.summary.hotspots?.[0]?.evidenceIds || []),
      confidence: 'medium'
    }, ctx, { droppedCitations: 0, unverifiedItems: 0 }, 'rules');
  }
}

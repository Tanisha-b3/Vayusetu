// Runs the whole pipeline on the sample files.
//   - Without GEMINI_API_KEY: cleaning, hotspots, comparison, RAG retrieval (local embeddings) + rules fallback.
//   - With GEMINI_API_KEY: also runs analysis, recommendations, comparison explanation, briefing and advisory.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseText } from '../services/parser.js';
import { createReport } from '../services/normalizer.js';
import { compareReports } from '../services/compare.js';
import { getReadingIndex, getKnowledgeIndex } from '../services/rag/indexer.js';
import { search } from '../services/rag/retriever.js';
import * as gen from '../services/generate.js';
import { hasKey } from '../services/gemini.js';

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), '../sample-data');
const load = (file, id) => createReport({ id, sourceFile: file, table: parseText(fs.readFileSync(path.join(dir, file), 'utf8')).table, city: 'Bhopal' });
const h = (t) => console.log(`\n=== ${t} ===`);

const prev = load('report_2026-11-12.csv', 'prev1');
const curr = load('report_2026-11-13.csv', 'curr1');

h('Cleaned readings (latest report)');
for (const r of curr.readings) {
  console.log(r.id.padEnd(4), (r.location || '?').padEnd(12), r.date, r.time || '', Object.entries(r.values).map(([f, v]) => `${f}=${v.value ?? 'null'}(${v.status}${v.flags.length ? ':' + v.flags.join('|') : ''})`).join('  '));
}
console.log('column mapping:', curr.columnMapping.map((c) => `${c.header}->${c.field}`).join(', '));
console.log('location merges:', curr.locationMerges.map((m) => `${m.from}->${m.to}`).join(', ') || 'none');

h('Summary');
console.log('data quality:', curr.summary.dataQuality);
console.log('hotspots:', curr.summary.hotspots.map((x) => `${x.location} (${x.band})`).join(', '));

h('Comparison (computed in code)');
const diff = compareReports(prev, curr);
for (const l of diff.locations) console.log(l.location.padEnd(12), ['pm25', 'pm10', 'aqi'].map((f) => `${f}:${l.metrics[f].previous ?? '-'}->${l.metrics[f].current ?? '-'} ${l.metrics[f].pct != null ? l.metrics[f].pct + '%' : l.metrics[f].reason || ''} ${l.metrics[f].direction}`).join(' | '));
console.log('new hotspots:', diff.newHotspots.map((x) => x.location).join(', ') || 'none');
console.log('gaps resolved:', diff.gapsResolved.map((g) => `${g.location}/${g.field}`).join(', ') || 'none');
console.log('new gaps:', diff.newGaps.map((g) => `${g.location}/${g.field}`).join(', ') || 'none');

h('RAG retrieval test');
const idx = await getReadingIndex(curr), kidx = await getKnowledgeIndex();
console.log(`embedder: ${idx.embedder}, data chunks: ${idx.docs.length}, knowledge chunks: ${kidx.docs.length}`);
for (const q of ['which area is a hotspot', 'missing readings']) {
  console.log(`Q: ${q}`);
  (await search(idx, q, { k: 3 })).forEach((r) => console.log('  ', r.score.toFixed(2), r.doc.text.slice(0, 110)));
}
console.log('Q: what can a school do');
(await search(kidx, 'what can a school do on a poor air day', { k: 2 })).forEach((r) => console.log('  ', r.score.toFixed(2), r.doc.id));

if (!hasKey()) { h('No GEMINI_API_KEY'); const a = await gen.analyzeReport(curr); console.log('rules fallback analysis:', a.headline, '| findings:', a.findings.length); process.exit(0); }

h('Gemini analysis'); curr.analysis = await gen.analyzeReport(curr); console.log(JSON.stringify(curr.analysis, null, 1).slice(0, 2500));
h('Gemini recommendations (school)'); const recs = await gen.recommend(curr, 'school'); console.log(JSON.stringify(recs.actions, null, 1).slice(0, 2000));
h('Gemini comparison'); const cmp = await gen.compare(prev, curr); console.log(JSON.stringify(cmp.explanation, null, 1).slice(0, 2000));
h('Gemini citizen advisory (Hindi, simple)'); const adv = await gen.advisory(curr, { language: 'hi', level: 'simple', comparison: cmp }); console.log(JSON.stringify(adv, null, 1).slice(0, 2500));

// Builds the two RAG corpora:
//  1) DATA corpus      - one chunk per reading row + one chunk per location summary (per report)
//  2) KNOWLEDGE corpus - AQI bands, health guidance, role playbooks, cause-attribution rules (markdown files)
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { LABEL } from '../normalizer.js';
import { buildIndex } from './retriever.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const KNOWLEDGE_DIR = path.join(here, '../../knowledge');

export function readingDocs(report) {
  const docs = [];
  for (const r of report.readings) {
    const vals = Object.entries(r.values).map(([f, c]) =>
      c.value != null ? `${LABEL[f]}=${c.value} ${c.unit} {${c.status}}` : `${LABEL[f]}=not usable (raw "${c.raw}") {${c.status}}`);
    const problems = [...Object.entries(r.values).flatMap(([f, c]) => c.flags.filter((x) => !x.startsWith('unit_assumed')).map((x) => `${LABEL[f]}:${x}`)), ...r.flags];
    const flagged = Object.values(r.values).some((c) => c.status !== 'ok') || r.flags.some((f) => !f.startsWith('ambiguous'));
    docs.push({
      id: r.id, type: 'reading',
      text: `[${r.id}] ${r.location || '(no location)'} | ${r.date || 'no date'} ${r.time || ''} | ${vals.join(' | ')}` +
        (problems.length ? ` | DATA QUALITY ISSUES: ${problems.join(', ')}` : '') + ` | source ${r.sourceFile} row ${r.rowNumber}`,
      meta: { flagged, location: r.location },
    });
  }
  for (const l of report.summary.locations) {
    const hs = report.summary.hotspots.find((h) => h.key === l.key);
    const part = (f) => (l[f].value != null ? `${LABEL[f]} ${l[f].value}` : l[f].provided ? `${LABEL[f]} no usable value` : null);
    docs.push({
      id: `LOC:${l.key}`, type: 'location',
      text: `[LOCATION SUMMARY] ${l.location} | ${[part('pm25'), part('pm10'), part('aqi')].filter(Boolean).join(' | ')} | band ${l.band || 'unknown'} | ` +
        `Hotspot status: ${hs ? 'HOTSPOT (' + hs.band + ')' : 'none'} | Supported by readings ${[...new Set([...l.pm25.okIds, ...l.pm10.okIds, ...l.aqi.okIds])].join(', ') || 'none'}`,
      meta: { hotspot: Boolean(hs), location: l.location },
    });
  }
  return docs;
}

export async function knowledgeDocs() {
  const files = (await fs.readdir(KNOWLEDGE_DIR)).filter((f) => f.endsWith('.md'));
  const docs = [];
  for (const f of files) {
    const raw = await fs.readFile(path.join(KNOWLEDGE_DIR, f), 'utf8');
    const name = f.replace('.md', '');
    raw.split(/\n(?=## )/).filter((c) => c.startsWith('## ')).forEach((chunk, i) => {
      const meta = {};
      for (const m of chunk.matchAll(/<!--\s*(\w+):\s*([\w,-]+)\s*-->/g)) meta[m[1]] = m[2];
      docs.push({ id: `K:${name}#${i + 1}`, type: 'knowledge', text: `[K:${name}#${i + 1}] ${chunk.replace(/<!--.*?-->\n?/g, '').trim()}`, meta: { file: name, ...meta } });
    });
  }
  return docs;
}

const cache = new Map();
export async function getReadingIndex(report) {
  const key = `${report.id}:${report.readings.length}`;
  if (!cache.has(key)) cache.set(key, await buildIndex(readingDocs(report)));
  return cache.get(key);
}
let kIndex = null;
export async function getKnowledgeIndex() {
  if (!kIndex) kIndex = await buildIndex(await knowledgeDocs());
  return kIndex;
}

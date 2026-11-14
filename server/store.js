// Report storage. Uses MongoDB when MONGO_URI is set, otherwise a local JSON file.
import fs from 'fs/promises';
import path from 'path';
import { config } from './config.js';

let coll = null;
async function mongo() {
  if (!config.mongoUri) return null;
  if (coll) return coll;
  const { MongoClient } = await import('mongodb');
  const client = new MongoClient(config.mongoUri);
  await client.connect();
  coll = client.db('vayusetu').collection('reports');
  return coll;
}

const file = () => path.join(config.dataDir, 'reports.json');
async function readAll() {
  try { return JSON.parse(await fs.readFile(file(), 'utf8')); } catch { return []; }
}
async function writeAll(all) {
  await fs.mkdir(config.dataDir, { recursive: true });
  await fs.writeFile(file(), JSON.stringify(all, null, 2));
}
const strip = (d) => { if (!d) return null; const { _id, ...rest } = d; return rest; };

export async function saveReport(report) {
  const m = await mongo();
  if (m) { await m.replaceOne({ _id: report.id }, { ...report, _id: report.id }, { upsert: true }); return report; }
  const all = await readAll();
  const i = all.findIndex((r) => r.id === report.id);
  if (i >= 0) all[i] = report; else all.push(report);
  await writeAll(all);
  return report;
}

export async function getReport(id) {
  const m = await mongo();
  if (m) return strip(await m.findOne({ _id: id }));
  return (await readAll()).find((r) => r.id === id) || null;
}

export async function listReports() {
  const m = await mongo();
  const all = m ? (await m.find({}).toArray()).map(strip) : await readAll();
  return all
    .map(({ readings, ...r }) => ({ ...r, readingCount: readings?.length ?? 0 }))
    .sort((a, b) => String(b.reportDate).localeCompare(String(a.reportDate)));
}

// Most recent earlier report (same city if given) - used for comparison.
export async function findPrevious(report) {
  const all = await listReports();
  const earlier = all
    .filter((r) => r.id !== report.id && String(r.reportDate) < String(report.reportDate))
    .filter((r) => !report.city || !r.city || r.city.toLowerCase() === report.city.toLowerCase());
  return earlier.length ? getReport(earlier[0].id) : null;
}

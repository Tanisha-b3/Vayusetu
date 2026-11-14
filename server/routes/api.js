import { Router } from 'express';
import multer from 'multer';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { parseBuffer, parseText } from '../services/parser.js';
import { createReport } from '../services/normalizer.js';
import * as gen from '../services/generate.js';
import { renderDocument } from '../services/render.js';
import { saveReport, getReport, listReports, findPrevious } from '../store.js';
import { ROLES, LANGUAGES, LEVELS } from '../prompts/index.js';
import { hasKey, activeProvider } from '../services/gemini.js';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });
export const api = Router();
const wrap = (fn) => (req, res, next) => fn(req, res, next).catch(next);
const need = async (id) => {
  const r = await getReport(id);
  if (!r) { const e = new Error('Report not found'); e.status = 404; throw e; }
  return r;
};
const pick = (v, allowed, dflt) => (v && allowed[v] ? v : dflt);

api.get('/health', (_req, res) => {
  const p = activeProvider();
  res.json({
    ok: true,
    gemini: hasKey(),
    provider: p.provider,
    model: p.model,
    roles: ROLES,
    languages: LANGUAGES,
    levels: Object.keys(LEVELS),
  });
});

api.get('/samples', (_req, res) => {
  try {
    const dir = fs.existsSync(path.join(process.cwd(), 'server', 'sample-data'))
      ? path.join(process.cwd(), 'server', 'sample-data')
      : path.join(process.cwd(), 'sample-data');
    const files = fs.readdirSync(dir).filter((f) => f.endsWith('.csv'));
    const samples = files.map((file) => ({
      name: file,
      city: 'Bhopal',
      content: fs.readFileSync(path.join(dir, file), 'utf8'),
    }));
    res.json(samples);
  } catch {
    res.json([]);
  }
});

// ---- Upload / paste -> parse -> clean -> store (no AI involved) ----
api.post('/reports', upload.single('file'), wrap(async (req, res) => {
  let table, sourceFile;
  if (req.file) { ({ table } = parseBuffer(req.file.buffer, req.file.originalname)); sourceFile = req.file.originalname; }
  else if (req.body.text) { ({ table } = parseText(req.body.text)); sourceFile = req.body.name || 'pasted-table'; }
  else { const e = new Error('Send a file (field "file") or pasted text (field "text").'); e.status = 400; throw e; }
  const report = createReport({ id: crypto.randomUUID().slice(0, 8), sourceFile, table, city: req.body.city, reportDate: req.body.reportDate, name: req.body.name });
  await saveReport(report);
  res.status(201).json(report);
}));

api.get('/reports', wrap(async (_req, res) => res.json(await listReports())));
api.get('/reports/:id', wrap(async (req, res) => res.json(await need(req.params.id))));

// ---- Traceability: click a finding -> see the underlying rows ----
api.get('/reports/:id/readings/:rid', wrap(async (req, res) => {
  const r = await need(req.params.id);
  const reading = r.readings.find((x) => x.id === req.params.rid);
  if (!reading) { const e = new Error('Reading not found'); e.status = 404; throw e; }
  res.json(reading);
}));
api.post('/reports/:id/readings', wrap(async (req, res) => { // batch lookup: { ids: ["R3","R7"] }
  const r = await need(req.params.id);
  res.json((req.body.ids || []).map((id) => r.readings.find((x) => x.id === id)).filter(Boolean));
}));

// ---- AI steps ----
api.post('/reports/:id/analyze', wrap(async (req, res) => {
  const r = await need(req.params.id);
  r.analysis = await gen.analyzeReport(r);
  await saveReport(r);
  res.json(r.analysis);
}));

api.post('/reports/:id/recommendations', wrap(async (req, res) => {
  const r = await need(req.params.id);
  const role = pick(req.body.role, ROLES, 'ward_officer');
  r.recommendations = { ...r.recommendations, [role]: await gen.recommend(r, role) };
  await saveReport(r);
  res.json(r.recommendations[role]);
}));

api.patch('/reports/:id/actions/:role/:actionId', wrap(async (req, res) => { // action tracker
  const r = await need(req.params.id);
  const a = r.recommendations?.[req.params.role]?.actions?.find((x) => x.id === req.params.actionId);
  if (!a) { const e = new Error('Action not found'); e.status = 404; throw e; }
  if (req.body.status) a.status = req.body.status;      // todo | in_progress | done
  if (req.body.assignee !== undefined) a.assignee = req.body.assignee;
  await saveReport(r);
  res.json(a);
}));

api.post('/reports/:id/compare', wrap(async (req, res) => {
  const r = await need(req.params.id);
  const prev = req.body.previousId ? await need(req.body.previousId) : await findPrevious(r);
  if (!prev) return res.json({ previous: null, message: 'No earlier report found. Upload an earlier report first.' });
  r.comparison = await gen.compare(prev, r);
  await saveReport(r);
  res.json(r.comparison);
}));

async function makeDoc(kind, req, res) {
  const r = await need(req.params.id);
  const language = pick(req.body.language, LANGUAGES, 'en');
  const level = pick(req.body.level, LEVELS, kind === 'advisory' ? 'simple' : 'standard');
  const role = pick(req.body.role, ROLES, 'ward_officer');
  const comparison = r.comparison || null;
  const content = kind === 'briefing'
    ? await gen.briefing(r, { language, level, comparison, recommendations: r.recommendations?.[role] || (await gen.recommend(r, role)) })
    : await gen.advisory(r, { language, level, comparison });
  const doc = { id: crypto.randomUUID().slice(0, 6), kind, language, level, role: kind === 'briefing' ? role : undefined, createdAt: new Date().toISOString(), content };
  r.documents.push(doc);
  await saveReport(r);
  res.json({ ...doc, printUrl: `/api/reports/${r.id}/documents/${doc.id}/print` });
}
api.post('/reports/:id/briefing', wrap((req, res) => makeDoc('briefing', req, res)));
api.post('/reports/:id/advisory', wrap((req, res) => makeDoc('advisory', req, res)));

api.get('/reports/:id/documents/:docId/print', wrap(async (req, res) => {
  const r = await need(req.params.id);
  const doc = r.documents.find((d) => d.id === req.params.docId);
  if (!doc) { const e = new Error('Document not found'); e.status = 404; throw e; }
  res.type('html').send(renderDocument(r, doc));
}));

// ---- Grounded Q&A over the report (RAG) ----
api.post('/reports/:id/ask', wrap(async (req, res) => {
  const r = await need(req.params.id);
  if (!req.body.question) { const e = new Error('question is required'); e.status = 400; throw e; }
  res.json(await gen.ask(r, req.body.question, req.body.role));
}));

api.all('*', (_req, res) => res.status(404).json({ error: 'API endpoint not found' }));

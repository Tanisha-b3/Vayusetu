import { Router } from 'express';
import multer from 'multer';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { parseBuffer, parseText } from '../services/parser.js';
import {
  createReportAsync,
  normalizeTableAsync,
  buildSummary,
  computeDataHealth,
} from '../services/normalizer.js';
import { runAnalysisPipeline } from '../services/agents/pipeline.js';
import * as gen from '../services/generate.js';
import { renderDocument } from '../services/render.js';
import { saveReport, getReport, listReports, findPrevious } from '../store.js';
import { createUser, findUserByEmail, findUserById, publicUser } from '../users.js';
import { hashPassword, verifyPassword, signToken, verifyToken } from '../services/auth.js';
import { ROLES, LANGUAGES, LEVELS } from '../prompts/index.js';
import { hasKey, activeProvider } from '../services/gemini.js';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });
export const api = Router();
const wrap = (fn) => (req, res, next) => fn(req, res, next).catch(next);
const need = async (id) => {
  const r = await getReport(id);
  if (!r) {
    const e = new Error('Report not found');
    e.status = 404;
    throw e;
  }
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
    const dir = [
      path.join(process.cwd(), 'server', 'sample-data'),
      path.join(process.cwd(), 'sample-data'),
      path.join(process.cwd(), '..', 'server', 'sample-data'),
    ].find((p) => fs.existsSync(p));
    if (!dir) return res.json([]);
    const files = fs.readdirSync(dir).filter((f) => f.endsWith('.csv') || f.endsWith('.txt'));
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

// ---- Upload / paste -> parse -> clean -> store ----
api.post(
  '/reports',
  upload.single('file'),
  wrap(async (req, res) => {
    let table, sourceFile;
    if (req.file) {
      ({ table } = parseBuffer(req.file.buffer, req.file.originalname));
      sourceFile = req.file.originalname;
    } else if (req.body.text) {
      ({ table } = parseText(req.body.text));
      sourceFile = req.body.name || 'pasted-table';
    } else {
      const e = new Error('Send a file (field "file") or pasted text (field "text").');
      e.status = 400;
      throw e;
    }
    const report = await createReportAsync({
      id: crypto.randomUUID().slice(0, 8),
      sourceFile,
      table,
      city: req.body.city,
      reportDate: req.body.reportDate,
      name: req.body.name,
    });
    report.dataHealth = computeDataHealth(report);
    await saveReport(report);
    res.status(201).json(report);
  })
);

api.get('/reports', wrap(async (_req, res) => res.json(await listReports())));
api.get('/reports/:id', wrap(async (req, res) => res.json(await need(req.params.id))));

// ---- Accept / override column interpretation ----
api.patch(
  '/reports/:id/remap',
  wrap(async (req, res) => {
    const r = await need(req.params.id);
    const overrides = req.body.overrides || {};
    if (!r.rawTable || r.rawTable.length === 0) {
      const e = new Error('Raw table data not available for remapping');
      e.status = 400;
      throw e;
    }
    const n = await normalizeTableAsync({
      table: r.rawTable,
      reportId: r.id,
      sourceFile: r.sourceFile,
      manualOverrides: overrides,
    });
    r.columnMapping = n.columns;
    r.unmappedColumns = n.unmapped;
    r.mappingLog = n.mappingLog;
    r.readings = n.readings;
    r.summary = buildSummary(n.readings, n.columns);
    r.dataHealth = computeDataHealth(r);
    // Reset generated downstream analysis so new columns apply
    r.analysis = null;
    await saveReport(r);
    res.json(r);
  })
);

// ---- Multi-Agent Pipeline Execution ----
api.post(
  '/reports/:id/pipeline',
  wrap(async (req, res) => {
    const r = await need(req.params.id);
    const result = await runAnalysisPipeline(r, {
      roles: req.body.roles,
      languages: req.body.languages,
    });
    r.analysis = result.analysis;
    r.recommendations = result.recommendations;
    r.pipelineTrace = result.trace;
    r.verification = result.verification;
    r.dataHealth = result.dataHealth;
    r.auditor = result.auditor;
    await saveReport(r);
    res.json(result);
  })
);

api.get(
  '/reports/:id/trace',
  wrap(async (req, res) => {
    const r = await need(req.params.id);
    res.json({ trace: r.pipelineTrace || [], verification: r.verification || null });
  })
);

// ---- Traceability: click a finding -> see the underlying rows ----
api.get(
  '/reports/:id/readings/:rid',
  wrap(async (req, res) => {
    const r = await need(req.params.id);
    const reading = r.readings.find((x) => x.id === req.params.rid);
    if (!reading) {
      const e = new Error('Reading not found');
      e.status = 404;
      throw e;
    }
    res.json(reading);
  })
);

api.post(
  '/reports/:id/readings',
  wrap(async (req, res) => {
    const r = await need(req.params.id);
    res.json((req.body.ids || []).map((id) => r.readings.find((x) => x.id === id)).filter(Boolean));
  })
);

// ---- Traditional AI analysis & recommendations ----
api.post(
  '/reports/:id/analyze',
  wrap(async (req, res) => {
    const r = await need(req.params.id);
    r.analysis = await gen.analyzeReport(r);
    await saveReport(r);
    res.json(r.analysis);
  })
);

api.post(
  '/reports/:id/recommendations',
  wrap(async (req, res) => {
    const r = await need(req.params.id);
    const role = pick(req.body.role, ROLES, 'ward_officer');
    r.recommendations = { ...r.recommendations, [role]: await gen.recommend(r, role) };
    await saveReport(r);
    res.json(r.recommendations[role]);
  })
);

api.patch(
  '/reports/:id/actions/:role/:actionId',
  wrap(async (req, res) => {
    const r = await need(req.params.id);
    const a = r.recommendations?.[req.params.role]?.actions?.find((x) => x.id === req.params.actionId);
    if (!a) {
      const e = new Error('Action not found');
      e.status = 404;
      throw e;
    }
    if (req.body.status) a.status = req.body.status;
    if (req.body.assignee !== undefined) a.assignee = req.body.assignee;
    await saveReport(r);
    res.json(a);
  })
);

api.post(
  '/reports/:id/compare',
  wrap(async (req, res) => {
    const r = await need(req.params.id);
    const prev = req.body.previousId ? await need(req.body.previousId) : await findPrevious(r);
    if (!prev) return res.json({ previous: null, message: 'No earlier report found. Upload an earlier report first.' });
    r.comparison = await gen.compare(prev, r);
    await saveReport(r);
    res.json(r.comparison);
  })
);

async function makeDoc(kind, req, res) {
  const r = await need(req.params.id);
  const language = pick(req.body.language, LANGUAGES, 'en');
  const level = pick(req.body.level, LEVELS, kind === 'advisory' ? 'simple' : 'standard');
  const role = pick(req.body.role, ROLES, 'ward_officer');
  const comparison = r.comparison || null;
  const content =
    kind === 'briefing'
      ? await gen.briefing(r, {
          language,
          level,
          comparison,
          recommendations: r.recommendations?.[role] || (await gen.recommend(r, role)),
        })
      : await gen.advisory(r, { language, level, comparison });
  const doc = {
    id: crypto.randomUUID().slice(0, 6),
    kind,
    language,
    level,
    role: kind === 'briefing' ? role : undefined,
    createdAt: new Date().toISOString(),
    content,
  };
  r.documents.push(doc);
  await saveReport(r);
  res.json({ ...doc, printUrl: `/api/reports/${r.id}/documents/${doc.id}/print` });
}

api.post('/reports/:id/briefing', wrap((req, res) => makeDoc('briefing', req, res)));
api.post('/reports/:id/advisory', wrap((req, res) => makeDoc('advisory', req, res)));

api.get(
  '/reports/:id/documents/:docId/print',
  wrap(async (req, res) => {
    const r = await need(req.params.id);
    const doc = r.documents.find((d) => d.id === req.params.docId);
    if (!doc) {
      const e = new Error('Document not found');
      e.status = 404;
      throw e;
    }
    res.type('html').send(renderDocument(r, doc));
  })
);

// ---- Grounded Q&A over the report (RAG) ----
api.post(
  '/reports/:id/ask',
  wrap(async (req, res) => {
    const r = await need(req.params.id);
    if (!req.body.question) {
      const e = new Error('question is required');
      e.status = 400;
      throw e;
    }
    res.json(await gen.ask(r, req.body.question, req.body.role));
  })
);

// ---- Authentication: real credential checks (see services/auth.js, users.js) ----
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const httpError = (status, message) => Object.assign(new Error(message), { status });

// Simple in-memory limit on login attempts per IP (10 per 15 minutes) to slow password guessing.
const loginAttempts = new Map();
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_MAX = 10;
function checkLoginRate(ip) {
  const now = Date.now();
  const recent = (loginAttempts.get(ip) || []).filter((t) => now - t < LOGIN_WINDOW_MS);
  if (recent.length >= LOGIN_MAX) throw httpError(429, 'Too many sign-in attempts. Try again in a few minutes.');
  recent.push(now);
  loginAttempts.set(ip, recent);
}

api.post(
  '/auth/signup',
  wrap(async (req, res) => {
    const { name, email, password, role, organization, city, ward, language } = req.body || {};
    if (!name || !String(name).trim()) throw httpError(400, 'Name is required.');
    if (!email || !EMAIL_RE.test(String(email).trim())) throw httpError(400, 'Enter a valid email address.');
    if (!password || String(password).length < 8) throw httpError(400, 'Password must be at least 8 characters.');
    if (String(password).length > 200) throw httpError(400, 'Password is too long.');

    const user = await createUser({
      id: 'usr_' + crypto.randomBytes(8).toString('hex'),
      name: String(name).trim().slice(0, 100),
      email: String(email).trim(),
      passwordHash: hashPassword(password),
      role: pick(role, ROLES, 'ward_officer'),
      organization: organization ? String(organization).slice(0, 150) : 'Civic Administration',
      city: city ? String(city).slice(0, 80) : 'Bhopal',
      ward: ward ? String(ward).slice(0, 80) : 'Zone 1',
      language: pick(language, LANGUAGES, 'en'),
      createdAt: new Date().toISOString(),
    });
    res.status(201).json({ success: true, user: publicUser(user), token: signToken(user.id) });
  })
);

// Demo account for reviewers. Created on first use, so it also exists after a data reset.
// Override with DEMO_EMAIL / DEMO_PASSWORD, or disable entirely with DEMO_ACCOUNT=off.
const demoEnabled = () => process.env.DEMO_ACCOUNT !== 'off';
const demoCreds = () => ({
  email: process.env.DEMO_EMAIL || 'demo@vayusetu.gov.in',
  password: process.env.DEMO_PASSWORD || 'password123',
});
async function ensureDemoUser() {
  if (!demoEnabled()) return;
  const { email, password } = demoCreds();
  if (await findUserByEmail(email)) return;
  try {
    await createUser({
      id: 'usr_demo',
      name: 'Ashok Sharma',
      email,
      passwordHash: hashPassword(password),
      role: 'ward_officer',
      organization: 'Bhopal Municipal Corporation',
      city: 'Bhopal',
      ward: 'Zone 8, Ward 42',
      language: 'hi',
      createdAt: new Date().toISOString(),
    });
  } catch (e) {
    if (e.status !== 409) throw e; // already created by a concurrent request
  }
}

api.get('/auth/demo', (_req, res) => {
  if (!demoEnabled()) return res.json({ enabled: false });
  res.json({ enabled: true, ...demoCreds() });
});

api.post(
  '/auth/login',
  wrap(async (req, res) => {
    checkLoginRate(req.ip);
    const { email, password } = req.body || {};
    if (!email || !password) throw httpError(400, 'Email and password are required.');
    await ensureDemoUser();
    const user = await findUserByEmail(email);
    // Same message for unknown email and wrong password, so accounts can't be enumerated.
    if (!user || !verifyPassword(password, user.passwordHash)) {
      throw httpError(401, 'Invalid email or password.');
    }
    res.json({ success: true, user: publicUser(user), token: signToken(user.id) });
  })
);

api.get(
  '/auth/me',
  wrap(async (req, res) => {
    const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
    const userId = verifyToken(token);
    if (!userId) throw httpError(401, 'Not signed in.');
    const user = await findUserById(userId);
    if (!user) throw httpError(401, 'Not signed in.');
    res.json({ user: publicUser(user) });
  })
);

api.post('/auth/logout', (_req, res) => {
  res.json({ success: true });
});

api.get('/auth/me', (req, res) => {
  const user = USERS_STORE.get('demo@vayusetu.gov.in');
  const safeUser = { ...user };
  delete safeUser.password;
  res.json({ user: safeUser });
});

api.all('*', (_req, res) => res.status(404).json({ error: 'API endpoint not found' }));

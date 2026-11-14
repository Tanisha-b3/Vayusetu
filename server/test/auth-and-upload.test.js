// Run with: npm run test:unit   (Node built-in test runner, no extra dependencies)
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import http from 'node:http';

const here = path.dirname(fileURLToPath(import.meta.url));
const tmpData = fs.mkdtempSync(path.join(os.tmpdir(), 'vayusetu-test-'));
process.env.DATA_DIR = tmpData; // must be set before config.js is imported
process.env.AUTH_SECRET = 'test-secret-for-unit-tests';

const { hashPassword, verifyPassword, signToken, verifyToken } = await import('../services/auth.js');
const { default: express } = await import('express');
const { api } = await import('../routes/api.js');

let server, base;

before(async () => {
  const app = express();
  app.use(express.json({ limit: '5mb' }));
  app.use('/api', api);
  app.use((err, _req, res, _next) => res.status(err.status || 500).json({ error: err.message }));
  await new Promise((resolve) => {
    server = app.listen(0, '127.0.0.1', resolve);
  });
  base = `http://127.0.0.1:${server.address().port}/api`;
});

after(() => {
  server?.close();
  fs.rmSync(tmpData, { recursive: true, force: true });
});

// Plain HTTP helper, so the tests don't need supertest.
function request(method, url, { body, headers = {}, form } = {}) {
  return new Promise((resolve, reject) => {
    const data = form ? form.body : body !== undefined ? JSON.stringify(body) : null;
    const req = http.request(url, { method, headers: { ...(data && !form ? { 'Content-Type': 'application/json' } : {}), ...(form ? form.headers : {}), ...headers } }, (res) => {
      let text = '';
      res.on('data', (c) => (text += c));
      res.on('end', () => {
        let json = null;
        try { json = JSON.parse(text); } catch { /* not JSON */ }
        resolve({ status: res.statusCode, text, json });
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

// ---- password hashing ----

test('hashPassword never stores the plain password and verifies correctly', () => {
  const stored = hashPassword('correct horse');
  assert.ok(!stored.includes('correct horse'));
  assert.equal(verifyPassword('correct horse', stored), true);
  assert.equal(verifyPassword('wrong password', stored), false);
});

test('hashPassword salts each hash', () => {
  assert.notEqual(hashPassword('same-password'), hashPassword('same-password'));
});

test('verifyPassword rejects malformed stored values', () => {
  assert.equal(verifyPassword('x', undefined), false);
  assert.equal(verifyPassword('x', 'plain-text'), false);
});

// ---- session tokens ----

test('signed token verifies and returns the user id', () => {
  const token = signToken('usr_123');
  assert.equal(verifyToken(token), 'usr_123');
});

test('tampered token is rejected', () => {
  const token = signToken('usr_123');
  const [payload, sig] = token.split('.');
  const forged = Buffer.from(JSON.stringify({ sub: 'usr_999', exp: 9999999999 })).toString('base64url');
  assert.equal(verifyToken(`${forged}.${sig}`), null);
  assert.equal(verifyToken(`${payload}.bad`), null);
});

test('expired token is rejected', () => {
  const issued = 1000;
  const token = signToken('usr_123', issued);
  assert.equal(verifyToken(token, issued + 60), 'usr_123');
  assert.equal(verifyToken(token, issued + 8 * 24 * 60 * 60), null);
});

// ---- sign up / sign in over HTTP ----

const account = { name: 'Test Officer', email: 'officer@example.gov.in', password: 'long-enough-pass' };

test('sign-up creates an account and returns a token without the password', async () => {
  const res = await request('POST', `${base}/auth/signup`, { body: account });
  assert.equal(res.status, 201);
  assert.ok(res.json.token);
  assert.equal(res.json.user.email, account.email);
  assert.equal(res.json.user.passwordHash, undefined);
  assert.equal(res.text.includes(account.password), false);
});

test('sign-up rejects a duplicate email', async () => {
  const res = await request('POST', `${base}/auth/signup`, { body: account });
  assert.equal(res.status, 409);
});

test('sign-up rejects a short password and a bad email', async () => {
  const short = await request('POST', `${base}/auth/signup`, { body: { ...account, email: 'a@b.co', password: 'short' } });
  assert.equal(short.status, 400);
  const bad = await request('POST', `${base}/auth/signup`, { body: { ...account, email: 'not-an-email' } });
  assert.equal(bad.status, 400);
});

test('sign-in succeeds with the right password, case-insensitive email', async () => {
  const res = await request('POST', `${base}/auth/login`, { body: { email: account.email.toUpperCase(), password: account.password } });
  assert.equal(res.status, 200);
  assert.ok(res.json.token);
});

test('sign-in fails with the wrong password and with an unknown email, with the same message', async () => {
  const wrong = await request('POST', `${base}/auth/login`, { body: { email: account.email, password: 'not-the-password' } });
  const unknown = await request('POST', `${base}/auth/login`, { body: { email: 'nobody@example.gov.in', password: 'whatever123' } });
  assert.equal(wrong.status, 401);
  assert.equal(unknown.status, 401);
  assert.equal(wrong.json.error, unknown.json.error);
});

test('/auth/me returns the signed-in user only with a valid token', async () => {
  const login = await request('POST', `${base}/auth/login`, { body: account });
  const ok = await request('GET', `${base}/auth/me`, { headers: { Authorization: `Bearer ${login.json.token}` } });
  assert.equal(ok.status, 200);
  assert.equal(ok.json.user.email, account.email);

  const none = await request('GET', `${base}/auth/me`);
  assert.equal(none.status, 401);
});

// ---- demo account ----

test('demo credentials are published and can sign in', async () => {
  const info = await request('GET', `${base}/auth/demo`);
  assert.equal(info.status, 200);
  assert.equal(info.json.enabled, true);
  const login = await request('POST', `${base}/auth/login`, { body: { email: info.json.email, password: info.json.password } });
  assert.equal(login.status, 200);
  assert.ok(login.json.token);
  assert.equal(login.json.user.passwordHash, undefined);
});

test('demo account does not accept a wrong password', async () => {
  const info = await request('GET', `${base}/auth/demo`);
  const login = await request('POST', `${base}/auth/login`, { body: { email: info.json.email, password: 'wrong-password' } });
  assert.equal(login.status, 401);
});

// ---- upload ----

test('uploading a sample CSV creates a report with readings', async () => {
  const csv = fs.readFileSync(path.join(here, '..', 'sample-data', 'report_2026-11-12.csv'));
  const boundary = '----vsTestBoundary';
  const head = `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="report.csv"\r\nContent-Type: text/csv\r\n\r\n`;
  const tail = `\r\n--${boundary}\r\nContent-Disposition: form-data; name="city"\r\n\r\nBhopal\r\n--${boundary}--\r\n`;
  const body = Buffer.concat([Buffer.from(head), csv, Buffer.from(tail)]);
  const res = await request('POST', `${base}/reports`, {
    form: { body, headers: { 'Content-Type': `multipart/form-data; boundary=${boundary}`, 'Content-Length': body.length } },
  });
  assert.equal(res.status, 201);
  assert.ok(res.json.id);
  assert.ok(res.json.readings.length > 0);
});

test('upload with no file and no text returns a JSON 400 error', async () => {
  const res = await request('POST', `${base}/reports`, { body: {} });
  assert.equal(res.status, 400);
  assert.ok(res.json.error);
});

// Credential helpers: password hashing (scrypt) and signed session tokens (HMAC-SHA256).
// Uses only Node's built-in crypto, so there are no extra dependencies.
import crypto from 'crypto';

const KEYLEN = 64;
const TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60;

export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(String(password), salt, KEYLEN).toString('hex');
  return `scrypt$${salt}$${hash}`;
}

export function verifyPassword(password, stored) {
  if (typeof stored !== 'string') return false;
  const [scheme, salt, hash] = stored.split('$');
  if (scheme !== 'scrypt' || !salt || !hash) return false;
  const candidate = crypto.scryptSync(String(password), salt, KEYLEN);
  const expected = Buffer.from(hash, 'hex');
  return expected.length === candidate.length && crypto.timingSafeEqual(expected, candidate);
}

// Signing secret. Set AUTH_SECRET in production; without it, a random per-process secret is used,
// so tokens stop working after a restart.
let warnedSecret = false;
function secret() {
  if (process.env.AUTH_SECRET) return process.env.AUTH_SECRET;
  if (!warnedSecret) {
    warnedSecret = true;
    console.warn('[auth] AUTH_SECRET is not set; using a random secret. Sessions end when the server restarts.');
  }
  if (!secret.fallback) secret.fallback = crypto.randomBytes(32).toString('hex');
  return secret.fallback;
}

const b64url = (buf) => Buffer.from(buf).toString('base64url');

export function signToken(userId, now = Math.floor(Date.now() / 1000)) {
  const payload = b64url(JSON.stringify({ sub: userId, iat: now, exp: now + TOKEN_TTL_SECONDS }));
  const sig = crypto.createHmac('sha256', secret()).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

// Returns the user id if the token is valid and unexpired, otherwise null.
export function verifyToken(token, now = Math.floor(Date.now() / 1000)) {
  if (typeof token !== 'string') return null;
  const [payload, sig] = token.split('.');
  if (!payload || !sig) return null;
  const expected = crypto.createHmac('sha256', secret()).update(payload).digest('base64url');
  const a = Buffer.from(sig), b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (!data.sub || typeof data.exp !== 'number' || data.exp < now) return null;
    return data.sub;
  } catch {
    return null;
  }
}

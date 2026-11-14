// Embeddings: Gemini when a key is available, otherwise a local hashed bag-of-words embedder
// so retrieval still works offline (demo safety net).
import { embedBatch, hasKey } from '../gemini.js';

const DIM = 1024;
const STOP = new Set('a an the and or of to in on at for is are was were be by with as it this that from'.split(' '));
const tokens = (t) => (String(t).toLowerCase().match(/[\p{L}\p{N}.]+/gu) || []).filter((x) => !STOP.has(x));

function hash(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return (h >>> 0) % DIM;
}
const norm = (v) => { const n = Math.sqrt(v.reduce((s, x) => s + x * x, 0)) || 1; return v.map((x) => x / n); };

export function localEmbed(text) {
  const v = new Array(DIM).fill(0);
  const tf = new Map();
  tokens(text).forEach((t) => tf.set(t, (tf.get(t) || 0) + 1));
  for (const [t, c] of tf) v[hash(t)] += 1 + Math.log(c);
  return norm(v);
}

// force: 'local' | 'gemini' | undefined (auto: try Gemini, fall back to local)
export async function embedTexts(texts, taskType, force) {
  if (force !== 'local' && hasKey()) {
    try { return { vectors: (await embedBatch(texts, taskType)).map(norm), embedder: 'gemini' }; }
    catch (e) { if (force === 'gemini') throw e; console.warn('[rag] Gemini embeddings failed, using local embedder:', e.message); }
  }
  return { vectors: texts.map(localEmbed), embedder: 'local' };
}

export const lexicalScore = (q, text) => {
  const qs = new Set(tokens(q));
  const ts = new Set(tokens(text));
  let hit = 0; qs.forEach((t) => ts.has(t) && hit++);
  return qs.size ? hit / qs.size : 0;
};

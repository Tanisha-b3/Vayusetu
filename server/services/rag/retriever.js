// Vector index + search over document chunks.
import { embedTexts, lexicalScore } from './embeddings.js';

const dot = (a, b) => { let s = 0; for (let i = 0; i < a.length; i++) s += a[i] * b[i]; return s; };

export async function buildIndex(docs) {
  if (!docs.length) return { embedder: 'local', docs: [] };
  const { vectors, embedder } = await embedTexts(docs.map((d) => d.text), 'RETRIEVAL_DOCUMENT');
  return { embedder, docs: docs.map((d, i) => ({ ...d, vector: vectors[i] })) };
}

export async function search(index, query, { k = 5, filter } = {}) {
  const pool = filter ? index.docs.filter(filter) : index.docs;
  if (!pool.length) return [];
  let scored;
  try {
    const { vectors } = await embedTexts([query], 'RETRIEVAL_QUERY', index.embedder);
    scored = pool.map((d) => ({ doc: d, score: dot(vectors[0], d.vector) }));
  } catch {
    scored = pool.map((d) => ({ doc: d, score: lexicalScore(query, d.text) }));
  }
  return scored.sort((a, b) => b.score - a.score).slice(0, k);
}

// Run several queries, merge + de-duplicate, and always include "must-have" docs (flagged rows, hotspots).
export async function gather(index, queries, { k = 4, always, alwaysCap = 40 } = {}) {
  const seen = new Map();
  const forced = always ? index.docs.filter(always).slice(0, alwaysCap) : [];
  forced.forEach((d) => seen.set(d.id, { doc: d, score: 1, why: 'always' }));
  for (const q of queries) {
    for (const hit of await search(index, q, { k })) {
      if (!seen.has(hit.doc.id)) seen.set(hit.doc.id, { ...hit, why: q });
    }
  }
  return [...seen.values()].map((h) => h.doc);
}

// Guardrail: every citation Gemini returns is checked against real reading ids.
// Invalid ids are removed; items left with no valid citation are flagged unverified (never silently trusted).
export function validIdsFor(...reports) {
  const ids = new Set();
  for (const [prefix, r] of reports) for (const x of r.readings) ids.add(prefix ? `${prefix}.${x.id}` : x.id);
  return ids;
}

export function verifyCitations(obj, validIds) {
  let dropped = 0, unverified = 0;
  const walk = (n) => {
    if (Array.isArray(n)) return n.forEach(walk);
    if (n && typeof n === 'object') {
      for (const k of Object.keys(n)) {
        if ((k === 'citations' || k === 'evidence') && Array.isArray(n[k])) {
          const before = n[k].length;
          n[k] = [...new Set(n[k].map(String).filter((id) => validIds.has(id)))];
          dropped += before - n[k].length;
          if (k === 'citations' && n[k].length === 0) { n.unverified = true; unverified++; }
        } else walk(n[k]);
      }
    }
  };
  walk(obj);
  return { droppedCitations: dropped, unverifiedItems: unverified };
}

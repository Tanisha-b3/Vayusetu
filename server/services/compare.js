// Step 5 (math part): all deltas computed in code. Gemini only explains them.
const FIELDS = ['pm25', 'pm10', 'aqi'];
const THRESH = 5; // % change treated as "stable"

function metric(p, c, prefix) {
  const pv = p?.value ?? null, cv = c?.value ?? null;
  const out = { previous: pv, current: cv, delta: null, pct: null, direction: 'not_comparable', reason: null,
    previousIds: (p?.okIds || []).map((i) => `prev.${i}`), currentIds: (c?.okIds || []).map((i) => `curr.${i}`) };
  if (pv == null || cv == null) {
    out.reason = pv == null && cv == null ? 'both_missing' : pv == null ? 'previous_missing' : 'current_missing';
    return out;
  }
  out.delta = Math.round((cv - pv) * 10) / 10;
  out.pct = pv ? Math.round(((cv - pv) / pv) * 1000) / 10 : null;
  out.direction = out.pct == null ? 'changed' : out.pct > THRESH ? 'worse' : out.pct < -THRESH ? 'better' : 'stable';
  return out;
}

// "Arera" in one file and "Arera Colony" in the next are the same place: match unambiguous word-prefix aliases across reports.
function aliasMap(prevKeys, currKeys) {
  const map = new Map();
  for (const k of currKeys) {
    if (prevKeys.has(k)) continue;
    const c = [...prevKeys].filter((p) => p.startsWith(k + ' ') || k.startsWith(p + ' '));
    if (c.length === 1 && !currKeys.has(c[0])) map.set(k, c[0]);
  }
  return map;
}

export function compareReports(prev, curr) {
  const pm = new Map(prev.summary.locations.map((l) => [l.key, l]));
  const alias = aliasMap(new Set(pm.keys()), new Set(curr.summary.locations.map((l) => l.key)));
  const canon = (k) => alias.get(k) || k;
  const cm = new Map(curr.summary.locations.map((l) => [canon(l.key), l]));
  const keys = [...new Set([...pm.keys(), ...cm.keys()])];
  const prevHot = new Set(prev.summary.hotspots.map((h) => h.key));
  const currHot = new Set(curr.summary.hotspots.map((h) => canon(h.key)));

  const locations = [], gapsResolved = [], newGaps = [];
  for (const k of keys) {
    const p = pm.get(k), c = cm.get(k);
    const name = (c || p).location;
    const entry = { location: name, status: !p ? 'new_location' : !c ? 'not_in_latest' : 'both', metrics: {} };
    for (const f of FIELDS) {
      entry.metrics[f] = metric(p?.[f], c?.[f]);
      if (p && c) {
        const pg = p[f].provided && p[f].value == null, cg = c[f].provided && c[f].value == null;
        if (pg && c[f].value != null) gapsResolved.push({ location: name, field: f, previousProblemIds: p[f].problemIds.map((i) => `prev.${i}`), currentIds: c[f].okIds.map((i) => `curr.${i}`) });
        if (cg && p[f].value != null) newGaps.push({ location: name, field: f, currentProblemIds: c[f].problemIds.map((i) => `curr.${i}`), previousIds: p[f].okIds.map((i) => `prev.${i}`) });
      }
    }
    locations.push(entry);
  }
  const newHotspots = curr.summary.hotspots.filter((h) => !prevHot.has(canon(h.key))).map((h) => ({ ...h, evidenceIds: h.evidenceIds.map((i) => `curr.${i}`), wasInPreviousReport: pm.has(canon(h.key)) }));
  const resolvedHotspots = prev.summary.hotspots.filter((h) => !currHot.has(h.key)).map((h) => ({ ...h, evidenceIds: h.evidenceIds.map((i) => `prev.${i}`), inLatestReport: cm.has(h.key) }));

  const count = (d) => locations.filter((l) => Object.values(l.metrics).some((m) => m.direction === d)).length;
  return {
    previousReportId: prev.id, previousDate: prev.reportDate, currentReportId: curr.id, currentDate: curr.reportDate,
    matchedAliases: [...alias].map(([from, to]) => ({ latest: from, previous: to })),
    locations, newHotspots, resolvedHotspots, gapsResolved, newGaps,
    reliability: { previous: prev.summary.dataQuality.reliability, current: curr.summary.dataQuality.reliability },
    totals: { improved: count('better'), worsened: count('worse'), stable: count('stable') },
  };
}

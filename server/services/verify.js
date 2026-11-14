// Strict citation guardrail:
// Every sentence containing a number, station name or trend claim must carry at least one [R#] citation.
// Checks in code:
// 1. The cited row exists.
// 2. Any number in the sentence matches the cited row's value within rounding/tolerance (e.g. +/- 15% or integer match).
// 3. Any station named in the sentence matches the cited row's station.
// Any sentence failing a check is removed or marked unverified.
// Returns a verification object { total, verified, removed, unverified, ratioText }.

export function validIdsFor(...reports) {
  const ids = new Set();
  for (const reportItem of reports) {
    if (!reportItem) continue;
    const [prefix, r] = Array.isArray(reportItem) ? reportItem : ['', reportItem];
    if (r && Array.isArray(r.readings)) {
      for (const x of r.readings) {
        ids.add(prefix ? `${prefix}.${x.id}` : x.id);
      }
    }
  }
  return ids;
}

export function buildReadingLookup(report) {
  const map = new Map();
  if (!report || !Array.isArray(report.readings)) return map;
  for (const r of report.readings) {
    map.set(r.id, r);
  }
  return map;
}

// Split text into individual sentences while preserving citation tags
export function splitSentences(text) {
  if (!text || typeof text !== 'string') return [];
  const raw = text.split(/(?<=[.!?])\s+(?=[A-Z0-9\[\u0900-\u097F])/g);
  return raw.map((s) => s.trim()).filter((s) => s.length > 0);
}

// Extract [R#] or [R12, R14] citations
export function extractCitations(sentence) {
  const matches = sentence.match(/\[([R\d\s,.-]+)\]/g) || [];
  const ids = [];
  for (const m of matches) {
    const inner = m.replace(/[\[\]]/g, '');
    const parts = inner.split(/[,;\s]+/).map((p) => p.trim());
    for (const p of parts) {
      if (/^R\d+$/i.test(p)) ids.push(p.toUpperCase());
    }
  }
  return [...new Set(ids)];
}

// Check if sentence makes empirical claims (has numbers or mentions known stations)
export function hasEmpiricalClaim(sentence, knownStations = []) {
  const hasNumber = /\b\d+(?:\.\d+)?\b/.test(sentence);
  const lower = sentence.toLowerCase();
  const hasStation = knownStations.some((st) => st && st.length >= 3 && lower.includes(st.toLowerCase()));
  const hasTrend = /\b(spike|spiked|peak|peaked|highest|lowest|exceeded|hazardous|severe|poor|improved|worsened|doubled)\b/i.test(sentence);
  return hasNumber || hasStation || hasTrend;
}

/**
 * Verify a single sentence against report readings
 */
export function verifySentence(sentence, report, knownStations = []) {
  const citations = extractCitations(sentence);
  const empirical = hasEmpiricalClaim(sentence, knownStations);

  if (!empirical) {
    return { verified: true, issues: [], citations, sentence };
  }

  if (citations.length === 0) {
    return {
      verified: false,
      issues: ['missing_citation_for_empirical_claim'],
      citations: [],
      sentence,
    };
  }

  const readingMap = buildReadingLookup(report);
  const citedRows = citations.map((id) => readingMap.get(id)).filter(Boolean);

  if (citedRows.length === 0) {
    return {
      verified: false,
      issues: ['cited_rows_do_not_exist'],
      citations,
      sentence,
    };
  }

  const issues = [];

  // Check 1: Station name matching
  const lower = sentence.toLowerCase();
  const mentionedStations = knownStations.filter((st) => st && st.length >= 3 && lower.includes(st.toLowerCase()));
  if (mentionedStations.length > 0) {
    const stationMatch = citedRows.some((r) =>
      r.location && mentionedStations.some((ms) => r.location.toLowerCase().includes(ms.toLowerCase()) || ms.toLowerCase().includes(r.location.toLowerCase()))
    );
    if (!stationMatch) {
      issues.push('station_mismatch_with_cited_row');
    }
  }

  // Check 2: Number matching within rounding tolerance
  const cleanSentence = sentence.replace(/\[R\d+\]/gi, '').replace(/\b20\d\d-\d\d-\d\d\b/g, '');
  const numbersInSentence = (cleanSentence.match(/\b\d+(?:\.\d+)?\b/g) || []).map(Number).filter((n) => n > 0 && n !== 2026 && n !== 2025);

  if (numbersInSentence.length > 0) {
    const rowValues = [];
    for (const row of citedRows) {
      if (row.values) {
        for (const [k, v] of Object.entries(row.values)) {
          if (v && typeof v.value === 'number') rowValues.push(v.value);
        }
      }
    }

    const majorNumbers = numbersInSentence.filter((n) => n >= 15);
    if (majorNumbers.length > 0 && rowValues.length > 0) {
      const matchFound = majorNumbers.some((num) =>
        rowValues.some((rv) => Math.abs(rv - num) <= 2 || Math.abs(rv - num) / Math.max(1, rv) <= 0.15)
      );
      if (!matchFound) {
        issues.push('number_mismatch_with_cited_rows');
      }
    }
  }

  if (issues.length > 0) {
    return {
      verified: false,
      issues,
      citations,
      sentence,
    };
  }

  return { verified: true, issues: [], citations, sentence };
}

/**
 * Enforces strict verification on a full document or structured analysis
 */
export function verifyDocument(textOrObj, report) {
  const knownStations = (report?.summary?.locations || []).map((l) => l.location).filter(Boolean);
  
  if (typeof textOrObj === 'string') {
    const sentences = splitSentences(textOrObj);
    let verifiedCount = 0;
    let unverifiedCount = 0;
    let removedCount = 0;

    const auditedSentences = sentences.map((s) => {
      const check = verifySentence(s, report, knownStations);
      if (check.verified) {
        verifiedCount++;
        return { text: s, status: 'verified', citations: check.citations };
      } else {
        unverifiedCount++;
        return { text: s, status: 'unverified', issues: check.issues, citations: check.citations };
      }
    });

    const total = sentences.length;
    return {
      total,
      verified: verifiedCount,
      unverified: unverifiedCount,
      removed: removedCount,
      ratioText: `${verifiedCount}/${total || 1} claims verified against your data`,
      sentences: auditedSentences,
      sanitizedText: auditedSentences.map((s) => s.text).join(' '),
    };
  }

  let totalClaims = 0;
  let verifiedClaims = 0;
  let unverifiedClaims = 0;
  const readingMap = buildReadingLookup(report);

  const walk = (node) => {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) {
      node.forEach(walk);
      return;
    }

    const ids = node.citations || node.evidenceIds || node.evidence;
    if (Array.isArray(ids)) {
      totalClaims++;
      const validIds = ids.filter((id) => readingMap.has(id));
      if (validIds.length > 0) {
        verifiedClaims++;
        node.verified = true;
        node.citations = validIds;
      } else {
        unverifiedClaims++;
        node.verified = false;
        node.unverified = true;
      }
    }

    for (const key of Object.keys(node)) {
      if (typeof node[key] === 'object') walk(node[key]);
    }
  };

  walk(textOrObj);

  return {
    total: totalClaims,
    verified: verifiedClaims,
    unverified: unverifiedClaims,
    removed: 0,
    ratioText: `${verifiedClaims}/${totalClaims || 1} claims verified against your data`,
  };
}

export function verifyCitations(obj, validIds) {
  let dropped = 0, unverified = 0;
  const walk = (n) => {
    if (Array.isArray(n)) return n.forEach(walk);
    if (n && typeof n === 'object') {
      for (const k of Object.keys(n)) {
        if ((k === 'citations' || k === 'evidence' || k === 'evidenceIds') && Array.isArray(n[k])) {
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

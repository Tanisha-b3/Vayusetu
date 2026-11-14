// Step 2: Normalization and Quality Assurance Pipeline.
// Pass 1: Deterministic alias and unit extraction.
// Pass 2: SchemaAgent (LLM) fallback for unresolved columns or low confidence, validated by Zod.
// The LLM only determines the column definitions/mapping — it NEVER touches or modifies raw values.
// Calculates Confidence (High/Medium/Low) in code and stores complete mappingLog.

import { aqiBandIndex, pm25BandIndex, pm10BandIndex, bandName, worstBandIndex, HOTSPOT_MIN_BAND } from './aqi.js';
import { runSchemaAgent } from './agents/schemaAgent.js';

const FIELDS = {
  location: [
    'location', 'area', 'station', 'site', 'ward', 'locality', 'place', 'monitoringstation',
    'स्थान', 'स्टेशन', 'क्षेत्र', 'वार्ड', 'जगह', 'केंद्र'
  ],
  lat: ['latitude', 'lat'],
  lng: ['longitude', 'lng', 'lon', 'long'],
  date: ['date', 'datetime', 'timestamp', 'reportdate', 'दिनांक', 'तारीख'],
  time: ['time', 'समय', 'घंटा'],
  pm25: ['pm25', 'pm2.5', 'पीएम25', 'पीएम2.5', 'पीएम 2.5'],
  pm10: ['pm10', 'पीएम10', 'पीएम 10'],
  aqi: ['aqi', 'airqualityindex', 'एक्यूआई', 'वायुगुणवत्तासूचकांक'],
  no2: ['no2', 'नाइट्रोजनडाइऑक्साइड'],
  so2: ['so2', 'सल्फरडाइऑक्साइड'],
};

export const POLLUTANTS = ['pm25', 'pm10', 'aqi', 'no2', 'so2'];
export const LABEL = { pm25: 'PM2.5', pm10: 'PM10', aqi: 'AQI', no2: 'NO2', so2: 'SO2' };

const MISSING = new Set(['', '-', '--', '---', 'na', 'n/a', 'nan', 'null', 'none', 'nil', 'missing', 'nd', '—', '–', '?', 'not available']);
const HARD_MAX = { pm25: 1500, pm10: 3000, aqi: 500, no2: 2000, so2: 2000 };
const SOFT_MAX = { pm25: 500, pm10: 1000 };

const keyOf = (s) => String(s ?? '').toLowerCase().replace(/[^a-z0-9\u0900-\u097F]/g, '');

function matchField(key) {
  for (const [field, aliases] of Object.entries(FIELDS)) {
    if (aliases.some((a) => key === a || (a.length >= 3 && key.startsWith(a)))) return field;
  }
  return null;
}

export function unitFromText(s) {
  const t = String(s || '');
  if (/mg\s*\/\s*m(3|³)/i.test(t)) return 'mg/m³';
  if (/(µg|μg|ug)\s*\/\s*m(3|³)/i.test(t)) return 'µg/m³';
  if (/ppb/i.test(t)) return 'ppb';
  if (/ppm/i.test(t)) return 'ppm';
  return null;
}

/**
 * Pass 1: Deterministic mapping of headers
 */
export function mapHeaders(headerRow, manualOverrides = {}) {
  const byField = {};
  const columns = [];
  const unmapped = [];
  const mappingDecisions = [];

  (headerRow || []).forEach((h, col) => {
    const text = String(h ?? '').trim();
    if (!text) return;

    // 1. Check for manual user override first
    if (manualOverrides[text]) {
      const field = manualOverrides[text];
      const unitHint = unitFromText(text);
      if (field !== 'ignore') {
        byField[field] = { col, header: text, unitHint, method: 'manual_override' };
        columns.push({ header: text, field, unitHint, col });
      }
      mappingDecisions.push({
        source: text,
        target: field,
        unit: unitHint,
        confidence: 1.0,
        method: 'manual_override',
        reason: 'User manual override',
      });
      return;
    }

    // 2. Deterministic alias match
    const field = matchField(keyOf(text));
    const unitHint = unitFromText(text);

    if (field && !byField[field]) {
      byField[field] = { col, header: text, unitHint, method: 'deterministic' };
      columns.push({ header: text, field, unitHint, col });
      mappingDecisions.push({
        source: text,
        target: field,
        unit: unitHint,
        confidence: 0.98,
        method: 'deterministic',
        reason: `Matched standard dictionary alias for ${field}`,
      });
    } else {
      unmapped.push(text);
      mappingDecisions.push({
        source: text,
        target: null,
        unit: unitHint,
        confidence: 0.2,
        method: 'unresolved',
        reason: 'No standard deterministic alias matched',
      });
    }
  });

  return { byField, columns, unmapped, mappingDecisions };
}

function findHeaderRowIndex(table, manualOverrides = {}) {
  for (let i = 0; i < Math.min(10, table.length); i++) {
    const m = mapHeaders(table[i], manualOverrides).byField;
    if (m.location && (m.pm25 || m.pm10 || m.aqi)) return i;
  }
  // If not found deterministically, look for candidate row with highest number of non-numeric text columns
  let bestIdx = 0;
  let maxTextCols = 0;
  for (let i = 0; i < Math.min(5, table.length); i++) {
    const row = table[i];
    if (Array.isArray(row)) {
      const textCols = row.filter((c) => String(c || '').trim().length > 1 && !/^-?\d+(?:\.\d+)?$/.test(String(c).trim())).length;
      if (textCols > maxTextCols) {
        maxTextCols = textCols;
        bestIdx = i;
      }
    }
  }
  return bestIdx;
}

export function parseMeasurement(raw, field, headerUnit) {
  const s = String(raw ?? '').trim();
  const base = { raw: s, value: null, unit: field === 'aqi' ? 'AQI' : 'µg/m³', status: 'ok', flags: [] };
  if (MISSING.has(s.toLowerCase()) || /^(n\/?a|missing|not available|nd)\b/i.test(s)) {
    return { ...base, status: 'missing', flags: ['missing_value'] };
  }
  let t = s.replace(/(\d),(\d{3})(?!\d)/g, '$1$2').replace(/(\d),(\d)/g, '$1.$2');
  const m = t.match(/-?\d+(?:\.\d+)?/);
  if (!m) return { ...base, status: 'invalid', flags: ['non_numeric'] };
  let v = Number(m[0]);
  const flags = [];
  if (field !== 'aqi') {
    const u = unitFromText(s) || headerUnit;
    if (u === 'mg/m³') {
      v *= 1000;
      flags.push('unit_converted_mg_to_ug');
    } else if (u === 'ppb' || u === 'ppm') {
      return { ...base, status: 'invalid', flags: ['unsupported_unit_' + u] };
    } else if (!u) {
      flags.push('unit_assumed_ug_m3');
    }
  }
  v = Math.round(v * 100) / 100;
  if (v < 0) return { ...base, status: 'invalid', flags: [...flags, 'negative_value'] };
  if (v > HARD_MAX[field]) return { ...base, status: 'invalid', flags: [...flags, 'exceeds_physical_limit'] };
  const status = SOFT_MAX[field] && v > SOFT_MAX[field] ? 'suspicious' : 'ok';
  if (status === 'suspicious') flags.push('extreme_value');
  return { ...base, value: v, status, flags };
}

const MONTHS = { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12 };
const iso = (y, m, d) => {
  const dt = new Date(Date.UTC(y, m - 1, d));
  if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== m - 1 || dt.getUTCDate() !== d) return null;
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
};
const fullYear = (y) => (y < 100 ? 2000 + y : y);

export function parseDate(raw) {
  const s = String(raw ?? '').trim();
  const out = { iso: null, time: null, flags: [] };
  if (!s || MISSING.has(s.toLowerCase())) return out;

  let rest = s;
  const tm = rest.match(/(?:^|\s|T)(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(am|pm)?/i);
  if (tm) {
    let hh = parseInt(tm[1], 10);
    const mm = tm[2];
    const ampm = tm[4]?.toLowerCase();
    if (ampm === 'pm' && hh < 12) hh += 12;
    if (ampm === 'am' && hh === 12) hh = 0;
    out.time = `${String(hh).padStart(2, '0')}:${mm}`;
    rest = (rest.slice(0, tm.index) + ' ' + rest.slice(tm.index + tm[0].length)).trim();
  }

  let m = rest.match(/^(\d{4})[-\/.](\d{1,2})[-\/.](\d{1,2})$/);
  if (m) { out.iso = iso(parseInt(m[1], 10), parseInt(m[2], 10), parseInt(m[3], 10)); return out; }

  m = rest.match(/^(\d{1,2})\s+([A-Za-z]{3,9})\s+(\d{2,4})$/);
  if (m && MONTHS[m[2].slice(0, 3).toLowerCase()]) {
    out.iso = iso(fullYear(parseInt(m[3], 10)), MONTHS[m[2].slice(0, 3).toLowerCase()], parseInt(m[1], 10));
    return out;
  }

  m = rest.match(/^(\d{1,2})[-\/.](\d{1,2})[-\/.](\d{2,4})$/);
  if (m) {
    const p1 = parseInt(m[1], 10), p2 = parseInt(m[2], 10), y = fullYear(parseInt(m[3], 10));
    if (p1 > 12 && p2 <= 12) { out.iso = iso(y, p2, p1); return out; }
    if (p2 > 12 && p1 <= 12) { out.iso = iso(y, p1, p2); return out; }
    out.iso = iso(y, p2, p1);
    out.flags.push('ambiguous_date_day_first_assumed');
    return out;
  }

  const dt = new Date(s);
  if (!isNaN(dt.getTime())) {
    out.iso = dt.toISOString().slice(0, 10);
    if (!out.time && /T\d{2}:/.test(dt.toISOString())) out.time = dt.toISOString().slice(11, 16);
    return out;
  }

  out.flags.push('unparseable_date');
  return out;
}

const pretty = (s) =>
  String(s ?? '')
    .trim()
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');

const locKey = (s) => String(s ?? '').toLowerCase().replace(/[^a-z0-9]/g, '');

/**
 * Normalizes raw table data with Pass 1 (deterministic) + Pass 2 (SchemaAgent LLM)
 */
export async function normalizeTableAsync({ table, reportId, sourceFile = '', manualOverrides = {} }) {
  if (!Array.isArray(table) || table.length === 0) {
    const e = new Error('Empty table.');
    e.status = 400;
    throw e;
  }

  const h = findHeaderRowIndex(table, manualOverrides);
  const headerRow = (table[h] || []).map((c) => String(c ?? '').trim());

  // Pass 1: Deterministic
  let { byField, columns, unmapped, mappingDecisions } = mapHeaders(headerRow, manualOverrides);

  // Check if Pass 2 (SchemaAgent LLM) is needed:
  // Triggered when key columns (location or pollutants) are missing, or unmapped columns exist
  const needsPass2 = !byField.location || (!byField.pm25 && !byField.pm10 && !byField.aqi) || unmapped.length > 0;
  let llmNotes = [];
  let detectedDateFormat = null;

  if (needsPass2) {
    try {
      const sampleRows = table.slice(h + 1, h + 6).map((r) => (Array.isArray(r) ? r.map((c) => String(c ?? '')) : []));
      const schemaRes = await runSchemaAgent({ headerRow, sampleRows, unmappedColumns: unmapped });

      if (schemaRes.success && schemaRes.data && Array.isArray(schemaRes.data.columns)) {
        llmNotes = schemaRes.data.notes || [];
        detectedDateFormat = schemaRes.data.dateFormat || null;

        for (const colMap of schemaRes.data.columns) {
          const colIdx = headerRow.findIndex((hdr) => hdr.toLowerCase() === colMap.source.toLowerCase());
          if (colIdx >= 0 && colMap.target && colMap.target !== 'ignore' && !manualOverrides[colMap.source]) {
            // Apply LLM mapping if deterministic pass did not map it
            if (!byField[colMap.target]) {
              const unitHint = colMap.unit || unitFromText(colMap.source);
              byField[colMap.target] = { col: colIdx, header: colMap.source, unitHint, method: 'llm_inferred' };
              columns.push({ header: colMap.source, field: colMap.target, unitHint, col: colIdx });

              // Update mapping decisions
              const decIdx = mappingDecisions.findIndex((d) => d.source.toLowerCase() === colMap.source.toLowerCase());
              const updated = {
                source: colMap.source,
                target: colMap.target,
                unit: unitHint,
                confidence: colMap.confidence || 0.85,
                method: 'llm_inferred',
                reason: colMap.reason || 'Mapped via SchemaAgent LLM pass',
              };
              if (decIdx >= 0) mappingDecisions[decIdx] = updated;
              else mappingDecisions.push(updated);

              // Remove from unmapped
              const uIdx = unmapped.findIndex((u) => u.toLowerCase() === colMap.source.toLowerCase());
              if (uIdx >= 0) unmapped.splice(uIdx, 1);
            }
          }
        }
      }
    } catch (err) {
      console.warn('[Normalizer] SchemaAgent Pass 2 failed or skipped, falling back to deterministic:', err.message);
      llmNotes.push('SchemaAgent LLM fallback encountered an error; deterministic rules retained.');
    }
  }

  // Validate that minimum requirement is met (location + at least one pollutant)
  if (!byField.location || (!byField.pm25 && !byField.pm10 && !byField.aqi)) {
    // If still missing, check if column 0 looks like location and column 1 looks like PM2.5/AQI
    if (headerRow.length >= 2 && !byField.location) {
      byField.location = { col: 0, header: headerRow[0], unitHint: null, method: 'heuristic_fallback' };
      columns.push({ header: headerRow[0], field: 'location', unitHint: null, col: 0 });
      mappingDecisions.push({
        source: headerRow[0],
        target: 'location',
        unit: null,
        confidence: 0.5,
        method: 'heuristic_fallback',
        reason: 'Assumed column 0 is monitoring location',
      });
    }
    if (!byField.pm25 && !byField.pm10 && !byField.aqi && headerRow.length >= 2) {
      byField.pm25 = { col: 1, header: headerRow[1], unitHint: 'µg/m³', method: 'heuristic_fallback' };
      columns.push({ header: headerRow[1], field: 'pm25', unitHint: 'µg/m³', col: 1 });
      mappingDecisions.push({
        source: headerRow[1],
        target: 'pm25',
        unit: 'µg/m³',
        confidence: 0.5,
        method: 'heuristic_fallback',
        reason: 'Assumed column 1 is PM2.5 particulate measurement',
      });
    }
  }

  // Row by row normalization - values are parsed entirely in code!
  const readings = [];
  for (let i = h + 1; i < table.length; i++) {
    const row = table[i];
    if (!row || !row.some((c) => String(c ?? '').trim() !== '')) continue;
    const cell = (f) => (byField[f] && row[byField[f].col] !== undefined ? row[byField[f].col] : null);

    const values = {};
    for (const f of POLLUTANTS) {
      if (byField[f]) values[f] = parseMeasurement(cell(f), f, byField[f].unitHint);
    }
    const locRaw = cell('location');
    const d = parseDate(cell('date'));
    const timeCol = cell('time') ? String(cell('time')).match(/(\d{1,2}):(\d{2})/) : null;
    const rowNumber = i + 1;

    const flags = [...d.flags];
    if (!locRaw) flags.push('missing_location');
    const num = (f) => {
      const n = parseFloat(cell(f));
      return Number.isFinite(n) ? n : null;
    };

    readings.push({
      id: `R${rowNumber}`,
      reportId,
      sourceFile,
      rowNumber,
      location: locRaw ? pretty(locRaw) : null,
      locationKey: locRaw ? locKey(locRaw) : null,
      date: d.iso,
      time: timeCol ? `${timeCol[1].padStart(2, '0')}:${timeCol[2]}` : d.time,
      lat: num('lat'),
      lng: num('lng'),
      values,
      flags,
      rawRow: Array.isArray(row) ? row.map((c) => String(c ?? '')) : [],
    });
  }

  // Merge obvious location aliases
  const keys = [...new Set(readings.map((r) => r.locationKey).filter(Boolean))];
  const merges = [];
  for (const k of keys) {
    const longer = keys.filter((o) => o !== k && o.startsWith(k + ' '));
    if (longer.length === 1) {
      const target = readings.find((r) => r.locationKey === longer[0]);
      readings
        .filter((r) => r.locationKey === k)
        .forEach((r) => {
          merges.push({ from: r.location, to: target.location, readingId: r.id });
          r.location = target.location;
          r.locationKey = target.locationKey;
          r.flags.push('location_alias_merged');
        });
    }
  }

  const dates = readings.map((r) => r.date).filter(Boolean);
  const counts = dates.reduce((m, d) => ((m[d] = (m[d] || 0) + 1), m), {});
  const detectedDate = Object.keys(counts).sort((x, y) => counts[y] - counts[x])[0] || null;

  const mappingLog = {
    columns: mappingDecisions,
    dateFormat: detectedDateFormat,
    notes: llmNotes,
  };

  return {
    headerRow: h + 1,
    columns,
    unmapped,
    readings,
    merges,
    detectedDate,
    mappingLog,
  };
}

// Synchronous wrapper for backwards compatibility
export function normalizeTable({ table, reportId, sourceFile = '', manualOverrides = {} }) {
  if (!Array.isArray(table) || table.length === 0) {
    const e = new Error('Empty table.');
    e.status = 400;
    throw e;
  }
  const h = findHeaderRowIndex(table, manualOverrides);
  const headerRow = (table[h] || []).map((c) => String(c ?? '').trim());
  const { byField, columns, unmapped, mappingDecisions } = mapHeaders(headerRow, manualOverrides);

  // Fallback defaults if needed
  if (!byField.location && headerRow.length >= 1) {
    byField.location = { col: 0, header: headerRow[0], unitHint: null, method: 'deterministic_fallback' };
    columns.push({ header: headerRow[0], field: 'location', unitHint: null, col: 0 });
  }
  if (!byField.pm25 && !byField.pm10 && !byField.aqi && headerRow.length >= 2) {
    byField.pm25 = { col: 1, header: headerRow[1], unitHint: 'µg/m³', method: 'deterministic_fallback' };
    columns.push({ header: headerRow[1], field: 'pm25', unitHint: 'µg/m³', col: 1 });
  }

  const readings = [];
  for (let i = h + 1; i < table.length; i++) {
    const row = table[i];
    if (!row || !row.some((c) => String(c ?? '').trim() !== '')) continue;
    const cell = (f) => (byField[f] && row[byField[f].col] !== undefined ? row[byField[f].col] : null);

    const values = {};
    for (const f of POLLUTANTS) {
      if (byField[f]) values[f] = parseMeasurement(cell(f), f, byField[f].unitHint);
    }
    const locRaw = cell('location');
    const d = parseDate(cell('date'));
    const timeCol = cell('time') ? String(cell('time')).match(/(\d{1,2}):(\d{2})/) : null;
    const rowNumber = i + 1;

    const flags = [...d.flags];
    if (!locRaw) flags.push('missing_location');
    const num = (f) => {
      const n = parseFloat(cell(f));
      return Number.isFinite(n) ? n : null;
    };

    readings.push({
      id: `R${rowNumber}`,
      reportId,
      sourceFile,
      rowNumber,
      location: locRaw ? pretty(locRaw) : null,
      locationKey: locRaw ? locKey(locRaw) : null,
      date: d.iso,
      time: timeCol ? `${timeCol[1].padStart(2, '0')}:${timeCol[2]}` : d.time,
      lat: num('lat'),
      lng: num('lng'),
      values,
      flags,
      rawRow: Array.isArray(row) ? row.map((c) => String(c ?? '')) : [],
    });
  }

  const mappingLog = {
    columns: mappingDecisions,
    dateFormat: null,
    notes: ['Computed via deterministic pass'],
  };

  return {
    headerRow: h + 1,
    columns,
    unmapped,
    readings,
    merges: [],
    detectedDate: new Date().toISOString().slice(0, 10),
    mappingLog,
  };
}

/**
 * Computes deterministic confidence score (High/Medium/Low) for findings and hotspots
 */
export function computeConfidence({ location, readings = [], locationStats }) {
  const locReadings = readings.filter((r) => r.location === location || r.locationKey === locKey(location));
  const validCount = locationStats?.pm25?.n || locReadings.filter((r) => r.values?.pm25?.status === 'ok').length;
  const flaggedCount = locReadings.filter((r) => r.flags && r.flags.length > 0).length;
  const totalCount = Math.max(1, locReadings.length);
  const flaggedShare = flaggedCount / totalCount;

  // Distinct hours coverage
  const distinctHours = new Set(locReadings.map((r) => r.time?.slice(0, 2)).filter(Boolean)).size;

  // Factor 1: Valid rows
  const rowScore = validCount >= 8 ? 1.0 : validCount >= 3 ? 0.6 : 0.3;
  // Factor 2: Flagged row share
  const flagScore = flaggedShare <= 0.15 ? 1.0 : flaggedShare <= 0.35 ? 0.6 : 0.2;
  // Factor 3: Time coverage
  const timeScore = distinctHours >= 4 ? 1.0 : distinctHours >= 2 ? 0.7 : 0.4;

  const score = Math.round((0.4 * rowScore + 0.35 * flagScore + 0.25 * timeScore) * 100);
  const level = score >= 75 ? 'High' : score >= 50 ? 'Medium' : 'Low';

  return {
    level,
    score,
    factors: {
      validRows: validCount,
      flaggedShare: Math.round(flaggedShare * 100),
      distinctHours,
    },
  };
}

/**
 * Computes dataset-wide Data Health card metrics
 */
export function computeDataHealth(report) {
  const readings = report?.readings || [];
  const dq = report?.summary?.dataQuality || {};
  const totalCells = dq.cells || 1;
  const usableShare = dq.usableShare || Math.round(((dq.ok || 0) / totalCells) * 100);

  // Count quarantined readings (invalid values)
  const quarantined = readings.filter((r) =>
    r.flags?.some((f) => ['exceeds_physical_limit', 'negative_value', 'non_numeric', 'unsupported_unit_ppb'].includes(f))
  );

  // Missing hours per station
  const stationHours = new Map();
  for (const r of readings) {
    if (!r.location) continue;
    if (!stationHours.has(r.location)) stationHours.set(r.location, new Set());
    if (r.time) stationHours.get(r.location).add(r.time.slice(0, 2));
  }

  const missingHoursPerStation = [];
  for (const [loc, hours] of stationHours.entries()) {
    const recordedHours = hours.size;
    const missing = Math.max(0, 24 - recordedHours);
    if (missing > 0) {
      missingHoursPerStation.push({ location: loc, recordedHours, missingHours: missing });
    }
  }

  // One line verdict
  let verdict = 'Good operational health: data is reliable and representative for municipal action.';
  if (usableShare < 70) {
    verdict = `Limited reliability (${usableShare}% usable): high proportion of missing or quarantined sensor data requires on-site verification.`;
  } else if (quarantined.length > 3) {
    verdict = `Moderate health (${usableShare}% usable): ${quarantined.length} readings quarantined due to physical limit or sensor saturation violations.`;
  }

  // Why was this excluded tooltip lookup map
  const RULE_TOOLTIPS = {
    exceeds_physical_limit: 'Sensor reading exceeds physical limit (e.g. >1500 µg/m³); indicates laser diode saturation or electrical spike.',
    extreme_value: 'Suspiciously high value requiring cross-station corroboration.',
    negative_value: 'Negative particle concentration is physically impossible; indicates baseline zero-drift.',
    non_numeric: 'Raw cell contained unparseable text or non-numeric symbols.',
    unsupported_unit_ppb: 'Particulates measured in gas concentration unit (ppb); incompatible.',
    missing_value: 'Cell was empty or sentinel NA.',
    missing_location: 'No station identifier could be resolved for this row.',
  };

  const quarantinedTooltips = {};
  for (const r of quarantined) {
    const primaryRule = r.flags.find((f) => RULE_TOOLTIPS[f]) || r.flags[0] || 'flagged';
    quarantinedTooltips[r.id] = {
      readingId: r.id,
      location: r.location,
      rule: primaryRule,
      tooltip: RULE_TOOLTIPS[primaryRule] || `Excluded by rule: ${primaryRule}`,
    };
  }

  return {
    usableShare,
    quarantinedCount: quarantined.length,
    missingHoursPerStation,
    verdict,
    quarantinedTooltips,
  };
}

export function buildSummary(readings, columns) {
  const present = ['pm25', 'pm10', 'aqi'].filter((f) => columns.some((c) => c.field === f));
  const locs = new Map();
  const gaps = [];
  const byStatus = { ok: 0, missing: 0, invalid: 0, suspicious: 0 };

  for (const r of readings) {
    if (!r.location) continue;
    if (!locs.has(r.locationKey)) {
      locs.set(r.locationKey, { key: r.locationKey, location: r.location, lat: r.lat, lng: r.lng, readingIds: [], pm25: [], pm10: [], aqi: [] });
    }
    const L = locs.get(r.locationKey);
    L.readingIds.push(r.id);
    if (L.lat == null && r.lat != null) { L.lat = r.lat; L.lng = r.lng; }
    for (const f of present) {
      const c = r.values[f];
      if (!c) continue;
      byStatus[c.status]++;
      L[f].push({ id: r.id, status: c.status, value: c.value });
      if (c.status !== 'ok') gaps.push({ readingId: r.id, location: r.location, field: f, status: c.status, raw: c.raw, flags: c.flags });
    }
  }

  const locations = [...locs.values()].map((L) => {
    const agg = {};
    for (const f of present) {
      const ok = L[f].filter((x) => x.status === 'ok');
      const bad = L[f].filter((x) => x.status !== 'ok');
      agg[f] = {
        value: ok.length ? Math.round((ok.reduce((s, x) => s + x.value, 0) / ok.length) * 10) / 10 : null,
        n: ok.length,
        okIds: ok.map((x) => x.id),
        problemIds: bad.map((x) => x.id),
        problemStatuses: bad.map((x) => x.status),
        provided: L[f].length > 0,
      };
    }
    for (const f of ['pm25', 'pm10', 'aqi']) if (!agg[f]) agg[f] = { value: null, n: 0, okIds: [], problemIds: [], problemStatuses: [], provided: false };
    const bandIdx = worstBandIndex([pm25BandIndex(agg.pm25.value), pm10BandIndex(agg.pm10.value), aqiBandIndex(agg.aqi.value)]);
    return { key: L.key, location: L.location, lat: L.lat, lng: L.lng, readingIds: L.readingIds, pm25: agg.pm25, pm10: agg.pm10, aqi: agg.aqi, bandIndex: bandIdx, band: bandName(bandIdx) };
  });

  const hotspots = locations
    .filter((l) => l.bandIndex != null && l.bandIndex >= HOTSPOT_MIN_BAND)
    .sort((a, b) => b.bandIndex - a.bandIndex || (b.pm25.value ?? b.aqi.value ?? 0) - (a.pm25.value ?? a.aqi.value ?? 0))
    .map((l) => ({
      key: l.key, location: l.location, band: l.band, pm25: l.pm25.value, pm10: l.pm10.value, aqi: l.aqi.value,
      evidenceIds: [...new Set([...l.pm25.okIds, ...l.pm10.okIds, ...l.aqi.okIds])],
    }));

  const total = Object.values(byStatus).reduce((a, b) => a + b, 0);
  const share = total ? byStatus.ok / total : 0;
  const reliability = share >= 0.85 ? 'Good' : share >= 0.6 ? 'Limited' : 'Poor';
  const rowIssues = readings.filter((r) => r.flags.some((f) => !f.startsWith('ambiguous') && f !== 'location_alias_merged')).map((r) => ({ readingId: r.id, flags: r.flags }));

  return {
    indicators: present,
    locations,
    hotspots,
    gaps,
    rowIssues,
    dataQuality: { cells: total, ...byStatus, usableShare: Math.round(share * 100), reliability },
  };
}

export async function createReportAsync({ id, name, sourceFile, table, city, reportDate, manualOverrides = {} }) {
  const n = await normalizeTableAsync({ table, reportId: id, sourceFile, manualOverrides });
  const summary = buildSummary(n.readings, n.columns);

  return {
    id,
    name: name || sourceFile,
    sourceFile,
    city: city || null,
    createdAt: new Date().toISOString(),
    reportDate: reportDate || n.detectedDate || new Date().toISOString().slice(0, 10),
    headerRow: n.headerRow,
    columnMapping: n.columns,
    unmappedColumns: n.unmapped,
    mappingLog: n.mappingLog,
    locationMerges: n.merges,
    readings: n.readings,
    summary,
    rawTable: table,
    analysis: null,
    recommendations: {},
    comparison: null,
    documents: [],
  };
}

export function createReport({ id, name, sourceFile, table, city, reportDate, manualOverrides = {} }) {
  const n = normalizeTable({ table, reportId: id, sourceFile, manualOverrides });
  const summary = buildSummary(n.readings, n.columns);

  return {
    id,
    name: name || sourceFile,
    sourceFile,
    city: city || null,
    createdAt: new Date().toISOString(),
    reportDate: reportDate || n.detectedDate || new Date().toISOString().slice(0, 10),
    headerRow: n.headerRow,
    columnMapping: n.columns,
    unmappedColumns: n.unmapped,
    mappingLog: n.mappingLog,
    locationMerges: n.merges,
    readings: n.readings,
    summary,
    rawTable: table,
    analysis: null,
    recommendations: {},
    comparison: null,
    documents: [],
  };
}

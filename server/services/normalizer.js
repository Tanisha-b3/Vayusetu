// Step 2: deterministic cleaning. NO AI here - missing values stay missing, every reading keeps file + row.
import { aqiBandIndex, pm25BandIndex, pm10BandIndex, bandName, worstBandIndex, HOTSPOT_MIN_BAND } from './aqi.js';

const FIELDS = {
  location: ['location', 'area', 'station', 'site', 'ward', 'locality', 'place', 'monitoringstation'],
  lat: ['latitude', 'lat'],
  lng: ['longitude', 'lng', 'lon', 'long'],
  date: ['date', 'datetime', 'timestamp', 'reportdate'],
  time: ['time'],
  pm25: ['pm25'],
  pm10: ['pm10'],
  aqi: ['aqi', 'airqualityindex'],
  no2: ['no2'],
  so2: ['so2'],
};
export const POLLUTANTS = ['pm25', 'pm10', 'aqi', 'no2', 'so2'];
export const LABEL = { pm25: 'PM2.5', pm10: 'PM10', aqi: 'AQI', no2: 'NO2', so2: 'SO2' };

const MISSING = new Set(['', '-', '--', '---', 'na', 'n/a', 'nan', 'null', 'none', 'nil', 'missing', 'nd', '—', '–', '?', 'not available']);
const HARD_MAX = { pm25: 1500, pm10: 3000, aqi: 500, no2: 2000, so2: 2000 };
const SOFT_MAX = { pm25: 500, pm10: 1000 };

const keyOf = (s) => String(s ?? '').toLowerCase().replace(/[^a-z0-9]/g, '');
function matchField(key) {
  for (const [field, aliases] of Object.entries(FIELDS)) {
    if (aliases.some((a) => key === a || (a.length >= 3 && key.startsWith(a)))) return field;
  }
  return null;
}
function unitFromText(s) {
  const t = String(s || '');
  if (/mg\s*\/\s*m(3|³)/i.test(t)) return 'mg/m³';
  if (/(µg|μg|ug)\s*\/\s*m(3|³)/i.test(t)) return 'µg/m³';
  if (/ppb/i.test(t)) return 'ppb';
  if (/ppm/i.test(t)) return 'ppm';
  return null;
}

export function mapHeaders(headerRow) {
  const byField = {};
  const columns = [];
  const unmapped = [];
  (headerRow || []).forEach((h, col) => {
    const text = String(h ?? '').trim();
    if (!text) return;
    const field = matchField(keyOf(text));
    if (field && !byField[field]) {
      byField[field] = { col, header: text, unitHint: unitFromText(text) };
      columns.push({ header: text, field, unitHint: byField[field].unitHint });
    } else unmapped.push(text);
  });
  return { byField, columns, unmapped };
}

function findHeaderRow(table) {
  for (let i = 0; i < Math.min(10, table.length); i++) {
    const m = mapHeaders(table[i]).byField;
    if (m.location && (m.pm25 || m.pm10 || m.aqi)) return i;
  }
  const e = new Error('Could not find recognisable columns (need a location column and at least one of PM2.5, PM10, AQI).');
  e.status = 422;
  throw e;
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
    if (u === 'mg/m³') { v *= 1000; flags.push('unit_converted_mg_to_ug'); }
    else if (u === 'ppb' || u === 'ppm') return { ...base, status: 'invalid', flags: ['unsupported_unit_' + u] };
    else if (!u) flags.push('unit_assumed_ug_m3');
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
  if (!s) { out.flags.push('missing_date'); return out; }
  const tm = s.match(/(\d{1,2}):(\d{2})/);
  if (tm) out.time = `${tm[1].padStart(2, '0')}:${tm[2]}`;
  let m;
  if (/^\d{5}(\.\d+)?$/.test(s) && Number(s) > 30000 && Number(s) < 80000) {
    const d = new Date(Math.round((Number(s) - 25569) * 86400000));
    out.iso = iso(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate());
  } else if ((m = s.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/))) {
    out.iso = iso(+m[1], +m[2], +m[3]);
  } else if ((m = s.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{2,4})/))) {
    let [d, mo, y] = [+m[1], +m[2], fullYear(+m[3])];
    if (mo > 12 && d <= 12) { [d, mo] = [mo, d]; out.flags.push('date_month_first_detected'); }
    else if (d <= 12 && mo <= 12 && d !== mo) out.flags.push('ambiguous_date_dayfirst_assumed');
    out.iso = iso(y, mo, d);
  } else if ((m = s.match(/^(\d{1,2})(?:st|nd|rd|th)?\s+([A-Za-z]{3,9})\.?,?\s+(\d{2,4})/))) {
    out.iso = iso(fullYear(+m[3]), MONTHS[m[2].slice(0, 3).toLowerCase()], +m[1]);
  } else if ((m = s.match(/^([A-Za-z]{3,9})\.?\s+(\d{1,2}),?\s+(\d{2,4})/))) {
    out.iso = iso(fullYear(+m[3]), MONTHS[m[1].slice(0, 3).toLowerCase()], +m[2]);
  }
  if (!out.iso) out.flags.push('unparseable_date');
  return out;
}

const cleanLoc = (s) => String(s ?? '').replace(/\s+/g, ' ').trim();
const locKey = (s) => cleanLoc(s).toLowerCase().replace(/[^a-z0-9\u0900-\u097f ]/g, '').replace(/\s+/g, ' ').trim();
const pretty = (s) => (s === s.toLowerCase() || s === s.toUpperCase() ? s.replace(/\b\w/g, (c) => c.toUpperCase()).replace(/\bMp\b/, 'MP') : s);

export function normalizeTable({ table, reportId, sourceFile }) {
  const h = findHeaderRow(table);
  const { byField, columns, unmapped } = mapHeaders(table[h]);
  const readings = [];

  for (let i = h + 1; i < table.length; i++) {
    const row = table[i];
    if (!row || row.every((c) => String(c ?? '').trim() === '')) continue;
    const rowNumber = i + 1; // matches the line/row number the user sees in the file
    const cell = (f) => (byField[f] ? row[byField[f].col] : undefined);
    const locRaw = cleanLoc(cell('location'));
    const values = {};
    for (const f of POLLUTANTS) if (byField[f]) values[f] = parseMeasurement(cell(f), f, byField[f].unitHint);

    // cross-check: PM2.5 is a subset of PM10, so PM2.5 > PM10 means at least one of them is wrong
    const a = values.pm25, b = values.pm10;
    if (a?.value != null && b?.value != null && a.status !== 'invalid' && b.status !== 'invalid' && a.value > b.value) {
      for (const c of [a, b]) { c.status = 'suspicious'; if (!c.flags.includes('pm25_exceeds_pm10')) c.flags.push('pm25_exceeds_pm10'); }
    }

    const d = byField.date ? parseDate(cell('date')) : { iso: null, time: null, flags: ['no_date_column'] };
    const timeCol = byField.time ? String(cell('time') ?? '').match(/(\d{1,2}):(\d{2})/) : null;
    const flags = [...d.flags];
    if (!locRaw) flags.push('missing_location');
    const num = (f) => { const n = parseFloat(cell(f)); return Number.isFinite(n) ? n : null; };

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
      rawRow: row.map((c) => String(c ?? '')),
    });
  }

  // merge obvious location aliases ("Arera" -> "Arera Colony") when unambiguous
  const keys = [...new Set(readings.map((r) => r.locationKey).filter(Boolean))];
  const merges = [];
  for (const k of keys) {
    const longer = keys.filter((o) => o !== k && o.startsWith(k + ' '));
    if (longer.length === 1) {
      const target = readings.find((r) => r.locationKey === longer[0]);
      readings.filter((r) => r.locationKey === k).forEach((r) => {
        merges.push({ from: r.location, to: target.location, readingId: r.id });
        r.location = target.location; r.locationKey = target.locationKey; r.flags.push('location_alias_merged');
      });
    }
  }

  const dates = readings.map((r) => r.date).filter(Boolean);
  const counts = dates.reduce((m, d) => ((m[d] = (m[d] || 0) + 1), m), {});
  const detectedDate = Object.keys(counts).sort((x, y) => counts[y] - counts[x])[0] || null;

  return { headerRow: h + 1, columns, unmapped, readings, merges, detectedDate };
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

export function createReport({ id, name, sourceFile, table, city, reportDate }) {
  const n = normalizeTable({ table, reportId: id, sourceFile });
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
    locationMerges: n.merges,
    readings: n.readings,
    summary,
    analysis: null,
    recommendations: {},
    comparison: null,
    documents: [],
  };
}

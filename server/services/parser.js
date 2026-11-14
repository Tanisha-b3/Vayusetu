// Step 1: turn any uploaded/pasted input into a raw table (array of rows). No interpretation here.
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

export function parseText(text) {
  const clean = String(text ?? '').replace(/^\uFEFF/, '').trim();
  if (!clean) return { table: [] };

  // 1. First pass: PapaParse handles CSV, TSV, semicolon, and pipe
  const res = Papa.parse(clean, { skipEmptyLines: false });
  let table = res.data;

  // 2. Second pass fallback: If table only has 1 column OR cells contain multi-space delimiters that PapaParse missed
  const hasMultiSpaceCells = table.some((r) => Array.isArray(r) && r.some((c) => /\s{2,}/.test(String(c))));
  const maxCols = Math.max(0, ...table.map((r) => (Array.isArray(r) ? r.length : 0)));

  if (maxCols <= 1 || hasMultiSpaceCells) {
    const lines = clean.split(/\r?\n/).filter((l) => l.trim().length > 0);
    const splitTable = lines.map((line) => {
      return line.split(/\t+|\s{2,}/).map((c) => c.trim()).filter((c) => c.length > 0);
    });

    const splitMaxCols = Math.max(0, ...splitTable.map((r) => r.length));
    if (splitMaxCols > maxCols) {
      table = splitTable;
    }
  }

  return { table };
}

function parseSheet(buffer) {
  const wb = XLSX.read(buffer, { type: 'buffer', cellDates: false });
  const name = wb.SheetNames[0];
  const table = XLSX.utils.sheet_to_json(wb.Sheets[name], { header: 1, raw: false, defval: '', blankrows: true });
  return { table, sheet: name };
}

export function parseBuffer(buffer, filename = '') {
  const ext = filename.split('.').pop().toLowerCase();
  if (['xlsx', 'xls', 'xlsm'].includes(ext)) return parseSheet(buffer);
  if (ext === 'pdf') {
    const e = new Error('PDF upload is not supported yet. Export the table to CSV/XLSX or paste it as text.');
    e.status = 415;
    throw e;
  }
  return parseText(buffer.toString('utf8'));
}

// Step 1: turn any uploaded/pasted input into a raw table (array of rows). No interpretation here.
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

export function parseText(text) {
  const clean = String(text).replace(/^\uFEFF/, '');
  // Papa auto-detects comma / tab / semicolon / pipe (pasted Excel is tab separated)
  const res = Papa.parse(clean, { skipEmptyLines: false });
  return { table: res.data };
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

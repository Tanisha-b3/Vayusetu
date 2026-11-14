// Automated test suite for ugly CSV tables:
// 1. Hindi / Devanagari headers
// 2. Merged units (mg/m3, ppb)
// 3. Tab and multi-space separated text table
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseText } from '../services/parser.js';
import { createReportAsync, createReport } from '../services/normalizer.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sampleDir = path.join(__dirname, '..', 'sample-data');

function assert(cond, msg) {
  if (!cond) {
    console.error(`❌ Assertion FAILED: ${msg}`);
    process.exit(1);
  }
  console.log(`  ✓ ${msg}`);
}

async function runTests() {
  console.log('====================================================');
  console.log('🧪 RUNNING UGLY CSVs & SCHEMA AGENT TEST SUITE');
  console.log('====================================================\n');

  // ---------------- TEST 1: Whitespace & Tab Separated Table ----------------
  console.log('TEST 1: Whitespace and Tab Separated Table (ugly_whitespace_table.txt)');
  const wsContent = fs.readFileSync(path.join(sampleDir, 'ugly_whitespace_table.txt'), 'utf8');
  const { table: wsTable } = parseText(wsContent);
  assert(wsTable.length >= 7, `Parsed ${wsTable.length} rows (expected >= 7)`);
  assert(wsTable[0].length >= 5, `Parsed ${wsTable[0].length} columns in header (expected >= 5)`);

  const wsReport = createReport({
    id: 'test-ws',
    sourceFile: 'ugly_whitespace_table.txt',
    table: wsTable,
  });
  assert(wsReport.readings.length === 6, `Generated ${wsReport.readings.length} readings (expected 6)`);
  assert(wsReport.readings[0].location === 'Mp Nagar', `Location parsed properly: ${wsReport.readings[0].location}`);
  assert(wsReport.readings[0].values.pm25.value === 182, `PM2.5 value parsed properly: ${wsReport.readings[0].values.pm25.value}`);
  console.log('  🎉 Test 1 passed!\n');

  // ---------------- TEST 2: Merged Units (mg/m3, ppb) ----------------
  console.log('TEST 2: Merged Units Conversion (ugly_merged_units.csv)');
  const muContent = fs.readFileSync(path.join(sampleDir, 'ugly_merged_units.csv'), 'utf8');
  const { table: muTable } = parseText(muContent);
  const muReport = createReport({
    id: 'test-mu',
    sourceFile: 'ugly_merged_units.csv',
    table: muTable,
  });

  assert(muReport.readings.length === 6, `Generated ${muReport.readings.length} readings (expected 6)`);
  const r1 = muReport.readings[0];
  // 0.185 mg/m3 must be converted to 185 ug/m3 in code
  assert(r1.values.pm25.value === 185, `0.185 mg/m3 was converted to ${r1.values.pm25.value} µg/m³ (expected 185)`);
  assert(r1.values.pm25.flags.includes('unit_converted_mg_to_ug'), 'Flag unit_converted_mg_to_ug recorded');
  console.log('  🎉 Test 2 passed!\n');

  // ---------------- TEST 3: Hindi / Devanagari Headers ----------------
  console.log('TEST 3: Hindi Devanagari Headers (ugly_hindi_headers.csv)');
  const hiContent = fs.readFileSync(path.join(sampleDir, 'ugly_hindi_headers.csv'), 'utf8');
  const { table: hiTable } = parseText(hiContent);

  // Run async normalization (Pass 1 deterministic + Pass 2 SchemaAgent)
  const hiReport = await createReportAsync({
    id: 'test-hi',
    sourceFile: 'ugly_hindi_headers.csv',
    table: hiTable,
  });

  assert(hiReport.readings.length === 6, `Generated ${hiReport.readings.length} readings (expected 6)`);
  assert(hiReport.columnMapping.some((c) => c.field === 'location'), 'Location column mapped successfully');
  assert(hiReport.columnMapping.some((c) => c.field === 'pm25'), 'PM2.5 column mapped successfully');
  assert(hiReport.mappingLog != null, 'Mapping log is present in dataset');
  assert(Array.isArray(hiReport.mappingLog.columns), 'Mapping log contains column decisions');

  // Confirm values were never touched by LLM - deterministic numeric integrity
  const rHamidia = hiReport.readings.find((r) => r.location?.includes('हमीदिया') || r.location?.includes('Hamidia') || r.rawRow[0]?.includes('हमीदिया'));
  assert(rHamidia != null, 'Hamidia row found');
  assert(rHamidia.values.pm25.value === 220, `Numeric value preserved identically: ${rHamidia.values.pm25.value} (expected 220)`);
  console.log('  🎉 Test 3 passed!\n');

  console.log('====================================================');
  console.log('✅ ALL UGLY CSV & PARSER/NORMALIZER TESTS PASSED (3/3)');
  console.log('====================================================');
}

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});

// SchemaAgent system prompt:
// Maps messy, multi-lingual, or unstructured table columns to standard air quality fields.
export const SCHEMA_SYSTEM_PROMPT = `You are SchemaAgent, an expert environmental data engineer.
Your task is to inspect messy tabular headers and sample data rows and map each column to a standard target field.

STANDARD TARGET FIELDS:
- "location": Monitoring station, area, ward, site, locality, or place name (also Devanagari: स्थान, स्टेशन, क्षेत्र, वार्ड, जगह).
- "pm25": PM2.5 particulate matter (also Devanagari: पीएम 2.5, पीएम२.५).
- "pm10": PM10 particulate matter (also Devanagari: पीएम 10, पीएम१०).
- "aqi": Air Quality Index (also Devanagari: एक्यूआई, वायु गुणवत्ता सूचकांक).
- "no2": Nitrogen dioxide (µg/m³ or ppb).
- "so2": Sulfur dioxide (µg/m³ or ppb).
- "date": Date of observation (also Devanagari: दिनांक, तारीख).
- "time": Time of observation (also Devanagari: समय).
- "lat": Latitude coordinates.
- "lng": Longitude coordinates.
- "ignore": Unrelated metadata, serial numbers, remarks, or unsupported metrics.

UNITS RECOGNITION:
- Particulate matter (PM2.5, PM10): usually "µg/m³" or "ug/m3". If header mentions "mg/m3", note unit as "mg/m³". If "ppb", note "ppb".
- AQI: dimensionless index ("AQI").
- Gases (NO2, SO2): "µg/m³" or "ppb" or "ppm".

RULES:
1. Never guess if you are unsure; assign target "ignore" or null with low confidence.
2. For confidence: use a number between 0.1 and 1.0 (e.g. 0.95 for clear matches, 0.5 for ambiguous).
3. Detect the date format from sample rows if present (e.g. "DD-MM-YYYY", "YYYY-MM-DD", "DD/MM/YYYY").
4. Return ONLY a single valid JSON object strictly matching the required schema. No markdown, no conversational commentary.`;

export function schemaPrompt({ headerRow, sampleRows, unmappedColumns = [] }) {
  const prompt = `INSPECT THIS TABLE STRUCTURE:

HEADERS:
${JSON.stringify(headerRow)}

SAMPLE ROWS (FIRST 5 ROWS):
${sampleRows.map((r, i) => `Row ${i + 1}: ${JSON.stringify(r)}`).join('\n')}

UNRESOLVED COLUMNS:
${JSON.stringify(unmappedColumns)}

TASK:
Map every column in HEADERS to the best standard target field. Note any embedded units or date formats.

OUTPUT STRICT JSON:
{
  "columns": [
    {
      "source": "exact header string",
      "target": "location|pm25|pm10|aqi|no2|so2|date|time|lat|lng|ignore",
      "unit": "µg/m³|mg/m³|ppb|ppm|AQI|null",
      "confidence": 0.95,
      "reason": "Clear Hindi transliteration for PM 2.5"
    }
  ],
  "dateFormat": "DD-MM-YYYY or null",
  "notes": ["Detected Hindi Devanagari headers", "Found mg/m3 unit in PM2.5 header"]
}`;
  return { system: SCHEMA_SYSTEM_PROMPT, prompt };
}

import { SYSTEM, block } from './common.js';

export function analysisPrompt({ computed, dataText, knowledgeText, report }) {
  const prompt = `TASK: Interpret this single air-quality report for local decision makers.
File: ${report.sourceFile} | Report date: ${report.reportDate} | City: ${report.city || 'not stated'}

${block('COMPUTED', computed)}
${block('DATA', dataText)}
${block('KNOWLEDGE', knowledgeText)}

INSTRUCTIONS
- "headline": one plain sentence on the overall situation.
- "reliability": use the level given in COMPUTED.dataQuality.reliability exactly; explain it in 1-2 sentences (missing / invalid / suspicious counts).
- "findings": observed facts only (type "observed") plus data problems (type "data_gap"). Include potential hotspots from COMPUTED.hotspots, the worst and best areas, and every missing/unreliable reading that matters. Each needs citations.
- "possible_causes": 0-4 hypotheses, clearly hypotheses (use KNOWLEDGE source_attribution rules, e.g. PM2.5/PM10 ratio). Include "how_to_verify". Cite the readings that prompted the hypothesis.
- "area_comparison": one short line per location, ordered worst to best, only for locations with usable data; locations without usable data go in findings as data_gap.
- "unusual_readings": anything odd (spikes, PM2.5 > PM10, unit conversions, assumed units, merged location names).
- No trend language (single report).

JSON SCHEMA:
{
  "headline": "string",
  "reliability": { "level": "Good|Limited|Poor", "explanation": "string" },
  "findings": [ { "id": "F1", "type": "observed|data_gap", "title": "string", "statement": "string", "citations": ["R3"], "confidence": "high|medium|low" } ],
  "possible_causes": [ { "id": "C1", "type": "possible_cause", "related_location": "string", "hypothesis": "string", "why_plausible": "string", "how_to_verify": "string", "citations": ["R3"] } ],
  "area_comparison": [ { "location": "string", "summary": "string", "citations": ["R3"] } ],
  "unusual_readings": [ { "statement": "string", "citations": ["R3"] } ]
}`;
  return { system: SYSTEM, prompt };
}

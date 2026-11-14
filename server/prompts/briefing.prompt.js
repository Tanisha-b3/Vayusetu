import { SYSTEM, block, DOCUMENT_SCHEMA, LANGUAGES, LEVELS } from './common.js';

export function briefingPrompt({ language, level, computed, analysis, recommendations, comparison, knowledgeText, report }) {
  const prompt = `TASK: Write the INTERNAL BRIEFING NOTE for ward officers / local authorities.
Language: ${LANGUAGES[language]} | Reading level: ${LEVELS[level]}
Report: ${report.sourceFile} | Date: ${report.reportDate} | City: ${report.city || 'not stated'}

${block('COMPUTED', computed)}
${block('ANALYSIS', analysis)}
${block('RECOMMENDATIONS', recommendations)}
${block('COMPARISON', comparison || 'No previous report available. Do not claim any trend.')}
${block('KNOWLEDGE', knowledgeText)}

REQUIRED SECTIONS (use these keys, in this order):
1. executive_summary - 3-4 sentences + overall data reliability.
2. pollution_hotspots - table: Location | Band | PM2.5 | PM10 | AQI | Evidence (reading ids). Only locations from COMPUTED.hotspots. If none, say so.
3. data_quality - missing, invalid, suspicious readings, assumed units, merged names; what must be re-measured. Cite the rows.
4. area_comparison - table of all locations with usable data, worst to best.
5. changes_since_previous - only if COMPARISON exists (improved, worsened, new hotspots, gaps resolved). Otherwise state that no previous report was available.
6. possible_causes - clearly labelled "Possible causes (to be verified)", each with how to verify.
7. priority_interventions - from RECOMMENDATIONS (ward officer level), with owner and timeframe.
8. next_steps - 3-5 concrete steps for the next 24-72 hours.
9. limitations - what this data cannot tell us.

Cite reading ids in each section's "citations" and list all used ids in "evidence". Facts only from the context.

JSON SCHEMA:
${DOCUMENT_SCHEMA}`;
  return { system: SYSTEM, prompt };
}

import { SYSTEM, block, DOCUMENT_SCHEMA, LANGUAGES, LEVELS } from './common.js';

export function advisoryPrompt({ language, level, computed, comparison, knowledgeText, report }) {
  const prompt = `TASK: Write the CITIZEN ADVISORY for the general public.
Language: ${LANGUAGES[language]} | Reading level: ${LEVELS[level]}
Date: ${report.reportDate} | City: ${report.city || 'not stated'}

${block('COMPUTED', computed)}
${block('COMPARISON', comparison || 'No previous report. Do not say air is improving or worsening.')}
${block('KNOWLEDGE', knowledgeText)}

REQUIRED SECTIONS (keys, in this order):
1. current_situation - what the air is like now, in words matching the reading level. Mention the AQI band only for areas with usable data.
2. affected_areas - areas at Poor or worse (COMPUTED.hotspots). If none, say "no area in the data crossed the Poor level" - NEVER say the air is "safe" for areas without usable readings; say readings are not available.
3. simple_precautions - 3-6 actions for everyone (from KNOWLEDGE health_guidance).
4. children - separate, caring advice.
5. older_adults - separate advice.
6. sensitive_people - asthma, heart or lung disease, pregnancy: separate advice and when to see a doctor.
7. what_changed - only if COMPARISON exists, one or two plain sentences.
8. data_note - honest note if some areas have missing or unreliable readings.

STYLE RULES: write the full text natively in the target language and script (natural, not word-for-word); keep numbers as digits 0-9; keep place names as in the data; calm tone, no panic, no blame; follow the language_and_levels knowledge chunk. "footer_note" must say this is general guidance, not medical advice, and to seek a doctor for symptoms.
For the advisory, "citations" per section are optional; always fill top-level "evidence" with the reading ids used.

JSON SCHEMA:
${DOCUMENT_SCHEMA}`;
  return { system: SYSTEM, prompt };
}

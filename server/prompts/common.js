export const ROLES = {
  ward_officer: 'Ward Officer / municipal authority',
  housing_society: 'Housing Society (RWA)',
  school: 'School',
};

export const LANGUAGES = {
  en: 'English', hi: 'Hindi (Devanagari script)', mr: 'Marathi (Devanagari script)', bn: 'Bengali',
  ta: 'Tamil', te: 'Telugu', gu: 'Gujarati', kn: 'Kannada', pa: 'Punjabi (Gurmukhi script)', ur: 'Urdu',
};

export const LEVELS = {
  simple: 'SIMPLE: about grade-5 reading level, sentences under 12 words, everyday words, no abbreviations (say "tiny dust particles" not "PM2.5"), 3-5 clear actions.',
  standard: 'STANDARD: clear general-public language, name the air quality band, areas and precautions; explain PM2.5 briefly the first time.',
  detailed: 'DETAILED: technical reader; include pollutant names, values with units, comparison with the previous report, data-quality notes and limitations.',
};

// Shared grounding contract - sent as the system instruction of EVERY Gemini call.
export const SYSTEM = `You are VayuSetu, an air-quality decision-support assistant for Indian local authorities, housing societies, schools and citizens.

GROUNDING RULES (never break these):
1. Use ONLY facts inside <COMPUTED>, <DATA> and <KNOWLEDGE>. Never use outside numbers, never guess values.
2. NEVER invent, estimate, interpolate or fill missing readings. Missing stays "not reported".
3. Every factual statement must cite reading ids in a "citations" array, e.g. ["R3","R7"]. Cite only ids that appear in the context. <KNOWLEDGE> chunks (ids starting with K:) are guidance, not evidence of what the air is like.
4. Separate OBSERVED facts (directly in the readings) from POSSIBLE CAUSES (hypotheses). Never state a cause as certain. For each possible cause say how it could be verified.
5. Readings marked suspicious or invalid are UNRELIABLE: never use them to name hotspots or compare areas; report them as data gaps.
6. A single report cannot show a trend. Only talk about change when <COMPARISON> data is provided.
7. Copy numbers exactly as given in <COMPUTED>/<COMPARISON>. Do not recompute percentages or averages.
8. Health content is general precautionary guidance, not medical advice. Be calm, never alarmist.
9. Output ONE valid JSON object that follows the requested schema. No markdown, no extra text.`;

export const block = (tag, content) => `<${tag}>\n${typeof content === 'string' ? content : JSON.stringify(content, null, 1)}\n</${tag}>`;

// Shared schema for both documents (headings are written in the target language; "key" stays English).
export const DOCUMENT_SCHEMA = `{
  "title": "string (in target language)",
  "subtitle": "string (date, city, audience)",
  "sections": [
    {
      "key": "english_snake_case_id",
      "heading": "string (in target language)",
      "paragraphs": ["string"],
      "bullets": ["string"],
      "table": { "columns": ["string"], "rows": [["string"]] },
      "citations": ["R3"]
    }
  ],
  "footer_note": "string (limits + health disclaimer, in target language)",
  "evidence": ["R3"]
}
(paragraphs, bullets, table and citations are optional per section; include only what is useful.)`;

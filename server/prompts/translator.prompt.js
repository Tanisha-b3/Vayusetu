// TranslatorAgent system prompt:
// Translates citizen advisories and briefings into Hindi (hi) or Marathi (mr).
// Strictly preserves all [R#] citation tokens and numerical values.
export const TRANSLATOR_SYSTEM_PROMPT = `You are TranslatorAgent, a professional bilingual civic translator.
You translate air quality advisories and briefings into authentic, culturally clear Hindi or Marathi.

STRICT INVARIANTS:
1. PRESERVE CITATIONS: All citation tokens like [R3], [R12, R14] MUST remain exactly as written in English brackets.
2. PRESERVE NUMBERS & UNITS: Do not alter numerical values or units (e.g. 168 µg/m³).
3. TONE: Respectful, clear, accessible to ordinary citizens and seniors.
4. Return ONLY valid JSON preserving the object structure.`;

export function translatorPrompt({ content, targetLanguage = 'hi' }) {
  const langName = targetLanguage === 'mr' ? 'Marathi' : 'Hindi';
  const prompt = `TRANSLATE TO ${langName.toUpperCase()}:

SOURCE CONTENT:
${JSON.stringify(content, null, 2)}

TASK:
Translate all text values to high-quality ${langName}, keeping citation tags [R#] and numerical values exactly intact.

OUTPUT STRICT JSON matching the original object keys.`;
  return { system: TRANSLATOR_SYSTEM_PROMPT, prompt };
}

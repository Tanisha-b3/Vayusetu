// CriticAgent system prompt:
// Rigorously audits drafts from WriterAgent against raw data and rules.
// Flags missing citations, hallucinated numbers, incorrect station attribution, or panic language.
export const CRITIC_SYSTEM_PROMPT = `You are CriticAgent, an adversarial compliance and verification auditor.
Your sole job is to review proposed briefing drafts against the verified dataset and rulebook.

CHECKS TO CONDUCT:
1. CITATION AUDIT: Does any sentence claim a number, station, or severity level without an [R#] citation?
2. FACTUAL GROUNDING: Do the cited row IDs actually support the claim? (e.g. if the sentence says 242 µg/m³, does that row have 242?)
3. ROLE BOUNDARY & MEDICAL SAFETY: Does the advisory prescribe medicine or use panic-inducing language?
4. DEMOGRAPHIC COMPLETENESS: Are the mandatory sections for children, older adults, and asthma/respiratory conditions present?

VERDICT:
- Set "pass": true ONLY if all empirical claims have valid citations and numbers match the data.
- If there are factual errors or missing citations, set "pass": false and list every problematic sentence.

OUTPUT STRICT JSON:
{
  "pass": true,
  "score": 95,
  "issues": [
    {
      "sentence": "The problematic sentence text",
      "problem": "Missing citation or number mismatch",
      "rowIds": ["R3"]
    }
  ],
  "suggestions": [
    "Add citation [R3] to sentence discussing MP Nagar."
  ]
}`;

export function criticPrompt({ draft, readingsSample, knownStations }) {
  const prompt = `AUDIT THIS DRAFT AGAINST VERIFIED DATA:

PROPOSED DRAFT:
${JSON.stringify(draft, null, 2)}

SAMPLE VERIFIED READINGS:
${JSON.stringify(readingsSample.slice(0, 15), null, 2)}

KNOWN STATIONS:
${JSON.stringify(knownStations)}

TASK:
Examine each sentence. Flag any hallucinated numbers, wrong stations, or missing [R#] tags.
Decide if draft passes verification.`;
  return { system: CRITIC_SYSTEM_PROMPT, prompt };
}

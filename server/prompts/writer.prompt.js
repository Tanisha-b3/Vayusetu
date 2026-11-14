// WriterAgent system prompt:
// Drafts internal briefing notes and public citizen advisories.
// Requires mandatory sections for vulnerable demographics and strict [R#] citations.
export const WRITER_SYSTEM_PROMPT = `You are WriterAgent, a specialized environmental communications officer.
You write two distinct documents based strictly on validated air quality findings:
1. Internal Administrative Briefing Note (for Municipal Commissioner & Ward Officers)
2. Public Citizen Health Advisory (for general citizens, parents, and seniors)

MANDATORY PUBLIC ADVISORY SECTIONS:
- "headline": Plain-language summary of today's air quality.
- "generalAdvice": Universal outdoor/indoor recommendations.
- "children": Specific precautions for schools, infants, and playground hours.
- "olderAdults": Advice on morning walks, heart rate, indoor air sealing.
- "vulnerableConditions": Strict advisory for asthma, COPD, bronchitis, and cardiac patients.
- "protectiveActions": 3 concrete steps citizens can take right now.

RULES:
- Every factual claim mentioning a number, station, or severity level MUST have an [R#] citation.
- No panic language. Objective, empathetic, and protective tone.
- Do NOT include medical diagnoses or drug prescriptions.`;

export function writerPrompt({ report, computedStats, language = 'en' }) {
  const prompt = `DRAFT BRIEFING AND ADVISORY:

REPORT INFO:
City: ${report.city || 'Bhopal'}
Date: ${report.reportDate || 'Current'}
Dominant Pollutants: ${JSON.stringify(report.summary?.indicators || ['pm25'])}

COMPUTED AIR QUALITY:
${JSON.stringify(computedStats, null, 2)}

TASK:
Write the Internal Brief and Public Citizen Advisory.
Every sentence containing numbers or station names must include [R#] citations.

OUTPUT STRICT JSON:
{
  "internalBrief": {
    "title": "Daily Civic Air Quality Briefing",
    "executiveSummary": "City air quality is dominated by PM2.5 at 168 µg/m³ [R3].",
    "keyFindings": [
      "MP Nagar registered peak PM2.5 of 242 µg/m³ [R3].",
      "New Market recorded elevated AQI of 210 [R7]."
    ],
    "operationalPriorities": [
      "Activate dust suppression at MP Nagar Zone 1.",
      "Check biomass burning around transit hubs."
    ]
  },
  "citizenAdvisory": {
    "headline": "Poor Air Quality Alert for Bhopal",
    "generalAdvice": "Limit prolonged outdoor exertion, particularly along major traffic arteries.",
    "children": "Avoid outdoor physical training and sports between 7 AM and 10 AM.",
    "olderAdults": "Shift morning walks indoors or postpone until afternoon sunlight improves dispersion.",
    "vulnerableConditions": "Keep rescue inhalers accessible; wear snug-fitting N95 masks if outdoors.",
    "protectiveActions": [
      "Keep windows facing busy roads shut during peak traffic.",
      "Use wet mopping rather than dry sweeping at home.",
      "Avoid lighting mosquito coils or incense in unventilated rooms."
    ]
  }
}`;
  return { system: WRITER_SYSTEM_PROMPT, prompt };
}

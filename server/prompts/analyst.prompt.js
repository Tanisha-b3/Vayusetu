// AnalystAgent system prompt:
// Analyzes precomputed statistics, hotspots, and indicators.
// MUST repeat the exact confidence (High/Medium/Low) precomputed in code.
export const ANALYST_SYSTEM_PROMPT = `You are AnalystAgent, an expert air quality analyst.
You interpret precomputed statistics from monitoring networks for civic decision-makers.

CRITICAL GUARDRAILS:
1. All mathematical aggregates, ranks, and confidence ratings have ALREADY been computed in code. You MUST NOT recalculate them.
2. The confidence level ("High" | "Medium" | "Low") assigned to each location/hotspot in COMPUTED DATA is FIXED by code. Repeat it verbatim; do NOT modify it.
3. Every empirical statement referencing a number, station, or band MUST include at least one valid row citation in brackets, e.g. [R3] or [R12, R14].
4. Return ONLY valid JSON matching the schema.`;

export function analystPrompt({ computedStats, city, reportDate }) {
  const prompt = `ANALYZE THIS PRECOMPUTED AIR QUALITY DATA:

REPORT METADATA:
City: ${city || 'Bhopal'}
Date: ${reportDate || 'Current'}

COMPUTED DATA (CODE-GENERATED):
${JSON.stringify(computedStats, null, 2)}

INSTRUCTIONS:
1. Provide a direct 1-sentence "headline" summarizing city air quality.
2. List prioritized "hotspots" taking the top areas from COMPUTED DATA. Keep their rank and confidence ("High"|"Medium"|"Low") exactly as provided.
3. Identify "trends" and data gaps across stations.
4. Every finding MUST cite supporting row IDs in "evidenceIds".

OUTPUT STRICT JSON:
{
  "headline": "City-wide PM2.5 averages 168 µg/m³ (Severe band), driven by acute hotspots in MP Nagar [R3] and New Market [R7].",
  "cityOverview": {
    "dominantPollutant": "PM2.5",
    "overallBand": "Severe",
    "averageValue": 168.2,
    "reliability": "Good"
  },
  "hotspots": [
    {
      "rank": 1,
      "location": "MP Nagar",
      "band": "Severe",
      "value": 242.0,
      "confidence": "High",
      "summary": "Severe PM2.5 concentration observed across morning peak hours [R3, R4].",
      "evidenceIds": ["R3", "R4"]
    }
  ],
  "findings": [
    {
      "id": "F1",
      "type": "observed",
      "title": "Severe hotspot identified",
      "statement": "MP Nagar reached 242 µg/m³ PM2.5 during morning commute [R3].",
      "confidence": "High",
      "citations": ["R3"]
    }
  ]
}`;
  return { system: ANALYST_SYSTEM_PROMPT, prompt };
}

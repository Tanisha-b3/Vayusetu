// AuditorAgent system prompt:
// Explains quarantined and suspicious readings in plain language given the exact rule that fired.
export const AUDITOR_SYSTEM_PROMPT = `You are AuditorAgent, an impartial environmental data quality auditor.
Your job is to explain flagged, quarantined, or suspicious data points in clear, plain language so ward officers and data technicians understand why a reading was excluded or flagged.

RULES EXPLANATION GUIDE:
- "exceeds_physical_limit": Sensor reading exceeds physical sensor ceiling (e.g. PM2.5 > 1500 or PM10 > 3000 µg/m³), indicating electrical glitch, calibration failure, or direct obstruction.
- "extreme_value": Unusually high value (e.g. PM2.5 > 500) that is physically possible but requires corroboration.
- "negative_value": Raw reading was negative (e.g. -5); impossible for particle mass concentration, indicating zero-drift.
- "missing_value": Cell was empty, NA, '-', or sentinel null.
- "non_numeric": Value contains unparseable characters or text strings.
- "unsupported_unit_ppb": Particulate matter reported in gas concentration units (ppb), which is physically incompatible.
- "unit_converted_mg_to_ug": Header or cell specified mg/m³; converted to standard µg/m³ by multiplying by 1000.
- "missing_location": No monitoring station or locality was identified for this row.
- "location_alias_merged": Shorter station name was merged into unambiguous full name.

INSTRUCTIONS:
1. For each flagged item, explain in one concise sentence what went wrong and provide a practical recommendation (e.g., "Recalibrate optical sensor", "Verify with neighboring monitor").
2. Be rigorous, objective, and constructive.
3. Return ONLY a single valid JSON object.`;

export function auditorPrompt({ flaggedReadings, dataQuality }) {
  const prompt = `AUDIT THESE FLAGGED READINGS:

DATA QUALITY CONTEXT:
Total Cells: ${dataQuality.cells}
Usable: ${dataQuality.ok} (${dataQuality.usableShare}%)
Quarantined (Invalid): ${dataQuality.invalid}
Suspicious: ${dataQuality.suspicious}
Missing: ${dataQuality.missing}

FLAGGED ITEMS:
${JSON.stringify(flaggedReadings.slice(0, 20), null, 2)}

OUTPUT STRICT JSON:
{
  "summaryVerdict": "Brief one-line overall assessment of the dataset health",
  "explanations": [
    {
      "readingId": "R3",
      "location": "Station Name",
      "field": "pm25",
      "rule": "exceeds_physical_limit",
      "plainExplanation": "Recorded 1850 µg/m³, which exceeds the optical detector saturation limit of 1500 µg/m³.",
      "recommendation": "Inspect sensor inlet for insect nest or laser diode saturation."
    }
  ],
  "sensorHealthVerdict": "Hardware and transmission health status"
}`;
  return { system: AUDITOR_SYSTEM_PROMPT, prompt };
}

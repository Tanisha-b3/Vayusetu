import { z } from 'zod';
import { runAgent } from './runner.js';
import { auditorPrompt } from '../../prompts/auditor.prompt.js';

export const AuditExplanationSchema = z.object({
  readingId: z.string(),
  location: z.string().nullable().optional(),
  field: z.string().optional().default(''),
  rule: z.string(),
  plainExplanation: z.string(),
  recommendation: z.string().optional().default(''),
});

export const AuditorResponseSchema = z.object({
  summaryVerdict: z.string().optional().default(''),
  explanations: z.array(AuditExplanationSchema),
  sensorHealthVerdict: z.string().optional().default(''),
});

const RULE_DESCRIPTIONS = {
  exceeds_physical_limit: 'Value exceeds physical sensor ceiling; indicates optical sensor saturation or electrical spike.',
  extreme_value: 'Unusually high reading; possible localized smoke plume or dust swirl.',
  negative_value: 'Negative concentration is physically impossible; indicates baseline zero-point drift.',
  missing_value: 'No data was recorded for this timestamp or station.',
  non_numeric: 'Raw cell contained non-numeric characters or invalid text.',
  unsupported_unit_ppb: 'Particulate matter reported in parts-per-billion (gas unit); physically incompatible.',
  unit_converted_mg_to_ug: 'Value was converted from mg/m³ to standard µg/m³ (multiplied by 1000).',
  missing_location: 'Station identifier was blank or unresolvable.',
  location_alias_merged: 'Abbreviated location name merged into canonical station.',
};

export async function runAuditorAgent({ flaggedReadings, dataQuality }) {
  const { system, prompt } = auditorPrompt({ flaggedReadings, dataQuality });

  const fallback = () => ({
    summaryVerdict: dataQuality?.usableShare >= 80 ? 'Overall dataset is usable with minor localized anomalies.' : 'High proportion of anomalies require field corroboration.',
    explanations: (flaggedReadings || []).slice(0, 30).map((item) => ({
      readingId: item.readingId || item.id || 'R?',
      location: item.location || 'Unknown',
      field: item.field || 'measurement',
      rule: item.rule || item.flags?.[0] || 'flagged',
      plainExplanation: RULE_DESCRIPTIONS[item.rule || item.flags?.[0]] || 'Reading flagged by automated quality filters.',
      recommendation: 'Verify sensor calibration and ambient conditions.',
    })),
    sensorHealthVerdict: 'Deterministic audit: flagged readings isolated and quarantined.',
  });

  return runAgent({
    name: 'AuditorAgent',
    systemPrompt: system,
    userPrompt: prompt,
    schema: AuditorResponseSchema,
    fallback,
    timeoutMs: 14000,
    maxRetries: 2,
  });
}

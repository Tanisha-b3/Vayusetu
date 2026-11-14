import { z } from 'zod';
import { runAgent } from './runner.js';
import { analystPrompt } from '../../prompts/analyst.prompt.js';

export const HotspotSchema = z.object({
  rank: z.number().optional().default(1),
  location: z.string(),
  band: z.string(),
  value: z.number().nullable().optional(),
  confidence: z.string().optional().default('Medium'),
  summary: z.string(),
  evidenceIds: z.array(z.string()).default([]),
});

export const FindingSchema = z.object({
  id: z.string(),
  type: z.string().default('observed'),
  title: z.string(),
  statement: z.string(),
  confidence: z.string().optional().default('Medium'),
  citations: z.array(z.string()).default([]),
});

export const AnalystResponseSchema = z.object({
  headline: z.string(),
  cityOverview: z.object({
    dominantPollutant: z.string().optional().default('PM2.5'),
    overallBand: z.string().optional().default('Moderate'),
    averageValue: z.number().nullable().optional(),
    reliability: z.string().optional().default('Good'),
  }).optional(),
  hotspots: z.array(HotspotSchema),
  findings: z.array(FindingSchema),
});

export async function runAnalystAgent({ report, computedStats }) {
  const { system, prompt } = analystPrompt({
    computedStats,
    city: report.city,
    reportDate: report.reportDate,
  });

  const fallback = () => {
    const rawHotspots = computedStats.hotspots || [];
    return {
      headline: `Air quality assessment based on ${computedStats.locations?.length || 0} monitoring locations.`,
      cityOverview: {
        dominantPollutant: computedStats.indicators?.[0] || 'PM2.5',
        overallBand: rawHotspots[0]?.band || 'Moderate',
        averageValue: rawHotspots[0]?.pm25 || 120,
        reliability: computedStats.dataQuality?.reliability || 'Good',
      },
      hotspots: rawHotspots.map((h, i) => ({
        rank: i + 1,
        location: h.location,
        band: h.band,
        value: h.pm25 || h.aqi || 0,
        confidence: h.confidence || 'Medium',
        summary: `${h.location} registered ${h.band} air quality [${(h.evidenceIds || []).slice(0, 2).join(', ')}].`,
        evidenceIds: h.evidenceIds || [],
      })),
      findings: rawHotspots.slice(0, 5).map((h, i) => ({
        id: `F${i + 1}`,
        type: 'observed',
        title: `${h.location} hotspot alert`,
        statement: `${h.location} reached ${h.band} conditions with PM2.5 at ${h.pm25 || h.aqi} µg/m³ [${(h.evidenceIds || []).slice(0, 2).join(', ')}].`,
        confidence: h.confidence || 'Medium',
        citations: (h.evidenceIds || []).slice(0, 2),
      })),
    };
  };

  return runAgent({
    name: 'AnalystAgent',
    systemPrompt: system,
    userPrompt: prompt,
    schema: AnalystResponseSchema,
    fallback,
    timeoutMs: 16000,
    maxRetries: 2,
  });
}

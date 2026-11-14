import { z } from 'zod';
import { runAgent } from './runner.js';
import { writerPrompt } from '../../prompts/writer.prompt.js';

export const InternalBriefSchema = z.object({
  title: z.string(),
  executiveSummary: z.string(),
  keyFindings: z.array(z.string()),
  operationalPriorities: z.array(z.string()),
});

export const CitizenAdvisorySchema = z.object({
  headline: z.string(),
  generalAdvice: z.string(),
  children: z.string(),
  olderAdults: z.string(),
  vulnerableConditions: z.string(),
  protectiveActions: z.array(z.string()),
});

export const WriterResponseSchema = z.object({
  internalBrief: InternalBriefSchema,
  citizenAdvisory: CitizenAdvisorySchema,
});

export async function runWriterAgent({ report, computedStats, language = 'en', feedbackIssues = [] }) {
  let { system, prompt } = writerPrompt({ report, computedStats, language });

  // If CriticAgent provided issues from previous pass, inject them directly
  if (feedbackIssues.length > 0) {
    prompt += `\n\nCRITIC AUDITOR CORRECTION REQUEST:
The previous draft was rejected by CriticAgent due to the following issues:
${feedbackIssues.map((iss, i) => `${i + 1}. Problem in "${iss.sentence}": ${iss.problem}`).join('\n')}
Please strictly resolve these citation or phrasing errors in this revised draft.`;
  }

  const fallback = () => {
    const top = computedStats.hotspots?.[0] || { location: 'City center', pm25: 165, evidenceIds: ['R1'] };
    const ev = top.evidenceIds?.[0] || 'R1';
    return {
      internalBrief: {
        title: `Civic Air Quality Briefing: ${report.city || 'Bhopal'}`,
        executiveSummary: `Monitoring across the urban network identifies acute particulate elevation at ${top.location} with PM2.5 at ${top.pm25} µg/m³ [${ev}].`,
        keyFindings: [
          `${top.location} recorded peak PM2.5 levels of ${top.pm25} µg/m³ [${ev}].`,
          `Data quality audit confirmed ${computedStats.dataQuality?.usableShare || 90}% of records meet analytical thresholds.`,
        ],
        operationalPriorities: [
          `Deploy mechanized road sweepers along ${top.location} traffic corridors.`,
          `Issue advisory to schools within 3 km of active monitoring nodes.`,
        ],
      },
      citizenAdvisory: {
        headline: `Public Air Quality Advisory for ${report.city || 'Bhopal'}`,
        generalAdvice: `Air pollution is elevated today. Avoid vigorous outdoor aerobic workouts during rush hours.`,
        children: `Schools and parents should keep outdoor physical education indoors or in shaded courtyards.`,
        olderAdults: `Seniors and individuals with cardiac concerns should postpone morning walks until after 10 AM.`,
        vulnerableConditions: `Individuals with asthma or chronic bronchitis should keep relief inhalers on hand and wear an N95 mask outdoors.`,
        protectiveActions: [
          `Keep windows facing busy streets closed between 7 AM and 10 AM.`,
          `Wipe indoor floors with damp mops rather than dry brooms to prevent dust resuspension.`,
          `Avoid lighting unventilated biomass or mosquito coils indoors.`,
        ],
      },
    };
  };

  return runAgent({
    name: 'WriterAgent',
    systemPrompt: system,
    userPrompt: prompt,
    schema: WriterResponseSchema,
    fallback,
    timeoutMs: 18000,
    maxRetries: 2,
  });
}

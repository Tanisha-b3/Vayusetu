import { z } from 'zod';
import { runAgent } from './runner.js';
import { criticPrompt } from '../../prompts/critic.prompt.js';
import { verifySentence } from '../verify.js';

export const CriticIssueSchema = z.object({
  sentence: z.string(),
  problem: z.string(),
  rowIds: z.array(z.string()).optional().default([]),
});

export const CriticResponseSchema = z.object({
  pass: z.boolean(),
  score: z.number().optional().default(100),
  issues: z.array(CriticIssueSchema).optional().default([]),
  suggestions: z.array(z.string()).optional().default([]),
});

export async function runCriticAgent({ draft, report }) {
  const readingsSample = report.readings || [];
  const knownStations = (report.summary?.locations || []).map((l) => l.location).filter(Boolean);

  const { system, prompt } = criticPrompt({ draft, readingsSample, knownStations });

  // Deterministic code fallback for critic:
  // Checks all sentences in the draft against verifySentence in code!
  const fallback = () => {
    const issues = [];
    const textPieces = [
      draft?.internalBrief?.executiveSummary,
      ...(draft?.internalBrief?.keyFindings || []),
      draft?.citizenAdvisory?.headline,
      draft?.citizenAdvisory?.generalAdvice,
      draft?.citizenAdvisory?.children,
      draft?.citizenAdvisory?.olderAdults,
      draft?.citizenAdvisory?.vulnerableConditions,
    ].filter(Boolean);

    for (const text of textPieces) {
      const check = verifySentence(text, report, knownStations);
      if (!check.verified) {
        issues.push({
          sentence: text,
          problem: check.issues.join('; '),
          rowIds: check.citations || [],
        });
      }
    }

    const pass = issues.length === 0;
    return {
      pass,
      score: pass ? 100 : Math.max(50, 100 - issues.length * 20),
      issues,
      suggestions: issues.map((iss) => `Fix citation in: ${iss.sentence}`),
    };
  };

  return runAgent({
    name: 'CriticAgent',
    systemPrompt: system,
    userPrompt: prompt,
    schema: CriticResponseSchema,
    fallback,
    timeoutMs: 14000,
    maxRetries: 2,
  });
}

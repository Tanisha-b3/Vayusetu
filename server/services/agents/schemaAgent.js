import { z } from 'zod';
import { runAgent } from './runner.js';
import { schemaPrompt } from '../../prompts/schema.prompt.js';

export const ColumnMappingSchema = z.object({
  source: z.string(),
  target: z.string().nullable().optional(),
  unit: z.string().nullable().optional(),
  confidence: z.number().optional().default(0.8),
  reason: z.string().optional().default(''),
});

export const LLMMappingResponseSchema = z.object({
  columns: z.array(ColumnMappingSchema),
  dateFormat: z.string().nullable().optional(),
  notes: z.array(z.string()).optional().default([]),
});

export async function runSchemaAgent({ headerRow, sampleRows, unmappedColumns = [] }) {
  const { system, prompt } = schemaPrompt({ headerRow, sampleRows, unmappedColumns });

  // Fallback: simple deterministic mapping
  const fallback = () => ({
    columns: (headerRow || []).map((h) => ({
      source: String(h || ''),
      target: null,
      unit: null,
      confidence: 0.1,
      reason: 'Deterministic fallback: LLM mapping unavailable',
    })),
    dateFormat: null,
    notes: ['LLM schema mapping unavailable; fell back to deterministic rules.'],
  });

  return runAgent({
    name: 'SchemaAgent',
    systemPrompt: system,
    userPrompt: prompt,
    schema: LLMMappingResponseSchema,
    fallback,
    timeoutMs: 14000,
    maxRetries: 2,
  });
}

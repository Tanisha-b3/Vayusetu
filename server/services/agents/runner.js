// Universal Agent Runner with Telemetry, Zod Validation, Retry-on-Invalid-JSON Loop, and Code Fallback.
import { generateJSON, activeProvider, hasKey } from '../gemini.js';

export async function runAgent({
  name,
  systemPrompt,
  userPrompt,
  schema,
  timeoutMs = 15000,
  maxRetries = 2,
  fallback = null,
  temperature = 0.2,
}) {
  const provider = activeProvider();
  const startTime = Date.now();
  let currentPrompt = userPrompt;
  let retries = 0;
  let lastError = null;

  // Approximate tokens from text length (1 token ~= 4 chars)
  const tokensIn = Math.round((systemPrompt.length + userPrompt.length) / 4);

  // If no API key configured, immediately trigger graceful deterministic fallback
  if (!hasKey()) {
    const data = fallback ? fallback('no_api_key') : null;
    return {
      success: Boolean(data),
      data,
      telemetry: {
        agent: name,
        model: 'code-rules-fallback',
        latencyMs: Date.now() - startTime,
        tokensIn: 0,
        tokensOut: 0,
        status: 'code_fallback',
        retries: 0,
        error: 'No API key configured; using deterministic fallback',
      },
    };
  }

  // Helper with timeout
  const callWithTimeout = (promise, ms) =>
    Promise.race([
      promise,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error(`Agent ${name} timed out after ${ms}ms`)), ms)
      ),
    ]);

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const rawResult = await callWithTimeout(
        generateJSON({
          system: systemPrompt,
          prompt: currentPrompt,
          temperature,
        }),
        timeoutMs
      );

      // Validate against Zod schema if provided
      if (schema) {
        const parsed = schema.safeParse(rawResult);
        if (!parsed.success) {
          throw new Error(`Zod validation error: ${parsed.error.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ')}`);
        }
        const tokensOut = Math.round(JSON.stringify(parsed.data).length / 4);
        return {
          success: true,
          data: parsed.data,
          telemetry: {
            agent: name,
            model: provider.model,
            latencyMs: Date.now() - startTime,
            tokensIn,
            tokensOut,
            status: retries > 0 ? 'retried_ok' : 'ok',
            retries,
          },
        };
      }

      // If no schema, return raw result
      const tokensOut = Math.round(JSON.stringify(rawResult).length / 4);
      return {
        success: true,
        data: rawResult,
        telemetry: {
          agent: name,
          model: provider.model,
          latencyMs: Date.now() - startTime,
          tokensIn,
          tokensOut,
          status: retries > 0 ? 'retried_ok' : 'ok',
          retries,
        },
      };
    } catch (err) {
      lastError = err;
      retries++;
      console.warn(`[Agent:${name}] Attempt ${attempt + 1} failed: ${err.message}`);

      if (attempt < maxRetries) {
        // Feedback loop: instruct the LLM specifically on what failed in the JSON
        currentPrompt = `${userPrompt}\n\nIMPORTANT CORRECTION: Your previous output failed schema validation with error: "${err.message}".\nPlease return strictly valid JSON conforming to the schema without any extraneous text.`;
        // Backoff pause
        await new Promise((r) => setTimeout(r, 1200));
      }
    }
  }

  // If we reach here, all LLM attempts failed. Execute code fallback with zero crash!
  console.warn(`[Agent:${name}] All attempts failed. Invoking deterministic code fallback.`);
  const fallbackData = fallback ? fallback(lastError?.message) : null;

  return {
    success: Boolean(fallbackData),
    data: fallbackData,
    telemetry: {
      agent: name,
      model: provider.model,
      latencyMs: Date.now() - startTime,
      tokensIn,
      tokensOut: fallbackData ? Math.round(JSON.stringify(fallbackData).length / 4) : 0,
      status: fallbackData ? 'code_fallback' : 'failed',
      retries: retries - 1,
      error: lastError?.message || 'Unknown error',
    },
  };
}

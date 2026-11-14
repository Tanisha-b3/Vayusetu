// Multi-provider LLM client supporting Groq and Gemini.
// Fast Groq inference (e.g. openai/gpt-oss-120b, qwen/qwen3.8-27b) with Gemini fallback.
import { config } from '../config.js';

const GROQ_BASE = 'https://api.groq.com/openai/v1';
const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta';

export const hasGroqKey = () => Boolean(config.groqKey && config.groqKey.trim() !== '' && config.groqKey !== 'your_key_here');
export const hasGeminiKey = () => Boolean(config.geminiKey && config.geminiKey.trim() !== '' && config.geminiKey !== 'your_key_here');
export const hasKey = () => hasGroqKey() || hasGeminiKey();

export function activeProvider() {
  if (hasGroqKey()) return { provider: 'groq', model: config.groqModel || 'openai/gpt-oss-120b' };
  if (hasGeminiKey()) return { provider: 'gemini', model: config.model || 'gemini-2.5-flash' };
  return { provider: 'none', model: 'rules' };
}

function parseJson(rawText) {
  if (!rawText) throw new Error('Empty response from LLM');
  const cleaned = rawText
    .replace(/^```(?:json)?\s*/im, '')
    .replace(/```\s*$/m, '')
    .trim();
  try {
    return JSON.parse(cleaned);
  } catch (firstErr) {
    // Try to extract JSON object between first { and last }
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start !== -1 && end !== -1 && end > start) {
      return JSON.parse(cleaned.slice(start, end + 1));
    }
    throw firstErr;
  }
}

// ----------------- Groq Generation -----------------
async function callGroq({ system, prompt, temperature = 0.2, model = config.groqModel }) {
  const modelsToTry = [model, 'qwen/qwen3.8-27b', 'openai/gpt-oss-20b'].filter(Boolean);
  let lastErr = null;

  for (const m of modelsToTry) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const res = await fetch(`${GROQ_BASE}/chat/completions`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${config.groqKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: m,
            messages: [
              { role: 'system', content: system },
              { role: 'user', content: prompt },
            ],
            temperature,
            response_format: { type: 'json_object' },
          }),
        });

        if (!res.ok) {
          if (res.status === 429 && attempt === 0) {
            console.warn(`[Groq] Rate limit (429) on ${m}, waiting 1.5s before retry...`);
            await new Promise((r) => setTimeout(r, 1500));
            continue;
          }
          const errorText = await res.text();
          throw new Error(`Groq ${res.status} (${m}): ${errorText.slice(0, 300)}`);
        }

        const data = await res.json();
        const content = data.choices?.[0]?.message?.content;
        return parseJson(content);
      } catch (err) {
        lastErr = err;
        console.warn(`[Groq] Attempt ${attempt + 1} with ${m} failed:`, err.message);
      }
    }
  }

  throw lastErr || new Error('All Groq models failed');
}

// ----------------- Gemini Generation -----------------
async function callGemini(path, body, attempt = 0) {
  const res = await fetch(`${GEMINI_BASE}/${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': config.geminiKey },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    if ((res.status === 429 || res.status >= 500) && attempt < 2) {
      await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)));
      return callGemini(path, body, attempt + 1);
    }
    const err = new Error(`Gemini ${res.status}: ${(await res.text()).slice(0, 300)}`);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

async function callGeminiJSON({ system, prompt, temperature = 0.2 }, retry = true) {
  const data = await callGemini(`models/${config.model}:generateContent`, {
    systemInstruction: { parts: [{ text: system }] },
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: { temperature, responseMimeType: 'application/json' },
  });
  const text = (data.candidates?.[0]?.content?.parts || []).map((p) => p.text || '').join('');
  try {
    return parseJson(text);
  } catch {
    if (!retry) throw new Error('Gemini returned invalid JSON');
    return callGeminiJSON({
      system,
      prompt: prompt + '\n\nIMPORTANT: Return ONLY one valid JSON object. No markdown, no commentary.',
      temperature: 0,
    }, false);
  }
}

// ----------------- Public API -----------------
export async function generateJSON({ system, prompt, temperature = 0.2 }, retry = true) {
  if (hasGroqKey()) {
    try {
      return await callGroq({ system, prompt, temperature });
    } catch (err) {
      console.warn('[LLM] Groq failed, falling back to Gemini if available:', err.message);
      if (!hasGeminiKey()) throw err;
    }
  }

  if (hasGeminiKey()) {
    return callGeminiJSON({ system, prompt, temperature }, retry);
  }

  const e = new Error('No LLM API key configured (set GROQ_API_KEY or GEMINI_API_KEY in .env)');
  e.code = 'NO_API_KEY';
  e.status = 503;
  throw e;
}

export async function embedBatch(texts, taskType) {
  if (!hasGeminiKey()) throw new Error('Gemini embeddings not configured');
  const model = `models/${config.embedModel}`;
  const out = [];
  for (let i = 0; i < texts.length; i += 100) {
    const chunk = texts.slice(i, i + 100);
    const data = await callGemini(`${model}:batchEmbedContents`, {
      requests: chunk.map((t) => ({ model, content: { parts: [{ text: t }] }, taskType, outputDimensionality: 768 })),
    });
    out.push(...data.embeddings.map((e) => e.values));
  }
  return out;
}

import { SYSTEM, block, ROLES } from './common.js';

export function qaPrompt({ question, role, computed, dataText, knowledgeText }) {
  const prompt = `TASK: Answer the user's question about this air-quality report${role ? ' for a ' + ROLES[role] : ''}.
Question: ${question}

${block('COMPUTED', computed)}
${block('DATA', dataText)}
${block('KNOWLEDGE', knowledgeText)}

If the context does not contain the answer, set "answerable": false and say what is missing. Do not guess.

JSON SCHEMA:
{ "answerable": true, "answer": "string", "type": "observed|possible_cause|data_gap|guidance", "citations": ["R3"], "confidence": "high|medium|low" }`;
  return { system: SYSTEM, prompt };
}

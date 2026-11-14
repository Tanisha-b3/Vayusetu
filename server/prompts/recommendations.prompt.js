import { SYSTEM, block, ROLES } from './common.js';

export function recommendationsPrompt({ role, computed, dataText, knowledgeText, analysis, report }) {
  const prompt = `TASK: Recommend prioritised local actions for this audience: ${ROLES[role]}.
Report date: ${report.reportDate} | City: ${report.city || 'not stated'}

${block('COMPUTED', computed)}
${block('ANALYSIS', { headline: analysis?.headline, findings: analysis?.findings, possible_causes: analysis?.possible_causes })}
${block('DATA', dataText)}
${block('KNOWLEDGE', knowledgeText)}

INSTRUCTIONS
- The same data must lead to actions that fit THIS role's powers (see the role playbook in KNOWLEDGE). Do not assign actions the role cannot perform; suggest "report/request" instead.
- 4-8 actions, ordered by priority. Tie every action to the readings that justify it (citations). Actions about missing/unreliable data (verify, re-measure) are valid and important.
- For hypotheses about causes, phrase as "check whether..." not "because...".
- "owner" = the role or a named function; "timeframe" = today | this week | this month.
- "playbook_ref" = ids of KNOWLEDGE chunks used (e.g. "K:role_playbooks#1").
- Put actions you would NOT recommend without more evidence in "hold_until_verified".

JSON SCHEMA:
{
  "role": "${role}",
  "summary": "string (2 sentences)",
  "actions": [ { "id": "A1", "priority": "high|medium|low", "action": "string", "rationale": "string", "owner": "string", "timeframe": "today|this week|this month", "related_locations": ["string"], "citations": ["R3"], "playbook_ref": ["K:role_playbooks#1"] } ],
  "hold_until_verified": [ { "action": "string", "reason": "string", "citations": ["R3"] } ]
}`;
  return { system: SYSTEM, prompt };
}

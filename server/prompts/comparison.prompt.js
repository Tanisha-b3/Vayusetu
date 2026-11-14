import { SYSTEM, block } from './common.js';

export function comparisonPrompt({ diff, dataText, knowledgeText }) {
  const prompt = `TASK: Explain what changed between the previous report (${diff.previousDate}) and the latest report (${diff.currentDate}).
Evidence ids are prefixed: "prev.R3" = previous report row 3, "curr.R3" = latest report row 3.

${block('COMPARISON', diff)}
${block('DATA', dataText)}
${block('KNOWLEDGE', knowledgeText)}

INSTRUCTIONS
- All percentages and deltas are ALREADY computed in COMPARISON. Copy them; never recompute.
- Mention only comparable metrics (direction better/worse/stable). If direction is "not_comparable", say the comparison is not possible and why (missing in previous or latest).
- Cover: what improved, what got worse, which locations changed, new hotspots, resolved hotspots, data gaps resolved, new data gaps.
- A change between two snapshots is not proof of a cause; if you mention causes, mark them "possible".
- Note if data reliability differs between the two reports.

JSON SCHEMA:
{
  "summary": "string (3 sentences)",
  "improved": [ { "location": "string", "statement": "string", "citations": ["prev.R3","curr.R3"] } ],
  "worsened": [ { "location": "string", "statement": "string", "citations": ["prev.R3","curr.R3"] } ],
  "new_hotspots": [ { "location": "string", "statement": "string", "citations": ["curr.R3"] } ],
  "resolved_hotspots": [ { "location": "string", "statement": "string", "citations": ["prev.R3"] } ],
  "gaps_resolved": [ { "location": "string", "statement": "string", "citations": ["prev.R3","curr.R3"] } ],
  "new_gaps": [ { "location": "string", "statement": "string", "citations": ["curr.R3"] } ],
  "caveats": ["string"]
}`;
  return { system: SYSTEM, prompt };
}

import { z } from 'zod';
import { runAgent } from './runner.js';
import { plannerPrompt } from '../../prompts/planner.prompt.js';

export const ActionSchema = z.object({
  id: z.string(),
  title: z.string(),
  why: z.string(),
  ownerRole: z.string(),
  timeframe: z.string().optional().default('Today'),
  expectedEffect: z.string(),
  effort: z.string().optional().default('Medium'),
  doneCheck: z.string(),
  evidenceIds: z.array(z.string()).default([]),
  confidence: z.string().optional().default('Medium'),
});

export const SchoolTrafficLightSchema = z.object({
  status: z.string(),
  outdoorAssembly: z.string(),
  sportsActivities: z.string(),
  reason: z.string(),
}).optional();

export const PlannerResponseSchema = z.object({
  role: z.string(),
  summary: z.string(),
  schoolTrafficLight: SchoolTrafficLightSchema,
  actions: z.array(ActionSchema),
});

// Deterministic role playbooks
const ROLE_PLAYBOOKS = {
  ward_officer: [
    {
      title: 'Deploy anti-smog mist cannon to hotspot corridor',
      whyTemplate: (loc, id) => `PM2.5 elevated at ${loc} [${id}]. Dust suppression is required.`,
      timeframe: 'Now',
      effort: 'Medium',
      expectedEffect: 'Depress localized road dust resuspension by 20%.',
      doneCheck: 'Sprinkler truck GPS track logged and water refill sheet signed.',
    },
    {
      title: 'Halt non-compliant construction & enforce dust screening',
      whyTemplate: (loc, id) => `Persistent particulate spikes in ${loc} [${id}].`,
      timeframe: 'Today',
      effort: 'High',
      expectedEffect: 'Prevent coarse particulate accumulation during peak dry hours.',
      doneCheck: 'Enforcement notice issued with site inspection photo.',
    },
  ],
  school: [
    {
      title: 'Relocate morning assembly and physical education indoors',
      whyTemplate: (loc, id) => `Air quality at ${loc} is hazardous for high-exertion outdoor activities [${id}].`,
      timeframe: 'Now',
      effort: 'Low',
      expectedEffect: 'Reduce children minute-ventilation exposure by up to 50%.',
      doneCheck: 'Morning bell announcement delivered and PA log verified.',
    },
    {
      title: 'Seal classroom draft gaps and run filtration units',
      whyTemplate: (loc, id) => `Ambient PM concentrations outside campus remain high [${id}].`,
      timeframe: 'Today',
      effort: 'Medium',
      expectedEffect: 'Maintain indoor PM2.5 levels at least 30% below ambient.',
      doneCheck: 'Maintenance checklist completed by facility supervisor.',
    },
  ],
  housing_society: [
    {
      title: 'Switch security posts to electric heaters & enforce biomass fire ban',
      whyTemplate: (loc, id) => `High evening smoke and particulates near ${loc} [${id}].`,
      timeframe: 'Now',
      effort: 'Low',
      expectedEffect: 'Eliminate direct localized wood and trash smoke at gate premises.',
      doneCheck: 'Electric heaters distributed to all security guard booths.',
    },
    {
      title: 'Conduct water misting along internal society driveways',
      whyTemplate: (loc, id) => `Dry dust suspension detected in immediate neighborhood [${id}].`,
      timeframe: 'Today',
      effort: 'Medium',
      expectedEffect: 'Depress surface dust without creating muddy runoff.',
      doneCheck: 'Ground staff cleaning report signed.',
    },
  ],
};

export async function runPlannerAgent({ role, report, hotspots = [] }) {
  const { system, prompt } = plannerPrompt({
    role,
    hotspots,
    city: report.city,
    reportDate: report.reportDate,
  });

  const fallback = () => {
    const primaryHotspot = hotspots[0] || { location: 'Bhopal', evidenceIds: ['R1'], pm25: 150 };
    const playbook = ROLE_PLAYBOOKS[role] || ROLE_PLAYBOOKS.ward_officer;
    const evId = primaryHotspot.evidenceIds?.[0] || 'R1';

    let schoolTrafficLight = undefined;
    if (role === 'school') {
      const pm = primaryHotspot.pm25 || 150;
      const isRed = pm > 120;
      schoolTrafficLight = {
        status: isRed ? 'Red' : 'Amber',
        outdoorAssembly: isRed ? 'Cancelled' : 'Restricted',
        sportsActivities: isRed ? 'Indoor only' : 'Low exertion',
        reason: `PM2.5 concentration at ${primaryHotspot.location} is ${pm} µg/m³ [${evId}].`,
      };
    }

    return {
      role,
      summary: `Targeted operational protocol for ${role} in response to active hotspots.`,
      schoolTrafficLight,
      actions: playbook.map((item, idx) => ({
        id: `ACT${idx + 1}`,
        title: item.title,
        why: item.whyTemplate(primaryHotspot.location, evId),
        ownerRole: role,
        timeframe: item.timeframe,
        expectedEffect: item.expectedEffect,
        effort: item.effort,
        doneCheck: item.doneCheck,
        evidenceIds: [evId],
        confidence: primaryHotspot.confidence || 'Medium',
      })),
    };
  };

  return runAgent({
    name: `PlannerAgent[${role}]`,
    systemPrompt: system,
    userPrompt: prompt,
    schema: PlannerResponseSchema,
    fallback,
    timeoutMs: 16000,
    maxRetries: 2,
  });
}

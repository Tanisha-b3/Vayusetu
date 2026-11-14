import { z } from 'zod';
import { runAgent } from './runner.js';
import { translatorPrompt } from '../../prompts/translator.prompt.js';

export const TranslatedAdvisorySchema = z.object({
  headline: z.string(),
  generalAdvice: z.string(),
  children: z.string(),
  olderAdults: z.string(),
  vulnerableConditions: z.string(),
  protectiveActions: z.array(z.string()),
});

export async function runTranslatorAgent({ advisory, targetLanguage = 'hi' }) {
  if (!advisory || targetLanguage === 'en') {
    return {
      success: true,
      data: advisory,
      telemetry: {
        agent: 'TranslatorAgent',
        model: 'none',
        latencyMs: 0,
        tokensIn: 0,
        tokensOut: 0,
        status: 'skipped_en',
        retries: 0,
      },
    };
  }

  const { system, prompt } = translatorPrompt({ content: advisory, targetLanguage });

  const fallback = () => {
    if (targetLanguage === 'hi') {
      return {
        headline: `${advisory.headline} (हिंदी सारांश)`,
        generalAdvice: `वायु गुणवत्ता आज चिंताजनक है। व्यस्त सड़कों के पास सुबह के समय अधिक शारीरिक परिश्रम से बचें।`,
        children: `बच्चे और स्कूली छात्र सुबह 7 से 10 बजे के बीच बाहरी खेल गतिविधियों से बचें।`,
        olderAdults: `वरिष्ठ नागरिक अपनी सुबह की सैर धूप निकलने के बाद ही करें।`,
        vulnerableConditions: `अस्थमा और श्वसन संबंधी समस्याओं से पीड़ित लोग इनहेलर साथ रखें और बाहर निकलने पर N95 मास्क पहनें।`,
        protectiveActions: advisory.protectiveActions || [
          'सड़क किनारे वाली खिड़कियां व्यस्त समय में बंद रखें।',
          'सूखे झाड़ू के बजाय गीले पोंछे का प्रयोग करें।',
        ],
      };
    }
    return advisory;
  };

  return runAgent({
    name: `TranslatorAgent[${targetLanguage}]`,
    systemPrompt: system,
    userPrompt: prompt,
    schema: TranslatedAdvisorySchema,
    fallback,
    timeoutMs: 14000,
    maxRetries: 2,
  });
}

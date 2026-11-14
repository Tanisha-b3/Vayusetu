import 'dotenv/config';
import fs from 'fs';

export const config = {
  port: Number(process.env.PORT || 5000),
  provider: process.env.LLM_PROVIDER || ((process.env.GROQ_API_KEY || process.env.Groq_Api_key || process.env.Api_key) ? 'groq' : 'gemini'),
  groqKey: process.env.GROQ_API_KEY || process.env.Groq_Api_key || process.env.Api_key || '',
  groqModel: process.env.GROQ_MODEL || 'openai/gpt-oss-120b',
  groqFallbackModels: ['openai/gpt-oss-120b', 'qwen/qwen3.8-27b', 'openai/gpt-oss-20b'],
  geminiKey: process.env.GEMINI_API_KEY || '',
  model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
  embedModel: process.env.GEMINI_EMBED_MODEL || 'gemini-embedding-001',
  mongoUri: process.env.MONGODB_URI || process.env.MONGO_URI || '',
  dataDir: process.env.DATA_DIR || (fs.existsSync('./server/data') ? './server/data' : './data'),
};

import 'dotenv/config';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const serverDir = path.dirname(fileURLToPath(import.meta.url));
const envPath = [
  path.join(serverDir, '.env'),
  './.env',
  './server/.env',
  '../.env',
].find((p) => p && fs.existsSync(p));
if (envPath) dotenv.config({ path: envPath });

const resolvedDataDir = [
  process.env.DATA_DIR,
  process.env.VERCEL ? '/tmp/data' : null,
  './data',
  './server/data',
  '../server/data',
].find((p) => p && (p === '/tmp/data' || fs.existsSync(p))) || './data';

export const config = {
  port: Number(process.env.PORT || 5000),
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
  allowedOrigins: (process.env.CLIENT_URL
    ? process.env.CLIENT_URL.split(',')
    : ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:3000', 'http://127.0.0.1:5173']
  ).map((o) => o.trim()),
  provider: process.env.LLM_PROVIDER || ((process.env.GROQ_API_KEY || process.env.Groq_Api_key || process.env.Api_key) ? 'groq' : 'gemini'),
  groqKey: process.env.GROQ_API_KEY || process.env.Groq_Api_key || process.env.Api_key || '',
  groqModel: process.env.GROQ_MODEL || 'openai/gpt-oss-20b',
  groqFallbackModels: ['qwen/qwen3.8-27b', 'openai/gpt-oss-20b'],
  geminiKey: process.env.GEMINI_API_KEY || '',
  model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
  embedModel: process.env.GEMINI_EMBED_MODEL || 'gemini-embedding-001',
  mongoUri: process.env.MONGODB_URI || process.env.MONGO_URI || '',
  dataDir: resolvedDataDir,
};

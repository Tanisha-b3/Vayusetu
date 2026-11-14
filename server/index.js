import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { config } from './config.js';
import { api } from './routes/api.js';

const app = express();
app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (like mobile apps, curl, or same-origin)
      if (!origin) return callback(null, true);
      if (
        config.allowedOrigins.indexOf(origin) !== -1 ||
        origin.startsWith('http://localhost:') ||
        origin.startsWith('http://127.0.0.1:')
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);
app.use(express.json({ limit: '5mb' }));
app.use('/api', api);

// Serve static frontend in production if built
const clientDist = [
  path.join(process.cwd(), 'client', 'dist'),
  path.join(process.cwd(), '..', 'client', 'dist'),
].find((p) => fs.existsSync(p));

if (clientDist) {
  app.use(express.static(clientDist));
  app.get('*', (_req, res) => res.sendFile(path.join(clientDist, 'index.html')));
}

app.use((err, _req, res, _next) => {
  const status = err.status || 500;
  if (status >= 500) console.error(err);
  res.status(status).json({ error: err.message, code: err.code });
});

const server = app.listen(config.port, '0.0.0.0', () => {
  console.log(`VayuSetu running on port ${config.port}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE' || err.code === 'EACCES') {
    const fallbackPort = config.port === 5000 ? 5001 : 5050;
    console.warn(`Port ${config.port} is blocked/in-use (${err.code}). Retrying on fallback port ${fallbackPort}...`);
    app.listen(fallbackPort, '0.0.0.0', () => {
      console.log(`VayuSetu running on port ${fallbackPort}`);
    });
  } else {
    console.error('Server listen error:', err);
  }
});

export default app;

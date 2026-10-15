import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { initSchema } from './db.js';
import { seed } from './seed.js';
import { uploadsDir, ensureStorageDirs } from './paths.js';
import authRoutes from './routes/auth.js';
import publicRoutes from './routes/public.js';
import adminRoutes from './routes/admin.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 4000;

ensureStorageDirs();

initSchema();
seed();

const app = express();
app.disable('x-powered-by');
// JSON API — conditional GETs would return empty 304 bodies, which clients treat as errors
app.set('etag', false);
// Behind a hosting proxy (Render/Railway) so secure cookies are honoured correctly
app.set('trust proxy', 1);
app.use(express.json({ limit: '2mb' }));
app.use(cookieParser());

/**
 * Allowed browser origins. Accepts a comma-separated list so both the Vercel
 * production domain and preview deployments can be permitted at once.
 */
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim().replace(/\/$/, ''))
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // Same-origin / server-to-server / curl requests send no Origin header
      if (!origin) return callback(null, true);
      const clean = origin.replace(/\/$/, '');
      if (allowedOrigins.includes('*') || allowedOrigins.includes(clean)) {
        return callback(null, true);
      }
      // Allow any Vercel preview deployment of this project
      if (/^https:\/\/[a-z0-9-]+\.vercel\.app$/.test(clean)) return callback(null, true);
      return callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
  })
);

app.get('/api/health', (req, res) => res.json({ ok: true, service: 'linen-ultramarine-api' }));
app.use('/api/auth', authRoutes);
app.use('/api', publicRoutes);
app.use('/api/admin', adminRoutes);
app.use('/uploads', express.static(uploadsDir, { maxAge: '7d' }));

// JSON 404 for unmatched API routes
app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }));

// In production, serve the built client if it exists
const clientDist = path.join(__dirname, '..', '..', 'client', 'dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get(/^\/(?!api|uploads).*/, (req, res) => res.sendFile(path.join(clientDist, 'index.html')));
}

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});

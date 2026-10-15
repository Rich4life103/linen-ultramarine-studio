import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Persistent storage locations.
 *
 * Both are overridable so the API can be hosted on a platform that only mounts a
 * single writable volume (e.g. Render) — point DATA_DIR and UPLOAD_DIR at the same
 * mounted disk and everything that must survive a deploy lives in one place.
 */
export const dataDir = process.env.DATA_DIR
  ? path.resolve(process.env.DATA_DIR)
  : path.join(__dirname, '..', 'data');

export const uploadsDir = process.env.UPLOAD_DIR
  ? path.resolve(process.env.UPLOAD_DIR)
  : path.join(__dirname, '..', 'uploads');

export const dbFile = path.join(dataDir, 'studio.db');

export function ensureStorageDirs() {
  fs.mkdirSync(dataDir, { recursive: true });
  fs.mkdirSync(uploadsDir, { recursive: true });
}

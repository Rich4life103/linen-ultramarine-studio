/**
 * API location resolution.
 *
 * - Local dev: VITE_API_URL is unset, so requests go to the relative "/api" path and
 *   Vite's dev proxy forwards them to the local Express server.
 * - Production: VITE_API_URL points at the deployed API origin (e.g. Render), so the
 *   static frontend on Vercel can reach the backend across origins.
 */
export const API_ORIGIN = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const BASE = `${API_ORIGIN}/api`;

/** Resolve a server-relative asset path (e.g. "/uploads/x.png") against the API origin. */
export function assetUrl(url) {
  if (!url) return url;
  if (/^(https?:|data:|blob:)/i.test(url)) return url;
  return `${API_ORIGIN}${url.startsWith('/') ? '' : '/'}${url}`;
}

async function request(path, { method = 'GET', body, formData } = {}) {
  const opts = { method, credentials: 'include', cache: 'no-store', headers: {} };
  if (formData) {
    opts.body = formData;
  } else if (body !== undefined) {
    opts.headers['Content-Type'] = 'application/json';
    opts.body = JSON.stringify(body);
  }
  const res = await fetch(`${BASE}${path}`, opts);
  const isJson = res.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await res.json() : null;
  if (!res.ok) {
    const err = new Error(data?.error || `Request failed (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return data;
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body }),
  put: (path, body) => request(path, { method: 'PUT', body }),
  patch: (path, body) => request(path, { method: 'PATCH', body }),
  del: (path) => request(path, { method: 'DELETE' }),
  upload: (path, file) => {
    const fd = new FormData();
    fd.append('file', file);
    return request(path, { method: 'POST', formData: fd });
  },
};

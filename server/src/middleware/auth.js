import jwt from 'jsonwebtoken';

export const JWT_SECRET = process.env.JWT_SECRET || 'linen-ultramarine-dev-secret';
export const COOKIE_NAME = 'studio_token';

export function signToken(user) {
  return jwt.sign({ id: user.id, email: user.email, name: user.name, role: user.role }, JWT_SECRET, {
    expiresIn: '7d',
  });
}

export function setAuthCookie(res, token) {
  // In production the frontend (Vercel) and API (Render) are different sites, so the
  // session cookie must be SameSite=None + Secure to be sent on cross-origin fetches.
  const crossSite = process.env.NODE_ENV === 'production' || process.env.COOKIE_SAMESITE === 'none';
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: crossSite ? 'none' : 'lax',
    secure: crossSite,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

export function clearAuthCookie(res) {
  const crossSite = process.env.NODE_ENV === 'production' || process.env.COOKIE_SAMESITE === 'none';
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    sameSite: crossSite ? 'none' : 'lax',
    secure: crossSite,
  });
}

/** Express middleware: require a valid studio token */
export function requireAuth(req, res, next) {
  const token = req.cookies?.[COOKIE_NAME] || req.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (!token) return res.status(401).json({ error: 'Authentication required' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Session expired — please sign in again' });
  }
}

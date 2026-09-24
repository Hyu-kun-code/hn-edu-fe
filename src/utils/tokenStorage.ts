// Shared localStorage access for the auth session, used by both AuthContext
// (React state) and the axios interceptor in api.ts (outside React) so the
// two stay in sync on the same keys.

export interface Session {
  token: string;
  expiresAt: number;
  refreshToken: string;
  refreshExpiresAt: number;
}

const KEYS = {
  token: "token",
  user: "user",
  tokenExpiresAt: "tokenExpiresAt",
  refreshToken: "refreshToken",
  refreshTokenExpiresAt: "refreshTokenExpiresAt",
} as const;

export function getToken(): string | null {
  return localStorage.getItem(KEYS.token);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(KEYS.refreshToken);
}

function readTimestamp(key: string): number | null {
  const stored = localStorage.getItem(key);
  return stored ? Number(stored) : null;
}

export function getTokenExpiresAt(): number | null {
  return readTimestamp(KEYS.tokenExpiresAt);
}

export function getRefreshTokenExpiresAt(): number | null {
  return readTimestamp(KEYS.refreshTokenExpiresAt);
}

export function isTokenValid(): boolean {
  const expiresAt = getTokenExpiresAt();
  return Boolean(getToken() && expiresAt && Date.now() < expiresAt);
}

export function isRefreshTokenValid(): boolean {
  const expiresAt = getRefreshTokenExpiresAt();
  return Boolean(getRefreshToken() && expiresAt && Date.now() < expiresAt);
}

export function saveSession(session: Session): void {
  localStorage.setItem(KEYS.token, session.token);
  localStorage.setItem(KEYS.tokenExpiresAt, String(session.expiresAt));
  localStorage.setItem(KEYS.refreshToken, session.refreshToken);
  localStorage.setItem(KEYS.refreshTokenExpiresAt, String(session.refreshExpiresAt));
}

export function clearSession(): void {
  localStorage.removeItem(KEYS.token);
  localStorage.removeItem(KEYS.user);
  localStorage.removeItem(KEYS.tokenExpiresAt);
  localStorage.removeItem(KEYS.refreshToken);
  localStorage.removeItem(KEYS.refreshTokenExpiresAt);
}

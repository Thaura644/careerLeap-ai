/**
 * Auth session persistence — the single place that decides how long a login
 * survives.
 *
 * "Remember me" checked  → token + user live in localStorage with a 30-day
 *                          expiry (checked on every read).
 * "Remember me" unchecked → token + user live in sessionStorage only, so the
 *                          session ends when the browser/tab closes.
 *
 * Everything that reads the token (API client, auth gating in contexts, the
 * header menu) goes through here so both storage tiers behave identically.
 */

const TOKEN_KEY = "leap_token";
const USER_KEY = "leap_user";
const EXPIRES_KEY = "leap_token_expires_at";

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export interface StoredUser {
  fullName?: string;
  email?: string;
}

/** Persist the session: localStorage + 30-day expiry when remembered,
 *  sessionStorage (browser-session-only) otherwise. */
export function saveAuthSession(token: string, user: StoredUser, remember: boolean): void {
  if (remember) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    localStorage.setItem(EXPIRES_KEY, String(Date.now() + THIRTY_DAYS_MS));
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
  } else {
    sessionStorage.setItem(TOKEN_KEY, token);
    sessionStorage.setItem(USER_KEY, JSON.stringify(user));
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(EXPIRES_KEY);
  }
}

/** The current token, or null. Expired remembered sessions are cleared. */
export function getAuthToken(): string | null {
  const lsToken = localStorage.getItem(TOKEN_KEY);
  if (lsToken) {
    const expires = Number(localStorage.getItem(EXPIRES_KEY) || 0);
    if (expires && Date.now() > expires) {
      clearAuthSession();
      return null;
    }
    return lsToken;
  }
  return sessionStorage.getItem(TOKEN_KEY);
}

/** The stored user object (from whichever storage tier holds the session). */
export function getAuthUser(): StoredUser | null {
  const raw = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    const user = JSON.parse(raw);
    return user && typeof user === "object" ? user : null;
  } catch {
    return null;
  }
}

/** Clear the session from both storage tiers. */
export function clearAuthSession(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(EXPIRES_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
}

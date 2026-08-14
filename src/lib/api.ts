const API_BASE = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api").replace(/\/$/, "");

// Render's free tier cold-starts can take 30-60s; keep the default generous so
// legit slow starts don't fail, but never let a request hang forever silently.
const DEFAULT_TIMEOUT_MS = 45000;

const getAuthToken = () => localStorage.getItem("leap_token");

const withHeaders = (headers?: HeadersInit): HeadersInit => {
  const token = getAuthToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(headers || {}),
  };
};

/** Signals that a request hit its timeout rather than a server error. */
export class ApiTimeoutError extends Error {
  constructor(path: string) {
    super(`Request to ${path} timed out`);
    this.name = "ApiTimeoutError";
  }
}

async function fetchWithTimeout(path: string, init: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);
  try {
    return await fetch(`${API_BASE}${path}`, { ...init, signal: controller.signal });
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new ApiTimeoutError(path);
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetchWithTimeout(path, { method: "GET", headers: withHeaders() });
  if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`);
  return res.json();
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetchWithTimeout(path, {
    method: "POST",
    headers: withHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`POST ${path} failed: ${res.status}`);
  return res.json();
}

export async function apiPut<T>(path: string, body: unknown): Promise<T> {
  const res = await fetchWithTimeout(path, {
    method: "PUT",
    headers: withHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`PUT ${path} failed: ${res.status}`);
  return res.json();
}

export async function apiDelete<T>(path: string): Promise<T> {
  const res = await fetchWithTimeout(path, { method: "DELETE", headers: withHeaders() });
  if (!res.ok) throw new Error(`DELETE ${path} failed: ${res.status}`);
  return res.json();
}

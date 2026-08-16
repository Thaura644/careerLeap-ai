import { getAuthToken } from "./authSession";

const API_BASE = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api").replace(/\/$/, "");

// Render's free tier cold-starts can take 30-60s; keep the default generous so
// legit slow starts don't fail, but never let a request hang forever silently.
const DEFAULT_TIMEOUT_MS = 45000;

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

/** Reads a server-provided error message from a failed response body.
 *  Prefers the human-readable `message` field over the machine `error` code,
 *  so callers (e.g. Pro-gate detection) see real text like "explore pool"
 *  instead of a bare code like "forbidden". The Error also carries the HTTP
 *  status so callers can branch on 401/403/404 directly. */
export class ApiError extends Error {
  status?: number;
  code?: string;

  constructor(message: string, status?: number, code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

async function errorMessage(path: string, res: Response): Promise<Error> {
  let msg = `Request to ${path} failed (${res.status})`;
  let code: string | undefined;
  try {
    const body = await res.json();
    if (body && typeof body === "object") {
      if (typeof body.message === "string" && body.message.trim()) {
        msg = body.message;
      } else if (typeof body.error === "string" && body.error.trim()) {
        msg = body.error;
      }
      if (typeof body.error === "string" && body.error.trim()) {
        code = body.error;
      }
    }
  } catch {
    /* keep generic message */
  }
  return new ApiError(msg, res.status, code);
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetchWithTimeout(path, { method: "GET", headers: withHeaders() });
  if (!res.ok) throw await errorMessage(path, res);
  return res.json();
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetchWithTimeout(path, {
    method: "POST",
    headers: withHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw await errorMessage(path, res);
  return res.json();
}

export async function apiPut<T>(path: string, body: unknown): Promise<T> {
  const res = await fetchWithTimeout(path, {
    method: "PUT",
    headers: withHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw await errorMessage(path, res);
  return res.json();
}

export async function apiDelete<T>(path: string): Promise<T> {
  const res = await fetchWithTimeout(path, { method: "DELETE", headers: withHeaders() });
  if (!res.ok) throw await errorMessage(path, res);
  return res.json();
}

/** Multipart POST (file uploads). The auth header is added but Content-Type
 *  is left to the browser so the boundary is set correctly. */
export async function apiPostMultipart<T>(path: string, formData: FormData): Promise<T> {
  const token = getAuthToken();
  const res = await fetchWithTimeout(path, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });
  if (!res.ok) throw await errorMessage(path, res);
  return res.json();
}

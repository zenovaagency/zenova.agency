/**
 * Typed fetch client for the Zenova FastAPI backend.
 *
 * - Reads VITE_API_URL — falls back to https://api.zenova.agency/api/v1.
 * - Attaches the admin bearer token from auth storage when present.
 * - Normalises error responses ({ error: { code, message } }) into ApiError.
 * - Auto-refreshes the access token once on 401 if a refresh token exists.
 */

import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  setTokens,
} from './auth';

// VITE_API_URL overrides the deployed backend (e.g. http://localhost:8000/api/v1
// during local development against a local API).
const BASE_URL = (() => {
  const env = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/+$/, '');
  return env || 'https://api.zenova.agency/api/v1';
})();
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  auth?: boolean;
  signal?: AbortSignal;
  headers?: Record<string, string>;
  formData?: FormData;
}

async function rawRequest<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, auth = false, signal, headers = {}, formData } = opts;

  const finalHeaders: Record<string, string> = { Accept: 'application/json', ...headers };
  let payload: BodyInit | undefined;

  if (formData) {
    payload = formData;
  } else if (body !== undefined) {
    finalHeaders['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }

  if (auth) {
    const token = getAccessToken();
    if (token) finalHeaders.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: finalHeaders,
    body: payload,
    signal,
  });

  if (res.status === 204) return undefined as T;

  const text = await res.text();
  const data: unknown = text ? safeJson(text) : null;

  if (!res.ok) {
    const err = (data as { error?: { code?: string; message?: string; details?: unknown } })?.error;
    throw new ApiError(
      err?.message ?? `Request failed (${res.status})`,
      res.status,
      err?.code ?? 'http_error',
      err?.details,
    );
  }
  return data as T;
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

let refreshing: Promise<boolean> | null = null;

async function attemptRefresh(): Promise<boolean> {
  if (refreshing) return refreshing;
  const refresh_token = getRefreshToken();
  if (!refresh_token) return false;
  refreshing = (async () => {
    try {
      const tokens = await rawRequest<{
        access_token: string;
        refresh_token: string;
        token_type: string;
        expires_in: number;
      }>('/auth/refresh', { method: 'POST', body: { refresh_token } });
      setTokens(tokens);
      return true;
    } catch {
      clearTokens();
      return false;
    } finally {
      refreshing = null;
    }
  })();
  return refreshing;
}

export async function api<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  try {
    return await rawRequest<T>(path, opts);
  } catch (err) {
    if (
      err instanceof ApiError &&
      err.status === 401 &&
      opts.auth &&
      err.code !== 'invalid_credentials'
    ) {
      const ok = await attemptRefresh();
      if (ok) return rawRequest<T>(path, opts);
    }
    throw err;
  }
}

export const apiBaseUrl = BASE_URL;

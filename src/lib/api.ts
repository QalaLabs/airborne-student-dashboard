import { AuthUser } from '../types/dashboard';

function getStoredAuth(): AuthUser | null {
  try {
    const raw = localStorage.getItem('airborne_auth_user') || sessionStorage.getItem('airborne_auth_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function authHeaders(extra?: HeadersInit): HeadersInit {
  const user = getStoredAuth();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (user?.token) {
    headers.Authorization = `Bearer ${user.token}`;
  }
  if (extra) {
    Object.assign(headers, extra);
  }
  return headers;
}

export async function apiFetch<T = any>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: {
      ...authHeaders(),
      ...(init.headers || {}),
    },
  });

  let data: any = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    const detail = data?.detail ?? data?.error ?? `Request failed (${res.status})`;
    const message = typeof detail === 'string'
      ? detail
      : Array.isArray(detail)
        ? detail.map((d: any) => d.msg || JSON.stringify(d)).join('; ')
        : 'Request failed';
    throw new Error(message);
  }

  return data as T;
}

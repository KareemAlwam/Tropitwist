const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';
const SESSION_KEY = 'tropitwist-session';

export function getSession() {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null'); } catch { return null; }
}

export function setSession(session) { localStorage.setItem(SESSION_KEY, JSON.stringify(session)); }
export function clearSession() { localStorage.removeItem(SESSION_KEY); }

export async function api(path, options = {}) {
  return request(`/api/v1${path}`, options);
}

export async function adminApi(path, options = {}) {
  return request(`/api/admin${path}`, options);
}

async function request(path, options) {
  const session = getSession();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(session?.token ? { Authorization: `Bearer ${session.token}` } : {}),
      ...(options.headers || {}),
    },
  });
  const body = response.status === 204 ? null : await response.json();
  if (!response.ok) {
    const error = new Error(body?.error?.message || 'Request failed.');
    error.details = body?.error?.details || {};
    throw error;
  }
  return body?.data ?? body;
}

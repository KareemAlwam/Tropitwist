const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
const SESSION_KEY = 'tropitwist-session';
const GUEST_CART_KEY = 'tropitwist-guest-cart-id';
let session = null;
let refreshInFlight = null;
let csrfToken = null;

export function getSession() {
  return session;
}

export function setSession(nextSession) {
  session = nextSession;
  csrfToken = nextSession.csrfToken || csrfToken;
  localStorage.removeItem(SESSION_KEY);
  window.dispatchEvent(new Event('tropitwist-session-change'));
}

export function clearSession() {
  session = null;
  csrfToken = null;
  localStorage.removeItem(SESSION_KEY);
  window.dispatchEvent(new Event('tropitwist-session-change'));
}

export function cartHeaders() {
  let guestCartId = localStorage.getItem(GUEST_CART_KEY);
  if (!guestCartId) {
    guestCartId = window.crypto?.randomUUID?.().replaceAll('-', '') || `guest${Date.now()}${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(GUEST_CART_KEY, guestCartId);
  }
  return { 'X-Cart-Id': guestCartId };
}

export async function restoreSession() {
  if (session) return session;
  if (!refreshInFlight) {
    refreshInFlight = loadCsrfToken().then(() => send('/api/v1/auth/refresh', { method: 'POST' }))
      .then(async (response) => {
        if (!response.ok) return null;
        const body = await response.json();
        setSession(body.data);
        return getSession();
      })
      .catch(() => null)
      .finally(() => { refreshInFlight = null; });
  }
  return refreshInFlight;
}

export async function api(path, options = {}) {
  return request(`/api/v1${path}`, options);
}

export async function adminApi(path, options = {}) {
  return request(`/api/admin${path}`, options);
}

async function request(path, options = {}) {
  const { skipAuthRefresh = false } = options;
  let response = await send(path, options);
  if (response.status === 401 && !skipAuthRefresh && !path.endsWith('/auth/refresh') && !path.endsWith('/auth/login') && !path.endsWith('/auth/register')) {
    const restored = await restoreSession();
    if (restored) response = await send(path, options);
  }

  const body = response.status === 204 ? null : await response.json();
  if (!response.ok) {
    const error = new Error(body?.error?.message || 'Request failed.');
    error.details = body?.error?.details || {};
    throw error;
  }
  return body?.data ?? body;
}

async function send(path, options) {
  const { skipAuthRefresh: _skipAuthRefresh, ...requestOptions } = options;
  const currentSession = getSession();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...requestOptions,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(currentSession?.accessToken ? { Authorization: `Bearer ${currentSession.accessToken}` } : {}),
      ...((path.endsWith('/auth/refresh') || path.endsWith('/auth/logout')) && csrfToken ? { 'X-CSRF-Token': csrfToken } : {}),
      ...(requestOptions.headers || {}),
    },
  });
  return response;
}

async function loadCsrfToken() {
  if (csrfToken) return csrfToken;
  const response = await send('/api/v1/auth/csrf', { method: 'GET' });
  if (!response.ok) return null;
  const body = await response.json();
  csrfToken = body?.data?.csrfToken || null;
  return csrfToken;
}

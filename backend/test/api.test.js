import assert from 'node:assert/strict';
import test from 'node:test';
import { createApp } from '../src/app.js';
import { env } from '../src/config/env.js';
import { createAccessToken } from '../src/lib/security.js';
import { MemoryStore } from '../src/store/memory-store.js';

async function withApi(run, store = undefined) {
  const server = createApp({ store }).listen(0, '127.0.0.1');
  await new Promise((resolve, reject) => { server.once('listening', resolve); server.once('error', reject); });
  const baseUrl = `http://127.0.0.1:${server.address().port}`;
  const request = async (path, options = {}) => {
    const response = await fetch(`${baseUrl}${path}`, {
      ...options,
      headers: { 'content-type': 'application/json', ...(options.headers || {}) },
      body: options.body && typeof options.body !== 'string' ? JSON.stringify(options.body) : options.body,
    });
    const text = await response.text();
    return { status: response.status, body: text ? JSON.parse(text) : null, headers: response.headers };
  };
  try { await run(request); } finally { await new Promise((resolve) => server.close(resolve)); }
}

test('catalog supports search, filters and product slugs', () => withApi(async (request) => {
  const catalog = await request('/api/v1/products?category=skincare&search=cleanser');
  assert.equal(catalog.status, 200);
  assert.equal(catalog.body.pagination.total, 1);
  assert.equal(catalog.body.data[0].slug, 'daily-glow-cleanser');
  const product = await request('/api/v1/products/daily-glow-cleanser');
  assert.equal(product.status, 200);
  assert.equal(product.body.data.id, 'p3');
}));

test('accounts issue sessions and protect customer data', () => withApi(async (request) => {
  const registration = await request('/api/v1/auth/register', { method: 'POST', body: { firstName: 'Mona', lastName: 'Ali', email: 'MONA@example.com', password: 'safe-password' } });
  assert.equal(registration.status, 201);
  assert.equal(registration.body.data.user.email, 'mona@example.com');
  assert.equal('passwordHash' in registration.body.data.user, false);
  const token = registration.body.data.accessToken;
  assert.equal(typeof token, 'string');
  assert.match(registration.headers.get('set-cookie'), /HttpOnly/);
  assert.match(registration.headers.get('set-cookie'), /SameSite=Lax/);
  assert.match(registration.headers.get('x-request-id'), /^[A-Za-z0-9-]+$/);
  assert.equal((await request('/api/v1/me')).status, 401);
  const me = await request('/api/v1/me', { headers: { authorization: `Bearer ${token}` } });
  assert.equal(me.status, 200);
  assert.equal(me.body.data.firstName, 'Mona');
  const duplicate = await request('/api/v1/auth/register', { method: 'POST', body: { firstName: 'Mona', lastName: 'Ali', email: 'mona@example.com', password: 'safe-password' } });
  assert.equal(duplicate.status, 409);
}));

test('a guest cart is retained when an account is created', () => withApi(async (request) => {
  const guestHeaders = { 'x-cart-id': 'guestcart123456' };
  const guestCart = await request('/api/v1/cart', {
    method: 'PUT',
    headers: guestHeaders,
    body: { items: [{ productId: 'p1', quantity: 1 }] },
  });
  assert.equal(guestCart.status, 200);
  assert.equal(guestCart.body.data.itemCount, 1);

  const registration = await request('/api/v1/auth/register', {
    method: 'POST',
    headers: guestHeaders,
    body: { firstName: 'Mona', lastName: 'Ali', email: 'mona@example.com', password: 'safe-password' },
  });
  assert.equal(registration.status, 201);
  const cart = await request('/api/v1/cart', { headers: { authorization: `Bearer ${registration.body.data.accessToken}` } });
  assert.equal(cart.status, 200);
  assert.equal(cart.body.data.itemCount, 1);
  assert.equal(cart.body.data.items[0].product.id, 'p1');
}));

test('authenticated checkout ignores client-supplied prices', () => withApi(async (request) => {
  const registration = await request('/api/v1/auth/register', { method: 'POST', body: { firstName: 'Mona', lastName: 'Ali', email: 'mona@example.com', password: 'safe-password' } });
  const headers = { authorization: `Bearer ${registration.body.data.accessToken}` };
  const added = await request('/api/v1/cart/items', { method: 'POST', headers, body: { productId: 'p1', quantity: 2 } });
  assert.equal(added.status, 201);
  assert.equal(added.body.data.subtotal, 700);
  const order = await request('/api/v1/orders', {
    method: 'POST', headers,
    body: {
      customer: { firstName: 'Mona', lastName: 'Ali', email: 'mona@example.com', phone: '01000000000', address: '12 Nile Street', city: 'Cairo', area: 'Dokki' },
      paymentMethod: 'cash-on-delivery',
      items: [{ productId: 'p1', quantity: 2, unitPrice: 1 }],
      total: 1,
    },
  });
  assert.equal(order.status, 201);
  assert.equal(order.body.data.subtotal, 700);
  assert.equal(order.body.data.shipping, 60);
  assert.equal(order.body.data.total, 760);
  const cart = await request('/api/v1/cart', { headers });
  assert.equal(cart.body.data.itemCount, 0);
}));

test('checkout requires an account and rejects excessive stock', () => withApi(async (request) => {
  const anonymous = await request('/api/v1/orders', { method: 'POST', body: {} });
  assert.equal(anonymous.status, 401);
  const registration = await request('/api/v1/auth/register', { method: 'POST', body: { firstName: 'Mona', lastName: 'Ali', email: 'mona@example.com', password: 'safe-password' } });
  const invalidPhone = await request('/api/v1/orders', {
    method: 'POST', headers: { authorization: `Bearer ${registration.body.data.accessToken}` },
    body: { customer: { firstName: 'Mona', lastName: 'Ali', email: 'mona@example.com', phone: '12345678', address: '12 Nile Street', city: 'Cairo', area: 'Dokki' }, paymentMethod: 'cash-on-delivery', items: [{ productId: 'p1', quantity: 1 }] },
  });
  assert.equal(invalidPhone.status, 422);
  const stock = await request('/api/v1/checkout/session', { method: 'POST', headers: { authorization: `Bearer ${registration.body.data.accessToken}` }, body: { items: [{ productId: 'b1', quantity: 20 }] } });
  assert.equal(stock.status, 409);
  assert.equal(stock.body.error.code, 'INSUFFICIENT_STOCK');
}));

test('card payments remain unavailable until Paymob is configured', () => withApi(async (request) => {
  const methods = await request('/api/v1/payments/methods');
  assert.equal(methods.status, 200);
  assert.equal(methods.body.data.paymobCard, false);
  const registration = await request('/api/v1/auth/register', { method: 'POST', body: { firstName: 'Mona', lastName: 'Ali', email: 'mona@example.com', password: 'safe-password' } });
  const checkout = await request('/api/v1/payments/paymob/checkout', {
    method: 'POST', headers: { authorization: `Bearer ${registration.body.data.accessToken}` },
    body: { customer: { firstName: 'Mona', lastName: 'Ali', email: 'mona@example.com', phone: '01000000000', address: '12 Nile Street', city: 'Cairo', area: 'Dokki' }, items: [{ productId: 'p1', quantity: 1 }] },
  });
  assert.equal(checkout.status, 503);
  assert.equal(checkout.body.error.code, 'PAYMENT_UNAVAILABLE');
}));

test('admin dashboard rejects a regular customer', () => withApi(async (request) => {
  const registration = await request('/api/v1/auth/register', { method: 'POST', body: { firstName: 'Mona', lastName: 'Ali', email: 'mona@example.com', password: 'safe-password' } });
  const dashboard = await request('/api/admin/dashboard', { headers: { authorization: `Bearer ${registration.body.data.accessToken}` } });
  assert.equal(dashboard.status, 403);
  assert.equal(dashboard.body.error.code, 'FORBIDDEN');
}));

test('admin can control homepage and bestseller product flags', () => {
  const store = new MemoryStore();
  const admin = store.createUser({ firstName: 'Store', lastName: 'Admin', email: 'admin@example.com', passwordHash: 'not-used-in-this-test', role: 'admin' });
  const token = createAccessToken(admin, env.JWT_ACCESS_SECRET, env.ACCESS_TOKEN_TTL_MINUTES);
  return withApi(async (request) => {
    const headers = { authorization: `Bearer ${token}` };
    const updated = await request('/api/admin/products/p1', { method: 'PATCH', headers, body: { featured: false, bestseller: false } });
    assert.equal(updated.status, 200);
    assert.equal(updated.body.data.featured, false);
    assert.equal(updated.body.data.bestseller, false);
    const dashboard = await request('/api/admin/dashboard', { headers });
    assert.equal(dashboard.status, 200);
    const product = dashboard.body.products.find((item) => item.id === 'p1');
    assert.equal(product.featured, false);
    assert.equal(product.bestseller, false);
  }, store);
});

test('refresh tokens rotate in an HttpOnly cookie and logout revokes the session', () => withApi(async (request) => {
  const registration = await request('/api/v1/auth/register', { method: 'POST', body: { firstName: 'Mona', lastName: 'Ali', email: 'mona@example.com', password: 'safe-password' } });
  const firstCookie = registration.headers.get('set-cookie').split(';')[0];
  const firstCsrf = registration.body.data.csrfToken;
  const missingCsrf = await request('/api/v1/auth/refresh', { method: 'POST', headers: { cookie: firstCookie } });
  assert.equal(missingCsrf.status, 403);
  assert.equal(missingCsrf.body.error.code, 'CSRF_INVALID');
  const refresh = await request('/api/v1/auth/refresh', { method: 'POST', headers: { cookie: firstCookie, 'x-csrf-token': firstCsrf } });
  assert.equal(refresh.status, 200);
  const secondCookie = refresh.headers.get('set-cookie').split(';')[0];
  assert.notEqual(secondCookie, firstCookie);
  const staleRefresh = await request('/api/v1/auth/refresh', { method: 'POST', headers: { cookie: firstCookie, 'x-csrf-token': firstCsrf } });
  assert.equal(staleRefresh.status, 401);
  const me = await request('/api/v1/me', { headers: { authorization: `Bearer ${refresh.body.data.accessToken}` } });
  assert.equal(me.status, 200);
  const logout = await request('/api/v1/auth/logout', { method: 'POST', headers: { cookie: secondCookie, 'x-csrf-token': refresh.body.data.csrfToken } });
  assert.equal(logout.status, 204);
  const revoked = await request('/api/v1/auth/refresh', { method: 'POST', headers: { cookie: secondCookie, 'x-csrf-token': refresh.body.data.csrfToken } });
  assert.equal(revoked.status, 401);
}));

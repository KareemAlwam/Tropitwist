import assert from 'node:assert/strict';
import test from 'node:test';
import { createApp } from '../src/app.js';

async function withApi(run) {
  const server = createApp().listen(0, '127.0.0.1');
  await new Promise((resolve, reject) => { server.once('listening', resolve); server.once('error', reject); });
  const baseUrl = `http://127.0.0.1:${server.address().port}`;
  const request = async (path, options = {}) => {
    const response = await fetch(`${baseUrl}${path}`, {
      ...options,
      headers: { 'content-type': 'application/json', ...(options.headers || {}) },
      body: options.body && typeof options.body !== 'string' ? JSON.stringify(options.body) : options.body,
    });
    const text = await response.text();
    return { status: response.status, body: text ? JSON.parse(text) : null };
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
  const token = registration.body.data.token;
  assert.equal((await request('/api/v1/me')).status, 401);
  const me = await request('/api/v1/me', { headers: { authorization: `Bearer ${token}` } });
  assert.equal(me.status, 200);
  assert.equal(me.body.data.firstName, 'Mona');
  const duplicate = await request('/api/v1/auth/register', { method: 'POST', body: { firstName: 'Mona', lastName: 'Ali', email: 'mona@example.com', password: 'safe-password' } });
  assert.equal(duplicate.status, 409);
}));

test('authenticated checkout ignores client-supplied prices', () => withApi(async (request) => {
  const registration = await request('/api/v1/auth/register', { method: 'POST', body: { firstName: 'Mona', lastName: 'Ali', email: 'mona@example.com', password: 'safe-password' } });
  const headers = { authorization: `Bearer ${registration.body.data.token}` };
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
  const stock = await request('/api/v1/checkout/session', { method: 'POST', headers: { authorization: `Bearer ${registration.body.data.token}` }, body: { items: [{ productId: 'b1', quantity: 20 }] } });
  assert.equal(stock.status, 409);
  assert.equal(stock.body.error.code, 'INSUFFICIENT_STOCK');
}));

test('admin dashboard rejects a regular customer', () => withApi(async (request) => {
  const registration = await request('/api/v1/auth/register', { method: 'POST', body: { firstName: 'Mona', lastName: 'Ali', email: 'mona@example.com', password: 'safe-password' } });
  const dashboard = await request('/api/admin/dashboard', { headers: { authorization: `Bearer ${registration.body.data.token}` } });
  assert.equal(dashboard.status, 403);
  assert.equal(dashboard.body.error.code, 'FORBIDDEN');
}));

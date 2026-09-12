import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import test from 'node:test';
import { verifyPaymobCallback } from '../src/services/paymob.js';

test('Paymob callbacks require a valid HMAC signature', () => {
  const secret = 'test-paymob-hmac-secret';
  const payload = { obj: {
    amount_cents: 76000, created_at: '2026-09-12T00:00:00Z', currency: 'EGP', error_occured: false,
    has_parent_transaction: false, id: 123, integration_id: 456, is_3d_secure: true, is_auth: false,
    is_capture: false, is_refunded: false, is_standalone_payment: true, is_voided: false,
    order: { id: 789 }, owner: 1, pending: false, source_data: { pan: '1234', sub_type: 'Visa', type: 'card' }, success: true,
  } };
  const signed = '760002026-09-12T00:00:00ZEGPfalsefalse123456truefalsefalsefalsetruefalse7891false1234Visacardtrue';
  const hmac = createHmac('sha512', secret).update(signed).digest('hex');
  assert.equal(verifyPaymobCallback(payload, hmac, secret), true);
  assert.equal(verifyPaymobCallback(payload, `${hmac.slice(0, -1)}0`, secret), false);
});

import { createHmac, timingSafeEqual } from 'node:crypto';

const baseUrl = 'https://accept.paymob.com';

function value(input) { return input == null ? '' : String(input); }

export function verifyPaymobCallback(payload, receivedHmac, secret) {
  const transaction = payload?.obj;
  if (!transaction || !receivedHmac || !secret) return false;
  const source = transaction.source_data || {};
  const signed = [
    transaction.amount_cents, transaction.created_at, transaction.currency, transaction.error_occured,
    transaction.has_parent_transaction, transaction.id, transaction.integration_id, transaction.is_3d_secure,
    transaction.is_auth, transaction.is_capture, transaction.is_refunded, transaction.is_standalone_payment,
    transaction.is_voided, transaction.order?.id, transaction.owner, transaction.pending, source.pan,
    source.sub_type, source.type, transaction.success,
  ].map(value).join('');
  const expected = createHmac('sha512', secret).update(signed).digest('hex');
  const actual = Buffer.from(receivedHmac, 'hex');
  const expectedBuffer = Buffer.from(expected, 'hex');
  return actual.length === expectedBuffer.length && timingSafeEqual(actual, expectedBuffer);
}

export async function createPaymobCheckout(order, config) {
  const response = await fetch(`${baseUrl}/v1/intention/`, {
    method: 'POST',
    headers: { Authorization: `Token ${config.secretKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      amount: order.total * 100,
      currency: order.currency,
      payment_methods: [config.cardIntegrationId],
      items: order.items.map((item) => ({ name: item.name, amount: item.unitPrice * 100, description: item.name, quantity: item.quantity })),
      billing_data: {
        apartment: 'N/A', floor: 'N/A', first_name: order.customer.firstName, last_name: order.customer.lastName,
        street: order.customer.address, building: 'N/A', phone_number: order.customer.phone, city: order.customer.city,
        country: 'EG', state: order.customer.area, email: order.customer.email, postal_code: 'N/A',
      },
      special_reference: order.id,
      expiration: 3600,
      notification_url: config.webhookUrl,
      redirection_url: `${config.redirectUrl}${config.redirectUrl.includes('?') ? '&' : '?'}orderId=${encodeURIComponent(order.id)}`,
    }),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok || !body.client_secret || !body.intention_order_id) {
    throw new Error(body?.detail || 'Paymob could not create a payment session.');
  }
  return {
    reference: String(body.intention_order_id),
    checkoutUrl: `${baseUrl}/unifiedcheckout/?publicKey=${encodeURIComponent(config.publicKey)}&clientSecret=${encodeURIComponent(body.client_secret)}`,
  };
}

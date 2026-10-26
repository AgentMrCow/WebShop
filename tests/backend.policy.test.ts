import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { assertAdmin, assertOwnership, assertSameOrigin, cart, HttpError, moneyCents,
  password, verifyCapture, imagePath } from '../lib/server/policy';

function failsStatus(fn: () => unknown, status: number) {
  assert.throws(fn, (error) => error instanceof HttpError && error.status === status);
}

test('administrator permission comes from the role, never a display name', () => {
  failsStatus(() => assertAdmin(null), 401);
  failsStatus(() => assertAdmin({ isAdmin: false, name: 'Admin' } as { isAdmin: boolean }), 403);
  assert.doesNotThrow(() => assertAdmin({ isAdmin: true }));
});

test('order ownership stays private unless an administrator route explicitly opts in', () => {
  assert.doesNotThrow(() => assertOwnership('buyer-a', { id: 'buyer-a', isAdmin: false }));
  failsStatus(() => assertOwnership('buyer-a', { id: 'buyer-b', isAdmin: false }), 404);
  failsStatus(() => assertOwnership('buyer-a', { id: 'admin', isAdmin: true }), 404);
  assert.doesNotThrow(() => assertOwnership('buyer-a', { id: 'admin', isAdmin: true }, true));
});

test('mutations require the exact origin and reject cross-site or absent origins', () => {
  const request = (origin?: string, site?: string) => new Request('https://shop.example.test/api/checkout', {
    method: 'POST', headers: { ...(origin ? { origin } : {}), ...(site ? { 'sec-fetch-site': site } : {}) },
  });
  assert.doesNotThrow(() => assertSameOrigin(request('https://shop.example.test')));
  failsStatus(() => assertSameOrigin(request()), 403);
  failsStatus(() => assertSameOrigin(request('https://shop.example.test.attacker.test')), 403);
  failsStatus(() => assertSameOrigin(request('http://shop.example.test')), 403);
  failsStatus(() => assertSameOrigin(request('https://shop.example.test', 'cross-site')), 403);
});

test('cart rejects malformed, fractional, oversized and duplicate quantities', () => {
  assert.deepEqual(cart([{ productId: 2, quantity: 99 }, { id: 1, quantity: '1' }]), [
    { productId: 1, quantity: 1 }, { productId: 2, quantity: 99 },
  ]);
  for (const quantity of [-1, 0, 1.2, NaN, Infinity, 100, '1.5', '100', {}, null]) {
    failsStatus(() => cart([{ productId: 1, quantity }]), 400);
  }
  failsStatus(() => cart([]), 400);
  failsStatus(() => cart([{ productId: 1, quantity: 1 }, { productId: 1, quantity: 1 }]), 400);
  failsStatus(() => cart([{ productId: '1 OR 1=1', quantity: 1 }]), 400);
});

test('currency conversion rejects sub-cent, non-finite and negative prices', () => {
  assert.equal(moneyCents(12.34), 1234);
  assert.equal(moneyCents(0), 0);
  for (const value of [1.001, -0.01, Infinity, NaN, '12.34', 1_000_000.01]) {
    failsStatus(() => moneyCents(value), 400);
  }
});

test('password validation preserves the supplied string and enforces bcrypt byte bounds', () => {
  const valid = `Aa1 ${randomBytes(16).toString('hex')} `;
  assert.equal(password(valid), valid);
  failsStatus(() => password('Aa1' + '😀'.repeat(20)), 400);
  failsStatus(() => password('Aa1' + 'x'.repeat(70)), 400);
});

function capturePayload() {
  return { id: 'TEST-PROVIDER-ORDER', status: 'COMPLETED', purchase_units: [{
    reference_id: 'test-order-reference', custom_id: 'test-order-reference', payments: {
      captures: [{ id: 'test-capture-reference', status: 'COMPLETED', amount: { currency_code: 'USD', value: '24.68' } }],
    },
  }] };
}
const expected = { paypalOrderId: 'TEST-PROVIDER-ORDER', uuid: 'test-order-reference', totalCents: 2468, currency: 'USD' };

test('payment confirmation checks the provider order, reference, status, amount and currency', () => {
  assert.equal(verifyCapture(capturePayload(), expected), 'test-capture-reference');
  const wrongId = capturePayload(); wrongId.id = 'ANOTHER-ORDER';
  failsStatus(() => verifyCapture(wrongId, expected), 409);
  const wrongReference = capturePayload(); wrongReference.purchase_units[0].reference_id = 'another-order';
  failsStatus(() => verifyCapture(wrongReference, expected), 409);
  const pending = capturePayload(); pending.purchase_units[0].payments.captures[0].status = 'PENDING';
  failsStatus(() => verifyCapture(pending, expected), 409);
  const wrongAmount = capturePayload(); wrongAmount.purchase_units[0].payments.captures[0].amount.value = '0.01';
  failsStatus(() => verifyCapture(wrongAmount, expected), 409);
  const wrongCurrency = capturePayload(); wrongCurrency.purchase_units[0].payments.captures[0].amount.currency_code = 'HKD';
  failsStatus(() => verifyCapture(wrongCurrency, expected), 409);
  failsStatus(() => verifyCapture({ status: 'APPROVED' }, expected), 409);
});

test('catalogue image references cannot escape local assets or inject arbitrary URLs', () => {
  assert.equal(imagePath('/sample_product.webp'), '/sample_product.webp');
  assert.equal(imagePath('/api/images/12345678-1234-1234-1234-123456789abc'), '/api/images/12345678-1234-1234-1234-123456789abc');
  for (const value of ['//attacker.test/a.png', 'https://attacker.test/a.png', '/../../config.png', '/a.svg', 'javascript:alert(1)']) {
    failsStatus(() => imagePath(value), 400);
  }
});

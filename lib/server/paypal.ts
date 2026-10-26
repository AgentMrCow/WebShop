import { prisma } from '../prisma';
import { HttpError, verifyCapture } from './policy';
import { orderInclude, ownedOrder, type StoredOrder } from './orders';
import type { Actor } from './http';

const BASE = 'https://api-m.sandbox.paypal.com';
let cachedToken: { value: string; expiresAt: number } | null = null;

export function paymentConfig() {
  const configured = Boolean(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET);
  return { checkoutMode: configured ? 'paypal-sandbox' as const : 'demo' as const,
    paypalClientId: configured ? process.env.PAYPAL_CLIENT_ID! : null };
}

async function accessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 30_000) return cachedToken.value;
  if (paymentConfig().checkoutMode !== 'paypal-sandbox') throw new HttpError(503, 'PayPal sandbox is not configured.');
  const credentials = Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString('base64');
  const response = await fetch(`${BASE}/v1/oauth2/token`, {
    method: 'POST', headers: { Authorization: `Basic ${credentials}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'grant_type=client_credentials', signal: AbortSignal.timeout(15_000), cache: 'no-store',
  });
  if (!response.ok) throw new HttpError(502, 'PayPal sandbox is temporarily unavailable.');
  const data = await response.json();
  if (typeof data.access_token !== 'string' || typeof data.expires_in !== 'number') throw new HttpError(502, 'PayPal sandbox is temporarily unavailable.');
  cachedToken = { value: data.access_token, expiresAt: Date.now() + Math.min(data.expires_in, 28_800) * 1000 };
  return cachedToken.value;
}

async function paypal(path: string, method: 'GET' | 'POST', body?: unknown, requestId?: string) {
  const token = await accessToken();
  const response = await fetch(`${BASE}${path}`, {
    method, headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', Prefer: 'return=representation',
      ...(requestId ? { 'PayPal-Request-Id': requestId } : {}) },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }), signal: AbortSignal.timeout(20_000), cache: 'no-store',
  });
  const data = await response.json().catch(() => null);
  return { response, data };
}

export async function ensurePayPalOrder(order: StoredOrder): Promise<string> {
  if (order.mode !== 'paypal-sandbox') throw new HttpError(409, 'This is a demo order.');
  if (order.status === 'cancelled') throw new HttpError(409, 'This order was cancelled. Start a new checkout.');
  if (order.paypalOrderId) return order.paypalOrderId;
  if (order.status !== 'pending') throw new HttpError(409, 'This order is not awaiting payment.');
  const value = (order.totalCents / 100).toFixed(2);
  const { response, data } = await paypal('/v2/checkout/orders', 'POST', {
    intent: 'CAPTURE', purchase_units: [{ reference_id: order.uuid, custom_id: order.uuid, invoice_id: order.uuid,
      amount: { currency_code: order.currency, value,
        breakdown: { item_total: { currency_code: order.currency, value } } },
      items: order.items.map((item) => ({ name: item.name.slice(0, 127), quantity: String(item.quantity),
        unit_amount: { currency_code: order.currency, value: (item.unitPriceCents / 100).toFixed(2) }, category: 'PHYSICAL_GOODS' })),
    }],
  }, order.uuid);
  if (!response.ok || typeof data?.id !== 'string' || !/^[A-Z0-9]{8,40}$/.test(data.id)) {
    throw new HttpError(502, 'Could not create a PayPal sandbox order. Retry checkout with the same basket.');
  }
  const updated = await prisma.order.updateMany({ where: { uuid: order.uuid, status: 'pending', paypalOrderId: null }, data: { paypalOrderId: data.id } });
  if (!updated.count) {
    const current = await prisma.order.findUnique({ where: { uuid: order.uuid } });
    if (current && current.paypalOrderId === data.id && current.status !== 'cancelled') return data.id;
    throw new HttpError(409, 'The order changed. Refresh your order history.');
  }
  return data.id;
}

export async function capturePayPalOrder(uuid: string, providerId: string, actor: Actor) {
  let order = await ownedOrder(uuid, actor);
  if (order.mode !== 'paypal-sandbox' || !order.paypalOrderId || providerId !== order.paypalOrderId) {
    throw new HttpError(409, 'Sandbox payment does not match this order.');
  }
  if (order.status === 'paid' || order.status === 'completed') return order;
  if (!['pending', 'capturing'].includes(order.status)) throw new HttpError(409, 'This order cannot accept a payment.');
  // Cancellation cannot restock an order once server-side capture starts.
  if (order.status === 'pending') {
    const changed = await prisma.order.updateMany({ where: { uuid, status: 'pending' }, data: { status: 'capturing' } });
    order = await ownedOrder(uuid, actor);
    if (!changed.count && order.status !== 'capturing') throw new HttpError(409, 'This order changed. Refresh your order history.');
  }
  const result = await paypal(`/v2/checkout/orders/${encodeURIComponent(providerId)}/capture`, 'POST', {}, `${uuid}-capture`);
  let payment = result.data;
  if (!result.response.ok) {
    // A retry after a successful capture can return ORDER_ALREADY_CAPTURED.
    const details = await paypal(`/v2/checkout/orders/${encodeURIComponent(providerId)}`, 'GET');
    if (!details.response.ok || details.data?.status !== 'COMPLETED') {
      if (details.response.ok && ['CREATED', 'APPROVED', 'SAVED', 'PAYER_ACTION_REQUIRED'].includes(details.data?.status)) {
        await prisma.order.updateMany({ where: { uuid, status: 'capturing' }, data: { status: 'pending' } });
      }
      throw new HttpError(409, 'Sandbox payment has not been confirmed. Retry confirmation or check your order history.');
    }
    payment = details.data;
  }
  let captureId: string;
  try {
    captureId = verifyCapture(payment, { paypalOrderId: providerId, uuid, totalCents: order.totalCents, currency: order.currency });
  } catch (error) {
    await prisma.order.updateMany({ where: { uuid, status: 'capturing' }, data: { status: 'payment_review' } });
    throw error;
  }
  await prisma.order.updateMany({ where: { uuid, status: 'capturing' }, data: { status: 'paid', paypalCaptureId: captureId } });
  return prisma.order.findUniqueOrThrow({ where: { uuid }, include: orderInclude });
}

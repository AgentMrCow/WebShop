export class HttpError extends Error {
  readonly status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
  }
}

export const MAX_QUANTITY = 99;
export const MAX_CART_LINES = 40;
export const MAX_PRICE_CENTS = 100_000_000;
export const MAX_UPLOAD_BYTES = 2 * 1024 * 1024;

export function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new HttpError(400, 'A JSON object is required.');
  }
  return value as Record<string, unknown>;
}

export function text(value: unknown, label: string, min = 1, max = 200): string {
  if (typeof value !== 'string') throw new HttpError(400, `${label} is required.`);
  const result = value.trim();
  if (result.length < min || result.length > max || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(result)) {
    throw new HttpError(400, `${label} must contain ${min}–${max} characters.`);
  }
  return result;
}

export function email(value: unknown): string {
  const result = text(value, 'Email', 3, 254).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(result)) throw new HttpError(400, 'Enter a valid email address.');
  return result;
}

export function password(value: unknown): string {
  if (typeof value !== 'string' || value.length < 12 || value.length > 72 ||
    new TextEncoder().encode(value).length > 72 || !/[a-z]/.test(value) ||
    !/[A-Z]/.test(value) || !/[0-9]/.test(value) || value.includes('\u0000')) {
    throw new HttpError(400, 'Use 12–72 characters with uppercase, lowercase and a number; the password must fit within 72 UTF-8 bytes.');
  }
  return value;
}

export function integer(value: unknown, label: string, min: number, max: number): number {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < min || value > max) {
    throw new HttpError(400, `${label} must be a whole number from ${min} to ${max}.`);
  }
  return value;
}

export function positiveId(value: unknown): number {
  if (typeof value === 'string' && /^[1-9][0-9]{0,9}$/.test(value)) value = Number(value);
  return integer(value, 'ID', 1, 2_147_483_647);
}

export function slug(value: unknown): string {
  const result = text(value, 'Slug', 1, 100).toLowerCase();
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(result)) throw new HttpError(400, 'Use lowercase letters, numbers and hyphens for the slug.');
  return result;
}

export function imagePath(value: unknown): string {
  const result = text(value, 'Image', 1, 300);
  const upload = /^\/api\/images\/[a-f0-9-]{36}$/.test(result);
  const asset = /^\/(?:[A-Za-z0-9_-]+\/)*[A-Za-z0-9_-][A-Za-z0-9_.-]*\.(?:png|jpe?g|webp|gif)$/i.test(result);
  if ((!upload && !asset) || result.includes('..')) throw new HttpError(400, 'Select an uploaded image or an existing image in this website.');
  return result;
}

export function moneyCents(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) throw new HttpError(400, 'Enter a valid price.');
  const cents = Math.round(value * 100);
  if (value < 0 || cents > MAX_PRICE_CENTS || Math.abs(value * 100 - cents) > 0.00001) {
    throw new HttpError(400, 'Price must be nonnegative, use at most two decimals and be at most 1,000,000.');
  }
  return cents;
}

export type CartLine = { productId: number; quantity: number };

export function cart(value: unknown): CartLine[] {
  if (!Array.isArray(value) || value.length === 0 || value.length > MAX_CART_LINES) {
    throw new HttpError(400, `Your basket must contain 1–${MAX_CART_LINES} different products.`);
  }
  const seen = new Set<number>();
  return value.map((raw) => {
    const item = record(raw);
    const productId = positiveId(item.productId ?? item.id);
    const rawQuantity = typeof item.quantity === 'string' && /^[1-9][0-9]*$/.test(item.quantity)
      ? Number(item.quantity) : item.quantity;
    const quantity = integer(rawQuantity, 'Quantity', 1, MAX_QUANTITY);
    if (seen.has(productId)) throw new HttpError(400, 'Combine duplicate products into one basket item.');
    seen.add(productId);
    return { productId, quantity };
  }).sort((a, b) => a.productId - b.productId);
}

export function idempotencyKey(value: unknown): string {
  const key = text(value, 'Idempotency key', 16, 100);
  if (!/^[A-Za-z0-9_-]+$/.test(key)) throw new HttpError(400, 'Invalid idempotency key.');
  return key;
}

export function assertSameOrigin(request: Request): void {
  const origin = request.headers.get('origin');
  const expected = new URL(request.url).origin;
  if (!origin || origin !== expected || request.headers.get('sec-fetch-site') === 'cross-site') {
    throw new HttpError(403, 'This request must originate from this website.');
  }
}

export function assertOwnership(ownerId: string, actor: { id: string; isAdmin: boolean }, allowAdmin = false): void {
  if (ownerId !== actor.id && !(allowAdmin && actor.isAdmin)) throw new HttpError(404, 'Order not found.');
}

export function assertAdmin(actor: { isAdmin: boolean } | null): void {
  if (!actor) throw new HttpError(401, 'Please sign in.');
  if (actor.isAdmin !== true) throw new HttpError(403, 'Administrator access is required.');
}

export function parseProviderAmount(value: unknown): number {
  if (typeof value !== 'string' || !/^(?:0|[1-9][0-9]{0,7})\.[0-9]{2}$/.test(value)) {
    throw new HttpError(502, 'The payment provider returned an invalid amount.');
  }
  const [whole, fraction] = value.split('.');
  return Number(whole) * 100 + Number(fraction);
}

export function verifyCapture(payload: unknown, expected: { paypalOrderId: string; uuid: string; totalCents: number; currency: string }): string {
  const order = record(payload);
  if (order.id !== expected.paypalOrderId || order.status !== 'COMPLETED' || !Array.isArray(order.purchase_units) || order.purchase_units.length !== 1) {
    throw new HttpError(409, 'Sandbox payment has not been confirmed.');
  }
  const unit = record(order.purchase_units[0]);
  if (unit.reference_id !== expected.uuid || (unit.custom_id && unit.custom_id !== expected.uuid)) {
    throw new HttpError(409, 'Sandbox payment does not match this order.');
  }
  const payments = record(unit.payments);
  if (!Array.isArray(payments.captures) || payments.captures.length !== 1) throw new HttpError(409, 'Sandbox payment has not been confirmed.');
  const capture = record(payments.captures[0]);
  const amount = record(capture.amount);
  if (capture.status !== 'COMPLETED' || amount.currency_code !== expected.currency || parseProviderAmount(amount.value) !== expected.totalCents) {
    throw new HttpError(409, 'Sandbox payment amount or currency does not match this order.');
  }
  return text(capture.id, 'Capture reference', 1, 100);
}

import { createHash, randomUUID } from 'node:crypto';
import type { PrismaClient, Prisma } from '@prisma/client';
import { prisma } from '../prisma';
import { seedCatalogue } from './catalogue';
import { assertOwnership, cart, HttpError, idempotencyKey, moneyCents } from './policy';
import type { Actor } from './http';

export const orderInclude = { items: { orderBy: { id: 'asc' as const } } } satisfies Prisma.OrderInclude;
export type StoredOrder = Prisma.OrderGetPayload<{ include: typeof orderInclude }>;

export function publicOrder(order: StoredOrder) {
  const items = order.items.map((item) => ({ productId: item.productId, name: item.name,
    quantity: item.quantity, price: item.unitPriceCents / 100, unitPriceCents: item.unitPriceCents, image: item.image }));
  return {
    uuid: order.uuid, userId: order.userId, username: order.username, mode: order.mode,
    status: order.status, currency: order.currency, totalCents: order.totalCents,
    total: order.totalCents / 100, createdAt: order.createdAt, updatedAt: order.updatedAt,
    orderDetails: JSON.stringify({ items, total: (order.totalCents / 100).toFixed(2), currency: order.currency, status: order.status, mode: order.mode }),
    items,
  };
}

export async function placeOrder(actor: Actor, input: Record<string, unknown>, mode: 'demo' | 'paypal-sandbox', client: PrismaClient = prisma) {
  const lines = cart(input.items);
  const key = idempotencyKey(input.idempotencyKey);
  await expirePendingOrders(client);
  const fingerprint = createHash('sha256').update(JSON.stringify(lines)).digest('hex');
  const existing = await client.order.findUnique({
    where: { userId_idempotencyKey: { userId: actor.id, idempotencyKey: key } }, include: orderInclude,
  });
  if (existing) {
    if (existing.cartHash !== fingerprint) throw new HttpError(409, 'This checkout key was already used for a different basket.');
    return { order: existing, replayed: true };
  }
  if (client === prisma) await seedCatalogue();

  try {
    const order = await client.$transaction(async (tx) => {
      const products = await tx.product.findMany({ where: { id: { in: lines.map((item) => item.productId) }, active: true } });
      if (products.length !== lines.length) throw new HttpError(409, 'A product is no longer available. Refresh your basket.');
      const productMap = new Map(products.map((product) => [product.id, product]));
      let totalCents = 0;
      const items = [];
      for (const item of lines) {
        const product = productMap.get(item.productId)!;
        const unitPriceCents = moneyCents(product.price);
        totalCents += unitPriceCents * item.quantity;
        if (totalCents > 2_000_000_000) throw new HttpError(400, 'The basket total is too large.');
        const changed = await tx.product.updateMany({
          where: { id: product.id, active: true, inventory: { gte: item.quantity }, price: product.price },
          data: { inventory: { decrement: item.quantity } },
        });
        if (changed.count !== 1) throw new HttpError(409, 'Stock or price changed. Refresh your basket and try again.');
        items.push({ productId: product.id, name: product.name, image: product.image, unitPriceCents, quantity: item.quantity });
      }
      if (mode === 'paypal-sandbox' && totalCents <= 0) throw new HttpError(400, 'A sandbox payment requires a positive total.');
      return tx.order.create({
        data: { uuid: randomUUID(), userId: actor.id, username: actor.email, mode,
          status: mode === 'demo' ? 'demo' : 'pending', currency: 'USD', totalCents,
          idempotencyKey: key, cartHash: fingerprint, items: { create: items } },
        include: orderInclude,
      });
    }, { maxWait: 10_000, timeout: 20_000 });
    return { order, replayed: false };
  } catch (error) {
    // A competing request with the same key may have committed first. Its basket must match.
    const duplicate = await client.order.findUnique({
      where: { userId_idempotencyKey: { userId: actor.id, idempotencyKey: key } }, include: orderInclude,
    });
    if (duplicate) {
      if (duplicate.cartHash !== fingerprint) throw new HttpError(409, 'This checkout key was already used for a different basket.');
      return { order: duplicate, replayed: true };
    }
    throw error;
  }
}

export async function ownedOrder(uuid: string, actor: Actor, allowAdmin = false, client: PrismaClient = prisma) {
  const order = await client.order.findUnique({ where: { uuid }, include: orderInclude });
  if (!order) throw new HttpError(404, 'Order not found.');
  assertOwnership(order.userId, actor, allowAdmin);
  return order;
}

export async function cancelOrder(uuid: string, actor: Actor, allowAdmin = false, client: PrismaClient = prisma) {
  return client.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { uuid }, include: orderInclude });
    if (!order) throw new HttpError(404, 'Order not found.');
    assertOwnership(order.userId, actor, allowAdmin);
    if (order.status === 'cancelled') return order;
    if (!['demo', 'pending'].includes(order.status)) {
      throw new HttpError(409, 'This order can no longer be cancelled. A confirmed or processing payment cannot be cancelled here.');
    }
    const changed = await tx.order.updateMany({
      where: { uuid, status: { in: ['demo', 'pending'] } }, data: { status: 'cancelled' },
    });
    if (changed.count === 1) {
      for (const item of order.items) {
        await tx.product.update({ where: { id: item.productId }, data: { inventory: { increment: item.quantity } } });
      }
    }
    const current = await tx.order.findUniqueOrThrow({ where: { uuid }, include: orderInclude });
    if (current.status !== 'cancelled') throw new HttpError(409, 'This order changed and cannot be cancelled.');
    return current;
  }, { maxWait: 10_000, timeout: 20_000 });
}

export async function listOrders(actor: Actor, all = false) {
  if (all && !actor.isAdmin) throw new HttpError(403, 'Administrator access is required.');
  await expirePendingOrders();
  const orders = await prisma.order.findMany({
    where: all ? {} : { userId: actor.id }, include: orderInclude, orderBy: { createdAt: 'desc' }, take: 200,
  });
  return orders.map(publicOrder);
}

// An abandoned PayPal approval must not reserve inventory indefinitely. Captures
// already in progress are deliberately excluded until their outcome is known.
export async function expirePendingOrders(client: PrismaClient = prisma, cutoff = new Date(Date.now() - 30 * 60 * 1000)) {
  const stale = await client.order.findMany({
    where: { mode: 'paypal-sandbox', status: 'pending', createdAt: { lt: cutoff } },
    select: { uuid: true, userId: true, username: true }, orderBy: { createdAt: 'asc' }, take: 50,
  });
  for (const order of stale) {
    try {
      await cancelOrder(order.uuid, { id: order.userId, email: order.username, name: null, isAdmin: false }, false, client);
    } catch (error) {
      if (!(error instanceof HttpError && [404, 409].includes(error.status))) throw error;
    }
  }
}

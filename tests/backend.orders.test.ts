import { after, before, beforeEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
import { DatabaseSync } from 'node:sqlite';
import { PrismaClient } from '@prisma/client';
import { cancelOrder, expirePendingOrders, ownedOrder, placeOrder, publicOrder } from '../lib/server/orders';
import { seedCatalogue } from '../lib/server/catalogue';
import { HttpError } from '../lib/server/policy';
import { prisma } from '../lib/prisma';

const temporary = mkdtempSync(join(tmpdir(), 'webshop-backend-test-'));
const databasePath = join(temporary, 'test.db');
const testDatabaseUrl = `file:${databasePath}`;
const client = new PrismaClient({ datasourceUrl: testDatabaseUrl });
const buyer = { id: 'test-buyer-a', email: 'buyer-a@example.test', name: 'Buyer A', isAdmin: false };
const other = { id: 'test-buyer-b', email: 'buyer-b@example.test', name: 'Buyer B', isAdmin: false };
const basket = (quantity = 1, key = 'test-idempotency-key-0001') => ({ items: [{ productId: 1, quantity }], idempotencyKey: key });

before(async () => {
  const schemaPath = resolve('prisma/local.schema.prisma');
  assert.match(readFileSync(schemaPath, 'utf8'), /provider\s*=\s*"sqlite"/, 'Run npm run setup:local before integration tests.');
  const sql = execFileSync(process.execPath, [resolve('node_modules/prisma/build/index.js'), 'migrate', 'diff',
    '--from-empty', '--to-schema-datamodel', schemaPath, '--script'], {
    cwd: process.cwd(), env: { ...process.env, DATABASE_URL: testDatabaseUrl }, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'],
  });
  const database = new DatabaseSync(databasePath);
  database.exec(sql);
  database.close();
  await client.$connect();
});

beforeEach(async () => {
  await client.orderItem.deleteMany();
  await client.order.deleteMany();
  await client.product.deleteMany();
  await client.category.deleteMany();
  await client.user.deleteMany();
  await client.appSetting.deleteMany();
  await client.user.createMany({ data: [buyer, other] });
  await client.category.create({ data: { id: 1, name: 'Test category', link: '/category/test', image: '/test.png' } });
  await client.product.create({ data: { id: 1, name: 'Test item', slug: 'test-item', price: 12.34, inventory: 5,
    description: 'Test item', categoryId: 1, image: '/test.png' } });
});

after(async () => {
  await client.$disconnect();
  await prisma.$disconnect();
  rmSync(temporary, { recursive: true, force: true });
});

test('checkout uses server prices and persists an explicitly unpaid demo order', async () => {
  const result = await placeOrder(buyer, { ...basket(2), total: 0.01 }, 'demo', client);
  assert.equal(result.order.totalCents, 2468);
  assert.equal(result.order.mode, 'demo');
  assert.equal(result.order.status, 'demo');
  assert.equal(result.order.userId, buyer.id);
  assert.equal((await client.product.findUniqueOrThrow({ where: { id: 1 } })).inventory, 3);
  assert.equal(publicOrder(result.order).total, 24.68);
  assert.ok(!('password' in publicOrder(result.order)));
});

test('replaying a checkout key returns one order without charging stock twice', async () => {
  const first = await placeOrder(buyer, basket(2), 'demo', client);
  const replay = await placeOrder(buyer, basket(2), 'demo', client);
  assert.equal(replay.order.uuid, first.order.uuid);
  assert.equal(replay.replayed, true);
  assert.equal(await client.order.count(), 1);
  assert.equal((await client.product.findUniqueOrThrow({ where: { id: 1 } })).inventory, 3);
  await assert.rejects(() => placeOrder(buyer, basket(3), 'demo', client), (error) => error instanceof HttpError && error.status === 409);
});

test('parallel stock reservations cannot oversell', async () => {
  const results = await Promise.allSettled([
    placeOrder(buyer, basket(3, 'parallel-checkout-key-0001'), 'demo', client),
    placeOrder(other, basket(3, 'parallel-checkout-key-0002'), 'demo', client),
  ]);
  assert.equal(results.filter((result) => result.status === 'fulfilled').length, 1);
  assert.equal(await client.order.count(), 1);
  assert.equal((await client.product.findUniqueOrThrow({ where: { id: 1 } })).inventory, 2);
});

test('failed multi-item reservations roll back every prior stock decrement', async () => {
  await client.product.create({ data: { id: 2, name: 'Out of stock', slug: 'out-of-stock', price: 1, inventory: 0,
    description: 'Test item', categoryId: 1, image: '/test.png' } });
  await assert.rejects(() => placeOrder(buyer, { ...basket(), items: [{ productId: 1, quantity: 2 }, { productId: 2, quantity: 1 }] }, 'demo', client));
  assert.equal((await client.product.findUniqueOrThrow({ where: { id: 1 } })).inventory, 5);
  assert.equal(await client.order.count(), 0);
});

test('other users cannot view or cancel an order and repeat cancellation only restocks once', async () => {
  const { order } = await placeOrder(buyer, basket(2), 'demo', client);
  await assert.rejects(() => ownedOrder(order.uuid, other, false, client), (error) => error instanceof HttpError && error.status === 404);
  await assert.rejects(() => cancelOrder(order.uuid, other, false, client), (error) => error instanceof HttpError && error.status === 404);
  assert.equal((await client.product.findUniqueOrThrow({ where: { id: 1 } })).inventory, 3);
  await Promise.all([cancelOrder(order.uuid, buyer, false, client), cancelOrder(order.uuid, buyer, false, client)]);
  assert.equal((await client.product.findUniqueOrThrow({ where: { id: 1 } })).inventory, 5);
  assert.equal((await client.order.findUniqueOrThrow({ where: { uuid: order.uuid } })).status, 'cancelled');
});

test('a confirmed or processing payment cannot be cancelled and restocked', async () => {
  const { order } = await placeOrder(buyer, basket(2), 'demo', client);
  await client.order.update({ where: { uuid: order.uuid }, data: { mode: 'paypal-sandbox', status: 'capturing' } });
  await assert.rejects(() => cancelOrder(order.uuid, buyer, false, client), (error) => error instanceof HttpError && error.status === 409);
  assert.equal((await client.product.findUniqueOrThrow({ where: { id: 1 } })).inventory, 3);
});

test('abandoned pending sandbox orders expire and release stock, while captures remain protected', async () => {
  const { order } = await placeOrder(buyer, basket(2), 'paypal-sandbox', client);
  await client.order.update({ where: { uuid: order.uuid }, data: { createdAt: new Date(Date.now() - 60 * 60 * 1000) } });
  await expirePendingOrders(client);
  await expirePendingOrders(client);
  assert.equal((await client.order.findUniqueOrThrow({ where: { uuid: order.uuid } })).status, 'cancelled');
  assert.equal((await client.product.findUniqueOrThrow({ where: { id: 1 } })).inventory, 5);
  const capture = await placeOrder(buyer, basket(1, 'another-sandbox-key-0002'), 'paypal-sandbox', client);
  await client.order.update({ where: { uuid: capture.order.uuid }, data: {
    status: 'capturing', createdAt: new Date(Date.now() - 60 * 60 * 1000),
  } });
  await expirePendingOrders(client);
  assert.equal((await client.order.findUniqueOrThrow({ where: { uuid: capture.order.uuid } })).status, 'capturing');
  assert.equal((await client.product.findUniqueOrThrow({ where: { id: 1 } })).inventory, 4);
});

test('catalogue seeding creates no accounts and never overwrites edits or resurrects deletions', async () => {
  const usersBefore = await client.user.count();
  await seedCatalogue(client);
  assert.equal(await client.user.count(), usersBefore);
  const seeded = await client.product.findFirstOrThrow({ where: { slug: 'luxury-wristwatch' } });
  await client.product.update({ where: { id: seeded.id }, data: { price: 87.65, active: false } });
  const deleted = await client.product.findFirstOrThrow({ where: { slug: 'juniper-faux-fur-coat' } });
  await client.product.delete({ where: { id: deleted.id } });
  await seedCatalogue(client);
  const changed = await client.product.findUniqueOrThrow({ where: { id: seeded.id } });
  assert.equal(changed.price, 87.65);
  assert.equal(changed.active, false);
  assert.equal(await client.product.count({ where: { slug: 'juniper-faux-fur-coat' } }), 0);
});

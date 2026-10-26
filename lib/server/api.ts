import { hash, compare } from 'bcryptjs';
import { configuredProviders } from '../auth';
import { prisma } from '../prisma';
import { getCategories, getProducts, seedCatalogue } from './catalogue';
import { administrator, currentActor, json, jsonBody, route, type IdContext } from './http';
import { assertSameOrigin, email, HttpError, imagePath, integer, moneyCents, password, positiveId, slug, text } from './policy';
import { cancelOrder, expirePendingOrders, listOrders, orderInclude, ownedOrder, placeOrder, publicOrder } from './orders';
import { capturePayPalOrder, ensurePayPalOrder, paymentConfig } from './paypal';
import { saveImage } from './images';

const safeUserFields = { id: true, name: true, email: true, image: true, isAdmin: true, createdAt: true, updatedAt: true } as const;

export const configuration = route(async () => json({ ...paymentConfig(), providers: configuredProviders() }));

export const products = route(async (request: Request) => {
  const inactive = new URL(request.url).searchParams.get('includeInactive') === 'true';
  if (inactive) await administrator();
  await expirePendingOrders();
  return json(await getProducts(inactive));
});
export const categories = route(async () => json(await getCategories()));

export const productById = route(async (_request: Request, context: IdContext) => {
  await expirePendingOrders();
  await seedCatalogue();
  const id = positiveId((await context.params).id);
  const product = await prisma.product.findFirst({ where: { id, active: true }, include: { Category: true } });
  if (!product) throw new HttpError(404, 'Product not found.');
  return json(product);
});

export const productBySlug = route(async (_request: Request, context: { params: Promise<{ slug: string }> }) => {
  await expirePendingOrders();
  await seedCatalogue();
  const productSlug = slug((await context.params).slug);
  const product = await prisma.product.findFirst({ where: { slug: productSlug, active: true }, include: { Category: true } });
  if (!product) throw new HttpError(404, 'Product not found.');
  return json(product);
});

function productInput(body: Record<string, unknown>) {
  const name = text(body.name, 'Product name', 1, 120);
  const productSlug = slug(body.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));
  const price = moneyCents(body.price) / 100;
  const inventory = integer(body.inventory, 'Inventory', 0, 1_000_000);
  const categoryId = positiveId(body.categoryId ?? body.category);
  const description = text(body.description, 'Description', 1, 6_000);
  const image = imagePath(body.imageName ?? body.image);
  if (body.active !== undefined && typeof body.active !== 'boolean') throw new HttpError(400, 'Invalid product availability.');
  return { name, slug: productSlug, price, inventory, categoryId, description, image,
    ...(typeof body.active === 'boolean' ? { active: body.active } : {}) };
}

function categoryInput(body: Record<string, unknown>) {
  const name = text(body.name, 'Category name', 1, 100);
  const link = text(body.link, 'Category link', 1, 150);
  if (!/^\/category\/[a-z0-9]+(?:-[a-z0-9]+)*$/.test(link)) throw new HttpError(400, 'Use a category link such as /category/apparel.');
  return { name, link, image: imagePath(body.imageName ?? body.image) };
}

export const adminCreate = route(async (request: Request) => {
  await administrator();
  const body = await jsonBody(request);
  if (body.type === 'product') {
    const product = await prisma.product.create({ data: productInput(body), include: { Category: true } });
    return json(product, 201);
  }
  if (body.type === 'category') return json(await prisma.category.create({ data: categoryInput(body) }), 201);
  throw new HttpError(400, 'Choose product or category.');
});

export const updateProduct = route(async (request: Request, context: IdContext) => {
  await administrator();
  const body = await jsonBody(request);
  const id = positiveId((await context.params).id);
  return json(await prisma.product.update({ where: { id }, data: productInput(body), include: { Category: true } }));
});

export const deleteProduct = route(async (request: Request, context: IdContext) => {
  await administrator();
  assertSameOrigin(request);
  const id = positiveId((await context.params).id);
  await prisma.product.update({ where: { id }, data: { active: false } });
  return new Response(null, { status: 204 });
});

export const updateCategory = route(async (request: Request, context: IdContext) => {
  await administrator();
  const body = await jsonBody(request);
  const id = positiveId((await context.params).id);
  return json(await prisma.category.update({ where: { id }, data: categoryInput(body) }));
});

export const deleteCategory = route(async (request: Request, context: IdContext) => {
  await administrator();
  assertSameOrigin(request);
  const id = positiveId((await context.params).id);
  if (await prisma.product.count({ where: { categoryId: id } })) {
    throw new HttpError(409, 'Move this category’s products to another category before deleting it.');
  }
  await prisma.category.delete({ where: { id } });
  return new Response(null, { status: 204 });
});

export const users = route(async () => {
  await administrator();
  return json(await prisma.user.findMany({ select: safeUserFields, orderBy: { createdAt: 'desc' }, take: 500 }));
});

export const ownOrders = route(async (request: Request) => {
  const actor = await currentActor();
  if (request.method === 'POST') {
    const body = await jsonBody(request);
    if (body.email !== undefined && email(body.email) !== actor.email.toLowerCase()) {
      throw new HttpError(403, 'You can only view your own order history.');
    }
  }
  return json(await listOrders(actor));
});

export const allOrders = route(async () => json(await listOrders(await administrator(), true)));

export const checkout = route(async (request: Request) => {
  const actor = await currentActor();
  const body = await jsonBody(request);
  body.idempotencyKey ??= request.headers.get('idempotency-key');
  const mode = paymentConfig().checkoutMode;
  const result = await placeOrder(actor, body, mode);
  if (result.order.status === 'cancelled') throw new HttpError(409, 'This checkout was cancelled. Start a new checkout.');
  const providerId = result.order.mode === 'paypal-sandbox' ? await ensurePayPalOrder(result.order) : undefined;
  return json({ mode: result.order.mode, uuid: result.order.uuid, ...(providerId ? { id: providerId } : {}),
    order: publicOrder(result.order), replayed: result.replayed }, result.replayed ? 200 : 201);
});

export const confirmCheckout = route(async (request: Request) => {
  const actor = await currentActor();
  const body = await jsonBody(request);
  const uuid = text(body.orderUUID, 'Order reference', 1, 100);
  const providerId = text(body.paypalOrderId, 'PayPal order reference', 8, 40);
  const order = await capturePayPalOrder(uuid, providerId, actor);
  return json({ message: 'PayPal sandbox payment confirmed.', order: publicOrder(order) });
});

export const cancelCheckout = route(async (request: Request) => {
  const actor = await currentActor();
  const body = await jsonBody(request);
  const uuid = text(body.orderUUID, 'Order reference', 1, 100);
  const order = await cancelOrder(uuid, actor);
  return json({ message: 'Order cancelled.', order: publicOrder(order) });
});

export const orderAction = route(async (request: Request, context: IdContext) => {
  const actor = await currentActor();
  const body = await jsonBody(request);
  const uuid = text((await context.params).id, 'Order reference', 1, 100);
  if (body.action !== 'cancel') throw new HttpError(400, 'Unknown order action.');
  return json({ order: publicOrder(await cancelOrder(uuid, actor)) });
});

export const adminOrderAction = route(async (request: Request, context: IdContext) => {
  const actor = await administrator();
  const body = await jsonBody(request);
  const uuid = text((await context.params).id, 'Order reference', 1, 100);
  if (body.status === 'cancelled') return json({ order: publicOrder(await cancelOrder(uuid, actor, true)) });
  if (body.status !== 'completed') throw new HttpError(400, 'Choose completed or cancelled. Payment status cannot be manually assigned.');
  const order = await ownedOrder(uuid, actor, true);
  if (!['demo', 'paid', 'completed'].includes(order.status)) throw new HttpError(409, 'Only a demo or verified sandbox order can be completed.');
  await prisma.order.updateMany({ where: { uuid, status: { in: ['demo', 'paid'] } }, data: { status: 'completed' } });
  return json({ order: publicOrder(await prisma.order.findUniqueOrThrow({ where: { uuid }, include: orderInclude })) });
});

export const adminDashboard = route(async () => {
  const actor = await administrator();
  const [products, categories, orders, users] = await Promise.all([
    getProducts(true), getCategories(), listOrders(actor, true),
    prisma.user.findMany({ select: safeUserFields, orderBy: { createdAt: 'desc' }, take: 500 }),
  ]);
  return json({ products, categories, orders, users, stats: {
    productCount: products.length, categoryCount: categories.length, userCount: users.length, orderCount: orders.length,
    openOrderCount: orders.filter((order) => ['demo', 'pending', 'capturing'].includes(order.status)).length,
    completedOrderCount: orders.filter((order) => order.status === 'completed').length,
    cancelledOrderCount: orders.filter((order) => order.status === 'cancelled').length,
    demoTotalCents: orders.filter((order) => order.mode === 'demo' && order.status !== 'cancelled').reduce((sum, order) => sum + order.totalCents, 0),
  } });
});

export const register = route(async (request: Request) => {
  const body = await jsonBody(request, 8_192);
  const normalizedEmail = email(body.email);
  const newPassword = password(body.newPassword);
  if (newPassword !== body.confirmPassword) throw new HttpError(400, 'The passwords do not match.');
  if (await prisma.user.findUnique({ where: { email: normalizedEmail }, select: { id: true } })) {
    throw new HttpError(409, 'An account already exists for this email. Sign in with your original method.');
  }
  const name = typeof body.name === 'string' && body.name.trim() ? text(body.name, 'Name', 1, 100) : null;
  await prisma.user.create({ data: { email: normalizedEmail, name, password: await hash(newPassword, 12), isAdmin: false } });
  return json({ message: 'Registration successful.' }, 201);
});

export const changePassword = route(async (request: Request) => {
  const actor = await currentActor();
  const body = await jsonBody(request, 8_192);
  const newPassword = password(body.newPassword);
  if (newPassword !== body.confirmPassword) throw new HttpError(400, 'The passwords do not match.');
  if (typeof body.currentPassword !== 'string' || body.currentPassword.length > 72 || Buffer.byteLength(body.currentPassword, 'utf8') > 72) {
    throw new HttpError(400, 'Enter your current password.');
  }
  const user = await prisma.user.findUniqueOrThrow({ where: { id: actor.id } });
  if (!user.password) throw new HttpError(400, 'This account uses an external sign-in provider and does not have a WebShop password.');
  if (!await compare(body.currentPassword, user.password)) throw new HttpError(403, 'The current password is incorrect.');
  await prisma.user.update({ where: { id: actor.id }, data: { password: await hash(newPassword, 12), sessionVersion: { increment: 1 } } });
  await prisma.session.deleteMany({ where: { userId: actor.id } });
  return json({ message: 'Password updated. Please sign in again.', signInAgain: true });
});

export const uploadImage = route(async (request: Request) => {
  const actor = await administrator();
  assertSameOrigin(request);
  if (!request.headers.get('content-type')?.startsWith('multipart/form-data')) throw new HttpError(415, 'Upload an image using multipart/form-data.');
  const contentLength = Number(request.headers.get('content-length'));
  if (Number.isFinite(contentLength) && contentLength > 2 * 1024 * 1024 + 65_536) throw new HttpError(413, 'Upload an image no larger than 2 MB.');
  const body = await request.formData();
  const file = body.get('file');
  if (!(file instanceof File)) throw new HttpError(400, 'Choose an image to upload.');
  const url = await saveImage(file, actor.id);
  return json({ success: true, url, image: url }, 201);
});

export const uploadedImage = route(async (_request: Request, context: IdContext) => {
  const id = (await context.params).id;
  if (!/^[a-f0-9-]{36}$/.test(id)) throw new HttpError(404, 'Image not found.');
  const image = await prisma.uploadedImage.findUnique({ where: { id } });
  if (!image) throw new HttpError(404, 'Image not found.');
  return new Response(new Uint8Array(image.bytes), { headers: {
    'Content-Type': image.contentType, 'Content-Length': String(image.size),
    'Cache-Control': 'public, max-age=31536000, immutable', 'X-Content-Type-Options': 'nosniff',
    'Content-Security-Policy': "default-src 'none'; sandbox", 'Content-Disposition': 'inline',
  } });
});

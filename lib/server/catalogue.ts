import type { PrismaClient } from '@prisma/client';
import catalogue from '../../prisma/catalogue.json';
import { prisma } from '../prisma';

const SEED_KEY = 'catalogue-v1';

export async function seedCatalogue(client: PrismaClient = prisma): Promise<void> {
  if (await client.appSetting.findUnique({ where: { key: SEED_KEY } })) return;
  try {
    await client.$transaction(async (tx) => {
      if (await tx.appSetting.findUnique({ where: { key: SEED_KEY } })) return;
      const categoryIds = new Map<number, number>();
      for (const source of catalogue.categories) {
        const category = await tx.category.upsert({
          where: { link: source.link },
          update: {},
          create: { name: source.name, link: source.link, image: source.image },
        });
        categoryIds.set(source.id, category.id);
      }
      for (const source of catalogue.products) {
        const categoryId = categoryIds.get(source.categoryId);
        if (!categoryId) throw new Error('Invalid catalogue category.');
        await tx.product.upsert({
          where: { slug: source.slug },
          update: {},
          create: {
            name: source.name, slug: source.slug, description: source.description,
            price: source.price, inventory: source.inventory, image: source.image,
            categoryId, active: true,
          },
        });
      }
      await tx.appSetting.create({ data: { key: SEED_KEY, value: 'initialized' } });
    }, { maxWait: 10_000, timeout: 30_000 });
  } catch (error) {
    // Another request may have finished the same first-run initialization.
    if (await client.appSetting.findUnique({ where: { key: SEED_KEY } })) return;
    throw error;
  }
}

export async function getProducts(includeInactive = false) {
  await seedCatalogue();
  return prisma.product.findMany({
    where: includeInactive ? {} : { active: true },
    include: { Category: true },
    orderBy: { id: 'asc' },
  });
}

export async function getCategories() {
  await seedCatalogue();
  return prisma.category.findMany({ orderBy: { id: 'asc' } });
}

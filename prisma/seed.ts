import { prisma } from '../lib/prisma';
import { seedCatalogue } from '../lib/server/catalogue';

async function main() {
  await seedCatalogue(prisma);
  console.log('Product catalogue initialized.');
}

main().catch(() => {
  console.error('Catalogue initialization failed. Check the database connection and migrations.');
  process.exitCode = 1;
}).finally(() => prisma.$disconnect());

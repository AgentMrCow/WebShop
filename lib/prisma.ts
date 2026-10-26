import { PrismaClient } from '@prisma/client';

const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL;
if (databaseUrl) process.env.DATABASE_URL = databaseUrl;

const globalForPrisma = globalThis as unknown as { webshopPrisma?: PrismaClient };

export const prisma = globalForPrisma.webshopPrisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.webshopPrisma = prisma;


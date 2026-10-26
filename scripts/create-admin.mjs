import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import bcrypt from 'bcryptjs';
import { prepareLocalEnvironment, projectRoot, prismaCli, localSchema, runNode } from './local-env.mjs';

const mode = process.argv[2] || '--local';
if (!['--local', '--production'].includes(mode) || process.argv.length > 3) {
  console.error('Use --local for the isolated development database or --production for the configured PostgreSQL database.');
  process.exit(1);
}
try {
  if (mode === '--local') {
    prepareLocalEnvironment();
  } else {
    const productionEnv = resolve(projectRoot, '.env.production.local');
    if (!process.env.VERCEL && existsSync(productionEnv)) process.loadEnvFile(productionEnv);
    process.env.DATABASE_URL ||= process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL;
    if (!/^postgres(?:ql)?:\/\//.test(process.env.DATABASE_URL || '')) {
      throw new Error('Production administration requires an explicit PostgreSQL connection. Local settings are not loaded.');
    }
  }
} catch (error) {
  console.error(error.message);
  process.exit(1);
}

const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD;
if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !password || password.length < 16 || password.length > 72 || Buffer.byteLength(password, 'utf8') > 72 || password.includes('\0')) {
  console.error('Supply ADMIN_EMAIL and a unique ADMIN_PASSWORD of at least 16 characters and at most 72 UTF-8 bytes through the environment. Values are never printed.');
  process.exitCode = 1;
} else {
  runNode(prismaCli, ['generate', '--schema', mode === '--local' ? localSchema : resolve(projectRoot, 'prisma/schema.prisma')]);
  const { PrismaClient } = await import('@prisma/client');
  const prisma = new PrismaClient();
  try {
    const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
    if (existing) throw new Error('An account already exists. This command will not overwrite its password or role.');
    await prisma.user.create({ data: { email, name: 'Store administrator', password: await bcrypt.hash(password, 12), isAdmin: true } });
    console.log(`Administrator created in the ${mode === '--local' ? 'local development' : 'configured PostgreSQL'} database. Keep the password in a password manager and remove provisioning variables after use.`);
  } catch (error) {
    console.error(error.message?.startsWith('An account already') ? error.message : 'Administrator creation failed. Check the configured database and migrations.');
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { randomBytes } from 'node:crypto';
import { spawnSync } from 'node:child_process';

export const projectRoot = resolve(import.meta.dirname, '..');
export const localSchema = resolve(projectRoot, 'prisma/local.schema.prisma');
export const prismaCli = resolve(projectRoot, 'node_modules/prisma/build/index.js');

export function prepareLocalEnvironment({ create = false } = {}) {
  if (process.env.VERCEL) throw new Error('Local database commands cannot run in Vercel.');
  const envPath = resolve(projectRoot, '.env.local');
  if (!existsSync(envPath)) {
    if (!create) throw new Error('Run npm run setup:local first.');
    const content = [
      '# Local development only. This file is excluded from Git.',
      'DATABASE_URL="file:./local.db"',
      'NEXTAUTH_URL="http://localhost:3000"',
      `NEXTAUTH_SECRET="${randomBytes(48).toString('base64url')}"`,
      '',
    ].join('\n');
    writeFileSync(envPath, content, { mode: 0o600, flag: 'wx' });
  }
  process.loadEnvFile(envPath);
  if (!process.env.DATABASE_URL?.startsWith('file:')) {
    throw new Error('Local commands require an isolated SQLite DATABASE_URL; they never modify a remote database.');
  }
  if (!process.env.NEXTAUTH_SECRET || process.env.NEXTAUTH_SECRET.length < 32) {
    throw new Error('Set a fresh NEXTAUTH_SECRET of at least 32 characters in the ignored .env.local file.');
  }
  const schema = readFileSync(resolve(projectRoot, 'prisma/schema.prisma'), 'utf8');
  if (!schema.includes('provider = "postgresql"') && !/provider\s*=\s*"postgresql"/.test(schema)) {
    throw new Error('The production Prisma schema must declare PostgreSQL.');
  }
  writeFileSync(localSchema, schema.replace(/provider\s*=\s*"postgresql"/, 'provider = "sqlite"'));
}

export function runNode(script, args = [], extraEnv = {}) {
  const result = spawnSync(process.execPath, [script, ...args], {
    cwd: projectRoot,
    env: { ...process.env, ...extraEnv },
    stdio: 'inherit',
  });
  if (result.error || result.status !== 0) {
    throw new Error(`Command failed: ${script.split('/').pop()}`);
  }
}

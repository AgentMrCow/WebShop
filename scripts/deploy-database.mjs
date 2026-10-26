import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const root = resolve(import.meta.dirname, '..');
if (!process.env.VERCEL && existsSync(resolve(root, '.env.production.local'))) {
  process.loadEnvFile(resolve(root, '.env.production.local'));
}
const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL;
const migrationUrl = process.env.DIRECT_URL || process.env.POSTGRES_URL_NON_POOLING || databaseUrl;
const valid = value => typeof value === 'string' && /^postgres(?:ql)?:\/\//.test(value);

if (!valid(databaseUrl) || !valid(migrationUrl)) {
  console.error('Configure a managed PostgreSQL DATABASE_URL before deploying migrations. SQLite and missing connections are rejected.');
  process.exitCode = 1;
} else {
  const run = (script, args, url) => {
    const result = spawnSync(process.execPath, [resolve(root, script), ...args], {
      cwd: root,
      env: { ...process.env, DATABASE_URL: url },
      encoding: 'utf8',
    });
    const output = `${result.stdout || ''}${result.stderr || ''}`.replace(/postgres(?:ql)?:\/\/[^\s'"`]+/g, '[database connection redacted]');
    process.stdout.write(output);
    if (result.status !== 0 || result.error) throw new Error('Database preparation failed.');
  };
  try {
    run('node_modules/prisma/build/index.js', ['generate'], databaseUrl);
    run('node_modules/prisma/build/index.js', ['migrate', 'deploy'], migrationUrl);
    run('node_modules/tsx/dist/cli.mjs', ['prisma/seed.ts'], databaseUrl);
    console.log('Database migrations and catalogue initialization completed.');
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

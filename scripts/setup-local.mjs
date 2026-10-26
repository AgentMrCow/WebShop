import { resolve } from 'node:path';
import { prepareLocalEnvironment, projectRoot, prismaCli, localSchema, runNode } from './local-env.mjs';

try {
  prepareLocalEnvironment({ create: true });
  runNode(prismaCli, ['generate', '--schema', localSchema]);
  runNode(prismaCli, ['db', 'push', '--schema', localSchema, '--skip-generate']);
  runNode(resolve(projectRoot, 'node_modules/tsx/dist/cli.mjs'), ['prisma/seed.ts']);
  console.log('Local WebShop is ready. Start with npm run dev:local. Register your own account; no shared accounts are seeded.');
} catch (error) {
  console.error(error instanceof Error ? error.message : 'Local setup failed.');
  process.exitCode = 1;
}

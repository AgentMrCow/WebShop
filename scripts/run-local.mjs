import { resolve } from 'node:path';
import { prepareLocalEnvironment, projectRoot, prismaCli, localSchema, runNode } from './local-env.mjs';

try {
  const command = process.argv[2];
  if (!['dev', 'build', 'start'].includes(command)) throw new Error('Use dev, build, or start.');
  prepareLocalEnvironment();
  runNode(prismaCli, ['generate', '--schema', localSchema]);
  const args = [command, ...(command === 'start' ? [] : ['--webpack']), ...process.argv.slice(3)];
  runNode(resolve(projectRoot, 'node_modules/next/dist/bin/next'), args);
} catch (error) {
  console.error(error instanceof Error ? error.message : 'Local command failed.');
  process.exitCode = 1;
}

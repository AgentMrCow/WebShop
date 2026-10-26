import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
let paths;
try {
  paths = execFileSync('git', ['ls-files', '-z'], { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).split('\0').filter(Boolean);
} catch {
  console.error('Public-file check requires a Git checkout; run npm run check:public before publishing source.');
  process.exit(1);
}
if (!paths.length) {
  console.error('No tracked files were available to inspect. The public-file check cannot pass without reading source.');
  process.exit(1);
}
const findings = [];
const forbiddenPath = /(?:^|\/)(?:\.env(?:\..*)?|[^/]+\.(?:db(?:-.*)?|sqlite(?:3)?(?:-.*)?|pem|key))$/i;
const checks = [
  ['OAuth or access token', /\b(?:gh[pours]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{30,}|ya29\.[A-Za-z0-9_-]{30,})\b/],
  ['private key', /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/],
  ['institutional email literal', /[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9.-]+\.edu(?:\.[a-z]{2})?\b/i],
  ['institutional host literal', /\b[a-z0-9-]+(?:\.[a-z0-9-]+)*\.edu(?:\.[a-z]{2})?\b/i],
  ['hardcoded authentication secret', /NEXTAUTH_SECRET\s*[:=]\s*["']?[A-Za-z0-9+/_=-]{32,}/],
];
for (const relative of paths) {
  const file = resolve(root, relative);
  if (!existsSync(file)) continue;
  if (forbiddenPath.test(relative) && relative !== '.env.example') findings.push(`${relative}: runtime or secret file must not be tracked`);
  if (!/\.(?:[cm]?[jt]sx?|json|md|ya?ml|sql|prisma)$/.test(relative) && relative !== '.env.example') continue;
  const content = readFileSync(file, 'utf8');
  for (const [kind, pattern] of checks) if (pattern.test(content)) findings.push(`${relative}: ${kind}`);
}
if (findings.length) {
  console.error('Public-file check failed. Values are intentionally omitted.');
  for (const finding of findings) console.error(finding);
  process.exitCode = 1;
} else console.log(`${paths.length} tracked public files passed the secret and runtime-data checks.`);

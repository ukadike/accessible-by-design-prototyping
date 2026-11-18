import { spawnSync } from 'node:child_process';
import { isPublicWebUrl } from '../dist/security/public-url.js';

const rawTargets = process.env.AUDIT_TARGETS ?? '';
const targets = rawTargets
  .split(/\r?\n/)
  .map((value) => value.trim())
  .filter(Boolean);

if (targets.length === 0) {
  console.error('Enter at least one website address.');
  process.exit(1);
}
if (targets.length > 5) {
  console.error('Enter no more than five website addresses per run.');
  process.exit(1);
}

for (const target of targets) {
  if (!(await isPublicWebUrl(target))) {
    console.error(`This address is not a public HTTP or HTTPS website: ${target}`);
    process.exit(1);
  }
}

process.env.A11Y_PUBLIC_URL_ONLY = 'true';
for (const target of targets) {
  console.log(`\nAuditing ${target}\n`);
  const result = spawnSync(
    process.execPath,
    ['dist/cli/index.js', 'audit', target, '--format', 'both', '--out', './audit-output'],
    { stdio: 'inherit', env: process.env },
  );
  if (result.error) {
    console.error(result.error.message);
    process.exit(1);
  }
  if (result.status !== 0) process.exit(result.status ?? 1);
}

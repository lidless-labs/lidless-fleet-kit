import { test } from 'node:test';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const script = join(here, 'fleet-sync-push.test.sh');

test('fleet-sync push success and rejection contracts', () => {
  const result = spawnSync('bash', [script], {
    encoding: 'utf8',
    env: process.env,
  });
  if (result.status !== 0) {
    const detail = [result.stdout, result.stderr].filter(Boolean).join('\n');
    throw new Error(`fleet-sync-push.test.sh failed (exit ${result.status}):\n${detail}`);
  }
});

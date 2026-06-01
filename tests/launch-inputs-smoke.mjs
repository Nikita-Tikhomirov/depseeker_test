import { execFileSync } from 'node:child_process';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));

let output = '';
let status = 0;
try {
  output = execFileSync('python', ['tools/check_launch_inputs.py'], {
    cwd: root,
    encoding: 'utf8',
    stdio: 'pipe'
  });
} catch (error) {
  status = error.status ?? 1;
  output = `${error.stdout ?? ''}${error.stderr ?? ''}`;
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(status === 1, 'local workspace must still report external launch inputs');
assert(output.includes('real HTTPS domain'), 'launch input check must require a real HTTPS domain');
assert(output.includes('production mode'), 'launch input check must require production mode switch');
assert(output.includes('real contacts'), 'launch input check must require real contacts');
assert(output.includes('owner/legal details'), 'launch input check must require legal details');
assert(!/traceback/i.test(output), 'launch input check must fail cleanly');

console.log('launch inputs smoke passed');

import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const root = process.cwd();

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function run(args, options = {}) {
  return execFileSync('python', ['tools/set_site_domain.py', ...args], {
    cwd: root,
    encoding: 'utf8',
    ...options
  });
}

function testReplacesSiteDomain() {
  const dir = mkdtempSync(join(tmpdir(), 'domain-tool-'));
  try {
    writeFileSync(
      join(dir, 'acf.html'),
      '<link rel="canonical" href="https://zifra.example.com/acf.html"><a href="https://zifra.example.com/acf-generator.html">go</a>',
      'utf8'
    );
    writeFileSync(
      join(dir, 'sitemap.xml'),
      '<loc>https://zifra.example.com/acf.html</loc><loc>https://zifra.example.com/migx.html</loc>',
      'utf8'
    );
    writeFileSync(join(dir, 'notes.md'), 'Keep https://unrelated.example.com untouched.', 'utf8');

    const output = run(['https://cifra.dev/', '--root', dir]);
    assert(output.includes('updated 2 files'), 'tool must report changed files');
    assert(readFileSync(join(dir, 'acf.html'), 'utf8').includes('https://cifra.dev/acf.html'), 'canonical URL must use normalized domain');
    assert(readFileSync(join(dir, 'sitemap.xml'), 'utf8').includes('https://cifra.dev/migx.html'), 'sitemap URLs must use normalized domain');
    assert(readFileSync(join(dir, 'notes.md'), 'utf8').includes('https://unrelated.example.com'), 'unrelated domains must stay untouched');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

function testRejectsUnsafeDomain() {
  let failed = false;
  try {
    run(['http://cifra.dev'], { stdio: 'pipe' });
  } catch (error) {
    failed = true;
    assert(String(error.stderr || error.message).includes('https://'), 'unsafe domain error must explain HTTPS requirement');
  }
  assert(failed, 'tool must reject non-HTTPS domains');
}

testReplacesSiteDomain();
testRejectsUnsafeDomain();
console.log('Site domain tool smoke passed.');

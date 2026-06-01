import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function isLocalAsset(value) {
  return value &&
    !value.startsWith('#') &&
    !value.startsWith('http://') &&
    !value.startsWith('https://') &&
    !value.startsWith('mailto:') &&
    !value.startsWith('tel:') &&
    !value.startsWith('javascript:') &&
    !value.startsWith('data:');
}

function targetPath(value) {
  const clean = value.split('#')[0].split('?')[0];
  if (!clean || clean === '/') return '';
  return normalize(clean.replace(/^\//, ''));
}

function pageFiles() {
  return ['index.html', ...readdirSync(root)
    .filter((file) => /^(acf|migx).*\.html$/.test(file))
    .sort()];
}

function localRefs(html) {
  const refs = [];
  const pattern = /\b(?:href|src)=["']([^"']+)["']/g;
  let match;
  while ((match = pattern.exec(html))) {
    if (!isLocalAsset(match[1])) continue;
    const target = targetPath(match[1]);
    if (target) refs.push(target);
  }
  return refs;
}

function main() {
  const missing = [];
  for (const page of pageFiles()) {
    const html = readFileSync(join(root, page), 'utf8');
    for (const ref of localRefs(html)) {
      if (!existsSync(join(root, ref))) missing.push(`${page} -> ${ref}`);
    }
  }

  assert(missing.length === 0, `missing local links:\n${missing.join('\n')}`);
  console.log(`Site link smoke passed: ${pageFiles().length} ACF/MIGX pages.`);
}

main();

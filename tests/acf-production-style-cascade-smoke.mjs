import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));

function read(relativePath) {
  return readFileSync(join(root, relativePath), 'utf8');
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function assertIncludes(source, needle, message) {
  assert(source.includes(needle), message || `missing ${needle}`);
}

const production = read('js/acf-production-renderer.js');

assertIncludes(
  production,
  'function changedFieldStyleProps(style)',
  'production renderer must detect real per-field edits before writing field CSS'
);
assertIncludes(
  production,
  'if (!changes.gap && !changes.labelColor && !changes.labelSize && !changes.valueColor && !changes.valueSize && !changes.valueWeight) continue;',
  'field CSS must be skipped when a field still has only default style values'
);
assertIncludes(
  production,
  "if (changes.valueSize) valueDecls.push('font-size: ' + cssPx(s.valueSize, 16))",
  'semantic field font-size must be emitted only after the user changes that field size'
);
assertIncludes(
  production,
  "if (changes.valueColor) valueDecls.push('color: ' + cssRaw(s.valueColor, '#111827'))",
  'semantic field color must be emitted only after the user changes that field color'
);

assert(
  !production.includes(".zifra-acf-field--' + key + '.zifra-acf-title, .zifra-acf-field--' + key + '.zifra-acf-lead, .zifra-acf-field--' + key + '.zifra-acf-btn, .zifra-acf-field--' + key + '[data-production-target=\"question\"], .zifra-acf-field--' + key + '.zifra-acf-faq-answer { color: ' + cssRaw(s.valueColor"),
  'default per-field CSS must not override semantic hero title/lead/button styles'
);

console.log('acf production style cascade smoke passed');

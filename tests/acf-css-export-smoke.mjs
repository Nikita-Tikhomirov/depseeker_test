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

const html = read('acf-generator.html');
const generator = read('js/acf-generator.js');
const production = read('js/acf-production-renderer.js');
const audit = read('js/acf-generator-audit.js');

assertIncludes(html, 'id="include-template-css"', 'ACF export UI must expose an explicit CSS toggle');
assertIncludes(html, 'data-action="copy-production-css"', 'ACF export UI must allow copying CSS separately');
assertIncludes(html, 'data-tab="html" data-action="switch-tab">WP-шаблон</button>', 'HTML tab must be a clean WP template tab');
assert(!html.includes('WP-шаблон+CSS'), 'ACF generator UI must not imply CSS is always included');

assertIncludes(generator, 'function isTemplateCSSExportEnabled()', 'fallback export must read the CSS toggle');
assertIncludes(generator, 'includeCSS: isTemplateCSSExportEnabled()', 'fallback HTML generation must pass the CSS toggle');
assertIncludes(generator, "return includeCSS ? '<style>", 'fallback snippet export must omit CSS when the toggle is off');
assertIncludes(generator, "case 'toggle-template-css':", 'CSS toggle must update generated output');
assertIncludes(generator, "case 'copy-production-css':", 'separate CSS copy action must be wired');
assertIncludes(generator, "markTemplateCSSNeeded('CSS включен: вы открыли live preview", 'live preview must auto-enable CSS export');
assertIncludes(generator, "markTemplateCSSNeeded('CSS включен: вы изменили", 'visual style edits must auto-enable CSS export');

assertIncludes(production, 'function templateCSSExportEnabled()', 'production renderer must read the CSS toggle');
assertIncludes(production, 'function markTemplateCSSNeeded(message)', 'production visual editing must mark CSS as needed');
assertIncludes(production, 'function renderProductionPHP(options)', 'production template renderer must accept export options');
assertIncludes(production, 'var includeCSS = options.includeCSS !== undefined ? !!options.includeCSS : templateCSSExportEnabled();', 'production template must default to the CSS toggle');
assertIncludes(production, 'if (includeCSS) {', 'production template must gate the style block');
assertIncludes(production, "out.push('<style>');", 'production template must still support explicit inline CSS');
assertIncludes(production, 'output.textContent = renderProductionPHP({ includeCSS: templateCSSExportEnabled() });', 'production HTML tab must render with explicit CSS mode');
assertIncludes(production, "markTemplateCSSNeeded('CSS включен: вы открыли live preview", 'production live preview must auto-enable CSS export');
assertIncludes(production, "markTemplateCSSNeeded('CSS включен: вы изменили стили", 'production visual style editing must auto-enable CSS export');

assert(!audit.includes('WP-шаблон+CSS'), 'audit copy must not imply CSS is always bundled into the WP template');
assertIncludes(audit, 'CSS как отдельный payload', 'audit must describe CSS as a separate payload');

console.log('acf css export smoke passed');

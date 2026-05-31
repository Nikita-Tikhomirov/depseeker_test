import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));

const expectedRoutes = [
  { page: 'acf-php-generator.html', href: 'acf-generator.html?preset=php&amp;source=acf-php-generator', source: 'acf-php-generator', tab: 'php' },
  { page: 'acf-json-generator.html', href: 'acf-generator.html?preset=json&amp;source=acf-json-generator', source: 'acf-json-generator', tab: 'json' },
  { page: 'acf-repeater-generator.html', href: 'acf-generator.html?preset=faq&amp;source=acf-repeater-generator', source: 'acf-repeater-generator', tab: 'html' },
  { page: 'acf-flexible-content-generator.html', href: 'acf-generator.html?preset=flexible&amp;source=acf-flexible-content-generator', source: 'acf-flexible-content-generator', tab: 'html' },
  { page: 'acf-field-group-generator.html', href: 'acf-generator.html?preset=field_group&amp;source=acf-field-group-generator', source: 'acf-field-group-generator', tab: 'php' },
  { page: 'acf-seo-fields.html', href: 'acf-generator.html?preset=seo&amp;source=acf-seo-fields', source: 'acf-seo-fields', tab: 'php' },
  { page: 'acf-faq-fields.html', href: 'acf-generator.html?preset=faq&amp;source=acf-faq-fields', source: 'acf-faq-fields', tab: 'html' },
  { page: 'acf-hero-section.html', href: 'acf-generator.html?preset=hero&amp;source=acf-hero-section', source: 'acf-hero-section', tab: 'html' },
  { page: 'acf-team-repeater.html', href: 'acf-generator.html?preset=team&amp;source=acf-team-repeater', source: 'acf-team-repeater', tab: 'html' },
  { page: 'acf-testimonials-repeater.html', href: 'acf-generator.html?preset=testimonials&amp;source=acf-testimonials-repeater', source: 'acf-testimonials-repeater', tab: 'html' },
  { page: 'acf-page-builder.html', href: 'acf-generator.html?preset=page_builder&amp;source=acf-page-builder', source: 'acf-page-builder', tab: 'html' },
  { page: 'acf-woocommerce-product-fields.html', href: 'acf-generator.html?preset=woocommerce_product&amp;source=acf-woocommerce-product-fields', source: 'acf-woocommerce-product-fields', tab: 'html' }
];

function read(relativePath) {
  return readFileSync(join(root, relativePath), 'utf8');
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function countMatches(text, pattern) {
  return (text.match(pattern) || []).length;
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function testCategoryPresetMap() {
  const category = read('acf.html');
  assert(countMatches(category, /class="acf-preset-row"/g) === expectedRoutes.length, 'acf.html must expose 12 preset rows');

  for (const route of expectedRoutes) {
    assert(category.includes(`href="${route.href}"`), `acf.html is missing route ${route.href}`);
    assert(category.includes(`href="${route.page}"`), `acf.html is missing landing link ${route.page}`);
  }
}

function testLandingCtas() {
  for (const route of expectedRoutes) {
    const landing = read(route.page);
    assert(landing.includes(`href="${route.href}"`), `${route.page} must link to ${route.href}`);
    assert(landing.includes('application/ld+json'), `${route.page} must keep structured data`);
  }
}

function testGeneratorRouteConfig() {
  const generator = read('js/acf-generator.js');

  for (const route of expectedRoutes) {
    const sourcePattern = new RegExp(`'${escapeRegex(route.source)}'\\s*:\\s*\\{[\\s\\S]*?primaryTab:\\s*'${route.tab}'`);
    assert(sourcePattern.test(generator), `landing context ${route.source} must open ${route.tab} tab`);
  }

  assert(generator.includes("page_builder: 'flexible_page'"), 'page_builder alias must resolve to flexible_page');
  assert(generator.includes("woocommerce: 'woocommerce_product'"), 'woocommerce alias must resolve to woocommerce_product');
  assert(generator.includes('switchCodeTab(landingContextCopy(source, preset, template).primaryTab);'), 'source routes must switch to landing primary tab');
  assert(generator.includes('function updateCodeExportNote'), 'export format note must be wired');
}

function testProductionExportGuards() {
  const generatorHtml = read('acf-generator.html');
  const generator = read('js/acf-generator.js');
  const production = read('js/acf-production-renderer.js');
  const audit = read('js/acf-generator-audit.js');

  assert(generatorHtml.includes('js/acf-generator.js?v=acf-ui-20260531-8'), 'acf-generator.html must load the current generator cache-buster');
  assert(generatorHtml.includes('js/acf-generator-audit.js?v=acf-ui-20260531-2'), 'acf-generator.html must load the current audit cache-buster');
  assert(generatorHtml.includes('WP-шаблон+CSS'), 'HTML export tab must be labeled as a WP template');
  assert(generatorHtml.includes('.audit-handoff'), 'generator UI must style the export handoff package');
  assert(generator.includes('generateVisualHTML({ fullDocument: false })'), 'fallback HTML export must use snippet mode');
  assert(generator.includes("return fullDocument ? ' data-style-target=\"' + key + '\"' : '';"), 'fallback editor markers must be gated by fullDocument');
  assert(production.includes('window.generateHTML = function()'), 'production renderer must own HTML export');
  assert(production.includes('output.textContent = renderProductionPHP();'), 'HTML export must render production PHP template');
  assert(production.includes('.zifra-acf-block, .zifra-acf-block * { box-sizing: border-box; }'), 'production CSS must be scoped to zifra-acf-block');
  assert(!production.includes('output.textContent = fullPreviewDoc();'), 'HTML export must not output editor preview document');
  assert(audit.includes('class="audit-handoff"'), 'audit panel must render the export handoff package');
  assert(audit.includes('ACF PHP'), 'handoff package must mention ACF PHP');
  assert(audit.includes('WP-шаблон+CSS'), 'handoff package must mention WP template and CSS');
  assert(audit.includes('JSON snapshot'), 'handoff package must mention JSON snapshot');
}

function main() {
  testCategoryPresetMap();
  testLandingCtas();
  testGeneratorRouteConfig();
  testProductionExportGuards();
  console.log('ACF smoke checks passed: 12 routes, landing CTAs, export tabs, production guards.');
}

main();

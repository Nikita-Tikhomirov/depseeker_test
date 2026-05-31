import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));

const expectedRoutes = [
  { page: 'migx-json-generator.html', preset: 'json', source: 'migx-json-generator' },
  { page: 'migx-tv-generator.html', preset: 'tv', source: 'migx-tv-generator' },
  { page: 'migx-formtabs-generator.html', preset: 'formtabs', source: 'migx-formtabs-generator' },
  { page: 'migx-grid-columns-generator.html', preset: 'grid_columns', source: 'migx-grid-columns-generator' },
  { page: 'migx-nested-generator.html', preset: 'nested', source: 'migx-nested-generator' },
  { page: 'migx-tabs-generator.html', preset: 'tabs', source: 'migx-tabs-generator' },
  { page: 'migx-gallery.html', preset: 'gallery', source: 'migx-gallery' },
  { page: 'migx-slider.html', preset: 'slider', source: 'migx-slider' },
  { page: 'migx-faq.html', preset: 'faq', source: 'migx-faq' },
  { page: 'migx-catalog.html', preset: 'catalog', source: 'migx-catalog' },
  { page: 'migx-team.html', preset: 'team', source: 'migx-team' },
  { page: 'migx-reviews.html', preset: 'reviews', source: 'migx-reviews' },
  { page: 'migx-getimagelist.html', preset: 'getimagelist', source: 'migx-getimagelist' },
  { page: 'migx-fenom-chunk.html', preset: 'fenom_chunk', source: 'migx-fenom-chunk' },
  { page: 'migx-configs.html', preset: 'configs', source: 'migx-configs' },
  { page: 'migx-image-field.html', preset: 'image_field', source: 'migx-image-field' },
  { page: 'migx-richtext-field.html', preset: 'richtext_field', source: 'migx-richtext-field' },
  { page: 'migx-validator.html', preset: 'validator', source: 'migx-validator' },
  { page: 'migx-import-json.html', preset: 'import_json', source: 'migx-import-json' },
  { page: 'migx-errors.html', preset: 'errors', source: 'migx-errors' },
  { page: 'migx-examples.html', preset: 'examples', source: 'migx-examples' }
];

function read(relativePath) {
  return readFileSync(join(root, relativePath), 'utf8');
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function countMatches(text, pattern) {
  return (text.match(pattern) || []).length;
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function landingHref(route) {
  return `migx-generator.html?preset=${route.preset}&amp;source=${route.source}`;
}

function testHubRoutes() {
  const hub = read('migx.html');
  assert(countMatches(hub, /class="acf-preset-row"/g) === expectedRoutes.length, 'migx.html must expose 21 preset rows');
  assert(hub.includes('MIGX генератор и шаблоны для MODX'), 'migx.html must be the MIGX hub');
  for (const route of expectedRoutes) {
    assert(hub.includes(`href="${route.page}"`), `migx.html is missing landing link ${route.page}`);
    assert(hub.includes(`href="${landingHref(route)}"`), `migx.html is missing generator route ${landingHref(route)}`);
  }
}

function testLandingPages() {
  for (const route of expectedRoutes) {
    const page = read(route.page);
    assert(page.includes(`href="${landingHref(route)}"`), `${route.page} must link to ${landingHref(route)}`);
    assert(page.includes('application/ld+json'), `${route.page} must include structured data`);
    assert(page.includes('migx.html'), `${route.page} must link back to the MIGX hub`);
    assert(page.includes('MIGX'), `${route.page} must contain MIGX copy`);
  }
}

function testSitemapRoutes() {
  const sitemap = read('sitemap.xml');
  const robots = read('robots.txt');
  assert(sitemap.includes('https://zifra.example.com/migx.html'), 'sitemap must include migx.html');
  assert(sitemap.includes('https://zifra.example.com/migx-generator.html'), 'sitemap must include migx-generator.html');
  assert(robots.includes('Sitemap: https://zifra.example.com/sitemap.xml'), 'robots.txt must expose the sitemap');
  for (const route of expectedRoutes) {
    assert(sitemap.includes(`https://zifra.example.com/${route.page}`), `sitemap must include ${route.page}`);
  }
}

function testTechnicalSeo() {
  const hub = read('migx.html');
  const generator = read('migx-generator.html');
  assert(
    hub.includes('<link rel="canonical" href="https://zifra.example.com/migx.html">'),
    'migx.html must expose a canonical URL'
  );
  assert(
    generator.includes('<link rel="canonical" href="https://zifra.example.com/migx-generator.html">'),
    'migx-generator.html canonical must match the sitemap URL'
  );
  assert(
    generator.includes('<meta property="og:url" content="https://zifra.example.com/migx-generator.html">'),
    'migx-generator.html Open Graph URL must match the canonical URL'
  );
  assert(!generator.includes('https://zifra.example.com/tools/migx-generator'), 'legacy MIGX generator URL must not remain in metadata');

  for (const route of expectedRoutes) {
    const page = read(route.page);
    assert(
      page.includes(`<link rel="canonical" href="https://zifra.example.com/${route.page}">`),
      `${route.page} must expose a canonical URL`
    );
    assert(page.includes('<meta name="robots" content="index, follow">'), `${route.page} must be indexable`);
  }
}

function testGeneratorWiring() {
  const html = read('migx-generator.html');
  const js = read('js/migx-generator.js');
  assert(html.includes('id="validation-panel"'), 'migx-generator.html must expose validation panel');
  assert(html.includes('data-tab="formtabs"'), 'migx-generator.html must expose Form Tabs export tab');
  assert(html.includes('data-tab="grid_columns"'), 'migx-generator.html must expose Grid Columns export tab');
  assert(html.includes('data-tab="fenom"'), 'migx-generator.html must expose Fenom export tab');
  assert(js.includes('var MIGX_PRESETS = {'), 'js/migx-generator.js must define MIGX_PRESETS');
  assert(js.includes('function applyPresetFromURL()'), 'js/migx-generator.js must load URL presets');
  assert(js.includes('function validateMIGXConfig()'), 'js/migx-generator.js must validate the current config');
  assert(js.includes('function generateFormTabsJSON()'), 'js/migx-generator.js must generate Form Tabs export');
  assert(js.includes('function generateGridColumnsJSON()'), 'js/migx-generator.js must generate Grid Columns export');
  assert(js.includes('function generateFenomChunk()'), 'js/migx-generator.js must generate Fenom chunk export');
  for (const route of expectedRoutes) {
    const pattern = new RegExp(`${escapeRegex(route.preset)}\\s*:\\s*\\{[\\s\\S]*?source`);
    assert(pattern.test(js), `MIGX_PRESETS must include preset ${route.preset}`);
  }
}

function testInternalEntryLinks() {
  const index = read('index.html');
  const acf = read('acf.html');
  assert(countMatches(index, /href="migx\.html"/g) >= 3, 'index.html must link to the MIGX hub from multiple entry points');
  assert(countMatches(index, /href="acf\.html"/g) >= 3, 'index.html must keep ACF hub entry links');
  assert(acf.includes('href="migx.html"'), 'acf.html must cross-link to the MIGX hub');
  assert(
    acf.includes('href="migx-generator.html?preset=gallery&amp;source=acf-related"'),
    'acf.html must link to a concrete MIGX generator preset'
  );
  assert(acf.includes('href="migx-getimagelist.html"'), 'acf.html must link to a MIGX supporting article');
}

function main() {
  testHubRoutes();
  testLandingPages();
  testSitemapRoutes();
  testTechnicalSeo();
  testGeneratorWiring();
  testInternalEntryLinks();
  console.log('MIGX smoke checks passed: hub, 21 landings, sitemap, technical SEO, generator wiring, internal entry links.');
}

main();

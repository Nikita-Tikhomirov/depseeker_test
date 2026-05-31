import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
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

function parseFirstJsonLd(html, label) {
  const match = html.match(/<script type="application\/ld\+json">\s*([\s\S]*?)\s*<\/script>/);
  assert(match, `${label} must include JSON-LD`);
  try {
    return JSON.parse(match[1]);
  } catch (error) {
    throw new Error(`${label} JSON-LD must be valid JSON: ${error.message}`);
  }
}

function parseAllJsonLd(html, label) {
  const matches = [...html.matchAll(/<script type="application\/ld\+json">\s*([\s\S]*?)\s*<\/script>/g)];
  assert(matches.length > 0, `${label} must include JSON-LD`);
  return matches.map((match, index) => {
    try {
      return JSON.parse(match[1]);
    } catch (error) {
      throw new Error(`${label} JSON-LD #${index + 1} must be valid JSON: ${error.message}`);
    }
  });
}

function assertSitemapEntry(sitemap, loc, { lastmod, changefreq, priority }) {
  const blockPattern = new RegExp(`<url>\\s*<loc>${escapeRegex(loc)}</loc>[\\s\\S]*?</url>`);
  const match = sitemap.match(blockPattern);
  assert(match, `sitemap must include ${loc}`);
  assert(match[0].includes(`<lastmod>${lastmod}</lastmod>`), `${loc} must expose lastmod ${lastmod}`);
  assert(match[0].includes(`<changefreq>${changefreq}</changefreq>`), `${loc} must expose changefreq ${changefreq}`);
  assert(match[0].includes(`<priority>${priority}</priority>`), `${loc} must expose priority ${priority}`);
}

function testHubRoutes() {
  const hub = read('migx.html');
  assert(countMatches(hub, /class="acf-preset-row"/g) === expectedRoutes.length, 'migx.html must expose 21 preset rows');
  assert(hub.includes('MIGX генератор и шаблоны для MODX'), 'migx.html must be the MIGX hub');
  assert(hub.includes('id="faq"'), 'migx.html must expose a FAQ section');
  assert(countMatches(hub, /class="acf-faq-item"/g) === 4, 'migx.html must expose 4 FAQ items');
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
  assert(robots.includes('Sitemap: https://zifra.example.com/sitemap.xml'), 'robots.txt must expose the sitemap');
  assertSitemapEntry(sitemap, 'https://zifra.example.com/migx.html', {
    lastmod: '2026-05-31',
    changefreq: 'weekly',
    priority: '0.85'
  });
  assertSitemapEntry(sitemap, 'https://zifra.example.com/migx-generator.html', {
    lastmod: '2026-05-31',
    changefreq: 'weekly',
    priority: '0.8'
  });
  for (const route of expectedRoutes) {
    assertSitemapEntry(sitemap, `https://zifra.example.com/${route.page}`, {
      lastmod: '2026-05-31',
      changefreq: 'weekly',
      priority: '0.75'
    });
  }
}

function testTechnicalSeo() {
  const hub = read('migx.html');
  const generator = read('migx-generator.html');
  const hubSchemas = parseAllJsonLd(hub, 'migx.html');
  const hubFaqSchema = hubSchemas.find((schema) => schema['@type'] === 'FAQPage');
  const generatorSchema = parseFirstJsonLd(generator, 'migx-generator.html');
  assert(
    hub.includes('<link rel="canonical" href="https://zifra.example.com/migx.html">'),
    'migx.html must expose a canonical URL'
  );
  assert(hubFaqSchema, 'migx.html must expose FAQPage JSON-LD');
  assert(Array.isArray(hubFaqSchema.mainEntity), 'migx.html FAQPage JSON-LD must expose mainEntity');
  assert(hubFaqSchema.mainEntity.length === 4, 'migx.html FAQPage JSON-LD must expose 4 questions');
  for (const question of ['Form Tabs', 'Grid Columns', 'nested MIGX', 'getImageList', 'Fenom', 'валидатор MIGX JSON']) {
    assert(
      JSON.stringify(hubFaqSchema).includes(question),
      `migx.html FAQPage JSON-LD must include ${question}`
    );
  }
  assert(
    generator.includes('<link rel="canonical" href="https://zifra.example.com/migx-generator.html">'),
    'migx-generator.html canonical must match the sitemap URL'
  );
  assert(
    generator.includes('<meta property="og:url" content="https://zifra.example.com/migx-generator.html">'),
    'migx-generator.html Open Graph URL must match the canonical URL'
  );
  assert(!generator.includes('https://zifra.example.com/tools/migx-generator'), 'legacy MIGX generator URL must not remain in metadata');
  assert(generatorSchema['@type'] === 'SoftwareApplication', 'MIGX generator JSON-LD must describe a SoftwareApplication');
  assert(generatorSchema.url === 'https://zifra.example.com/migx-generator.html', 'MIGX generator JSON-LD must expose the canonical URL');
  assert(generatorSchema.isAccessibleForFree === true, 'MIGX generator JSON-LD must mark the tool as free');
  assert(Array.isArray(generatorSchema.featureList), 'MIGX generator JSON-LD must expose featureList');
  for (const feature of ['MIGX JSON', 'Form Tabs', 'Grid Columns', 'getImageList', 'Fenom chunk', 'MIGX readiness score', 'Shareable MIGX config URL']) {
    assert(generatorSchema.featureList.includes(feature), `MIGX generator JSON-LD must include feature ${feature}`);
  }
  assert(
    generatorSchema.potentialAction?.target === 'https://zifra.example.com/migx-generator.html',
    'MIGX generator JSON-LD must expose a UseAction target'
  );

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
  const conversion = read('js/conversion-events.js');
  assert(html.includes('js/conversion-events.js?v=launch-analytics-20260531-1'), 'migx-generator.html must load conversion tracking helper');
  assert(conversion.includes('window.trackGeneratorEvent'), 'conversion helper must expose trackGeneratorEvent');
  assert(conversion.includes('window.dataLayer.push'), 'conversion helper must push events to dataLayer');
  assert(conversion.includes('new CustomEvent'), 'conversion helper must dispatch browser events for local QA');
  assert(html.includes('id="validation-panel"'), 'migx-generator.html must expose validation panel');
  assert(html.includes('id="validation-score"'), 'migx-generator.html must expose readiness score');
  assert(html.includes('id="validation-metrics"'), 'migx-generator.html must expose validation metrics');
  assert(html.includes('data-action="copy-audit"'), 'migx-generator.html must expose audit checklist copy action');
  assert(html.includes('data-action="copy-share-link"'), 'migx-generator.html must expose shareable config link action');
  assert(html.includes('fonts.googleapis.com/css2?family=Material+Symbols+Outlined'), 'migx-generator.html must load Material Symbols for tool icons');
  assert(html.includes('id="code-export-note"'), 'migx-generator.html must explain the active export package');
  assert(html.includes('data-tab="formtabs"'), 'migx-generator.html must expose Form Tabs export tab');
  assert(html.includes('data-tab="grid_columns"'), 'migx-generator.html must expose Grid Columns export tab');
  assert(html.includes('data-tab="fenom"'), 'migx-generator.html must expose Fenom export tab');
  assert(js.includes('var MIGX_PRESETS = {'), 'js/migx-generator.js must define MIGX_PRESETS');
  assert(js.includes('function applyPresetFromURL()'), 'js/migx-generator.js must load URL presets');
  assert(js.includes('function validateMIGXConfig()'), 'js/migx-generator.js must validate the current config');
  assert(js.includes('function renderValidationSummary('), 'js/migx-generator.js must render readiness score');
  assert(js.includes('function copyAuditChecklist()'), 'js/migx-generator.js must copy the audit checklist');
  assert(js.includes('function buildShareURL()'), 'js/migx-generator.js must build shareable config URLs');
  assert(js.includes('function copyShareText('), 'js/migx-generator.js must copy shareable config URLs with fallback');
  assert(js.includes('function restoreSharedStateFromURL()'), 'js/migx-generator.js must restore shareable config URLs');
  assert(js.includes('function sanitizeSharedFields('), 'js/migx-generator.js must sanitize shared fields before rendering');
  assert(js.includes('function buildGetImageListPackage()'), 'js/migx-generator.js must build a complete getImageList package');
  assert(js.includes('function renderGetImageListTpl('), 'js/migx-generator.js must render the getImageList row tpl');
  assert(js.includes('&value=`[[+'), 'getImageList export must include nested MIGX value handoff examples');
  assert(js.includes('function updateExportNote()'), 'js/migx-generator.js must keep export notes in sync with tabs');
  assert(js.includes("trackGeneratorEvent('migx_preset_loaded'"), 'MIGX preset loads must be tracked');
  assert(js.includes("trackGeneratorEvent('migx_code_copied'"), 'MIGX copy action must be tracked');
  assert(js.includes("trackGeneratorEvent('migx_code_downloaded'"), 'MIGX download action must be tracked');
  assert(js.includes("trackGeneratorEvent('migx_share_link_copied'"), 'MIGX share link action must be tracked');
  assert(js.includes("trackGeneratorEvent('migx_export_tab_changed'"), 'MIGX export tab changes must be tracked');
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

function testMigxPageGeneratorMatchesCheckedInPages() {
  const script = `
from pathlib import Path
import importlib.util

root = Path.cwd()
spec = importlib.util.spec_from_file_location("migxgen", root / "tools" / "generate_migx_pages.py")
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)
checks = [("migx.html", mod.render_hub())]
for page in mod.PAGES:
    checks.append((f"{page['slug']}.html", mod.render_page(page)))
changed = []
for rel, generated in checks:
    current = (root / rel).read_text(encoding="utf-8").replace("\\r\\n", "\\n")
    expected = generated.replace("\\r\\n", "\\n")
    if current != expected:
        changed.append(rel)
if changed:
    raise SystemExit("generator output drift: " + ", ".join(changed))
print("migx generator output matches")
`;
  const output = execFileSync('python', ['-c', script], { cwd: root, encoding: 'utf8' });
  assert(output.includes('migx generator output matches'), 'tools/generate_migx_pages.py must match checked-in MIGX generated files');
}

function main() {
  testHubRoutes();
  testLandingPages();
  testSitemapRoutes();
  testTechnicalSeo();
  testGeneratorWiring();
  testInternalEntryLinks();
  testMigxPageGeneratorMatchesCheckedInPages();
  console.log('MIGX smoke checks passed: hub, 21 landings, sitemap, technical SEO, generator wiring, internal entry links.');
}

main();

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

const specificLandingCopy = [
  { page: 'acf-php-generator.html', required: ['functions.php', 'acf_add_local_field_group', 'Location rules'] },
  { page: 'acf-json-generator.html', required: ['acf-json', 'синхронизация', 'field keys'] },
  { page: 'acf-repeater-generator.html', required: ['повторяемый список', 'sub fields', 'цикл вывода'] },
  { page: 'acf-flexible-content-generator.html', required: ['flexible content', 'layouts', 'секции страницы'] },
  { page: 'acf-field-group-generator.html', required: ['group key', 'location rules', 'field names'] },
  { page: 'acf-hero-section.html', required: ['первый экран', 'CTA', 'изображение hero'] },
  { page: 'acf-faq-fields.html', required: ['FAQPage schema', 'вопрос-ответ', 'аккордеон FAQ'] },
  { page: 'acf-seo-fields.html', required: ['canonical', 'robots', 'Open Graph'] },
  { page: 'acf-team-repeater.html', required: ['карточки команды', 'фото сотрудника', 'социальные ссылки'] },
  { page: 'acf-testimonials-repeater.html', required: ['отзывы клиентов', 'рейтинг', 'автор отзыва'] },
  { page: 'acf-page-builder.html', required: ['page builder', 'порядок секций', 'шаблон вывода'] },
  { page: 'acf-woocommerce-product-fields.html', required: ['характеристики товара', 'инструкции', 'FAQ товара'] }
];

const generatorContextRequirements = [
  { source: 'acf-php-generator', required: ['acf_add_local_field_group', 'functions.php', 'Location rules'] },
  { source: 'acf-json-generator', required: ['acf-json', 'синхронизация', 'field keys'] },
  { source: 'acf-repeater-generator', required: ['sub fields', 'цикл вывода', 'повторяемый список'] },
  { source: 'acf-flexible-content-generator', required: ['flexible content', 'layouts', 'секции страницы'] },
  { source: 'acf-field-group-generator', required: ['group key', 'field names', 'location rules'] },
  { source: 'acf-seo-fields', required: ['canonical', 'robots', 'Open Graph'] },
  { source: 'acf-faq-fields', required: ['FAQPage schema', 'аккордеон FAQ', 'вопрос-ответ'] },
  { source: 'acf-hero-section', required: ['первый экран', 'CTA', 'изображение hero'] },
  { source: 'acf-team-repeater', required: ['карточки команды', 'фото сотрудника', 'социальные ссылки'] },
  { source: 'acf-testimonials-repeater', required: ['отзывы клиентов', 'рейтинг', 'автор отзыва'] },
  { source: 'acf-page-builder', required: ['page builder', 'порядок секций', 'шаблон вывода'] },
  { source: 'acf-woocommerce-product-fields', required: ['характеристики товара', 'инструкции', 'FAQ товара'] }
];

const acfSitemapPages = ['acf.html', 'acf-generator.html', ...expectedRoutes.map((route) => route.page)];
const acfSitemapLastmod = '2026-05-31';

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

function testSitemapLastmod() {
  const sitemap = read('sitemap.xml');

  for (const page of acfSitemapPages) {
    const loc = `https://zifra.example.com/${page}`;
    const locIndex = sitemap.indexOf(`<loc>${loc}</loc>`);
    assert(locIndex !== -1, `sitemap.xml must include ${loc}`);

    const nextUrlIndex = sitemap.indexOf('<url>', locIndex + loc.length);
    const block = nextUrlIndex === -1 ? sitemap.slice(locIndex) : sitemap.slice(locIndex, nextUrlIndex);
    assert(block.includes(`<lastmod>${acfSitemapLastmod}</lastmod>`), `sitemap.xml must include ${acfSitemapLastmod} lastmod for ${page}`);
  }
}

function testSpecificLandingCopy() {
  const genericPhrase = 'Страница закрывает конкретный низкочастотный запрос';
  for (const item of specificLandingCopy) {
    const landing = read(item.page);
    assert(!landing.includes(genericPhrase), `${item.page} must not use generic SEO placeholder copy`);
    for (const phrase of item.required) {
      assert(landing.includes(phrase), `${item.page} must include specific phrase: ${phrase}`);
    }
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

function testGeneratorLandingContextCopy() {
  const generator = read('js/acf-generator.js');

  for (const item of generatorContextRequirements) {
    const blockPattern = new RegExp(`'${escapeRegex(item.source)}'\\s*:\\s*\\{[\\s\\S]*?primaryTab:\\s*'[^']+'[\\s\\S]*?\\}`);
    const match = generator.match(blockPattern);
    assert(match, `landing context ${item.source} must have a copy block`);

    for (const phrase of item.required) {
      assert(match[0].includes(phrase), `landing context ${item.source} must include specific phrase: ${phrase}`);
    }
  }
}

function testProductionExportGuards() {
  const generatorHtml = read('acf-generator.html');
  const generator = read('js/acf-generator.js');
  const production = read('js/acf-production-renderer.js');
  const audit = read('js/acf-generator-audit.js');

  assert(generatorHtml.includes('js/acf-generator.js?v=acf-ui-20260531-10'), 'acf-generator.html must load the current generator cache-buster');
  assert(generatorHtml.includes('js/acf-generator-audit.js?v=acf-ui-20260531-3'), 'acf-generator.html must load the current audit cache-buster');
  assert(generatorHtml.includes('WP-шаблон+CSS'), 'HTML export tab must be labeled as a WP template');
  assert(generatorHtml.includes('.audit-handoff'), 'generator UI must style the export handoff package');
  assert(generator.includes('generateVisualHTML({ fullDocument: false })'), 'fallback HTML export must use snippet mode');
  assert(generator.includes("return fullDocument ? ' data-style-target=\"' + key + '\"' : '';"), 'fallback editor markers must be gated by fullDocument');
  assert(generator.includes('code = window.renderProductionPHP();'), 'HTML download fallback must use production WP template');
  assert(generator.includes("ext = 'php'; mime = 'text/x-php';"), 'HTML download fallback must save WP template as PHP');
  assert(!generator.includes('code = generateVisualHTML({ fullDocument: false });'), 'HTML download fallback must not download editor preview snippets');
  assert(production.includes('window.generateHTML = function()'), 'production renderer must own HTML export');
  assert(production.includes('output.textContent = renderProductionPHP();'), 'HTML export must render production PHP template');
  assert(production.includes('.zifra-acf-block, .zifra-acf-block * { box-sizing: border-box; }'), 'production CSS must be scoped to zifra-acf-block');
  assert(!production.includes('output.textContent = fullPreviewDoc();'), 'HTML export must not output editor preview document');
  assert(audit.includes('class="audit-handoff"'), 'audit panel must render the export handoff package');
  assert(audit.includes('ACF PHP'), 'handoff package must mention ACF PHP');
  assert(audit.includes('WP-шаблон+CSS'), 'handoff package must mention WP template and CSS');
  assert(audit.includes('JSON snapshot'), 'handoff package must mention JSON snapshot');
  assert(audit.includes('Скачать пакет'), 'handoff action must be labeled as a downloadable package');
  assert(audit.includes('-handoff.json'), 'handoff package filename must reflect the handoff payload');
  assert(audit.includes('Handoff-пакет проекта скачан'), 'handoff toast must describe the package download');
  assert(!audit.includes('inventory_2</span> Snapshot</button>'), 'handoff action must not use the vague Snapshot label');
  assert(audit.includes('acf_json'), 'snapshot must include a dedicated ACF JSON payload');
  assert(audit.includes('wp_template'), 'snapshot must include a dedicated WP template payload');
  assert(audit.includes('production_css'), 'snapshot must include a dedicated production CSS payload');
  assert(audit.includes('window.renderProductionPHP'), 'snapshot must use the production renderer for the WP template');
  assert(audit.includes('window.generateProductionCSS'), 'snapshot must include generated production CSS');
}

function main() {
  testCategoryPresetMap();
  testLandingCtas();
  testSitemapLastmod();
  testSpecificLandingCopy();
  testGeneratorRouteConfig();
  testGeneratorLandingContextCopy();
  testProductionExportGuards();
  console.log('ACF smoke checks passed: 12 routes, landing CTAs, sitemap lastmod, context copy, export tabs, production guards.');
}

main();

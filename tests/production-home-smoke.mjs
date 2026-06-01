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

function visibleText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function assertProductionHeader(page, html) {
  const header = html.match(/<header class="header">[\s\S]*?<\/header>/)?.[0] ?? '';
  for (const href of [
    'index.html',
    'index.html#catalog',
    'acf.html',
    'migx.html',
    'acf-generator.html',
    'acf-php-generator.html',
    'acf-json-generator.html',
    'migx-generator.html',
    'migx-json-generator.html',
    'migx-formtabs-generator.html'
  ]) {
    assert(html.includes(`href="${href}"`), `${page} must include shared navigation link ${href}`);
    assert(header.includes(`href="${href}"`), `${page} header must include shared navigation link ${href}`);
  }

  assert(header.includes('class="nav-dropdown"'), `${page} header must expose utilities as a dropdown`);
  assert(header.includes('aria-controls="utilities-menu"'), `${page} utilities dropdown must be accessible`);
  assert(header.includes('ACF / WordPress'), `${page} utilities dropdown must group ACF tools`);
  assert(header.includes('MODX / MIGX'), `${page} utilities dropdown must group MODX tools`);

  for (const forbidden of [
    /Каталог\s*▾/,
  ]) {
    assert(!forbidden.test(header), `${page} header must not expose tool-specific or old dropdown navigation: ${forbidden}`);
  }

  for (const forbidden of [
    /Популярное/,
    /Новинки/,
    /Цены/,
    /Корзина/,
    /Избранное/,
    /Поиск товаров/,
    /Войти/,
    /href="#"/
  ]) {
    assert(!forbidden.test(html), `${page} must not expose old marketplace header content: ${forbidden}`);
  }
}

function testHomepageProductionCopy() {
  const html = read('index.html');
  const layoutCss = read('css/layout.css');
  const text = visibleText(html);

  assertProductionHeader('index.html', html);
  assert(layoutCss.includes('.nav-dropdown-menu::before'), 'desktop dropdown must keep a hover bridge between trigger and menu');
  assert(layoutCss.includes('top: -32px') && layoutCss.includes('height: 32px'), 'desktop dropdown hover bridge must cover the visual gap');
  assert(text.includes('Цифровые продукты для сайтов, CMS и разработки'), 'index.html must position the site as a broad digital product catalog');
  assert(text.includes('ACF и MIGX размещены как отдельные CMS-разделы каталога'), 'index.html must present ACF/MIGX as catalog sections, not the whole site');
  assert(text.includes('Все карточки ведут на существующие страницы каталога'), 'index.html must keep homepage links tied to real catalog routes');

  for (const forbidden of [
    /Маркетплейс цифровых товаров/,
    /50 000/,
    /120 000/,
    /3D-модели/,
    /Онлайн-курсы/,
    /Музыка/,
    /Покупателей/,
    /Топ продаж/,
    /Свежие поступления/
  ]) {
    assert(!forbidden.test(text), `index.html must not keep template marketplace copy: ${forbidden}`);
  }
}

function testSharedGeneratorNavigation() {
  for (const page of ['acf.html', 'migx.html', 'acf-generator.html', 'migx-generator.html']) {
    assertProductionHeader(page, read(page));
  }
}

testHomepageProductionCopy();
testSharedGeneratorNavigation();
console.log('production home smoke ok: homepage and shared navigation are catalog-focused');

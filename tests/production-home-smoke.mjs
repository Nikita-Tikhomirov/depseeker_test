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
  for (const href of ['index.html', 'index.html#catalog', 'index.html#utilities', 'acf.html', 'migx.html']) {
    assert(html.includes(`href="${href}"`), `${page} must include shared navigation link ${href}`);
    assert(header.includes(`href="${href}"`), `${page} header must include shared navigation link ${href}`);
  }

  for (const forbidden of [
    /Каталог\s*▾/,
    /ACF генератор<\/a>/,
    /MIGX генератор<\/a>/,
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
  const text = visibleText(html);

  assertProductionHeader('index.html', html);
  assert(text.includes('Каталог цифровых продуктов и веб-утилит'), 'index.html must position the site as a broad digital product catalog');
  assert(text.includes('ACF и MIGX — первые опубликованные категории'), 'index.html must present ACF/MIGX as current catalog categories, not the whole site');
  assert(text.includes('Никаких ссылок на корзину, кабинет, поиск или пустые разделы'), 'index.html must explicitly guard against empty marketplace navigation');

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

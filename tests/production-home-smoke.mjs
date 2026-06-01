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
  for (const href of ['index.html', 'acf.html', 'migx.html', 'acf-generator.html', 'migx-generator.html']) {
    assert(html.includes(`href="${href}"`), `${page} must include shared navigation link ${href}`);
  }

  for (const forbidden of [
    /Каталог\s*▾/,
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
  assert(text.includes('Генераторы ACF и MIGX'), 'index.html must position the site around ACF and MIGX generators');
  assert(text.includes('Это магазин цифровых товаров? Нет.'), 'index.html must explicitly remove the marketplace positioning');

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
console.log('production home smoke ok: homepage and shared navigation are production-focused');

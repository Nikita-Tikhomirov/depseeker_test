import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const appShellPages = new Set(['acf-generator.html', 'acf-generator-test.html', 'migx-generator.html']);
const pageFiles = readdirSync(root)
  .filter((file) => /^(acf|migx).*\.html$/.test(file))
  .filter((file) => !appShellPages.has(file))
  .sort();

const bannedCopy = [
  /lorem ipsum/i,
  /заглушк/i,
  /тестовый текст/i,
  /пример текста/i,
  /страница откроет генератор/i,
  /открыть страницу/i,
  /seo-страница\s*(?:->|→)\s*пресет генератора/i,
  /карта пресетов/i,
  /todo/i,
  /fixme/i,
  /undefined/i,
  /null/i
];

function read(relativePath) {
  return readFileSync(join(root, relativePath), 'utf8');
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function stripTechnicalBlocks(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<pre[\s\S]*?<\/pre>/gi, ' ')
    .replace(/<code[\s\S]*?<\/code>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extract(html, pattern, label, page) {
  const match = html.match(pattern);
  assert(match, `${page} must include ${label}`);
  return match[1].replace(/\s+/g, ' ').trim();
}

function testSeoCopyQuality() {
  assert(pageFiles.length >= 35, 'SEO copy smoke must cover the ACF and MIGX content clusters');

  const seenTitles = new Set();
  const seenCanonicals = new Set();

  for (const page of pageFiles) {
    const html = read(page);
    const visibleText = stripTechnicalBlocks(html);
    const title = extract(html, /<title>([\s\S]*?)<\/title>/i, 'title', page);
    const description = extract(html, /<meta name="description" content="([^"]+)"/i, 'meta description', page);
    const h1 = extract(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i, 'H1', page);
    const canonical = extract(html, /<link rel="canonical" href="([^"]+)"/i, 'canonical', page);
    const generatorHref = page.startsWith('acf') ? 'acf-generator.html' : 'migx-generator.html';

    assert(title.length >= 20 && title.length <= 90, `${page} title must be SEO-sized, got ${title.length}`);
    assert(description.length >= 75 && description.length <= 180, `${page} description must be SEO-sized, got ${description.length}`);
    assert(h1.length >= 8 && h1.length <= 90, `${page} H1 must be specific, got ${h1.length}`);
    assert(canonical.endsWith(`/${page}`), `${page} canonical must point to the page itself`);
    assert(!seenTitles.has(title), `${page} title must be unique: ${title}`);
    assert(!seenCanonicals.has(canonical), `${page} canonical must be unique: ${canonical}`);
    seenTitles.add(title);
    seenCanonicals.add(canonical);

    assert(html.includes('application/ld+json'), `${page} must keep structured data`);
    assert(html.includes(generatorHref), `${page} must include a conversion route to ${generatorHref}`);
    assert(visibleText.length >= 1800, `${page} must have enough useful visible copy, got ${visibleText.length} chars`);

    for (const pattern of bannedCopy) {
      assert(!pattern.test(visibleText), `${page} must not expose weak placeholder copy matching ${pattern}`);
    }
  }
}

testSeoCopyQuality();
console.log(`seo copy smoke ok: ${pageFiles.length} pages checked`);

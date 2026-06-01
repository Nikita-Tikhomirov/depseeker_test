import { mkdtempSync, readFileSync, rmSync, cpSync, existsSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function run(args, cwd) {
  return execFileSync('python', ['tools/scaffold_catalog.py', ...args], {
    cwd,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe']
  });
}

const dir = mkdtempSync(join(tmpdir(), 'catalog-scaffold-'));
try {
  const baseFiles = [
    'tools',
    'css',
    'js',
    'site.config.json',
    'catalog.registry.json',
    'sitemap.xml',
    'robots.txt',
    'index.html',
    'about.html',
    'contacts.html',
    'privacy.html',
    'terms.html'
  ];
  const htmlFiles = readdirSync(root).filter((file) => file.endsWith('.html'));
  for (const name of [...baseFiles, ...htmlFiles]) {
    cpSync(join(root, name), join(dir, name), { recursive: true });
  }

  run([
    'category',
    'seo',
    'SEO инструменты',
    'Раздел с SEO-утилитами, генераторами метаданных и практическими материалами для поискового трафика.'
  ], dir);
  run([
    'item',
    'seo',
    'schema-generator',
    'Schema.org генератор',
    'Черновик утилиты для генерации структурированных данных, FAQ, breadcrumbs и JSON-LD разметки.',
    '--type',
    'utility',
    '--nav'
  ], dir);

  assert(existsSync(join(dir, 'seo.html')), 'category page must be created');
  assert(existsSync(join(dir, 'seo-schema-generator.html')), 'item page must be created');
  const registry = JSON.parse(readFileSync(join(dir, 'catalog.registry.json'), 'utf8'));
  const seo = registry.categories.find((category) => category.slug === 'seo');
  assert(seo, 'registry must include seo category');
  assert(seo.status === 'draft', 'new category must start as draft');
  assert(seo.items.some((item) => item.path === 'seo-schema-generator.html' && item.status === 'draft'), 'registry must include draft scaffolded item');
  assert(readFileSync(join(dir, 'seo.html'), 'utf8').includes('<meta name="robots" content="noindex, follow">'), 'draft pages must be noindex');
  assert(readFileSync(join(dir, 'sitemap.xml'), 'utf8').includes('https://zifra.example.com/seo-schema-generator.html'), 'sitemap must include scaffolded item');
  assert(readFileSync(join(dir, 'robots.txt'), 'utf8').includes('Clean-param: qa&preset&source /'), 'robots must be regenerated');
  execFileSync('python', ['tools/check_catalog_registry.py'], { cwd: dir, stdio: 'pipe' });
  console.log('catalog scaffold smoke passed');
} finally {
  rmSync(dir, { recursive: true, force: true });
}

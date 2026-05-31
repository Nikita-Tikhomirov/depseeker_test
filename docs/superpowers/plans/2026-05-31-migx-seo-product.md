# MIGX SEO Product Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the full MIGX SEO category, 21 landing pages, URL presets, validator, and export helpers for the existing MODX MIGX generator.

**Architecture:** Reuse the ACF cluster pattern: a Python generator owns page metadata and renders static HTML pages plus sitemap entries, while `js/migx-generator.js` owns browser-side presets, validation, and export modes. Smoke tests read files directly and verify routing, structured data, generator presets, and export wiring.

**Tech Stack:** Static HTML/CSS/JS, Python 3.10+ standard library, Node.js smoke tests, existing shared CSS files.

---

## File Structure

- Create: `tools/generate_migx_pages.py` — source of truth for MIGX page metadata, HTML rendering, and sitemap updates.
- Create: `tests/migx-smoke.mjs` — file-based smoke tests for generated pages and generator wiring.
- Create: `migx.html` — generated MIGX category hub.
- Create: `migx-json-generator.html`, `migx-tv-generator.html`, `migx-formtabs-generator.html`, `migx-grid-columns-generator.html`, `migx-nested-generator.html`, `migx-tabs-generator.html`, `migx-gallery.html`, `migx-slider.html`, `migx-faq.html`, `migx-catalog.html`, `migx-team.html`, `migx-reviews.html`, `migx-getimagelist.html`, `migx-fenom-chunk.html`, `migx-configs.html`, `migx-image-field.html`, `migx-richtext-field.html`, `migx-validator.html`, `migx-import-json.html`, `migx-errors.html`, `migx-examples.html` — generated landing pages.
- Modify: `migx-generator.html` — add source/preset message, validator panel, extra export tabs, and cache-busted script URL.
- Modify: `js/migx-generator.js` — add URL preset loading, validation helpers, and export modes.
- Modify: `sitemap.xml` — add MIGX hub, generator, and generated landing pages.

---

### Task 1: MIGX Smoke Test Skeleton

**Files:**
- Create: `tests/migx-smoke.mjs`

- [ ] **Step 1: Write the failing smoke test**

Create `tests/migx-smoke.mjs` with:

```js
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
  assert(sitemap.includes('https://zifra.example.com/migx.html'), 'sitemap must include migx.html');
  assert(sitemap.includes('https://zifra.example.com/migx-generator.html'), 'sitemap must include migx-generator.html');
  for (const route of expectedRoutes) {
    assert(sitemap.includes(`https://zifra.example.com/${route.page}`), `sitemap must include ${route.page}`);
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

function main() {
  testHubRoutes();
  testLandingPages();
  testSitemapRoutes();
  testGeneratorWiring();
  console.log('MIGX smoke checks passed: hub, 21 landings, sitemap, generator wiring.');
}

main();
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node tests/migx-smoke.mjs`

Expected: FAIL with an error like `ENOENT: no such file or directory, open '...\migx.html'`.

- [ ] **Step 3: Commit the failing test**

```bash
git add tests/migx-smoke.mjs
git commit -m "test: add migx smoke coverage"
```

---

### Task 2: MIGX Page Generator

**Files:**
- Create: `tools/generate_migx_pages.py`
- Create: `migx.html`
- Create: 21 `migx-*.html` landing pages listed in the file structure
- Modify: `sitemap.xml`

- [ ] **Step 1: Write the generator metadata and helpers**

Create `tools/generate_migx_pages.py` with this structure:

```python
from __future__ import annotations

import html
import json
from pathlib import Path
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
SITE = "https://zifra.example.com"
SITEMAP_NS = "http://www.sitemaps.org/schemas/sitemap/0.9"

PAGES = [
    {
        "slug": "migx-json-generator",
        "preset": "json",
        "query": "migx json generator",
        "title": "MIGX JSON генератор для MODX",
        "h1": "MIGX JSON генератор",
        "description": "Соберите MIGX JSON для MODX Revolution: поля, табы, вложенные MIGX и готовая структура для вставки в TV.",
        "intent": "Нужен готовый JSON без ручной сборки массива полей.",
        "deliverables": ["MIGX fields JSON", "Проверка fieldname", "Экспорт для TV"],
        "example": "[{\"fieldname\":\"title\",\"caption\":\"Заголовок\",\"inputTVtype\":\"text\"}]",
    },
    {
        "slug": "migx-tv-generator",
        "preset": "tv",
        "query": "migx tv modx",
        "title": "MIGX TV генератор для MODX",
        "h1": "MIGX TV генератор",
        "description": "Настройте поля для MIGX TV: Form Tabs, Grid Columns, JSON-конфигурация и пример вывода.",
        "intent": "Нужно быстро подготовить конфигурацию TV под MIGX.",
        "deliverables": ["Form Tabs", "Grid Columns", "TV-ready JSON"],
        "example": "[{\"caption\":\"Контент\",\"fields\":[{\"field\":\"title\",\"caption\":\"Заголовок\"}]}]",
    },
    {
        "slug": "migx-formtabs-generator",
        "preset": "formtabs",
        "query": "migx formtabs generator",
        "title": "MIGX Form Tabs генератор",
        "h1": "MIGX Form Tabs генератор",
        "description": "Создайте Form Tabs для MIGX: группы полей, подписи, типы ввода и безопасный JSON для MODX.",
        "intent": "Нужно собрать formtabs без ошибок кавычек и вложенных массивов.",
        "deliverables": ["Form Tabs JSON", "Группировка полей", "Подсказки по ошибкам"],
        "example": "[{\"caption\":\"Основное\",\"fields\":[{\"field\":\"title\",\"caption\":\"Заголовок\",\"inputTVtype\":\"text\"}]}]",
    },
    {
        "slug": "migx-grid-columns-generator",
        "preset": "grid_columns",
        "query": "migx grid columns",
        "title": "MIGX Grid Columns генератор",
        "h1": "MIGX Grid Columns генератор",
        "description": "Соберите Grid Columns для MIGX: подписи колонок, sortable поля и видимые значения в таблице MODX.",
        "intent": "Нужно настроить список элементов MIGX в админке MODX.",
        "deliverables": ["Grid Columns JSON", "Колонки таблицы", "Рекомендуемые поля"],
        "example": "[{\"header\":\"Заголовок\",\"dataIndex\":\"title\",\"sortable\":true}]",
    },
    {
        "slug": "migx-nested-generator",
        "preset": "nested",
        "query": "nested migx modx",
        "title": "Вложенный MIGX генератор",
        "h1": "Вложенный MIGX генератор",
        "description": "Создайте nested MIGX структуру: секции, элементы внутри секций и JSON configs для вложенных полей.",
        "intent": "Нужна структура section -> items без ручного вложения configs.",
        "deliverables": ["Nested MIGX", "Вложенные configs", "Пример секций"],
        "example": "[{\"fieldname\":\"sections\",\"caption\":\"Секции\",\"inputTVtype\":\"migx\",\"configs\":\"[...]\"}]",
    },
    {
        "slug": "migx-tabs-generator",
        "preset": "tabs",
        "query": "migx tabs modx",
        "title": "MIGX tabs генератор",
        "h1": "MIGX tabs генератор",
        "description": "Разделите MIGX-поля по табам: контент, медиа, SEO и дополнительные настройки.",
        "intent": "Нужно сделать удобную форму MIGX с табами для редактора.",
        "deliverables": ["Tabs", "tabid для полей", "Удобная структура формы"],
        "example": "[{\"fieldname\":\"tab_content\",\"caption\":\"Контент\",\"inputTVtype\":\"tab\"}]",
    },
    {
        "slug": "migx-gallery",
        "preset": "gallery",
        "query": "migx gallery",
        "title": "MIGX галерея для MODX",
        "h1": "MIGX галерея",
        "description": "Соберите MIGX-галерею: изображение, alt, подпись, описание и пример вывода через getImageList.",
        "intent": "Нужна редактируемая галерея изображений в MODX.",
        "deliverables": ["Image field", "Alt и подпись", "getImageList пример"],
        "example": "[[getImageList? &tvname=`gallery` &tpl=`galleryItemTpl`]]",
    },
    {
        "slug": "migx-slider",
        "preset": "slider",
        "query": "migx slider",
        "title": "MIGX слайдер для MODX",
        "h1": "MIGX слайдер",
        "description": "Соберите поля для слайдера MODX: изображение, заголовок, текст, кнопка и ссылка.",
        "intent": "Нужен управляемый слайдер без отдельного компонента.",
        "deliverables": ["Поля слайда", "CTA", "Пример chunk"],
        "example": "[[getImageList? &tvname=`slider` &tpl=`slideTpl`]]",
    },
    {
        "slug": "migx-faq",
        "preset": "faq",
        "query": "migx faq",
        "title": "MIGX FAQ блок для MODX",
        "h1": "MIGX FAQ",
        "description": "Соберите FAQ через MIGX: вопрос, ответ, категория, порядок и пример вывода аккордеоном.",
        "intent": "Нужен редактируемый FAQ-блок для SEO-страницы.",
        "deliverables": ["FAQ fields", "Richtext answer", "Accordion chunk"],
        "example": "[{\"fieldname\":\"question\",\"caption\":\"Вопрос\",\"inputTVtype\":\"text\"}]",
    },
    {
        "slug": "migx-catalog",
        "preset": "catalog",
        "query": "migx catalog",
        "title": "MIGX каталог для MODX",
        "h1": "MIGX каталог",
        "description": "Создайте простой каталог на MIGX: название, фото, цена, свойства и описание карточки.",
        "intent": "Нужно хранить небольшой каталог в TV без отдельной базы.",
        "deliverables": ["Карточка товара", "Цена и свойства", "Grid Columns"],
        "example": "[{\"fieldname\":\"price\",\"caption\":\"Цена\",\"inputTVtype\":\"number\"}]",
    },
    {
        "slug": "migx-team",
        "preset": "team",
        "query": "migx team",
        "title": "MIGX команда для MODX",
        "h1": "MIGX команда",
        "description": "Соберите блок команды: фото, имя, должность, описание, контакты и порядок сотрудников.",
        "intent": "Нужен управляемый блок сотрудников в MODX.",
        "deliverables": ["Team fields", "Фото и роль", "Контакты"],
        "example": "[{\"fieldname\":\"name\",\"caption\":\"Имя\",\"inputTVtype\":\"text\"}]",
    },
    {
        "slug": "migx-reviews",
        "preset": "reviews",
        "query": "migx reviews",
        "title": "MIGX отзывы для MODX",
        "h1": "MIGX отзывы",
        "description": "Соберите отзывы на MIGX: автор, компания, текст, рейтинг, фото и ссылка на кейс.",
        "intent": "Нужен редактируемый блок отзывов с рейтингом.",
        "deliverables": ["Review fields", "Rating", "Author photo"],
        "example": "[{\"fieldname\":\"rating\",\"caption\":\"Рейтинг\",\"inputTVtype\":\"number\"}]",
    },
    {
        "slug": "migx-getimagelist",
        "preset": "getimagelist",
        "query": "migx getimagelist",
        "title": "MIGX getImageList пример вывода",
        "h1": "MIGX getImageList",
        "description": "Получите пример вывода MIGX через getImageList: tvname, tpl, wrapperTpl и поля чанка.",
        "intent": "Нужно вывести MIGX TV на фронтенде через getImageList.",
        "deliverables": ["getImageList вызов", "tpl chunk", "Подстановка placeholders"],
        "example": "[[getImageList? &tvname=`items` &tpl=`itemTpl`]]",
    },
    {
        "slug": "migx-fenom-chunk",
        "preset": "fenom_chunk",
        "query": "migx fenom chunk",
        "title": "MIGX Fenom chunk для MODX",
        "h1": "MIGX Fenom chunk",
        "description": "Соберите Fenom/chunk пример для вывода MIGX-полей в MODX с понятными placeholders.",
        "intent": "Нужен готовый шаблон вывода MIGX-элементов.",
        "deliverables": ["Fenom snippet", "Chunk placeholders", "HTML-разметка"],
        "example": "<article>{$item.title}</article>",
    },
    {
        "slug": "migx-configs",
        "preset": "configs",
        "query": "migx configs",
        "title": "MIGX configs генератор",
        "h1": "MIGX configs",
        "description": "Разберите и соберите MIGX configs для вложенных структур, listbox и сложных наборов полей.",
        "intent": "Нужно понять и собрать configs без поломанного JSON.",
        "deliverables": ["configs JSON", "Nested fields", "Проверка синтаксиса"],
        "example": "{\"formtabs\":[{\"caption\":\"Основное\",\"fields\":[]}]}",
    },
    {
        "slug": "migx-image-field",
        "preset": "image_field",
        "query": "migx image field",
        "title": "MIGX image field",
        "h1": "MIGX image field",
        "description": "Настройте изображение в MIGX: image field, alt, подпись, превью и вывод в чанке.",
        "intent": "Нужно правильно добавить изображение в MIGX-структуру.",
        "deliverables": ["Image input", "Alt field", "Preview column"],
        "example": "[{\"fieldname\":\"image\",\"caption\":\"Изображение\",\"inputTVtype\":\"image\"}]",
    },
    {
        "slug": "migx-richtext-field",
        "preset": "richtext_field",
        "query": "migx richtext field",
        "title": "MIGX richtext field",
        "h1": "MIGX richtext field",
        "description": "Добавьте richtext поле в MIGX и проверьте структуру для описаний, FAQ и контентных блоков.",
        "intent": "Нужно хранить форматированный текст внутри MIGX.",
        "deliverables": ["Richtext input", "Описание", "Пример вывода"],
        "example": "[{\"fieldname\":\"content\",\"caption\":\"Текст\",\"inputTVtype\":\"richtext\"}]",
    },
    {
        "slug": "migx-validator",
        "preset": "validator",
        "query": "migx validator",
        "title": "MIGX validator",
        "h1": "MIGX validator",
        "description": "Проверьте MIGX JSON: пустые fieldname, дубли, listbox без опций, MIGX без вложенных полей и ошибки импорта.",
        "intent": "Нужно быстро найти ошибки в MIGX-конфигурации.",
        "deliverables": ["Проверка JSON", "Список предупреждений", "Безопасный экспорт"],
        "example": "fieldname не должен быть пустым или повторяться",
    },
    {
        "slug": "migx-import-json",
        "preset": "import_json",
        "query": "migx import json",
        "title": "MIGX import JSON",
        "h1": "MIGX import JSON",
        "description": "Импортируйте существующий MIGX JSON, проверьте поля и доработайте конфигурацию визуально.",
        "intent": "Нужно загрузить старую MIGX-конфигурацию и поправить ее без ручного редактирования.",
        "deliverables": ["Импорт JSON", "Разбор tab fields", "Проверка nested MIGX"],
        "example": "Загрузите .json файл через кнопку Импорт",
    },
    {
        "slug": "migx-errors",
        "preset": "errors",
        "query": "migx json error",
        "title": "Ошибки MIGX JSON и Form Tabs",
        "h1": "Ошибки MIGX JSON",
        "description": "Найдите типовые ошибки MIGX: битый JSON, неверный configs, пустой fieldname и проблемы Form Tabs.",
        "intent": "Нужно понять, почему MIGX не сохраняет или не показывает поля.",
        "deliverables": ["Диагностика ошибок", "Подсказки", "Проверка конфига"],
        "example": "Unexpected token чаще всего означает неэкранированные кавычки или лишнюю запятую",
    },
    {
        "slug": "migx-examples",
        "preset": "examples",
        "query": "migx examples",
        "title": "MIGX examples для MODX",
        "h1": "MIGX examples",
        "description": "Готовые примеры MIGX для MODX: галерея, слайдер, FAQ, каталог, команда и отзывы.",
        "intent": "Нужна стартовая библиотека рабочих MIGX-шаблонов.",
        "deliverables": ["Готовые пресеты", "JSON examples", "Связанные страницы"],
        "example": "Выберите шаблон и откройте генератор с предустановкой",
    },
]
```

- [ ] **Step 2: Add HTML rendering helpers**

In the same file, add helpers matching the ACF generator pattern:

```python
def esc(value: object) -> str:
    return html.escape(str(value), quote=True)


def slug_url(slug: str) -> str:
    return f"{SITE}/{slug}.html"


def generator_url(page: dict[str, object]) -> str:
    return f"migx-generator.html?preset={esc(page['preset'])}&amp;source={esc(page['slug'])}"


def asset_head(page: dict[str, object]) -> str:
    title = esc(f"{page['title']} | Цифра")
    description = esc(page["description"])
    canonical = esc(slug_url(str(page["slug"])))
    return f"""<meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="{description}">
    <meta name="robots" content="index, follow">
    <link rel="canonical" href="{canonical}">
    <meta name="author" content="Цифра">
    <meta property="og:type" content="website">
    <meta property="og:title" content="{title}">
    <meta property="og:description" content="{description}">
    <meta property="og:url" content="{canonical}">
    <meta property="og:locale" content="ru_RU">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="{title}">
    <meta name="twitter:description" content="{description}">
    <title>{title}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@500;600&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="css/base.css">
    <link rel="stylesheet" href="css/components.css">
    <link rel="stylesheet" href="css/layout.css">
    <link rel="stylesheet" href="css/responsive.css">
    <link rel="stylesheet" href="css/themes.css">
    <link rel="stylesheet" href="css/acf-content.css">"""
```

- [ ] **Step 3: Add schema, header, footer, hub, and page renderers**

Still in `tools/generate_migx_pages.py`, implement:

```python
def breadcrumb_schema(page: dict[str, object] | None) -> str:
    items = [
        {"@type": "ListItem", "position": 1, "name": "Главная", "item": f"{SITE}/"},
        {"@type": "ListItem", "position": 2, "name": "MIGX", "item": f"{SITE}/migx.html"},
    ]
    if page:
        items.append({"@type": "ListItem", "position": 3, "name": str(page["h1"]), "item": slug_url(str(page["slug"]))})
    return json.dumps({"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": items}, ensure_ascii=False, indent=4)


def faq_schema(page: dict[str, object]) -> str:
    payload = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {"@type": "Question", "name": f"Для чего нужен {page['h1']}?", "acceptedAnswer": {"@type": "Answer", "text": str(page["intent"])}},
            {"@type": "Question", "name": "Что получится на выходе?", "acceptedAnswer": {"@type": "Answer", "text": ", ".join(page["deliverables"])}},
            {"@type": "Question", "name": "Можно ли использовать результат в MODX?", "acceptedAnswer": {"@type": "Answer", "text": "Да. Скопируйте JSON, Form Tabs, Grid Columns или chunk и перенесите в MIGX TV или шаблон MODX."}},
        ],
    }
    return json.dumps(payload, ensure_ascii=False, indent=4)


def header(active: str = "") -> str:
    hub_active = ' class="is-active"' if active == "hub" else ""
    return f"""<header class="acf-header">
    <div class="acf-container acf-header__inner">
        <a class="acf-logo" href="index.html" aria-label="Цифра — на главную"><span>◆</span> Цифра</a>
        <nav class="acf-nav" aria-label="Навигация MIGX">
            <a href="migx.html"{hub_active}>MIGX</a>
            <a href="migx-generator.html">Генератор</a>
            <a href="migx-nested-generator.html">Nested</a>
            <a href="migx-validator.html">Валидатор</a>
        </nav>
        <a class="acf-header-cta" href="migx-generator.html">Открыть генератор</a>
    </div>
</header>"""


def footer() -> str:
    return """<footer class="acf-footer">
    <div class="acf-container acf-footer__inner">
        <div>
            <strong>Цифра</strong>
            <p>Инструменты для MODX-разработчиков: MIGX, JSON, Form Tabs, Grid Columns и готовые шаблоны.</p>
        </div>
        <a href="migx-generator.html">Запустить MIGX генератор</a>
    </div>
</footer>"""
```

- [ ] **Step 4: Render pages and sitemap**

Add:

```python
def related_links(current_slug: str) -> str:
    links = [p for p in PAGES if p["slug"] != current_slug][:6]
    return "\n".join(
        f'<a class="acf-related-card" href="{esc(p["slug"])}.html"><span>{esc(p["query"])}</span><strong>{esc(p["h1"])}</strong></a>'
        for p in links
    )


def preset_rows() -> str:
    return "\n".join(
        f"""<div class="acf-preset-row">
            <span class="acf-preset-query">{esc(p["query"])}</span>
            <a class="acf-preset-name" href="{esc(p["slug"])}.html">{esc(p["h1"])}</a>
            <span class="acf-preset-result">{esc(", ".join(p["deliverables"]))}</span>
            <a class="acf-preset-link" href="{generator_url(p)}">Открыть</a>
        </div>"""
        for p in PAGES
    )


def render_page(page: dict[str, object]) -> str:
    deliverables = "\n".join(f"<li>{esc(item)}</li>" for item in page["deliverables"])
    return f"""<!DOCTYPE html>
<html lang="ru">
<head>
    {asset_head(page)}
    <script type="application/ld+json">{breadcrumb_schema(page)}</script>
    <script type="application/ld+json">{faq_schema(page)}</script>
</head>
<body>
{header()}
<main>
    <section class="acf-hero acf-page-hero">
        <div class="acf-container acf-hero__grid">
            <div class="acf-hero__copy">
                <nav class="acf-breadcrumbs" aria-label="Хлебные крошки"><a href="index.html">Главная</a><span>/</span><a href="migx.html">MIGX</a><span>/</span>{esc(page["h1"])}</nav>
                <span class="acf-kicker">{esc(page["query"])}</span>
                <h1>{esc(page["h1"])}</h1>
                <p>{esc(page["description"])}</p>
                <div class="acf-actions">
                    <a class="acf-btn acf-btn--primary" href="{generator_url(page)}">Открыть пресет</a>
                    <a class="acf-btn acf-btn--ghost" href="#example">Посмотреть пример</a>
                </div>
            </div>
            <aside class="acf-intent-card" aria-label="Сценарий использования">
                <span>Сценарий</span>
                <h2>{esc(page["intent"])}</h2>
                <p>Откройте готовую структуру, поправьте поля и экспортируйте конфигурацию для MODX.</p>
            </aside>
        </div>
    </section>
    <section class="acf-section" id="example">
        <div class="acf-container acf-use-grid">
            <article>
                <span class="acf-section-label">Что входит</span>
                <h2>Готовая структура под запрос</h2>
                <ul class="acf-checklist">{deliverables}</ul>
            </article>
            <article class="acf-code-card"><pre><code>{esc(page["example"])}</code></pre></article>
        </div>
    </section>
    <section class="acf-section acf-section--muted">
        <div class="acf-container">
            <div class="acf-section-head"><span class="acf-section-label">Связанные страницы</span><h2>Продолжить по MIGX-кластеру</h2></div>
            <div class="acf-related-grid">{related_links(str(page["slug"]))}</div>
        </div>
    </section>
    <section class="acf-final-cta"><div class="acf-container"><h2>Соберите MIGX-конфигурацию сейчас</h2><p>Страница откроет генератор с нужной предустановкой.</p><a class="acf-btn acf-btn--primary" href="{generator_url(page)}">Открыть генератор</a></div></section>
</main>
{footer()}
</body>
</html>"""


def render_hub() -> str:
    page = {
        "slug": "migx",
        "title": "MIGX генератор и шаблоны для MODX",
        "description": "Категория MIGX-инструментов для MODX: JSON, Form Tabs, Grid Columns, nested MIGX, getImageList, Fenom chunks и готовые пресеты.",
    }
    cards = "\n".join(
        f'<article class="acf-topic-card"><span>{esc(p["query"])}</span><h3><a href="{esc(p["slug"])}.html">{esc(p["h1"])}</a></h3><p>{esc(p["description"])}</p><a href="{esc(p["slug"])}.html">Открыть страницу</a></article>'
        for p in PAGES
    )
    item_list = {"@context": "https://schema.org", "@type": "ItemList", "itemListElement": [{"@type": "ListItem", "position": i + 1, "url": slug_url(str(p["slug"])), "name": str(p["h1"])} for i, p in enumerate(PAGES)]}
    return f"""<!DOCTYPE html>
<html lang="ru">
<head>
    {asset_head(page)}
    <script type="application/ld+json">{breadcrumb_schema(None)}</script>
    <script type="application/ld+json">{json.dumps(item_list, ensure_ascii=False, indent=4)}</script>
</head>
<body>
{header("hub")}
<main>
    <section class="acf-hero">
        <div class="acf-container acf-hero__grid">
            <div class="acf-hero__copy">
                <span class="acf-kicker">MODX MIGX</span>
                <h1>MIGX генератор и шаблоны для MODX</h1>
                <p>Соберите MIGX JSON, Form Tabs, Grid Columns, nested-конфигурации и готовые chunks без ручной сборки массива.</p>
                <div class="acf-actions"><a class="acf-btn acf-btn--primary" href="migx-generator.html">Открыть генератор</a><a class="acf-btn acf-btn--ghost" href="#pages">Смотреть страницы</a></div>
            </div>
            <aside class="acf-plan-card"><h2>Карта категории</h2><ul><li>Базовые MIGX JSON и TV.</li><li>Form Tabs и Grid Columns.</li><li>Галерея, слайдер, FAQ, каталог, команда и отзывы.</li><li>Валидатор, импорт, ошибки и вывод через getImageList/Fenom.</li></ul></aside>
        </div>
    </section>
    <section class="acf-section" id="pages"><div class="acf-container"><div class="acf-section-head"><span class="acf-section-label">Кластеры</span><h2>Страницы под MIGX-запросы</h2><p>Каждая страница ведет в генератор с нужной предустановкой.</p></div><div class="acf-topic-grid">{cards}</div></div></section>
    <section class="acf-section acf-section--muted"><div class="acf-container"><div class="acf-section-head"><span class="acf-section-label">Карта пресетов</span><h2>SEO-страница -> пресет генератора</h2></div><div class="acf-preset-map" aria-label="Карта MIGX-пресетов">{preset_rows()}</div></div></section>
    <section class="acf-final-cta"><div class="acf-container"><h2>Откройте MIGX генератор</h2><p>Выберите шаблон, проверьте ошибки и экспортируйте JSON или chunk.</p><a class="acf-btn acf-btn--primary" href="migx-generator.html">Запустить</a></div></section>
</main>
{footer()}
</body>
</html>"""
```

- [ ] **Step 5: Write files and sitemap update**

Add:

```python
def write_pages() -> None:
    (ROOT / "migx.html").write_text(render_hub(), encoding="utf-8")
    for page in PAGES:
        (ROOT / f"{page['slug']}.html").write_text(render_page(page), encoding="utf-8")


def update_sitemap() -> None:
    sitemap = ROOT / "sitemap.xml"
    tree = ET.parse(sitemap)
    old_root = tree.getroot()
    entries: dict[str, tuple[str, str]] = {}
    for url in old_root.findall(".//{*}url"):
        loc = url.find("{*}loc")
        if loc is None or not loc.text:
            continue
        changefreq = url.find("{*}changefreq")
        priority = url.find("{*}priority")
        entries[loc.text] = (
            changefreq.text if changefreq is not None and changefreq.text else "weekly",
            priority.text if priority is not None and priority.text else "0.5",
        )
    entries[f"{SITE}/migx.html"] = ("weekly", "0.85")
    entries[f"{SITE}/migx-generator.html"] = ("weekly", "0.8")
    for page in PAGES:
        entries[slug_url(str(page["slug"]))] = ("weekly", "0.75")
    ET.register_namespace("", SITEMAP_NS)
    root = ET.Element(f"{{{SITEMAP_NS}}}urlset")
    for loc, (changefreq, priority) in entries.items():
        url = ET.SubElement(root, f"{{{SITEMAP_NS}}}url")
        ET.SubElement(url, f"{{{SITEMAP_NS}}}loc").text = loc
        ET.SubElement(url, f"{{{SITEMAP_NS}}}changefreq").text = changefreq
        ET.SubElement(url, f"{{{SITEMAP_NS}}}priority").text = priority
    tree = ET.ElementTree(root)
    ET.indent(tree, space="    ")
    tree.write(sitemap, encoding="utf-8", xml_declaration=True)


def main() -> None:
    write_pages()
    update_sitemap()


if __name__ == "__main__":
    main()
```

- [ ] **Step 6: Generate pages**

Run: `python tools/generate_migx_pages.py`

Expected: command exits 0 and creates `migx.html` plus 21 landing pages.

- [ ] **Step 7: Run smoke test and expect generator wiring failures**

Run: `node tests/migx-smoke.mjs`

Expected: FAIL at generator checks such as `migx-generator.html must expose validation panel`, while hub, landing, and sitemap checks pass.

- [ ] **Step 8: Commit generated pages**

```bash
git add tools/generate_migx_pages.py migx.html migx-*.html sitemap.xml
git commit -m "feat: add migx seo landing cluster"
```

---

### Task 3: Generator HTML Controls

**Files:**
- Modify: `migx-generator.html`

- [ ] **Step 1: Add landing context strip under the hero**

Find the end of `.tool-hero` and add:

```html
<section class="generator-context" id="generator-context" hidden>
    <div class="container">
        <div class="gen-context-card">
            <span class="gen-context-label">Открыто из SEO-страницы</span>
            <strong id="generator-context-title">MIGX пресет</strong>
            <p id="generator-context-copy">Генератор загрузил подходящую структуру. Проверьте поля и экспортируйте конфигурацию.</p>
        </div>
    </div>
</section>
```

- [ ] **Step 2: Add validation panel to the builder column**

Inside `.gen-panel-body`, after the field buttons and before the tabs manager, add:

```html
<div class="gen-panel gen-validation" id="validation-panel" aria-live="polite">
    <div class="gen-panel-header">Проверка MIGX</div>
    <div class="gen-panel-body" style="max-height:none;">
        <ul id="validation-list" class="validation-list">
            <li class="validation-ok">Добавьте поля, чтобы увидеть проверку.</li>
        </ul>
    </div>
</div>
```

- [ ] **Step 3: Add export tabs**

In `.code-preview-header`, keep existing `json` and `json_flat` buttons and add:

```html
<button class="code-tab" data-tab="formtabs" data-action="switch-tab">Form Tabs</button>
<button class="code-tab" data-tab="grid_columns" data-action="switch-tab">Grid Columns</button>
<button class="code-tab" data-tab="getimagelist" data-action="switch-tab">getImageList</button>
<button class="code-tab" data-tab="fenom" data-action="switch-tab">Fenom</button>
```

- [ ] **Step 4: Add minimal CSS in existing `<style>` block**

Add:

```css
.generator-context { padding: 0 0 22px; }
.gen-context-card { background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 16px 20px; }
.gen-context-label { display: block; color: var(--accent-2); font-size: 0.78rem; font-weight: 800; text-transform: uppercase; margin-bottom: 6px; }
.gen-context-card strong { display: block; font-size: 1rem; margin-bottom: 4px; }
.gen-context-card p { color: var(--text-2); margin: 0; font-size: 0.9rem; line-height: 1.55; }
.gen-validation { margin: 16px 0; }
.validation-list { list-style: none; margin: 0; padding: 0; display: grid; gap: 8px; }
.validation-list li { padding: 9px 12px; border-radius: 7px; background: rgba(245,158,11,0.08); color: var(--text-2); font-size: 0.84rem; }
.validation-list .validation-ok { background: rgba(16,185,129,0.1); color: var(--accent-2); }
.validation-list .validation-error { background: rgba(239,68,68,0.1); color: #f87171; }
```

- [ ] **Step 5: Cache-bust the script**

Change:

```html
<script src="js/migx-generator.js" defer></script>
```

to:

```html
<script src="js/migx-generator.js?v=migx-seo-20260531-1" defer></script>
```

- [ ] **Step 6: Run smoke test**

Run: `node tests/migx-smoke.mjs`

Expected: FAIL on JS functions not yet implemented, while HTML control checks pass.

- [ ] **Step 7: Commit HTML controls**

```bash
git add migx-generator.html
git commit -m "feat: add migx generator seo controls"
```

---

### Task 4: URL Presets and Scenario Templates

**Files:**
- Modify: `js/migx-generator.js`

- [ ] **Step 1: Add `MIGX_PRESETS` after state declarations**

Add:

```js
var MIGX_PRESETS = {
    json: { source: 'migx-json-generator', title: 'MIGX JSON генератор', template: 'tabs_demo' },
    tv: { source: 'migx-tv-generator', title: 'MIGX TV генератор', template: 'tabs_demo' },
    formtabs: { source: 'migx-formtabs-generator', title: 'MIGX Form Tabs', template: 'tabs_demo' },
    grid_columns: { source: 'migx-grid-columns-generator', title: 'MIGX Grid Columns', template: 'catalog' },
    nested: { source: 'migx-nested-generator', title: 'Вложенный MIGX', template: 'nested' },
    tabs: { source: 'migx-tabs-generator', title: 'MIGX tabs', template: 'tabs_demo' },
    gallery: { source: 'migx-gallery', title: 'MIGX галерея', template: 'gallery' },
    slider: { source: 'migx-slider', title: 'MIGX слайдер', template: 'slider' },
    faq: { source: 'migx-faq', title: 'MIGX FAQ', template: 'faq' },
    catalog: { source: 'migx-catalog', title: 'MIGX каталог', template: 'catalog' },
    team: { source: 'migx-team', title: 'MIGX команда', template: 'team' },
    reviews: { source: 'migx-reviews', title: 'MIGX отзывы', template: 'reviews' },
    getimagelist: { source: 'migx-getimagelist', title: 'MIGX getImageList', template: 'gallery' },
    fenom_chunk: { source: 'migx-fenom-chunk', title: 'MIGX Fenom chunk', template: 'catalog' },
    configs: { source: 'migx-configs', title: 'MIGX configs', template: 'nested' },
    image_field: { source: 'migx-image-field', title: 'MIGX image field', template: 'gallery' },
    richtext_field: { source: 'migx-richtext-field', title: 'MIGX richtext field', template: 'faq' },
    validator: { source: 'migx-validator', title: 'MIGX validator', template: 'errors' },
    import_json: { source: 'migx-import-json', title: 'MIGX import JSON', template: 'tabs_demo' },
    errors: { source: 'migx-errors', title: 'Ошибки MIGX JSON', template: 'errors' },
    examples: { source: 'migx-examples', title: 'MIGX examples', template: 'nested' }
};
```

- [ ] **Step 2: Extend `loadTemplate` cases**

Add cases:

```js
case 'gallery':
    fields = [
        mkField('image', 'Изображение', 'image'),
        mkField('text', 'Alt', 'alt'),
        mkField('text', 'Подпись', 'caption'),
        mkField('textarea', 'Описание', 'description')
    ];
    break;

case 'reviews':
    fields = [
        mkField('image', 'Фото автора', 'author_photo'),
        mkField('text', 'Автор', 'author_name'),
        mkField('text', 'Компания', 'company'),
        mkField('richtext', 'Текст отзыва', 'review_text'),
        mkField('number', 'Рейтинг', 'rating')
    ];
    break;

case 'errors':
    fields = [
        mkField('text', 'Поле без fieldname', ''),
        mkField('text', 'Дубликат', 'duplicate_name'),
        mkField('textarea', 'Дубликат 2', 'duplicate_name'),
        mkField('migx', 'Пустой MIGX', 'empty_nested'),
        mkField('listbox', 'Listbox без опций', 'empty_listbox')
    ];
    break;
```

- [ ] **Step 3: Add URL parsing**

Add:

```js
function getURLParam(name) {
    var params = new URLSearchParams(window.location.search);
    return params.get(name) || '';
}

function showLandingContext(presetName, source) {
    var preset = MIGX_PRESETS[presetName];
    var box = document.getElementById('generator-context');
    if (!box || !preset) return;
    var title = document.getElementById('generator-context-title');
    var copy = document.getElementById('generator-context-copy');
    if (title) title.textContent = preset.title;
    if (copy) copy.textContent = source ? 'Источник: ' + source + '. Проверьте поля, ошибки и экспорт.' : 'Проверьте поля, ошибки и экспорт.';
    box.hidden = false;
}

function applyPresetFromURL() {
    var presetName = getURLParam('preset');
    var source = getURLParam('source');
    if (!presetName || !MIGX_PRESETS[presetName]) return;
    loadTemplate(MIGX_PRESETS[presetName].template);
    showLandingContext(presetName, source);
}
```

- [ ] **Step 4: Call URL preset on init**

In `DOMContentLoaded`, after `generateJSON()`, add:

```js
applyPresetFromURL();
validateMIGXConfig();
```

- [ ] **Step 5: Run smoke test**

Run: `node tests/migx-smoke.mjs`

Expected: FAIL on validation/export helper checks not yet implemented.

- [ ] **Step 6: Commit URL presets**

```bash
git add js/migx-generator.js
git commit -m "feat: add migx url presets"
```

---

### Task 5: Validator and Export Modes

**Files:**
- Modify: `js/migx-generator.js`

- [ ] **Step 1: Add recursive field collection**

Add near helper functions:

```js
function collectFields(arr, result) {
    result = result || [];
    for (var i = 0; i < arr.length; i++) {
        result.push(arr[i]);
        if (arr[i].nestedFields && arr[i].nestedFields.length) {
            collectFields(arr[i].nestedFields, result);
        }
    }
    return result;
}
```

- [ ] **Step 2: Add validator**

Add:

```js
function validateMIGXConfig() {
    var list = document.getElementById('validation-list');
    if (!list) return [];
    var warnings = [];
    var all = collectFields(fields, []);
    var seen = {};

    for (var i = 0; i < all.length; i++) {
        var f = all[i];
        var name = f.fieldname || '';
        if (!name) warnings.push({ level: 'error', text: 'Поле "' + (f.caption || 'без названия') + '" без fieldname.' });
        if (name && /[^a-zA-Z0-9_]/.test(name)) warnings.push({ level: 'error', text: 'Fieldname "' + name + '" содержит пробелы, кириллицу или спецсимволы.' });
        if (name) {
            seen[name] = (seen[name] || 0) + 1;
            if (seen[name] === 2) warnings.push({ level: 'error', text: 'Fieldname "' + name + '" повторяется.' });
        }
        if (!f.caption && f.inputTVtype !== 'tab') warnings.push({ level: 'warn', text: 'Поле "' + (name || 'без fieldname') + '" без caption.' });
        if (f.inputTVtype === 'migx' && (!f.nestedFields || !f.nestedFields.length)) warnings.push({ level: 'warn', text: 'MIGX "' + (name || f.caption || 'без имени') + '" не содержит вложенных полей.' });
        if (f.inputTVtype === 'listbox' && !f.configs && !f.inputOptionValues) warnings.push({ level: 'warn', text: 'Listbox "' + (name || f.caption || 'без имени') + '" без опций.' });
        if (!MIGX_TYPES[f.inputTVtype || '']) warnings.push({ level: 'error', text: 'Неизвестный тип поля "' + (f.inputTVtype || '') + '".' });
    }

    if (!warnings.length) {
        list.innerHTML = '<li class="validation-ok">Ошибок не найдено. Конфигурацию можно экспортировать.</li>';
        return warnings;
    }

    list.innerHTML = warnings.map(function(w) {
        var cls = w.level === 'error' ? 'validation-error' : '';
        return '<li class="' + cls + '">' + escHtml(w.text) + '</li>';
    }).join('');
    return warnings;
}
```

- [ ] **Step 3: Wire validator into mutations**

After every `generateJSON();` call inside mutation functions, add `validateMIGXConfig();`. The required functions are:

```js
addField
removeField
duplicateField
moveField
updateField
addNestedField
removeNestedField
updateNestedField
addDeepNestedField
addTab
removeTab
changeFieldType
resetAll
loadTemplate
importFromJSON
```

- [ ] **Step 4: Add export generators**

Add:

```js
function generateFormTabsJSON() {
    var formTabs = [];
    var defaultTab = { caption: 'Основное', fields: [] };
    var tabMap = {};
    for (var i = 0; i < tabs.length; i++) {
        tabMap[tabs[i].id] = { caption: tabs[i].caption, fields: [] };
        formTabs.push(tabMap[tabs[i].id]);
    }
    if (!formTabs.length) formTabs.push(defaultTab);
    for (var j = 0; j < fields.length; j++) {
        var f = fields[j];
        if (f.inputTVtype === 'tab') continue;
        var row = {
            field: f.fieldname || '',
            caption: f.caption || f.fieldname || '',
            inputTVtype: f.inputTVtype || 'text'
        };
        var target = f.tabid && tabMap[f.tabid] ? tabMap[f.tabid] : formTabs[0];
        target.fields.push(row);
    }
    document.getElementById('code-output').textContent = JSON.stringify(formTabs, null, 2);
}

function generateGridColumnsJSON() {
    var columns = [];
    var all = fields.filter(function(f) { return f.inputTVtype !== 'tab'; });
    for (var i = 0; i < all.length; i++) {
        if (!all[i].fieldname) continue;
        columns.push({
            header: all[i].caption || all[i].fieldname,
            dataIndex: all[i].fieldname,
            sortable: true
        });
    }
    document.getElementById('code-output').textContent = JSON.stringify(columns, null, 2);
}

function generateGetImageListSnippet() {
    var tpl = '[[getImageList? &tvname=`migx_items` &tpl=`migxItemTpl`]]';
    document.getElementById('code-output').textContent = tpl;
}

function generateFenomChunk() {
    var all = fields.filter(function(f) { return f.inputTVtype !== 'tab'; });
    var lines = ['<article class="migx-item">'];
    for (var i = 0; i < all.length; i++) {
        var name = all[i].fieldname || ('field_' + i);
        lines.push('  <div class="migx-item__' + name + '">{$item.' + name + '}</div>');
    }
    lines.push('</article>');
    document.getElementById('code-output').textContent = lines.join('\n');
}
```

- [ ] **Step 5: Update `generateJSON` routing**

Replace `generateJSON()` body with:

```js
function generateJSON() {
    if (currentCodeTab === 'json_flat') {
        generateFlatJSON();
    } else if (currentCodeTab === 'formtabs') {
        generateFormTabsJSON();
    } else if (currentCodeTab === 'grid_columns') {
        generateGridColumnsJSON();
    } else if (currentCodeTab === 'getimagelist') {
        generateGetImageListSnippet();
    } else if (currentCodeTab === 'fenom') {
        generateFenomChunk();
    } else {
        generateStandardJSON();
    }
}
```

- [ ] **Step 6: Run smoke test**

Run: `node tests/migx-smoke.mjs`

Expected: PASS with `MIGX smoke checks passed: hub, 21 landings, sitemap, generator wiring.`

- [ ] **Step 7: Commit validator and exports**

```bash
git add js/migx-generator.js
git commit -m "feat: add migx validation and exports"
```

---

### Task 6: Static Checks and Existing ACF Guard

**Files:**
- No code changes expected unless checks expose a concrete issue.

- [ ] **Step 1: Compile Python generators**

Run:

```bash
python -m py_compile tools/generate_acf_pages.py tools/generate_migx_pages.py
```

Expected: exits 0.

- [ ] **Step 2: Run ACF smoke**

Run:

```bash
node tests/acf-smoke.mjs
```

Expected: exits 0 with `ACF smoke checks passed`.

- [ ] **Step 3: Run MIGX smoke**

Run:

```bash
node tests/migx-smoke.mjs
```

Expected: exits 0 with `MIGX smoke checks passed`.

- [ ] **Step 4: Run global harness smoke**

Run:

```powershell
C:\Users\user\.codex\scripts\harness.cmd smoke
```

Expected: exits 0 or reuses a fresh smoke report. If it exits non-zero because of known disk space below the harness threshold, record the exact reason in the final report and continue only if project checks pass.

- [ ] **Step 5: Commit check fixes only if needed**

If this task required a fix:

```bash
git add <fixed-files>
git commit -m "fix: stabilize migx seo checks"
```

If no changes were needed, do not create a commit for this task.

---

### Task 7: Browser QA

**Files:**
- No code changes expected unless visual or console issues are found.

- [ ] **Step 1: Start a local static server**

Run:

```powershell
python -m http.server 4173
```

Expected: server starts at `http://localhost:4173`.

- [ ] **Step 2: Open the hub in Browser**

Navigate to:

```text
http://localhost:4173/migx.html
```

Expected:

- page renders without console errors;
- hero clearly says `MIGX генератор и шаблоны для MODX`;
- preset map has 21 rows;
- CTA opens `migx-generator.html`.

- [ ] **Step 3: Open one representative landing**

Navigate to:

```text
http://localhost:4173/migx-gallery.html
```

Expected:

- page renders without console errors;
- CTA link contains `migx-generator.html?preset=gallery&source=migx-gallery`;
- JSON or chunk example is visible;
- related links are visible.

- [ ] **Step 4: Open generator with preset**

Navigate to:

```text
http://localhost:4173/migx-generator.html?preset=gallery&source=migx-gallery
```

Expected:

- gallery fields load automatically;
- validation panel shows either OK or actionable warnings;
- export tabs switch between JSON, Form Tabs, Grid Columns, getImageList, and Fenom;
- copy/download buttons still work for non-empty output.

- [ ] **Step 5: Check mobile viewport**

Resize Browser to `390x844`.

Expected:

- no horizontal overflow in hub, landing page, or generator;
- export tab row remains usable;
- validation text does not overlap controls.

- [ ] **Step 6: Commit visual fixes only if needed**

If this task required a fix:

```bash
git add <fixed-files>
git commit -m "fix: polish migx seo mobile qa"
```

If no changes were needed, do not create a commit for this task.

---

### Task 8: Final Integration and Push

**Files:**
- All files changed by previous tasks.

- [ ] **Step 1: Inspect changed files**

Run:

```bash
git status --short
```

Expected: only MIGX-related files, `sitemap.xml`, tests, and generator script changes are staged or modified for this implementation. Existing unrelated user changes may remain in the worktree and must not be reverted.

- [ ] **Step 2: Run final checks**

Run:

```bash
python -m py_compile tools/generate_migx_pages.py
node tests/migx-smoke.mjs
node tests/acf-smoke.mjs
```

Expected: all exit 0.

- [ ] **Step 3: Stage remaining implementation files**

Run:

```bash
git add tools/generate_migx_pages.py tests/migx-smoke.mjs migx.html migx-*.html migx-generator.html js/migx-generator.js sitemap.xml
```

- [ ] **Step 4: Commit remaining changes if any**

Run:

```bash
git commit -m "feat: launch migx seo product cluster"
```

If all previous tasks already committed everything, this command should report nothing to commit; do not create an empty commit.

- [ ] **Step 5: Push**

Run:

```bash
git push origin master
```

Expected: push succeeds.

---

## Self-Review Checklist

- Spec coverage: hub page, 21 landings, sitemap, URL presets, validator, export modes, structured data, browser QA are covered.
- Placeholder scan: no unfinished markers, vague generic handling instructions, or missing test commands.
- Type consistency: route names in `tests/migx-smoke.mjs`, `PAGES`, and `MIGX_PRESETS` use the same `preset` and `source` values.
- Risk note: the existing worktree contains unrelated modifications and deletions; implementation must avoid staging or reverting them.

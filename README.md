# depseeker_test

Static HTML workspace for the Цифра ACF/MIGX generators and SEO landing-page clusters.

## Site Config

Shared launch settings live in `site.config.json`.

- `mode=local` is the current pre-launch mode and may use `https://zifra.example.com`.
- `mode=production` must use the real HTTPS origin before publishing.
- `cleanParams` is used when generating `robots.txt` for local query parameters such as `qa`, `preset`, and `source`.
- `adsEnabled` and `yandexMetrikaId` are applied by `js/main.js` only in production mode.

Regenerate sitemap and robots after adding pages:

```powershell
python tools/build_site_metadata.py
python tools/check_catalog_registry.py
```

Check production readiness:

```powershell
python tools/check_production_ready.py
```

## Catalog Registry

Public catalog structure lives in `catalog.registry.json`. It lists categories, their primary utilities, pages, and nav-visible items. Use it as the source checklist when adding new categories or tools.

Detailed workflow: `docs/catalog-expansion.md`.
Ad placement notes: `docs/monetization.md`.
SEO content audit: `docs/seo-content-audit.md`.

Draft scaffolding examples:

```powershell
python tools/scaffold_catalog.py category seo "SEO инструменты" "Раздел с SEO-утилитами, генераторами метаданных и практическими материалами для поискового трафика."
python tools/scaffold_catalog.py item seo schema-generator "Schema.org генератор" "Утилита для генерации структурированных данных, FAQ, breadcrumbs и JSON-LD разметки." --type utility --nav
```

## Smoke Checks

Run the lightweight regression checks after changes to generator pages, SEO pages, sitemap, or shared scripts:

```powershell
node tests/acf-smoke.mjs
node tests/migx-smoke.mjs
node tests/production-home-smoke.mjs
node tests/site-links-smoke.mjs
node tests/site-runtime-smoke.mjs
node tests/scaffold-catalog-smoke.mjs
node tests/content-audit-smoke.mjs
python tools/audit_content_quality.py
python tools/check_catalog_registry.py
python tools/check_production_ready.py
```

The checks cover:

- ACF category routes, landing CTAs, generator preset routing, production export, visual editor guards, and conversion tracking.
- MIGX hub, 21 landing pages, sitemap entries, generator wiring, validation/audit/share features, and conversion tracking.
- Production homepage positioning and shared navigation without marketplace/header leftovers.
- Local `href`/`src` links across all HTML pages.
- Registered catalog categories and utilities in `catalog.registry.json`.
- Draft category and utility scaffolding.
- SEO content audit report for prioritizing thin pages before traffic growth.
- Runtime config loading for advertising and Yandex Metrika.
- Production foundation: service pages, sitemap coverage, robots sitemap URL, clean query parameters, one H1 per page, canonical and descriptions.

## Local Preview

Serve the static files from the project root:

```powershell
python -m http.server 8026 --bind 127.0.0.1
```

Then open:

- `http://127.0.0.1:8026/index.html`
- `http://127.0.0.1:8026/acf-generator.html`
- `http://127.0.0.1:8026/migx-generator.html`

## Launch Domain

Before publishing, replace the placeholder origin in canonical URLs, sitemap entries, and structured data:

```powershell
python tools/set_site_domain.py https://your-domain.example --dry-run
python tools/set_site_domain.py https://your-domain.example
python tools/build_site_metadata.py
python tools/check_catalog_registry.py
python tools/check_production_ready.py
```

The tool accepts only an HTTPS origin and keeps unrelated domains untouched.

Before final deployment, switch `site.config.json` to `mode=production`, set the real `origin`, fill the real contacts in `contacts.html`, and add the actual Yandex Metrika ID if analytics is enabled.

Run the external-input check after the real domain and owner details are known:

```powershell
python tools/check_launch_inputs.py
```

In the local workspace this command is expected to fail until the real domain, contacts, owner/legal details, and analytics decision are provided.

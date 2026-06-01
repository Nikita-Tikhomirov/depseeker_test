# depseeker_test

Static HTML workspace for the Цифра ACF/MIGX generators and SEO landing-page clusters.

## Smoke Checks

Run the lightweight regression checks after changes to generator pages, SEO pages, sitemap, or shared scripts:

```powershell
node tests/acf-smoke.mjs
node tests/migx-smoke.mjs
node tests/production-home-smoke.mjs
node tests/site-links-smoke.mjs
```

The checks cover:

- ACF category routes, landing CTAs, generator preset routing, production export, visual editor guards, and conversion tracking.
- MIGX hub, 21 landing pages, sitemap entries, generator wiring, validation/audit/share features, and conversion tracking.
- Production homepage positioning and shared navigation without marketplace/header leftovers.
- Local `href`/`src` links inside the ACF/MIGX clusters.

## Local Preview

Serve the static files from the project root:

```powershell
python -m http.server 8026 --bind 127.0.0.1
```

Then open:

- `http://127.0.0.1:8026/acf-generator.html`
- `http://127.0.0.1:8026/migx-generator.html`

## Launch Domain

Before publishing, replace the placeholder origin in canonical URLs, sitemap entries, and structured data:

```powershell
python tools/set_site_domain.py https://your-domain.example --dry-run
python tools/set_site_domain.py https://your-domain.example
```

The tool accepts only an HTTPS origin and keeps unrelated domains untouched.

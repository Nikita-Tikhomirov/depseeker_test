# depseeker_test

Static HTML workspace for the Цифра ACF generator and SEO landing-page cluster.

## ACF Smoke Check

Run the lightweight ACF regression check after changes to `acf*.html` or `js/acf-*.js`:

```powershell
node tests/acf-smoke.mjs
```

It verifies the 12 category routes, landing-page CTAs, generator preset routing, export tab notes, and production export guards.

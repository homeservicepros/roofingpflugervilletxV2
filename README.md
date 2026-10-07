# Pflugerville Roof Experts — Astro site

Static Astro 7 + Tailwind 4 rebuild of the former `www.jncroofing.com` site for
**https://www.pflugervilleroofexperts.com**, deployed on Cloudflare Pages.

* Every legacy URL is preserved exactly (`/`, `/blog/`, 10 blog posts, 20 `/services/…`, 15 `/service-area/…`).
* All page copy, titles, meta descriptions and H1s come verbatim from the old site (see *Content* below).
  Only the owner-approved identity values changed: phone, address, email, domain, brand assets.
* New design, layout, components and photography (the supplied media pack).

## Cloudflare Pages settings

| Setting | Value |
| --- | --- |
| Production branch | `astro-version` |
| Framework preset | Astro |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Node version | 22 (`.nvmrc`; or set env `NODE_VERSION=22`) |

Then add the custom domain `www.pflugervilleroofexperts.com` to the project and create the
`jncroofing.com → pflugervilleroofexperts.com` redirect rules in Cloudflare (not handled in this repo).

### Environment variables (Settings → Variables and secrets, Production *and* Preview)

| Name | Purpose |
| --- | --- |
| `PUBLIC_GA_MEASUREMENT_ID` | Google Analytics 4 id (`G-XXXXXXXXXX`). Empty/invalid ⇒ no analytics code is emitted. |
| `PUBLIC_GTM_ID` | Optional Google Tag Manager id (`GTM-XXXXXXX`). If set it is used *instead of* the GA tag. |
| `PUBLIC_SITE_URL` | Optional canonical-origin override (default `https://www.pflugervilleroofexperts.com`). |

Values are baked in at build time — change one, then **Retry deployment**. Phone and e-mail clicks are
reported automatically as `phone_click` / `email_click` events when a tag is present.

## Local development

```bash
npm install
npm run dev            # http://localhost:4321
npm run build          # → dist/
npm run preview:pages  # serves dist/ with Cloudflare-Pages-style routing (extensionless URLs)
```

Requires Node ≥ 22.12.

## Where things live

```
src/config/site.ts        phone, email, address, hours, analytics ids  ← change business details here
src/data/states.ts        all 50 states + DC + PR (links + sitemap-index entries)
src/data/legacy/*.json    page content extracted verbatim from the old site (edit copy here)
src/data/services.ts      service metadata (category, icon, hero photo) + legacy copy
src/lib/images.ts         the media pack registry — swap a photo site-wide here
src/assets/               media pack masters (100 % quality); Astro emits optimised WebP variants
src/pages/                routes (file-format output keeps the legacy URLs)
src/pages/*.txt.ts|xml.ts robots.txt, sitemap.xml, sitemap-index.xml, llms.txt, llms-full.txt
public/                   favicons, logo.png (schema), og-default.jpg, _headers
scripts/                  extraction + verification tooling (below)
```

### Content

`scripts/extract-legacy.py` re-extracts the old HTML from git ref `origin/main` into `src/data/legacy/`
(`npm run extract`). The generated JSON is committed and is the source of truth for the site copy.
Markup that was commented out in the old HTML (a testimonials block and a nationwide CTA) never rendered and
is intentionally not carried over.

### Verification

```bash
npm run build
npm run verify          # URL parity, internal links, no legacy phone/domain/address, schema JSON valid
npm run verify:parity   # every legacy text block, <title>, meta description and <h1> exists in the new page
```

### States, sitemaps and the sitemap index

* Every page's "States We Serve" section links to `https://{state}.pflugervilleroofexperts.com/`.
* `/sitemap-index.xml` lists `/sitemap.xml` plus `https://{state}.pflugervilleroofexperts.com/sitemap.xml`
  for each state with `sitemap: true` in `src/data/states.ts`. AZ, DE, HI, NV and UT are new relative to the
  old list: they are linked, but flip their `sitemap` flag to `true` once their sitemaps are live.

### Brand assets

`npm run brand-assets` regenerates favicons, `logo.png` and `og-default.jpg` from `src/assets/brand/logo.webp`.
The "verified customer" review-card graphic is bundled but disabled (`showReviewCardGraphic` in
`src/config/site.ts`) because the old site published no customer reviews.

# Deploying

The site is a Next.js App Router app, deployed on Vercel. The FastAPI backend is
separate and unchanged, at `https://api.zenova.agency/api/v1`.

## One-time setup

1. Import the repo in Vercel. It detects Next.js; no build settings to change.
2. Set the environment variable `NEXT_PUBLIC_API_URL` to
   `https://api.zenova.agency/api/v1` for Production, Preview and Development.
3. Add `zenova.agency` (and `www`) under **Settings → Domains**, then point DNS
   at Vercel.

Vercel builds every push and promotes `main` to production.
`.github/workflows/ci.yml` runs lint, types, a build, and the crawlability
checks — it does not deploy.

> **Do not switch the DNS until a preview deployment passes `npm run verify`.**
> The previous GitHub Pages deployment can stay live until then.

## Two URL details that must not change

Both of these will cost real search traffic if they move.

- **Trailing slashes.** Every indexed URL has one, because `canonicalUrl()` in
  `src/seo/seo-data.ts` emits them. `next.config.mjs` sets `trailingSlash: true`
  to match. Turning that off would 308 every indexed URL on the day the host
  changes.
- **`/favicon.ico`.** Google harvests one favicon per hostname from the site
  root. This URL has already moved three times and reset the crawl each time.
  It is served from `public/favicon.ico` and referenced absolutely in
  `app/layout.tsx`. Leave it alone.

## Rendering model

Every public route is rendered on the server. `curl` returns the finished page —
headings, body copy, navigation, JSON-LD — with no JavaScript required.

| Route | Rendering |
|---|---|
| `/`, `/services`, `/pricing`, `/work`, `/about`, `/careers`, `/contact`, `/privacy`, `/terms` | Static, revalidated with the CMS bundle |
| `/services/[slug]`, `/work/[slug]`, `/careers/[slug]` | Generated from the CMS at build; unknown slugs 404 |
| `/blog`, `/blog/[slug]`, `/[slug]` | Generated from the CMS; posts published later render on demand |
| `/admin/*`, `/client/*`, `/team/*` | Client-only react-router islands, `noindex` |

CMS content reaches the HTML through `getSiteBundle()`
(`src/lib/serverContent.ts`), which the layouts fetch and hand to
`seedSite()` in the admin store. `CONTENT_REVALIDATE` is 300s, so an admin edit
is live to crawlers within five minutes with no deploy.

**If the API is down the build still succeeds.** Every fetcher resolves to
`null` and the site falls back to the defaults in `src/data/`. That is
deliberate — a cold backend must not take the marketing site down — and it means
a shrinking sitemap shows up as a `[content]` warning in the log rather than a
failure.

> `src/lib/siteBundle.ts` owns the one rule for applying those defaults, and
> both the routes and the store go through it. When they disagreed, a route
> advertised a slug whose page rendered nothing: HTTP 200, no `<h1>`, ~400
> characters of chrome. Do not reimplement that rule anywhere else.

## Verifying a deployment

```bash
npm run build && npm start &
npm run verify                              # defaults to http://localhost:3000
npm run verify -- https://zenova.agency     # or any deployed URL
```

`scripts/verify-site.mjs` walks every URL in `sitemap.xml` and asserts: exactly
one `<h1>` and one `<main>`, a non-empty title and description, unique titles and
descriptions across routes, a correct canonical, parseable JSON-LD, no loading
skeletons in the served HTML, that `/blog` actually links to the posts the
sitemap claims, that unknown URLs return 404, that the redirects carry a
`Location` header, and that the portals are `noindex`.

Anything that depends on the CMS is conditional on the sitemap claiming that
content exists, so a cold backend degrades to "not asserted" rather than a red
build.

## Troubleshooting

**`curl https://zenova.agency` returns a nearly empty page**
Check the `[content]` warnings in the deployment log. If `/public/site` failed,
pages render from `src/data/` defaults — that is still complete HTML, just not
the CMS copy.

**A detail page returns 200 with no `<h1>`**
The route and the page disagree about which slugs exist. Both must resolve
through `resolveSiteBundle()`. `npm run verify` catches this.

**A blog post shows as a generic website card when shared**
`og:type` should be `article` and the page should carry `BlogPosting` JSON-LD,
both from `blogPostSeo()` in `src/seo/content-seo.ts`. If they are missing, the
route is not calling it.

**An admin page appears in the sitemap**
Add its slug to `EXCLUDED_CONTENT_SLUGS` in `src/seo/seo-data.ts` — and
unpublish it in the dashboard, which is the actual fix. The list is a backstop
so the frontend can refuse to publish whatever the API hands it.

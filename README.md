# Zenova

Marketing site for Zenova — one agency for everything modern.

Built with **Next.js 14 (App Router) + React 18 + TypeScript 5**, deployed on
Vercel. See [DEPLOY.md](./DEPLOY.md) for the rendering model and deployment.

## Requirements

- Node.js **≥ 18.17** (LTS recommended)
- npm 9+ (lockfile is npm)

## Scripts

```bash
npm install        # install dependencies (first run)
npm run dev        # dev server at http://localhost:3000
npm run build      # production build
npm start          # serve the production build
npm run verify     # crawlability assertions against a running server
npm run typecheck  # tsc --noEmit
npm run lint       # eslint over .ts/.tsx
```

`npm run verify` needs a server running. It walks every URL in `sitemap.xml` and
fails on the things that quietly break SEO — a missing `<h1>`, a duplicate
title, an unparseable JSON-LD block, a loading skeleton served to a crawler. Run
it before shipping anything that touches routing, metadata or data fetching.

## Project structure

```
.
├── app/                        Next App Router — routing, metadata, data fetching
│   ├── layout.tsx              <html>, global CSS, fonts, favicons
│   ├── (marketing)/            Public pages; owns the single <main> landmark
│   ├── contact/                Outside (marketing): no nav, no footer by design
│   ├── (portal)/               /login + the client-only admin/client/team islands
│   ├── _components/            Client wrappers the server layouts mount
│   ├── _lib/                   Route-level SEO and slug resolution helpers
│   ├── sitemap.ts              Generated from seo-data + the CMS
│   └── llms.txt/, llms-full.txt/  Agent-readable site reference
├── public/                     Served at the site root (robots.txt, favicon.ico, uploads)
├── src/
│   ├── views/                  Page bodies. NOT `pages/` — that name is reserved by Next
│   ├── components/             layout/, sections/, ui/, icons/
│   ├── seo/                    seo-data (source of truth), next-metadata, content-seo, llms
│   ├── data/                   Fallback content used when the CMS is unreachable
│   ├── admin/, client/, team/  The authenticated portals (react-router islands)
│   ├── lib/                    api, serverContent, siteBundle, router shim, sanitize/dom
│   ├── hooks/                  useReveal, useSmoothScroll, useScrollReset, useTweaks
│   └── styles/global.css       Global stylesheet, imported once from app/layout.tsx
├── scripts/verify-site.mjs
├── next.config.mjs
└── tsconfig.json               paths: @/* → src/*
```

Two structural notes worth knowing before editing:

- **`src/views/`, not `src/pages/`.** Next treats a `src/pages/` directory as the
  legacy Pages Router and will try to route every file in it.
- **`src/lib/router.tsx`** is a small shim exposing react-router's API
  (`<Link to>`, `useLocation`, `useParams`, …) over Next's navigation, so the
  ~25 public components written against react-router did not need rewriting.
  The portals use real react-router; everything public uses the shim.

## Where SEO lives

`src/seo/seo-data.ts` is the single source of truth — route metadata, JSON-LD,
and the sitemap all derive from it. Routes call `routeMetadata()` /
`seoMetaToMetadata()` rather than hand-rolling tags, so ~30 routes cannot drift
apart. CMS-owned routes derive theirs from `src/seo/content-seo.ts`.

## The dev tweaks panel

`src/dev/ZenovaTweaks.tsx` mounts a floating live-tuning panel for theme,
palette, rotating-word speed and section toggles. The persisted defaults live in
`src/config/tweaks.ts` between `/*EDITMODE-BEGIN*/` and `/*EDITMODE-END*/`
markers for the host-editor handshake — keep those literals JSON-shaped.

## Styling

Most components keep inline `style={...}` objects; that matches the original
hand-tuned design. Global CSS (theme variables, animations, layout primitives,
mobile nav) lives in `src/styles/global.css`, imported once from
`app/layout.tsx`. Per-page stylesheets sit next to their view in `src/views/`.

## Theming

The public site is light-only: `data-theme="light"` is set statically on `<html>`
in `app/layout.tsx`, so the first paint is already correct with no flash. The
portals override it at runtime for users with a stored dark preference.

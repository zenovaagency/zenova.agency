# SEO-friendly blog for Zenova (Astro 7 static site)

The site currently has no blog and no content collections — all content is TS data modules. The blog will use Astro content collections (markdown), which is the right fit for long-form prose and lets every SEO signal (headings, dates, descriptions) be authored per post. All styling follows the existing design language (Tailwind v4 tokens, `.card-tint`, PageHero, `accent-serif`, `mono` eyebrows) and all new SEO plumbing mirrors the house patterns in `src/lib/schema.ts` and `Base.astro`.

## 1. Content collection — `src/content.config.ts` (new)
- `glob` loader over `src/content/blog/*.md` with a zod schema: `title`, `description` (required — used for meta description, OG, and JSON-LD), `pubDate`, `updatedDate?`, `author?` (defaults to the agency), `image?` (optional per-post OG/hero image), `draft?` (default false).
- Drafts are filtered out of routes, listing, RSS — so nothing unpublished can leak into the sitemap.

## 2. Three sample posts — `src/content/blog/*.md` (new)
Written as replaceable starter content on agency-relevant topics, each with a proper heading hierarchy (single h1 comes from frontmatter title; body uses h2/h3), a ≤160-char meta description, real dates, and internal links to existing `/services/*` pages. Text-only; `og:image` falls back to the site-wide `/og-card.png`.

## 3. Blog helper — extend `src/data/site.ts` + small helper
- Add a `Blog` entry to `PAGES` (eyebrow/headline/accent/sub/title/description, like the other page intros) and `Blog` to `NAV` — Nav and Footer pick it up automatically.
- Add `src/lib/blog.ts` with a `published()` helper (filter drafts, sort by `pubDate` desc), mirroring the pattern in `data/projects.ts`.

## 4. Blog index — `src/pages/blog/index.astro` (new)
- House-style opener (PageHero / wash recipe), post list as `.card-tint` cards: date in `<time datetime>`, title link (descriptive text, not "read more"), description.
- Empty state if no publishable posts (same pattern as `/work`).
- SEO: unique title + meta description, canonical (from Base), `BreadcrumbList` JSON-LD via the existing builder.

## 5. Post page — `src/pages/blog/[slug].astro` (new)
- `getStaticPaths` from the collection (drafts excluded); renders markdown via `render()`.
- `<article>` with a single `<h1>`, author byline, `datePublished`/`dateModified` in `<time datetime>` elements; hand-rolled scoped prose styles matching the design tokens (no typography-plugin dependency — house pattern is custom scoped CSS).
- JSON-LD (via new `blogPosting()` builder in `src/lib/schema.ts`, following existing conventions: `abs()` URLs, `@id` from route, publisher/author referencing the site-wide Organization `@id`): `BlogPosting` with headline, description, dates (ISO), image, `mainEntityOfPage` + `BreadcrumbList`.
- Closing CTA (`Cta`) and back-to-blog link.

## 6. Layout SEO upgrade — `src/layouts/Base.astro` (extend, backward-compatible)
New optional props: `ogType` (`website`|`article`), `image` (per-page OG image override), `publishedTime`, `modifiedTime`. When set it emits `og:type article`, `article:published_time`/`article:modified_time`, per-page `og:image`, and adds the currently missing `twitter:title`/`twitter:description`/`twitter:image`. Existing pages are unaffected (all props optional, defaults unchanged).

## 7. RSS feed — `src/pages/rss.xml.ts` (new) + install `@astrojs/rss`
`/rss.xml` listing published posts (title, link, description, pubDate). Complements the sitemap for discovery; also referenced from the blog index footer.

## 8. Google-guideline coverage (verified at build)
- Unique, accurate `<title>`/meta description per page; canonical URLs (existing Base behavior)
- Descriptive URL slugs (`/blog/<slug>`)
- Semantic HTML: one `<h1>`, logical heading order, `<article>`, `<time>`
- Structured data: `BlogPosting` + `BreadcrumbList` + site-wide `Organization`, article OG/Twitter tags
- Drafts never reach build output or sitemap; `@astrojs/sitemap` auto-includes `/blog` routes; `robots.txt` already declares the sitemap — no change needed

## 9. Verification
Run `astro dev --background` (per AGENTS.md) and/or `astro build`, then inspect `dist/` output: single h1 per page, canonical + OG/article tags, valid JSON-LD, sitemap entries for blog pages, `/rss.xml` renders, nav/footer links work, empty-state and draft filtering behave.

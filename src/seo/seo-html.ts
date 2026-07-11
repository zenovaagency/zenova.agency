/**
 * Pure HTML string builders used by the build-time prerender plugin
 * (see vite.config.ts). No DOM, no fs — just strings, so it is safe to import
 * from vite.config.ts. Runtime head management lives in SeoManager.tsx instead.
 */
import { ALL_ROUTES, NAV, SITE, type SeoMeta, canonicalUrl, jsonLdObjects } from './seo-data';

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function escapeAttr(s: string): string {
  return escapeHtml(s).replace(/"/g, '&quot;');
}

/** Serialize a JSON-LD object for safe embedding inside a <script> tag. */
function jsonLdScript(obj: Record<string, unknown>): string {
  const json = JSON.stringify(obj).replace(/</g, '\\u003c');
  return `<script type="application/ld+json">${json}</script>`;
}

/** The full block of SEO <head> tags for a route. */
export function headTagsHtml(meta: SeoMeta): string {
  const url = canonicalUrl(meta.path);
  const robots = meta.index ? 'index,follow' : 'noindex,follow';
  const t = escapeAttr(meta.title);
  const d = escapeAttr(meta.description);
  const img = escapeAttr(SITE.ogImage);

  const tags = [
    `<title>${escapeHtml(meta.title)}</title>`,
    `<meta name="description" content="${d}" />`,
    `<meta name="robots" content="${robots}" />`,
    `<link rel="canonical" href="${url}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="${escapeAttr(SITE.name)}" />`,
    `<meta property="og:locale" content="${SITE.locale}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:title" content="${t}" />`,
    `<meta property="og:description" content="${d}" />`,
    `<meta property="og:image" content="${img}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${t}" />`,
    `<meta name="twitter:description" content="${d}" />`,
    `<meta name="twitter:image" content="${img}" />`,
    ...jsonLdObjects(meta).map(jsonLdScript),
  ];

  return tags.map((line) => `    ${line}`).join('\n');
}

/**
 * A crawlable, semantic snapshot injected into #root. React replaces it on
 * mount (createRoot renders fresh), so it exists only for non-JS crawlers,
 * social scrapers, and first paint — no hydration mismatch.
 */
export function prerenderBodyHtml(meta: SeoMeta): string {
  const links = NAV.map(
    (l) => `<a href="${l.path}/" style="color:#ff813a;text-decoration:none">${escapeHtml(l.label)}</a>`,
  ).join('\n        ');

  const intro = meta.intro ? `<p style="opacity:.75;line-height:1.6;font-size:1.05rem">${escapeHtml(meta.intro)}</p>` : '';

  return `<div id="seo-prerender" style="max-width:760px;margin:0 auto;padding:88px 24px;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif">
      <a href="/" style="font-weight:700;letter-spacing:-.02em;color:inherit;text-decoration:none">Zenova</a>
      <h1 style="font-size:clamp(1.8rem,4vw,2.6rem);line-height:1.12;margin:28px 0 16px">${escapeHtml(meta.h1)}</h1>
      ${intro}
      <nav aria-label="Primary" style="margin-top:36px;display:flex;flex-wrap:wrap;gap:20px;font-size:.95rem">
        ${links}
      </nav>
    </div>`;
}

/**
 * Rewrite a built index.html into a route-specific HTML document: strips any
 * existing SEO tags, injects this route's head + JSON-LD, and seeds #root with
 * the crawlable snapshot. Asset/script tags from the Vite build are preserved.
 */
export function applySeoToTemplate(template: string, meta: SeoMeta): string {
  let html = template;

  // Remove SEO tags that may exist in the source template so we don't duplicate.
  html = html
    .replace(/<title>[\s\S]*?<\/title>/i, '')
    .replace(/<meta\s+name="description"[^>]*>/gi, '')
    .replace(/<meta\s+name="robots"[^>]*>/gi, '')
    .replace(/<link\s+rel="canonical"[^>]*>/gi, '')
    .replace(/<meta\s+property="og:[^"]*"[^>]*>/gi, '')
    .replace(/<meta\s+name="twitter:[^"]*"[^>]*>/gi, '')
    .replace(/<script\s+type="application\/ld\+json"[^>]*>[\s\S]*?<\/script>/gi, '');

  // Inject the route's head block right before </head>.
  html = html.replace(/<\/head>/i, `${headTagsHtml(meta)}\n  </head>`);

  // Seed #root with the crawlable snapshot.
  html = html.replace(
    /<div id="root">\s*<\/div>/i,
    `<div id="root">${prerenderBodyHtml(meta)}</div>`,
  );

  return html;
}

/** Generate sitemap.xml for all indexable routes. */
export function sitemapXml(lastmod = new Date().toISOString().slice(0, 10)): string {
  const urls = ALL_ROUTES.filter((r) => r.index)
    .map((r) => {
      return [
        '  <url>',
        `    <loc>${canonicalUrl(r.path)}</loc>`,
        `    <lastmod>${lastmod}</lastmod>`,
        `    <changefreq>${r.changefreq ?? 'monthly'}</changefreq>`,
        `    <priority>${(r.priority ?? 0.6).toFixed(1)}</priority>`,
        '  </url>',
      ].join('\n');
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

/** All routes the prerender plugin should emit static HTML for. */
export function prerenderRoutes(): SeoMeta[] {
  return ALL_ROUTES.filter((r) => r.index);
}

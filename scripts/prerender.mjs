/**
 * Build step 3 of 3 — turns the SPA shell into real static HTML.
 *
 *   1. vite build              -> dist/          (client bundle + index.html shell)
 *   2. vite build --ssr        -> dist-ssr/      (Node build of entry-server.tsx)
 *   3. node scripts/prerender  -> dist/**\/index.html
 *
 * For every route it server-renders the React tree, injects the route's <head>
 * (title/canonical/OG/Twitter/JSON-LD) into the built shell, and writes
 * dist/<route>/index.html. GitHub Pages serves those directly, so `curl` and
 * every crawler get the full page text with no JavaScript.
 *
 * Failure policy: a route that cannot render fails the build. Silently shipping
 * an empty shell is the exact regression this script exists to prevent. The one
 * tolerated failure is the API fetch for dynamic routes (see below).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  SITE,
  applySeoToTemplate,
  prerenderRoutes,
  render,
  sitemapXml,
} from '../dist-ssr/entry-server.js';

const ROOT = path.resolve(fileURLToPath(import.meta.url), '../..');
const DIST = path.join(ROOT, 'dist');
const TEMPLATE_PATH = path.join(DIST, 'index.html');
const MANIFEST_PATH = path.join(DIST, '.vite', 'manifest.json');

const API_BASE = process.env.VITE_API_URL ?? 'https://api.zenova.agency/api/v1';
/** Render free-tier cold starts can take ~30s — budget generously. */
const API_TIMEOUT_MS = 45_000;
const BLOG_PAGE_SIZE = 50;
const BLOG_MAX = 500;

/**
 * Route -> the page module that route renders, used to emit a per-route
 * modulepreload so hydration does not wait on a request waterfall. Purely an
 * optimisation: an entry missing or stale here costs a preload hint, never
 * correctness, so it does not need to be exhaustive.
 */
const ROUTE_ENTRY_MODULE = {
  '/services': 'src/pages/ServicesPage.tsx',
  '/pricing': 'src/pages/PricingPage.tsx',
  '/work': 'src/pages/WorkPage.tsx',
  '/careers': 'src/pages/CareersPage.tsx',
  '/about': 'src/pages/AboutPage.tsx',
  '/contact': 'src/pages/ContactPage.tsx',
  '/blog': 'src/pages/BlogPage.tsx',
  '/privacy': 'src/pages/LegalPage.tsx',
  '/terms': 'src/pages/LegalPage.tsx',
};

/** Prefix -> page module, for dynamic detail routes. Longest match wins. */
const ROUTE_PREFIX_MODULE = [
  ['/services/', 'src/pages/ServiceDetailPage.tsx'],
  ['/work/', 'src/pages/ProjectDetailPage.tsx'],
  ['/careers/', 'src/pages/JobDetailPage.tsx'],
  ['/blog/', 'src/pages/BlogPostPage.tsx'],
];

function moduleForRoute(routePath) {
  if (ROUTE_ENTRY_MODULE[routePath]) return ROUTE_ENTRY_MODULE[routePath];
  for (const [prefix, mod] of ROUTE_PREFIX_MODULE) {
    if (routePath.startsWith(prefix)) return mod;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Dynamic routes (blog posts + admin-authored SEO pages)
// ---------------------------------------------------------------------------

/**
 * Any failure here (API down, cold start past the timeout, offline build)
 * degrades to the static routes only. That is deliberate: the runtime
 * SeoManager still covers those pages for JS-capable crawlers, and the next
 * deploy picks the content back up. It is warned about loudly so a silently
 * shrinking sitemap is visible in the CI log.
 */
async function fetchDynamicRoutes() {
  const getJson = async (route) => {
    const res = await fetch(`${API_BASE}${route}`, {
      signal: AbortSignal.timeout(API_TIMEOUT_MS),
    });
    if (!res.ok) throw new Error(`GET ${route} -> HTTP ${res.status}`);
    return res.json();
  };

  try {
    const routes = [];

    for (let offset = 0; offset < BLOG_MAX; offset += BLOG_PAGE_SIZE) {
      const page = await getJson(`/public/blog?limit=${BLOG_PAGE_SIZE}&offset=${offset}`);
      for (const p of page.items) {
        routes.push({
          path: `/blog/${p.slug}`,
          title: p.meta_title || `${p.title} | Zenova Blog`,
          description: p.meta_description || p.excerpt || SITE.description,
          h1: p.title,
          intro: p.excerpt,
          index: true,
          changefreq: 'monthly',
          priority: 0.6,
          breadcrumb: [
            { name: 'Home', path: '/' },
            { name: 'Blog', path: '/blog' },
            { name: p.title, path: `/blog/${p.slug}` },
          ],
        });
      }
      if (offset + page.items.length >= page.total || page.items.length === 0) break;
    }

    for (const p of await getJson('/public/pages')) {
      routes.push({
        path: `/${p.slug}`,
        title: p.meta_title || `${p.title} | ${SITE.name}`,
        description: p.meta_description || SITE.description,
        h1: p.title,
        intro: '',
        index: true,
        changefreq: 'monthly',
        priority: 0.7,
        breadcrumb: [
          { name: 'Home', path: '/' },
          { name: p.title, path: `/${p.slug}` },
        ],
      });
    }

    return routes;
  } catch (err) {
    console.warn(
      `[prerender] WARNING dynamic route fetch failed (${err?.message ?? err}) — ` +
        'prerendering static routes only; the next deploy picks up API content',
    );
    return [];
  }
}

// ---------------------------------------------------------------------------
// Per-route asset preloading
// ---------------------------------------------------------------------------

function readManifest() {
  if (!fs.existsSync(MANIFEST_PATH)) {
    console.warn('[prerender] no client manifest — skipping per-route modulepreload');
    return null;
  }
  return JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
}

/** Walk a manifest entry's import graph, collecting JS chunks and CSS files. */
function collectAssets(manifest, key, seen = new Set()) {
  const entry = manifest?.[key];
  if (!entry || seen.has(key)) return { js: [], css: [] };
  seen.add(key);

  const js = [entry.file];
  const css = [...(entry.css ?? [])];
  for (const dep of entry.imports ?? []) {
    const nested = collectAssets(manifest, dep, seen);
    js.push(...nested.js);
    css.push(...nested.css);
  }
  return { js, css };
}

/**
 * Preload the chunk + stylesheet this route hydrates with. Anything the shell
 * already references is skipped, so the entry chunk is never preloaded twice.
 */
function preloadTagsFor(manifest, routePath, template, base) {
  const key = manifest && moduleForRoute(routePath);
  if (!key || !manifest[key]) return '';

  const { js, css } = collectAssets(manifest, key);
  const tags = [];
  for (const file of new Set(css)) {
    if (!template.includes(file)) tags.push(`<link rel="stylesheet" href="${base}${file}" />`);
  }
  for (const file of new Set(js)) {
    if (!template.includes(file)) tags.push(`<link rel="modulepreload" href="${base}${file}" />`);
  }
  return tags.map((t) => `    ${t}`).join('\n');
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  if (!fs.existsSync(TEMPLATE_PATH)) {
    throw new Error(`dist/index.html not found — run "vite build" first (${TEMPLATE_PATH})`);
  }
  const template = fs.readFileSync(TEMPLATE_PATH, 'utf8');
  const manifest = readManifest();

  // dist/index.html is both the shell we inject into AND the homepage we write
  // back out. Running this script twice without an intervening `vite build`
  // would therefore feed an already-prerendered homepage back in as the
  // template: <div id="root"> no longer matches the empty-root pattern, the
  // body injection silently no-ops, and EVERY route ships the homepage with
  // only its <head> swapped. Fail loudly instead of shipping that.
  if (!/<div id="root">\s*<\/div>/i.test(template)) {
    throw new Error(
      'dist/index.html has no empty <div id="root"></div> — it looks already ' +
        'prerendered. Rebuild the shell first: npm run build:client',
    );
  }

  // Matches the client build's base so preload hrefs resolve under a project-site
  // deploy (/repo/) as well as a custom domain (/).
  const baseMatch = template.match(/<script type="module"[^>]+src="([^"]*\/)assets\//);
  const base = baseMatch ? baseMatch[1] : '/';

  const dynamic = await fetchDynamicRoutes();
  const routes = [...prerenderRoutes(), ...dynamic];

  let rendered = 0;
  const failures = [];

  for (const meta of routes) {
    let html;
    try {
      const body = await render(meta.path);
      if (!body || body.trim().length === 0) {
        throw new Error('SSR produced empty markup');
      }
      html = applySeoToTemplate(template, meta, body);
    } catch (err) {
      failures.push(`${meta.path}: ${err?.message ?? err}`);
      continue;
    }

    const preloads = preloadTagsFor(manifest, meta.path, template, base);
    // Function replacement — see the note in applySeoToTemplate.
    if (preloads) html = html.replace(/<\/head>/i, () => `${preloads}\n  </head>`);

    const outPath =
      meta.path === '/'
        ? TEMPLATE_PATH
        : path.join(DIST, meta.path.replace(/^\//, ''), 'index.html');
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, html);
    rendered += 1;
  }

  if (failures.length) {
    throw new Error(`prerender failed for ${failures.length} route(s):\n  - ${failures.join('\n  - ')}`);
  }

  fs.writeFileSync(path.join(DIST, 'sitemap.xml'), sitemapXml(dynamic));

  // build.manifest is a build-time input to this script, not something the site
  // should serve. Drop it so dist/ contains only publishable files.
  fs.rmSync(path.join(DIST, '.vite'), { recursive: true, force: true });

  // The whole point of this script. If the homepage shell came out empty the
  // build must not ship — that is the regression that started all of this.
  assertHomepageHasContent();

  console.log(
    `[prerender] ${rendered} routes (${dynamic.length} from API) + sitemap.xml -> dist/`,
  );
}

function assertHomepageHasContent() {
  const home = fs.readFileSync(TEMPLATE_PATH, 'utf8');
  const rootMatch = home.match(/<div id="root"[^>]*>([\s\S]*?)<\/div><\/body>|<div id="root"[^>]*>([\s\S]*)/i);
  const inner = (rootMatch?.[1] ?? rootMatch?.[2] ?? '').trim();
  if (inner.length < 1000) {
    throw new Error(
      `dist/index.html #root holds only ${inner.length} chars of markup — ` +
        'the homepage did not server-render. Refusing to ship an empty shell.',
    );
  }
  if (!/<h1[\s>]/i.test(home)) {
    throw new Error('dist/index.html contains no <h1> — homepage did not server-render.');
  }
}

main().catch((err) => {
  console.error(`\n[prerender] ${err?.stack ?? err}\n`);
  process.exit(1);
});

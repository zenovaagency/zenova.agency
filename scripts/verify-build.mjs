/**
 * Post-build assertion that dist/ is actually crawlable.
 *
 * Runs as the last step of `npm run build`, so it guards CI *and* every local
 * build without the deploy workflow needing to know it exists.
 *
 * It exists because the obvious checks are the useless ones. "dist/index.html
 * exists" and "index.html does not reference src/main.tsx" were both true of
 * the build that shipped an empty <div id="root"> to every crawler — the shell
 * was fine, there was just nothing in it. Everything below asserts the content
 * is really there.
 *
 * Route expectations come from prerenderRoutes()/canonicalUrl() in seo-data, so
 * adding a route to the SEO table automatically extends this check rather than
 * silently escaping it.
 *
 * Run standalone with `npm run verify` (needs a completed build in dist/ and
 * the SSR bundle in dist-ssr/).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { canonicalUrl, prerenderRoutes } from '../dist-ssr/entry-server.js';

const ROOT = path.resolve(fileURLToPath(import.meta.url), '../..');
const DIST = path.join(ROOT, 'dist');

const failures = [];
// Declared up front, not at their point of use: report() can be called from the
// missing-files check above them, and a const in the temporal dead zone would
// turn a clear "sitemap.xml is missing" into a ReferenceError.
let routeCount = 0;
let sitemapUrls = 0;

const fail = (msg) => failures.push(msg);
const read = (rel) => fs.readFileSync(path.join(DIST, rel), 'utf8');
const exists = (rel) => fs.existsSync(path.join(DIST, rel));

// --- files that must ship ---------------------------------------------------
for (const f of ['index.html', '404.html', '.nojekyll', 'sitemap.xml', 'robots.txt', 'llms.txt']) {
  if (!exists(f)) fail(`dist/${f} is missing`);
}
if (failures.length) report();

const home = read('index.html');

// --- the homepage must be prerendered, not an empty shell -------------------
if (/<div id="root">\s*<\/div>/i.test(home)) {
  fail('dist/index.html has an empty #root — prerendering did not run');
}
// Positive assertion, not merely "not empty": this attribute is what main.tsx
// keys hydrateRoot() off. Without it the browser silently does a full client
// render and throws the prerendered markup away.
if (!home.includes('<div id="root" data-prerendered>')) {
  fail('dist/index.html is missing data-prerendered on #root');
}
if (!/<h1[\s>]/i.test(home)) {
  fail('dist/index.html contains no <h1> — homepage did not prerender');
}
if (/src\/main\.tsx/.test(home)) {
  fail('dist/index.html still references raw TypeScript source');
}

// --- every indexable route ships its own document ---------------------------
const routes = prerenderRoutes();
routeCount = routes.length;
for (const meta of routes) {
  const rel = meta.path === '/' ? 'index.html' : `${meta.path.replace(/^\//, '')}/index.html`;
  if (!exists(rel)) {
    fail(`dist/${rel} missing — ${meta.path} was not prerendered`);
    continue;
  }
  const html = read(rel);
  const want = `<link rel="canonical" href="${canonicalUrl(meta.path)}" />`;
  if (!html.includes(want)) {
    fail(`dist/${rel} has the wrong canonical (expected ${canonicalUrl(meta.path)})`);
  }
  if (!html.includes('<div id="root" data-prerendered>')) {
    fail(`dist/${rel} was not prerendered`);
  }
  // Catches the shell-reused-as-template failure, where every route renders but
  // they all carry the homepage body with only the <head> swapped.
  if (meta.path !== '/' && bodyOf(html) === bodyOf(home)) {
    fail(`dist/${rel} has the same body as the homepage`);
  }
}

// --- sitemap ----------------------------------------------------------------
// The API-sourced entries (blog posts, admin SEO pages) are legitimately absent
// when api.zenova.agency is cold — the prerenderer degrades softly and warns.
// The static routes never are, so the floor is exactly that count.
const sitemap = read('sitemap.xml');
sitemapUrls = (sitemap.match(/<loc>/g) ?? []).length;
if (sitemapUrls < routes.length) {
  fail(`sitemap.xml lists ${sitemapUrls} URLs; expected at least ${routes.length} static routes`);
}

report();

/**
 * Everything inside #root, whitespace-normalised, for comparing two pages'
 * rendered content. Normalising matters: a raw byte compare treats a CRLF/LF
 * difference as "these pages differ" and silently lets the duplicate-body bug
 * through, which is exactly how this check first failed its own negative test.
 */
function bodyOf(html) {
  const i = html.indexOf('<div id="root"');
  return i === -1 ? '' : html.slice(i).replace(/\s+/g, ' ').trim();
}

function report() {
  if (failures.length) {
    console.error('\n[verify] dist/ is not deployable:\n');
    for (const f of failures) console.error(`  ✗ ${f}`);
    console.error('');
    process.exit(1);
  }
  console.log(
    `[verify] ${routeCount} routes prerendered, ${sitemapUrls} sitemap URLs, #root populated.`,
  );
}

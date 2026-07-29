/**
 * Post-build assertion that the running site is actually crawlable.
 *
 * Replaces scripts/verify-build.mjs, which inspected static files in dist/.
 * There is no dist/ any more — pages are rendered by the server — so this
 * drives a real HTTP server instead:
 *
 *     npm run build && npm start &        # or: next dev
 *     npm run verify                      # defaults to http://localhost:3000
 *     npm run verify -- http://localhost:3111
 *
 * It exists because the obvious checks are the useless ones. "index.html
 * exists" and "it does not reference src/main.tsx" were both true of the build
 * that shipped an empty <div id="root"> to every crawler — the shell was fine,
 * there was just nothing in it. Everything below asserts the content is really
 * there.
 *
 * The route list comes from sitemap.xml, i.e. from the site's own claims about
 * itself. That matters for the API-backed routes: when api.zenova.agency is
 * cold the CMS entries are legitimately absent, and a check that fails CI for
 * that would be bypassed within a week and then protect nothing. Everything
 * conditional degrades to "not asserted" rather than "failed".
 */
const BASE = (process.argv[2] ?? process.env.VERIFY_BASE_URL ?? 'http://localhost:3000').replace(
  /\/+$/,
  '',
);

/** See the note at the length assertion below for how this number was chosen. */
const MIN_TEXT = 200;

const failures = [];
const notes = [];
const fail = (msg) => failures.push(msg);
const note = (msg) => notes.push(msg);

/** Fetch a URL without following redirects, so status codes can be asserted. */
async function get(path, { redirect = 'follow' } = {}) {
  const res = await fetch(`${BASE}${path}`, { redirect });
  const body = res.headers.get('content-type')?.includes('image/') ? '' : await res.text();
  return { status: res.status, headers: res.headers, body };
}

const countOf = (html, re) => (html.match(re) ?? []).length;

/** The raw text of every <script type="application/ld+json"> in a document. */
function jsonLdBlocks(html) {
  const re = /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi;
  return [...html.matchAll(re)].map((m) => m[1]);
}

/** Visible text, for length assertions. Markup-heavy skeletons collapse to ~nothing. */
function visibleText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Parse robots.txt into records-of-rules.
 *
 * Consecutive `User-agent:` lines form ONE group sharing the rules beneath
 * them — the file names ~20 AI crawlers that way. A new group only begins at a
 * User-agent line that follows a rule line. Splitting on every User-agent line
 * instead would report each named agent as having no rules at all.
 */
function parseRobotsGroups(text) {
  const groups = [];
  let current = null;
  let lastWasAgent = false;

  for (const raw of text.split(/\r?\n/)) {
    const line = raw.replace(/#.*$/, '').trim();
    if (!line) continue;
    const [field, ...rest] = line.split(':');
    const key = field.trim().toLowerCase();
    const value = rest.join(':').trim();

    if (key === 'user-agent') {
      if (!current || !lastWasAgent) {
        current = { agents: [], allow: [], disallow: [] };
        groups.push(current);
      }
      current.agents.push(value);
      lastWasAgent = true;
      continue;
    }
    lastWasAgent = false;
    if (!current) continue;
    if (key === 'disallow') current.disallow.push(value);
    if (key === 'allow') current.allow.push(value);
  }
  return groups;
}

function record(map, key, value) {
  const list = map.get(key);
  if (list) list.push(value);
  else map.set(key, [value]);
}

async function main() {
  // --- the files agents and crawlers look for first ------------------------
  for (const [path, expect] of [
    ['/robots.txt', /Sitemap:\s*https?:\/\/\S+\/sitemap\.xml/i],
    ['/sitemap.xml', /<urlset/i],
    ['/llms.txt', /^#\s+Zenova/m],
    ['/llms-full.txt', /Zenova/],
    ['/favicon.ico', null],
  ]) {
    const res = await get(path);
    if (res.status !== 200) {
      fail(`${path} -> HTTP ${res.status} (expected 200)`);
      continue;
    }
    if (expect && !expect.test(res.body)) fail(`${path} is served but its content looks wrong`);
  }

  // robots.txt must keep the portals out. The duplicated Disallow block under
  // the named AI crawlers is load-bearing: a crawler obeys only the most
  // specific group naming it and ignores `User-agent: *` entirely, so dropping
  // it would grant ~20 AI agents access to /admin/.
  const robots = (await get('/robots.txt')).body;
  for (const group of parseRobotsGroups(robots)) {
    for (const dir of ['/admin/', '/client/', '/team/']) {
      if (!group.disallow.includes(dir)) {
        fail(`robots.txt group [${group.agents.join(', ')}] does not Disallow ${dir}`);
      }
    }
  }

  // --- every URL the sitemap advertises ------------------------------------
  const sitemap = (await get('/sitemap.xml')).body;
  const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  if (locs.length === 0) fail('sitemap.xml lists no URLs');

  // Excluded slugs must never appear.
  for (const slug of ['test-seo']) {
    if (locs.some((u) => u.includes(`/${slug}/`))) fail(`sitemap.xml lists excluded slug /${slug}/`);
  }

  const titles = new Map();
  const descriptions = new Map();
  const blogUrls = locs.filter((u) => /\/blog\/[^/]+\/$/.test(u));

  for (const loc of locs) {
    const path = new URL(loc).pathname;
    const res = await get(path);

    if (res.status !== 200) {
      fail(`${path} -> HTTP ${res.status} (listed in sitemap.xml, must be 200)`);
      continue;
    }
    const html = res.body;

    // Exactly one <h1>. Zero means the page did not render its heading; more
    // than one dilutes the primary topic signal and fails Lighthouse's SEO audit.
    const h1s = countOf(html, /<h1[\s>]/gi);
    if (h1s !== 1) fail(`${path} has ${h1s} <h1> elements (expected exactly 1)`);

    // Exactly one <main>. Three detail pages used to render their own <main>
    // inside the layout's, producing two landmarks in one document.
    const mains = countOf(html, /<main[\s>]/gi);
    if (mains !== 1) fail(`${path} has ${mains} <main> elements (expected exactly 1)`);

    const title = (html.match(/<title>([\s\S]*?)<\/title>/i) ?? [])[1]?.trim();
    const desc = (html.match(/<meta name="description" content="([^"]*)"/i) ?? [])[1]?.trim();
    if (!title) fail(`${path} has no <title>`);
    if (!desc) fail(`${path} has no meta description`);
    if (title) record(titles, title, path);
    if (desc) record(descriptions, desc, path);

    const canonical = (html.match(/<link rel="canonical" href="([^"]*)"/i) ?? [])[1];
    if (canonical !== loc) fail(`${path} canonical is ${canonical ?? '(missing)'}, expected ${loc}`);

    // Every ld+json block must parse. A malformed block is invisible in the
    // rendered page and silently discards ALL structured data on it, so this is
    // the only place it can be caught before deploy.
    for (const [i, block] of jsonLdBlocks(html).entries()) {
      try {
        JSON.parse(block);
      } catch (err) {
        fail(`${path} JSON-LD block #${i + 1} is not valid JSON: ${err.message}`);
      }
    }

    // Loading skeletons must never reach a crawler. /blog shipped six skeleton
    // cards and zero links to any post for months, and every check above passed
    // on it — a skeleton has a title, a description, a canonical and one <h1>.
    if (/class="[^"]*\bskel\b|class="[^"]*skel-/.test(html)) {
      fail(`${path} contains loading-skeleton markup — it was served before its data resolved`);
    }

    // Blunt backstop for a page that renders but says nothing.
    //
    // The floor is calibrated against the real pages, not guessed: the shortest
    // genuine page on this site is /contact at 399 characters (it is a form, and
    // it was 399 in the pre-migration build too). MIN_TEXT sits at roughly half
    // of that, low enough that no copy edit will ever trip it and high enough to
    // catch a document that rendered nothing but chrome.
    const text = visibleText(html);
    if (text.length < MIN_TEXT) {
      fail(`${path} has only ${text.length} chars of visible text — it did not really render`);
    }
  }

  for (const [title, paths] of titles) {
    if (paths.length > 1) fail(`duplicate <title> "${title}" on: ${paths.join(', ')}`);
  }
  for (const [desc, paths] of descriptions) {
    if (paths.length > 1) {
      fail(`duplicate meta description on: ${paths.join(', ')} ("${desc.slice(0, 60)}…")`);
    }
  }

  // --- the blog hub must link to the blog ----------------------------------
  // This is the check that would have caught the original bug. Conditional on
  // the sitemap actually claiming posts exist, so a cold API skips it.
  if (blogUrls.length > 0) {
    const hub = (await get('/blog/')).body;
    const linked = blogUrls.filter((u) => hub.includes(new URL(u).pathname.replace(/\/$/, '')));
    const want = Math.min(3, blogUrls.length);
    if (linked.length < want) {
      fail(
        `/blog/ links to ${linked.length} of ${blogUrls.length} posts in sitemap.xml ` +
          `(expected at least ${want}) — the hub is not a crawl path to the articles`,
      );
    }

    // Article semantics on the post pages themselves.
    for (const url of blogUrls) {
      const path = new URL(url).pathname;
      const html = (await get(path)).body;
      if (!/property="og:type" content="article"/.test(html)) {
        fail(`${path} does not declare og:type=article`);
      }
      const hasBlogPosting = jsonLdBlocks(html).some((b) => {
        try {
          return JSON.stringify(JSON.parse(b)).includes('"BlogPosting"');
        } catch {
          return false;
        }
      });
      if (!hasBlogPosting) fail(`${path} has no BlogPosting JSON-LD`);
    }
  } else {
    note('no blog posts in sitemap.xml — blog assertions skipped (API cold?)');
  }

  // --- unknown URLs must 404, not 200 --------------------------------------
  for (const path of [
    '/this-page-does-not-exist/',
    '/services/not-a-service/',
    '/work/not-a-project/',
    '/careers/not-a-role/',
    '/blog/not-a-post/',
  ]) {
    const { status } = await get(path);
    if (status !== 404) fail(`${path} -> HTTP ${status} (expected 404)`);
  }

  // --- permanent redirects must carry a Location header --------------------
  // A Server Component calling redirect() answers 307/308 with no Location for
  // a plain document request, which nothing can follow. These live in
  // next.config.mjs precisely so they emit a real header.
  for (const [from, to] of [
    ['/process', '/services/'],
    ['/signin', '/login/'],
    ['/admin/login', '/login/'],
  ]) {
    const res = await get(from, { redirect: 'manual' });
    if (res.status < 300 || res.status >= 400) {
      fail(`${from} -> HTTP ${res.status} (expected a redirect)`);
      continue;
    }
    if (!res.headers.get('location')) fail(`${from} redirects without a Location header`);
    const final = await fetch(`${BASE}${from}`);
    if (new URL(final.url).pathname !== to) {
      fail(`${from} lands on ${new URL(final.url).pathname}, expected ${to}`);
    }
  }

  // --- the portals must be noindex ----------------------------------------
  for (const path of ['/admin/', '/client/', '/team/', '/login/']) {
    const html = (await get(path)).body;
    if (!/<meta name="robots" content="noindex/i.test(html)) {
      fail(`${path} is missing a noindex robots meta`);
    }
  }

  report(locs.length);
}

function report(routeCount) {
  for (const n of notes) console.log(`  · ${n}`);
  if (failures.length) {
    console.error(`\n[verify] ${BASE} is not deployable:\n`);
    for (const f of failures) console.error(`  ✗ ${f}`);
    console.error('');
    process.exit(1);
  }
  console.log(`\n[verify] ${routeCount} sitemap routes served, crawlable, and uniquely titled.`);
}

main().catch((err) => {
  console.error(`\n[verify] ${err?.stack ?? err}\n`);
  process.exit(1);
});

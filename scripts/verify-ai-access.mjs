/**
 * Prove that AI crawlers can actually retrieve and understand this site.
 *
 *     npm run verify:ai                          # checks production
 *     npm run verify:ai -- http://localhost:3000
 *
 * scripts/verify-site.mjs already asserts the pages are crawlable. This asks a
 * different and narrower question: when the specific user-agents that feed AI
 * assistants ask for a page, do they get the same complete document a browser
 * gets, and can a model answer real questions about the company from it?
 *
 * The two failure modes it is built to catch are both silent:
 *
 *  - **Blocking.** A WAF, bot-protection rule, or rate limiter that treats an
 *    unknown user-agent as an attack. Nothing in the app changes, no error is
 *    logged on the site's side, and the only symptom is that the company
 *    quietly stops appearing in AI answers.
 *  - **Cloaking.** The crawler receiving materially less than a browser does.
 *    Usually accidental — a CDN serving a cached shell, or an edge rule
 *    stripping content — but search engines treat it as deceptive, and a model
 *    that receives an empty page simply has nothing to say about you.
 *
 * Both are checked by differential comparison against a normal Chrome UA
 * rather than against a fixed threshold, because the honest answer to "is this
 * enough HTML" depends entirely on the page.
 */
const BASE = (process.argv[2] ?? process.env.VERIFY_BASE_URL ?? 'https://zenova.agency').replace(
  /\/+$/,
  '',
);

/**
 * The user-agents that matter, and what each one feeds.
 *
 * Training-only crawlers (CCBot, Google-Extended) are deliberately absent:
 * they affect what future models know, not what today's assistants can look
 * up, and a failure there is not urgent in the way a search crawler failure is.
 */
const CRAWLERS = [
  ['GPTBot', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; GPTBot/1.2; +https://openai.com/gptbot', 'OpenAI crawl'],
  ['OAI-SearchBot', 'Mozilla/5.0 (compatible; OAI-SearchBot/1.0; +https://openai.com/searchbot)', 'ChatGPT Search'],
  ['ChatGPT-User', 'Mozilla/5.0 (compatible; ChatGPT-User/1.0; +https://openai.com/bot)', 'ChatGPT browsing'],
  ['ClaudeBot', 'Mozilla/5.0 (compatible; ClaudeBot/1.0; +claudebot@anthropic.com)', 'Claude crawl'],
  ['Claude-User', 'Mozilla/5.0 (compatible; Claude-User/1.0; +Claude-User@anthropic.com)', 'Claude browsing'],
  ['PerplexityBot', 'Mozilla/5.0 (compatible; PerplexityBot/1.0; +https://perplexity.ai/perplexitybot)', 'Perplexity'],
  ['bingbot', 'Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)', 'Bing → Copilot'],
  ['Googlebot', 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)', 'Google → AI Overviews'],
];

const BROWSER_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

/**
 * Pages an assistant would need to answer "what do they do / cost / how to
 * reach them", and what each must actually yield.
 *
 * /contact is checked for a reachable contact method rather than a word count.
 * It is a form page — most of its meaning lives in labels and placeholders, not
 * prose — so a length threshold either fails it forever or is set so low it
 * asserts nothing. "Does this page give a model a way to contact the company"
 * is the question that matters, and it is directly checkable.
 */
const PAGES = [
  { path: '/', minText: 1500 },
  { path: '/services/', minText: 1500 },
  { path: '/pricing/', minText: 1000 },
  { path: '/contact/', minText: 250, mustMatch: /[\w.+-]+@[\w-]+\.[\w.]+/, expects: 'an email address' },
];

const failures = [];
const notes = [];

async function get(path, ua) {
  const res = await fetch(`${BASE}${path}`, { headers: { 'user-agent': ua } });
  return { status: res.status, body: await res.text() };
}

function visibleText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Every JSON-LD node in the document, flattened out of its nesting. */
function schemaNodes(html) {
  const blocks = [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)];
  const out = [];
  const walk = (n) => {
    if (Array.isArray(n)) return n.forEach(walk);
    if (n && typeof n === 'object') {
      if (n['@type']) out.push(n);
      Object.values(n).forEach(walk);
    }
  };
  for (const [, raw] of blocks) {
    try {
      walk(JSON.parse(raw));
    } catch {
      failures.push('a JSON-LD block does not parse — models that read schema will skip it');
    }
  }
  return out;
}

console.log(`\n[verify:ai] ${BASE}\n`);

// --- 1. robots.txt must not exclude the assistants ---------------------------

const robots = await get('/robots.txt', BROWSER_UA);
if (robots.status !== 200) {
  failures.push(`robots.txt returned ${robots.status}`);
} else {
  for (const [name] of CRAWLERS) {
    // A `Disallow: /` under a group naming this agent would shut it out entirely.
    const group = new RegExp(`user-agent:\\s*${name}[\\s\\S]*?(?=user-agent:|$)`, 'i');
    const m = robots.body.match(group);
    if (m && /disallow:\s*\/\s*$/im.test(m[0])) {
      failures.push(`robots.txt blocks ${name} at the site root`);
    }
  }
  if (!/sitemap:/i.test(robots.body)) failures.push('robots.txt does not advertise a sitemap');
  console.log('  robots.txt        allows every checked assistant, sitemap advertised');
}

// --- 2. Each crawler gets the same document a browser gets -------------------

const reference = await get('/', BROWSER_UA);
if (reference.status !== 200) {
  failures.push(`baseline browser request to / returned ${reference.status}`);
}
const refLen = visibleText(reference.body).length;

for (const [name, ua, feeds] of CRAWLERS) {
  const res = await get('/', ua);
  const len = visibleText(res.body).length;

  if (res.status !== 200) {
    failures.push(`${name} (${feeds}) got HTTP ${res.status} — it is being blocked`);
    continue;
  }
  // Cloaking check. Small deltas are normal (timestamps, nonces); a crawler
  // seeing under 90% of a browser's text is being served something different.
  const ratio = refLen ? len / refLen : 0;
  if (ratio < 0.9) {
    failures.push(
      `${name} sees ${Math.round(ratio * 100)}% of the text a browser sees — content is being withheld`,
    );
  } else {
    console.log(`  ${name.padEnd(17)} 200, ${len} chars (${Math.round(ratio * 100)}% of browser)  → ${feeds}`);
  }
}

// --- 3. The agent-readable files -------------------------------------------

for (const f of ['/llms.txt', '/llms-full.txt', '/sitemap.xml']) {
  const res = await get(f, CRAWLERS[0][1]);
  if (res.status !== 200) failures.push(`${f} returned ${res.status} to GPTBot`);
  else console.log(`  ${f.padEnd(17)} 200, ${res.body.length} bytes`);
}

// --- 4. Can a model actually answer questions about the company? ------------

const home = await get('/', CRAWLERS[0][1]);
const nodes = schemaNodes(home.body);
const org = nodes.find((n) => n['@type'] === 'Organization');

if (!org) {
  failures.push('no Organization node — nothing tells a model what this company IS');
} else {
  const answerable = {
    'what it is called': org.name,
    'what it does': org.description,
    'what it sells': nodes.some((n) => n['@type'] === 'Service'),
    'what it charges': nodes.some((n) => n['@type'] === 'Offer'),
    'how to reach it': org.email || org.telephone,
    'where it operates': org.areaServed,
    'who vouches for it': nodes.some((n) => n['@type'] === 'Review'),
    'common questions': nodes.some((n) => n['@type'] === 'FAQPage'),
  };
  console.log('\n  A model reading the homepage can answer:');
  for (const [q, v] of Object.entries(answerable)) {
    console.log(`    ${v ? '✓' : '✗'} ${q}`);
    if (!v) notes.push(`schema does not answer "${q}"`);
  }

  // Facts that are absent by choice (see BUSINESS_NAP in src/seo/seo-data.ts)
  // are reported as notes, never failures — publishing placeholder address or
  // phone data is worse than publishing none.
  for (const k of ['telephone', 'address', 'foundingDate']) {
    if (!org[k]) notes.push(`Organization has no ${k} — an assistant cannot state it`);
  }
}

// --- 5. The pages that answer buying questions ------------------------------

console.log('');
for (const { path, minText, mustMatch, expects } of PAGES) {
  const res = await get(path, CRAWLERS[0][1]);
  const text = visibleText(res.body);

  if (res.status !== 200) {
    failures.push(`${path} returned ${res.status} to GPTBot`);
    continue;
  }
  if (text.length < minText) {
    failures.push(`${path} has ${text.length} chars of text for a crawler, expected ≥ ${minText}`);
    continue;
  }
  if (mustMatch && !mustMatch.test(text)) {
    failures.push(`${path} does not expose ${expects} to a crawler`);
    continue;
  }
  console.log(
    `  ${path.padEnd(17)} ${text.length} chars${mustMatch ? `, exposes ${expects}` : ''}`,
  );
}

// --- report -----------------------------------------------------------------

if (notes.length) {
  console.log('\n  Notes (not failures):');
  for (const n of [...new Set(notes)]) console.log(`    - ${n}`);
}

if (failures.length) {
  console.error(`\n[verify:ai] ${failures.length} problem(s):`);
  for (const f of failures) console.error(`  ✗ ${f}`);
  process.exit(1);
}

console.log('\n[verify:ai] every checked assistant can reach and understand this site.\n');

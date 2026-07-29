/**
 * Push the site's URLs to the IndexNow API.
 *
 *     npm run indexnow                 # every URL in the live sitemap
 *     npm run indexnow -- /blog/x/ /   # just these paths
 *     npm run indexnow -- --dry-run    # show what would be sent, send nothing
 *
 * Why this exists, given the sitemap already does a job:
 *
 * A sitemap is a *pull* mechanism — it tells a crawler what exists once the
 * crawler decides to come and look, which for a small site can be days or
 * weeks after a change. IndexNow is *push*: one HTTP call and the URL is
 * queued for recrawl in minutes.
 *
 * The reason to care is downstream of Bing rather than Bing itself. ChatGPT
 * Search and Microsoft Copilot both draw on Bing's index, so "how fast does
 * Bing know" is effectively "how fast can an AI assistant cite this page".
 * Yandex and Seznam share the same IndexNow endpoint. Google does NOT
 * participate — Google discovery still comes from the sitemap and Search
 * Console, which is why this replaces neither.
 *
 * The key lives at /<key>.txt in public/ because that is how IndexNow proves
 * you control the domain: it fetches that file and checks the contents match
 * the key in the payload. If the file 404s the whole submission is rejected,
 * so the check below runs first and fails loudly rather than reporting a
 * cheerful 200 for a submission that was actually thrown away.
 */
const KEY = '2d18a273bed1993264818191a9cd316e';
const HOST = 'zenova.agency';
const ORIGIN = `https://${HOST}`;
const ENDPOINT = 'https://api.indexnow.org/indexnow';

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const explicit = args.filter((a) => !a.startsWith('--'));

/** Pull every <loc> out of the live sitemap. */
async function urlsFromSitemap() {
  const res = await fetch(`${ORIGIN}/sitemap.xml`);
  if (!res.ok) throw new Error(`sitemap.xml returned ${res.status}`);
  const xml = await res.text();
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
}

/**
 * IndexNow rejects the whole batch if any URL is on a different host, so
 * normalise to absolute same-origin URLs rather than trusting the input.
 */
function toAbsolute(pathOrUrl) {
  const u = new URL(pathOrUrl, ORIGIN);
  if (u.host !== HOST) throw new Error(`refusing to submit off-host URL: ${u.href}`);
  return u.href;
}

async function assertKeyIsLive() {
  const keyUrl = `${ORIGIN}/${KEY}.txt`;
  const res = await fetch(keyUrl);
  if (!res.ok) {
    throw new Error(
      `key file ${keyUrl} returned ${res.status}. Deploy public/${KEY}.txt before submitting — ` +
        `IndexNow silently discards submissions it cannot verify.`,
    );
  }
  const body = (await res.text()).trim();
  if (body !== KEY) {
    throw new Error(`key file contents (${body.slice(0, 24)}…) do not match the key in this script`);
  }
}

const urls = (explicit.length ? explicit : await urlsFromSitemap()).map(toAbsolute);

if (!urls.length) {
  console.error('[indexnow] no URLs to submit');
  process.exit(1);
}

console.log(`[indexnow] ${urls.length} URL(s)`);
for (const u of urls) console.log(`  ${u}`);

if (dryRun) {
  // Returning rather than process.exit(0): an abrupt exit while fetch's keep-alive
  // sockets are still open trips a libuv assertion on Windows.
  console.log('[indexnow] --dry-run, nothing sent');
} else {

  await assertKeyIsLive();

  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({
      host: HOST,
      key: KEY,
      keyLocation: `${ORIGIN}/${KEY}.txt`,
      urlList: urls,
    }),
  });

  // 200 = accepted, 202 = accepted but the key is still being verified. Both fine.
  if (res.status === 200 || res.status === 202) {
    console.log(`[indexnow] accepted (HTTP ${res.status})`);
  } else {
    console.error(`[indexnow] rejected: HTTP ${res.status} ${await res.text()}`);
    process.exitCode = 1;
  }
}

# Getting AI assistants to answer questions about Zenova

The goal: someone asks ChatGPT, Claude, Perplexity or Copilot "what does Zenova
do / what do they charge / how do I reach them" and gets a correct, complete
answer.

## First, an important fact about what is actually live

`zenova.agency` is served by **GitHub Pages**, not Vercel — verified on the live
response (`Server: GitHub.com`). The repo has been migrated to a Next.js App
Router app and a Vercel project is linked (`zenova-agency`), but **the domain
was never pointed at it**. The live site is the older static prerender from
before the migration.

The good news is that the live site is genuinely crawlable anyway — the
pre-migration build already prerendered real HTML with full JSON-LD, which is
why the crawler audit below passes against it.

What is **not** live, and only arrives when the domain moves to Vercel:

| Undeployed | Effect today |
|---|---|
| `/process` and `/signin` 308 redirects | both **404** on the live site right now |
| `test-seo` sitemap exclusion | `/test-seo/`, an admin scratch page, is advertised in the live `sitemap.xml` as a real indexable URL |
| Server-rendered 404 with nav/footer | dead URLs return a bare page |
| `h1 → h2 → h3` heading order on pricing + service pages | live pages still skip `h1 → h3` |
| Correct `decoding`/`fetchPriority` on images | minor Core Web Vitals |

Deciding when to cut the domain over is your call — it is a DNS change with the
usual propagation caveats, and the current site is not broken. But until it
happens, the fixes in this repo are not the ones AI crawlers are reading.

## Where things stand for AI crawlers

Every AI crawler that matters receives the complete, server-rendered document —
no blocking, no cloaking, no JavaScript required:

```
npm run verify:ai
```

Last run against `https://zenova.agency`:

| Crawler | Feeds | Result |
|---|---|---|
| GPTBot | OpenAI training crawl | 200, 100% of browser text |
| OAI-SearchBot | ChatGPT Search | 200, 100% |
| ChatGPT-User | ChatGPT browsing | 200, 100% |
| ClaudeBot / Claude-User | Claude | 200, 100% |
| PerplexityBot | Perplexity | 200, 100% |
| bingbot | Bing → **Copilot + ChatGPT Search** | 200, 100% |
| Googlebot | Google → **AI Overviews** | 200, 100% |

A model reading the homepage alone can already answer: what the company is
called, what it does, what it sells, what it charges, how to reach it, where it
operates, who vouches for it, and the common questions.

**So the remaining work is not markup. It is discovery** — being *in* the
indexes these assistants query — and a few missing facts.

### One thing to be clear about: `llms.txt`

The site serves `/llms.txt` and `/llms-full.txt`, and they are good. But **no
major AI system reads them today** — not OpenAI, Anthropic, Google or
Perplexity. It is a proposed convention, not an implemented one. Keep them
(they cost nothing, they are generated from real data so they cannot go stale,
and the convention may well be adopted), but do not expect them to move the
needle. What moves the needle is the Google and Bing indexes.

---

## What you need to do

### 1. Bing Webmaster Tools — the highest-leverage step 🔴

Bing's index feeds **both Copilot and ChatGPT Search**. It is the single most
direct route into an AI assistant, and it is the one most people skip.

- [ ] Go to [bing.com/webmasters](https://www.bing.com/webmasters/) and sign in.
- [ ] **Add site** → `https://zenova.agency`.
- [ ] Easiest verification: **Import from Google Search Console** (once step 2 is
      done). Otherwise add the DNS TXT record it gives you in Cloudflare.
- [ ] **Sitemaps** → submit `https://zenova.agency/sitemap.xml`.
- [ ] In **Settings → API access**, note that IndexNow is already wired (below).

### 2. Google Search Console 🔴

Feeds AI Overviews and Gemini. Full step-by-step is in `SEO-NEXT-STEPS.md` §1 —
verify via a Cloudflare DNS TXT record, submit `sitemap.xml`, then request
indexing on the key pages.

### 3. Deploy, then push URLs with IndexNow 🟠

IndexNow tells Bing/Yandex about changes **in minutes** instead of waiting for a
crawl. Already built — but the key file has to be live first, because IndexNow
verifies domain ownership by fetching it.

> The key lives at `public/2d18a273bed1993264818191a9cd316e.txt`. On the current
> GitHub Pages deploy that path is only served if the static build copies
> `public/` to the site root — confirm with the `curl` below before submitting.
> After a Vercel cutover it is served automatically.

```bash
# after the next deploy, confirm the key file is live:
curl https://zenova.agency/2d18a273bed1993264818191a9cd316e.txt

npm run indexnow -- --dry-run   # show what would be sent
npm run indexnow                # submit every URL in the live sitemap
npm run indexnow -- /blog/new-post/   # or just what changed
```

Worth re-running whenever you publish a post or add a service. Google does not
participate in IndexNow — that is what the sitemap and Search Console are for.

### 4. Fill in the missing facts 🟠

Three things an assistant currently **cannot** state about Zenova, because the
site does not publish them as data:

- **telephone**
- **address** — note the contact page tells humans "Brooklyn, NY — Headquarters"
  and "Berlin — European hub", but the structured data says nothing, so a model
  asked "where is Zenova based?" has to say it does not know.
- **foundingDate**

These are off by design, not by accident: the stored values were template
placeholders (`123 Atlantic Ave, Brooklyn, NY 11201`, `+1 (555) 123-4567` — 555-01xx
is the reserved fictional range). Publishing placeholder contact data is worse
than publishing none, because Google cross-checks it against its own business
records and a mismatch suppresses the rich results the markup is meant to earn.

To turn them on, put the **real, verified** values in `BUSINESS_NAP`
(`src/seo/seo-data.ts`) and flip `verified` to `true`:

```ts
export const BUSINESS_NAP = {
  verified: true,
  streetAddress: '…',
  addressLocality: 'Brooklyn',
  addressRegion: 'NY',
  postalCode: '…',
  addressCountry: 'US',
  telephone: '+1…',
} as const;
```

Nothing else needs to change. The Organization node automatically becomes
`['Organization', 'ProfessionalService']` with `address` and `telephone`
attached, which also unlocks local rich results. The contact page brings its
address and phone rows back at the same time.

If you would rather not publish a street address, city-level is valid on its own —
`addressLocality` + `addressRegion` + `addressCountry`, with `streetAddress`
omitted. That still lets an assistant answer "where are they based".

### 5. Fix the Facebook profile link 🟡

`SITE.sameAs` in `src/seo/seo-data.ts` lists `https://facebook.com/zenova`,
which returns **HTTP 400**. `sameAs` is how search engines and models tie the
website to the same real-world entity across the web, so a dead entry weakens
that link. Either correct the URL or drop the line. The other four
(Instagram, LinkedIn, X, GitHub) resolve — worth confirming they are genuinely
yours, since `github.com/zenova` in particular could belong to someone else.

---

## Keeping it honest over time

```bash
npm run verify         # 27 sitemap routes crawlable + uniquely titled
npm run verify:ai      # AI crawlers get complete, uncloaked content
```

`verify:ai` is differential — it compares what each crawler receives against
what a normal Chrome user-agent receives, so it catches a WAF rule or bot-
protection setting that starts treating assistants as attackers. That failure is
completely silent otherwise: nothing errors, the site looks fine, and the only
symptom is quietly disappearing from AI answers. Run it after any change to
Vercel firewall settings, bot protection, or CDN rules.

## How to tell if it is working

- **Bing Webmaster → URL Inspection** shows the page indexed.
- Ask ChatGPT (with search on), Perplexity, and Copilot directly:
  *"What services does Zenova at zenova.agency offer, and what do they cost?"*
  A correct answer citing the site means the pipeline works end to end.
- Expect **days to weeks**, not hours. Indexing is the slow part; the site is
  already doing everything it can on its side.

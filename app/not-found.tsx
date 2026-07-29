/**
 * The site's 404, served for every unresolved URL — an unknown service,
 * project or job slug, a retired CMS page, or a plain typo — with a real HTTP
 * 404 status.
 *
 * This file has to live at the app root. The previous version was at
 * app/(marketing)/not-found.tsx, and a not-found file inside a route group is
 * never installed as the root boundary, so nothing rendered it: unmatched URLs
 * fell through to Next's built-in default. What actually shipped was a document
 * whose <body> held nothing but the RSC flight payload — no <h1>, no nav, no
 * footer, no link out. The strings were present in the payload as data and only
 * became DOM after hydration, so every crawler that does not run JavaScript saw
 * a blank page on every dead URL on the site.
 *
 * That is the exact failure this site's whole prerendering setup exists to
 * prevent, and 404s are where it matters most: dead URLs are precisely where a
 * crawler most needs the nav to find its way back to the live pages.
 *
 * MarketingChrome gives it the same nav and footer as every other public page,
 * so the 404 is a route back into the site rather than a dead end.
 *
 * ---------------------------------------------------------------------------
 * Why every dynamic route sets `dynamicParams = false`
 * ---------------------------------------------------------------------------
 *
 * Moving this file to the root fixed 404s for URLs that match no route at all
 * (/a/b/c). It did NOT fix the more common case: a URL that matches a dynamic
 * segment and resolves to no record (/abuot, /blog/deleted-post). Those call
 * notFound() at REQUEST time, and Next streams the response — the boundary
 * content is serialised into the RSC flight payload and never emitted as HTML.
 * Measured on a production build: a correct 404 status, 73 KB of body, and zero
 * visible text, no <h1>, no <nav>, no <main>.
 *
 * Four things were tried and did not change it:
 *   - a not-found.tsx inside the (marketing) group, so the boundary renders as
 *     a child of the layout rather than above it;
 *   - making that layout synchronous, in case its `await getSiteBundle()` was
 *     the suspension that flushed an empty shell;
 *   - calling notFound() with no preceding await at all;
 *   - Next 15.5.22, reproduced in a standalone app. It behaves identically —
 *     so this is not a 14.x bug waiting on an upgrade.
 *
 * `dynamicParams = false` is the only thing that works: an unknown slug is no
 * longer rendered on demand, so Next answers with the *prerendered* 404 above,
 * which is real HTML.
 *
 * The cost is that generateStaticParams pins the servable slug set at build
 * time — content published in the admin afterwards would 404. That is bought
 * back on the backend: any change to publishable content fires a deploy hook
 * and the rebuild republishes the slug list (backend/app/rebuild.py). Publishing
 * is therefore a rebuild behind instead of instant, which is the standard
 * trade for statically-rendered CMS content.
 *
 * If a future Next release emits real HTML for a request-time notFound(), all
 * five `dynamicParams = false` lines can go, and with them the rebuild hook.
 */
import { NotFoundPage } from '@/views/NotFoundPage';
import { MarketingChrome } from './_components/MarketingChrome';

/**
 * No `robots` key here on purpose. Next emits <meta name="robots"
 * content="noindex"> for the not-found route itself, and adding an explicit
 * `{ index: false, follow: true }` put two robots meta tags in the same
 * document. `noindex` already implies `follow` — the directive that suppresses
 * link-following is `nofollow`, which is not wanted here — so the automatic tag
 * says everything the explicit one did, without the ambiguity of two
 * directives that some future edit could set in conflict.
 */
export const metadata = {
  title: 'Page not found | Zenova',
};

/**
 * Synchronous, and passes a null bundle on purpose.
 *
 * Awaiting getSiteBundle() here made the component suspend, and a suspending
 * not-found boundary is flushed as an empty shell with the real subtree
 * streamed in afterwards — which put the whole 404 back in the RSC payload
 * instead of the HTML, the exact bug this file exists to fix.
 *
 * Nothing is lost: the store falls back to DEFAULT_CONTENT and the bundled
 * src/data, so the nav and footer render their standard links. A 404 has no
 * CMS-authored content of its own to wait for, and making the error page
 * depend on a network round-trip to the very API that might be down is
 * backwards anyway.
 */
export default function NotFound() {
  return (
    <MarketingChrome bundle={null}>
      <NotFoundPage />
    </MarketingChrome>
  );
}

/**
 * Build-time content handoff for the API-driven routes.
 *
 * The problem this solves: blog posts and admin-authored landing pages load
 * their content from the API inside an effect, and effects never run during
 * server rendering. Every one of those routes therefore prerendered to a
 * loading skeleton — correct <head> tags, correct canonical, and a body
 * containing the words "Loading…" and nothing else. They were listed in
 * sitemap.xml as indexable pages the whole time.
 *
 * The fix is the standard SSR data handoff, in two halves:
 *
 *   Build   scripts/prerender.mjs fetches each post/page, calls
 *           setSsrPayload() before render(), and serialises the same payload
 *           into the HTML as window.__ZENOVA_SSR__.
 *   Browser the page components seed their initial state from that payload.
 *
 * Both halves are load-bearing. Seeding only the server would make the
 * client's first render (a skeleton) disagree with the server markup (an
 * article), and React 18 responds to a hydration mismatch by throwing the
 * server markup away and re-rendering from scratch — the content would flash
 * to a skeleton and back. Seeding both sides keeps the two renders identical.
 *
 * The payload is keyed by slug, so it is only ever consulted for the exact
 * route that was prerendered. A client-side navigation to a different post
 * finds nothing here and falls through to the normal fetch.
 */
import type { PublicBlogPost, PublicSeoPage } from '@/lib/publicContentApi';

export interface SsrPayload {
  /** Blog posts by slug. */
  blogPosts?: Record<string, PublicBlogPost>;
  /** Standalone SEO pages by slug. */
  seoPages?: Record<string, PublicSeoPage>;
}

declare global {
  interface Window {
    __ZENOVA_SSR__?: SsrPayload;
  }
}

/** Node-side store, written by the prerenderer before each render(). */
let buildPayload: SsrPayload = {};

/** Build-time only — called from scripts/prerender.mjs via entry-server. */
export function setSsrPayload(payload: SsrPayload): void {
  buildPayload = payload ?? {};
}

export function getSsrPayload(): SsrPayload {
  // In the browser the payload arrives as an inline script; during the build
  // it is whatever setSsrPayload() last stored. Checking `window` rather than
  // import.meta.env keeps this correct in both passes of hydration.
  if (typeof window !== 'undefined') return window.__ZENOVA_SSR__ ?? {};
  return buildPayload;
}

export function getSsrBlogPost(slug: string): PublicBlogPost | null {
  if (!slug) return null;
  return getSsrPayload().blogPosts?.[slug] ?? null;
}

export function getSsrSeoPage(slug: string | null): PublicSeoPage | null {
  if (!slug) return null;
  return getSsrPayload().seoPages?.[slug] ?? null;
}

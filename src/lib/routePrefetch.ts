/**
 * Warms a lazy route's chunk before the user commits to the navigation.
 *
 * vite.config.ts strips <link modulepreload>/<link stylesheet> for lazy route
 * chunks (stripUnusedPreloads) so nothing is fetched eagerly on first load.
 * The trade is that every click cold-fetches the route's JS *and* its CSS,
 * which is the window the loading skeleton lives in. Firing the same dynamic
 * import on hover/focus closes that window without costing anything at boot —
 * Vite dedupes repeat import() of a specifier, so this is the exact module the
 * lazy() in App.tsx will await.
 */

type Loader = () => Promise<unknown>;

/** Ordered most-specific-first: the first matching pattern wins. */
const ROUTES: ReadonlyArray<readonly [RegExp, Loader]> = [
  [/^\/services\/[^/]+$/, () => import('@/pages/ServiceDetailPage')],
  [/^\/services$/, () => import('@/pages/ServicesPage')],
  [/^\/pricing$/, () => import('@/pages/PricingPage')],
  [/^\/work\/[^/]+$/, () => import('@/pages/ProjectDetailPage')],
  [/^\/work$/, () => import('@/pages/WorkPage')],
  [/^\/careers\/[^/]+$/, () => import('@/pages/JobDetailPage')],
  [/^\/careers$/, () => import('@/pages/CareersPage')],
  [/^\/about$/, () => import('@/pages/AboutPage')],
  [/^\/contact$/, () => import('@/pages/ContactPage')],
  [/^\/blog\/[^/]+$/, () => import('@/pages/BlogPostPage')],
  [/^\/blog$/, () => import('@/pages/BlogPage')],
  [/^\/(privacy|terms)$/, () => import('@/pages/LegalPage')],
];

const warmed = new Set<string>();

/** Fetch the chunk backing `href`, at most once per route pattern. */
export function prefetchRoute(href: string): void {
  let pathname: string;
  try {
    pathname = new URL(href, window.location.origin).pathname;
  } catch {
    return;
  }
  // Router paths are relative to the basename, hrefs are not.
  const base = import.meta.env.BASE_URL.replace(/\/+$/, '');
  if (base && pathname.startsWith(base)) pathname = pathname.slice(base.length) || '/';

  // Trailing slashes are equivalent for our routes; normalise before matching.
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;

  for (const [pattern, load] of ROUTES) {
    if (!pattern.test(path)) continue;
    const key = pattern.source;
    if (warmed.has(key)) return;
    warmed.add(key);
    // A failed prefetch is not a failed navigation — lazy() will retry.
    void load().catch(() => warmed.delete(key));
    return;
  }
}

import 'server-only';
/**
 * Server-side fetchers for everything the CMS owns: the site bundle, blog posts
 * and standalone SEO pages.
 *
 * Separate from lib/publicContentApi.ts on purpose. That module memoises into
 * module-level Maps, which is right for a browser tab (back/forward navigation
 * renders instantly) and wrong for a server process, where those Maps would be
 * shared by every visitor and never expire. Here the caching is Next's instead:
 * `next.revalidate` gives a real TTL, is shared across requests, and serves the
 * last good response while it refreshes in the background.
 *
 * Failure policy: every function resolves to null rather than throwing. The old
 * prerenderer degraded to static routes when api.zenova.agency was cold, and a
 * cold backend must still not take the site down — a page that cannot fetch its
 * CMS content falls back to the defaults baked into src/data, exactly as before.
 * The failure is logged so a silently shrinking sitemap is visible in the logs.
 */
import type { SiteBundle } from '@/admin/store';
import type {
  PublicBlogList,
  PublicBlogPost,
  PublicSeoPage,
  PublicSeoPageListItem,
} from '@/lib/publicContentApi';

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, '') || 'https://api.zenova.agency/api/v1';

/**
 * Five minutes. Long enough that a burst of traffic hits one upstream request,
 * short enough that an admin publishing a post sees it live without a deploy —
 * which is the whole reason this content is fetched per-request rather than
 * baked in at build time.
 */
export const CONTENT_REVALIDATE = 300;

/** Render's free tier can cold-start for ~30s; budget generously. */
const TIMEOUT_MS = 45_000;

async function getJson<T>(path: string, revalidate = CONTENT_REVALIDATE): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      signal: AbortSignal.timeout(TIMEOUT_MS),
      next: { revalidate },
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) {
      console.warn(`[content] GET ${path} -> HTTP ${res.status}`);
      return null;
    }
    return (await res.json()) as T;
  } catch (err) {
    console.warn(`[content] GET ${path} failed: ${(err as Error)?.message ?? err}`);
    return null;
  }
}

/** Services, projects, jobs, team, content and brand, as the admin last saved them. */
export function getSiteBundle(): Promise<SiteBundle | null> {
  return getJson<SiteBundle>('/public/site');
}

export function getBlogList(limit = 12, offset = 0): Promise<PublicBlogList | null> {
  return getJson<PublicBlogList>(`/public/blog?limit=${limit}&offset=${offset}`);
}

export function getBlogPost(slug: string): Promise<PublicBlogPost | null> {
  return getJson<PublicBlogPost>(`/public/blog/${encodeURIComponent(slug)}`);
}

/** Slug + title + updated_at for every published page. No body HTML — see the type. */
export function getSeoPages(): Promise<PublicSeoPageListItem[] | null> {
  return getJson<PublicSeoPageListItem[]>('/public/pages');
}

export function getSeoPage(slug: string): Promise<PublicSeoPage | null> {
  return getJson<PublicSeoPage>(`/public/pages/${encodeURIComponent(slug)}`);
}

/**
 * Every published post, paged out, for the sitemap and for generateStaticParams.
 * Capped so a runaway archive cannot stall a build.
 */
export async function getAllBlogPosts(): Promise<PublicBlogList['items']> {
  const PAGE = 50;
  const MAX = 500;
  const items: PublicBlogList['items'] = [];
  for (let offset = 0; offset < MAX; offset += PAGE) {
    const page = await getBlogList(PAGE, offset);
    if (!page || page.items.length === 0) break;
    items.push(...page.items);
    if (items.length >= page.total) break;
  }
  return items;
}

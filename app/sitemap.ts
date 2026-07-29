import type { MetadataRoute } from 'next';
import {
  MAIN_ROUTES,
  SITE,
  canonicalUrl,
  isExcludedContentSlug,
} from '@/seo/seo-data';
import { CONTENT_REVALIDATE, getAllBlogPosts, getSeoPages } from '@/lib/serverContent';
import { resolveJobs, resolveProjects, resolveServices } from './_lib/detail-routes';

/**
 * sitemap.xml — every canonical, indexable URL this site serves, and nothing else.
 *
 * Two fields only, `<loc>` and `<lastmod>`, because those are the two Google
 * reads. `<priority>` and `<changefreq>` were removed: Google ignores both and
 * Bing ignores priority, so they were bytes that cost crawl bandwidth and bought
 * nothing — and a `changefreq: 'yearly'` on /contact was, for the few crawlers
 * that still parse it, an argument against recrawling a page we want recrawled.
 *
 * `<lastmod>` is the reason this file is careful. It used to be one build-wide
 * `new Date()` on all ~27 static URLs, which — with `revalidate` below — is not
 * even the build date: the sitemap regenerates every five minutes, so every
 * fetch claimed the entire site had changed in the last five. Google's response
 * to a lastmod it cannot trust is to stop reading lastmod, which costs the pages
 * that genuinely did change. So the rule here is: a date is emitted only when
 * something real backs it, and omitted otherwise. An absent lastmod is valid and
 * simply defers to Google's own crawl history; a fabricated one is worse than
 * absent.
 *
 * Where the dates come from:
 *   - fixed marketing pages -> `contentUpdated` in the route table, curated
 *   - jobs                  -> the role's own postedAt
 *   - blog posts, CMS pages -> the row's updated_at, published_at as fallback
 *   - services, case studies -> nothing yet; /public/site drops the per-row
 *     timestamps the database has. readRecordDate() below picks them up the day
 *     the bundle carries them, with no change here.
 */
export const revalidate = CONTENT_REVALIDATE;

/** A resolved URL and, if one is genuinely known, when its content last changed. */
type Entry = MetadataRoute.Sitemap[number];

/** What a source yields before validation: a site-relative path, not a URL. */
interface Candidate {
  path: string;
  lastModified?: Date | undefined;
}

/**
 * One collection of URLs. Adding a future collection means adding one of these
 * to SOURCES — no other part of this file changes.
 */
interface SitemapSource {
  /** Identifies the source in the warning line when it fails. */
  name: string;
  load: () => Promise<Candidate[]>;
}

/**
 * Every path segment a canonical URL may contain — the same grammar the API
 * enforces on slugs it accepts (`Slug` in backend/app/schemas.py). Keeping the
 * two aligned means a slug that reached the database can round-trip into a
 * `<loc>` unescaped, and anything else is a bug worth dropping rather than
 * publishing.
 */
const CANONICAL_PATHNAME = /^(?:\/|(?:\/[a-z0-9][a-z0-9\-_]*)+\/)$/;

/**
 * True only for a URL this site would answer with a 200 and claim as canonical:
 * https, the production host, a trailing slash, no query or fragment, and no
 * character that needed percent-escaping.
 *
 * Checked because three of the six sources below interpolate strings the CMS
 * owns. The API validates slugs on write, but that is a guarantee held by
 * another service — an invalid `<loc>` invalidates the whole document for some
 * validators, which is too much to stake on a remote assumption.
 */
function isCanonicalUrl(value: string): boolean {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return false;
  }
  return (
    url.protocol === 'https:' &&
    url.origin === SITE.url &&
    url.search === '' &&
    url.hash === '' &&
    url.pathname === encodeURI(url.pathname) &&
    CANONICAL_PATHNAME.test(url.pathname)
  );
}

/** Coerce a timestamp of unknown provenance to a Date, or undefined. */
function toDate(value: unknown): Date | undefined {
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? undefined : value;
  if (typeof value !== 'string' || value.trim() === '') return undefined;
  const date = new Date(value);
  // Guards both unparseable strings and the 1970 epoch a null timestamp
  // sometimes arrives as, which would advertise every such page as ancient.
  return Number.isNaN(date.getTime()) || date.getTime() === 0 ? undefined : date;
}

/** The first of several candidate timestamps that parses. */
function pickDate(...values: unknown[]): Date | undefined {
  for (const value of values) {
    const date = toDate(value);
    if (date) return date;
  }
  return undefined;
}

/**
 * Best available modification date for a CMS record, whatever shape it arrives
 * in. `postedAt` is a job's real publication date and is present today;
 * `updated_at` is what the site bundle will carry once it stops dropping the
 * column, and is read speculatively so that becomes a backend-only change.
 */
function readRecordDate(record: object): Date | undefined {
  const fields = record as Record<string, unknown>;
  return pickDate(fields.updated_at, fields.updatedAt, fields.postedAt);
}

// --- Sources ---------------------------------------------------------------

/** The fixed marketing pages, from the same table that drives their <head>. */
async function staticRoutes(): Promise<Candidate[]> {
  return MAIN_ROUTES.filter((route) => route.index).map((route) => ({
    path: route.path,
    lastModified: toDate(route.contentUpdated),
  }));
}

/**
 * Shared adapter for the three collections the site bundle owns. The slugs come
 * from the CMS through the same helpers the routes themselves use, so the
 * sitemap advertises exactly the URLs that render — listing src/data's slugs
 * instead would publish URLs that 404 the moment the two diverge.
 */
function bundleCollection<T extends { slug: string }>(
  resolve: () => Promise<T[]>,
  toPath: (slug: string) => string,
): () => Promise<Candidate[]> {
  return async () => {
    const records = await resolve();
    return records
      .filter((record) => !isExcludedContentSlug(record.slug))
      .map((record) => ({
        path: toPath(record.slug),
        lastModified: readRecordDate(record),
      }));
  };
}

async function blogPosts(): Promise<Candidate[]> {
  const posts = await getAllBlogPosts();
  return posts
    .filter((post) => !isExcludedContentSlug(post.slug))
    .map((post) => ({
      path: `/blog/${post.slug}`,
      // updated_at first: a post rewritten a year after publication has changed,
      // and published_at would keep insisting otherwise.
      lastModified: pickDate(post.updated_at, post.published_at),
    }));
}

/** Admin-authored landing pages served at top-level URLs. */
async function cmsPages(): Promise<Candidate[]> {
  const pages = await getSeoPages();
  return (pages ?? [])
    .filter((page) => !isExcludedContentSlug(page.slug))
    .map((page) => ({
      path: `/${page.slug}`,
      lastModified: toDate(page.updated_at),
    }));
}

/**
 * Order matters only for readability — crawlers do not weight position — but
 * hubs before their detail pages makes the document easy to eyeball, and a fixed
 * order is half of what keeps the output byte-stable between regenerations.
 */
const SOURCES: SitemapSource[] = [
  { name: 'static', load: staticRoutes },
  {
    name: 'services',
    load: bundleCollection(resolveServices, (slug) => `/services/${slug}`),
  },
  {
    name: 'projects',
    load: bundleCollection(resolveProjects, (slug) => `/work/${slug}`),
  },
  {
    name: 'jobs',
    load: bundleCollection(resolveJobs, (slug) => `/careers/${slug}`),
  },
  { name: 'blog', load: blogPosts },
  { name: 'pages', load: cmsPages },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  /**
   * All six in one wave. The three bundle sources each go through
   * getSiteBundle(), and Next dedupes identical fetches within a render, so this
   * is three upstream requests rather than six — and one round-trip of latency
   * rather than two, which against a cold API is worth ~45s of build time.
   *
   * A source that throws contributes nothing rather than failing the build: the
   * marketing pages need no network and are always present, so an unreachable
   * API degrades the sitemap to a smaller valid document instead of a broken
   * one. Logged, because a silently shrinking sitemap is the kind of regression
   * nobody notices for a month.
   */
  const groups = await Promise.all(
    SOURCES.map((source) =>
      source.load().catch((err: unknown) => {
        const reason = err instanceof Error ? err.message : String(err);
        console.warn(`[sitemap] source "${source.name}" failed: ${reason}`);
        return [] as Candidate[];
      }),
    ),
  );

  const entries: Entry[] = [];
  const seen = new Set<string>();

  for (const group of groups) {
    const resolved: Entry[] = [];

    for (const candidate of group) {
      const url = canonicalUrl(candidate.path);

      if (!isCanonicalUrl(url)) {
        console.warn(`[sitemap] skipped non-canonical URL from path "${candidate.path}"`);
        continue;
      }
      // First occurrence wins. Nothing produces a collision today — the API
      // reserves the top-level slugs the marketing site owns — but that
      // guarantee lives in another service, and the cost of holding it here too
      // is one Set.
      if (seen.has(url)) continue;
      seen.add(url);

      resolved.push(candidate.lastModified ? { url, lastModified: candidate.lastModified } : { url });
    }

    // Sorted within the group with a plain comparison rather than
    // localeCompare(), whose collation is locale-dependent and would let the
    // same content produce different bytes on a different machine.
    resolved.sort((a, b) => (a.url < b.url ? -1 : a.url > b.url ? 1 : 0));
    entries.push(...resolved);
  }

  return entries;
}

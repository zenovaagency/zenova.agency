import type { MetadataRoute } from 'next';
import {
  MAIN_ROUTES,
  canonicalUrl,
  isExcludedContentSlug,
  jobRouteMeta,
  projectRouteMeta,
  serviceRouteMeta,
} from '@/seo/seo-data';
import { CONTENT_REVALIDATE, getAllBlogPosts, getSeoPages } from '@/lib/serverContent';
import { resolveJobs, resolveProjects, resolveServices } from './_lib/detail-routes';

/**
 * sitemap.xml, generated from the same route table that drives every page's
 * <head>, plus whatever the CMS currently publishes.
 *
 * Two things it fixes versus the hand-rolled generator it replaces:
 *
 *  - Per-resource `lastModified`. Every URL previously carried one build-wide
 *    date, so each deploy told search engines that all ~27 pages had changed.
 *    That is a claim crawlers learn to discount, which devalues the signal for
 *    the pages that genuinely did change.
 *  - Excluded slugs. `/test-seo/` — an admin scratch page — was listed as a
 *    real indexable URL.
 */
export const revalidate = CONTENT_REVALIDATE;

/** Coerce an API timestamp to a Date, or undefined if absent/unparseable. */
function asDate(value: string | null | undefined): Date | undefined {
  if (!value) return undefined;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];

  const buildDate = new Date();

  const push = (route: { path: string; index: boolean; changefreq?: string; priority?: number }) => {
    if (!route.index) return;
    entries.push({
      url: canonicalUrl(route.path),
      lastModified: buildDate,
      changeFrequency: (route.changefreq ?? 'monthly') as 'monthly',
      priority: route.priority ?? 0.6,
    });
  };

  // The fixed marketing pages.
  MAIN_ROUTES.forEach(push);

  // Detail pages come from the CMS, resolved through the same helpers the
  // routes themselves use — so the sitemap advertises exactly the URLs that
  // actually render, and an admin adding a service gets it indexed without a
  // code change. Listing src/data's slugs here instead would publish URLs that
  // 404 the moment the two diverge.
  const [services, projects, jobs] = await Promise.all([
    resolveServices(),
    resolveProjects(),
    resolveJobs(),
  ]);
  services.forEach((s) => push(serviceRouteMeta(s)));
  projects.forEach((p) => push(projectRouteMeta(p)));
  jobs.forEach((j) => push(jobRouteMeta(j)));

  // A cold or unreachable API yields no CMS entries rather than failing the
  // build. The static routes above are always present, so the sitemap degrades
  // to a smaller valid document instead of a broken one.
  const [posts, pages] = await Promise.all([getAllBlogPosts(), getSeoPages()]);

  for (const post of posts) {
    entries.push({
      url: canonicalUrl(`/blog/${post.slug}`),
      lastModified: asDate(post.published_at) ?? buildDate,
      changeFrequency: 'monthly',
      priority: 0.6,
    });
  }

  for (const page of pages ?? []) {
    if (isExcludedContentSlug(page.slug)) continue;
    entries.push({
      url: canonicalUrl(`/${page.slug}`),
      lastModified: asDate(page.updated_at) ?? buildDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    });
  }

  return entries;
}

/**
 * The single rule for turning a raw `/public/site` response into the values the
 * site actually renders.
 *
 * Both sides of the render must apply it identically:
 *
 *   - app/_lib/detail-routes.ts uses it to decide which slugs /services/[slug],
 *     /work/[slug] and /careers/[slug] serve, and which URLs the sitemap lists.
 *   - admin/store.ts uses it to seed the stores those pages read from.
 *
 * When the two disagreed, the route advertised a slug the page could not render
 * and the response was a 200 with no <h1> and ~400 characters in it — a page
 * that exists as far as a crawler is concerned and says nothing. Deriving both
 * from this one function makes that unrepresentable.
 *
 * The rule itself: an absent *or empty* collection means "the CMS has nothing to
 * say about this", so the repo defaults stand. Empty is treated as absent
 * deliberately — a backend that returns `services: []` because of a bad query
 * or an unmigrated table should not blank the site's entire service offering.
 * The cost is that genuinely clearing a collection in the CMS shows the
 * defaults instead of nothing, which is the far less damaging failure.
 *
 * Pure: no React, no DOM, no fetch — so server-only route code and the
 * client-only store can both import it.
 */
import { SERVICES as DEFAULT_SERVICES, type ServiceDetail } from '@/data/services';
import { PROJECTS as DEFAULT_PROJECTS, type ProjectDetail } from '@/data/projects';
import { JOBS as DEFAULT_JOBS, type JobDetail } from '@/data/jobs';
import {
  DEFAULT_BRAND,
  DEFAULT_CONTENT,
  DEFAULT_TEAM,
  type BrandSettings,
  type SiteContent,
  type TeamMember,
} from '@/data/site-content';

export interface SiteBundle {
  services: ServiceDetail[];
  projects: ProjectDetail[];
  jobs?: JobDetail[];
  team: TeamMember[];
  content: SiteContent;
  brand: BrandSettings;
}

export interface ResolvedSite {
  services: ServiceDetail[];
  projects: ProjectDetail[];
  jobs: JobDetail[];
  team: TeamMember[];
  content: SiteContent;
  brand: BrandSettings;
}

/** Not named `use…` — that reads as a React hook to the linter, and this is not one. */
const orDefault = <T>(value: T[] | undefined | null, fallback: T[]): T[] =>
  value && value.length > 0 ? value : fallback;

export function resolveSiteBundle(bundle: Partial<SiteBundle> | null | undefined): ResolvedSite {
  return {
    services: orDefault(bundle?.services, DEFAULT_SERVICES),
    projects: orDefault(bundle?.projects, DEFAULT_PROJECTS),
    jobs: orDefault(bundle?.jobs, DEFAULT_JOBS),
    team: orDefault(bundle?.team, DEFAULT_TEAM),
    // Objects, not collections, and merged rather than replaced: every section
    // of the site reads named keys off these (content.hero.rotatingWords,
    // content.legal.privacy, …). A payload missing one section must fall back
    // to the default copy for that section, not take the server render down.
    content: { ...DEFAULT_CONTENT, ...(bundle?.content ?? {}) },
    brand: { ...DEFAULT_BRAND, ...(bundle?.brand ?? {}) },
  };
}

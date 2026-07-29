import 'server-only';
/**
 * Resolves the slug lists that the three detail routes serve.
 *
 * The important property here is that the route and the page agree. The page
 * components read their record from the admin store, which the layout seeds
 * from `/public/site`; if the route derived its slugs independently, the two
 * would disagree the moment the CMS returned something unexpected — and the
 * symptom is nasty, because it is not an error. The route says the slug exists,
 * the page finds no record, and the response is HTTP 200 carrying no <h1> and
 * ~400 characters of chrome. A crawler indexes that as a real, empty page.
 *
 * Both sides therefore go through resolveSiteBundle() in src/lib/siteBundle.ts,
 * which owns the defaulting rule. Do not reimplement that rule here.
 */
import { resolveSiteBundle } from '@/lib/siteBundle';
import { getSiteBundle } from '@/lib/serverContent';

async function resolved() {
  // getSiteBundle() is cached by Next for CONTENT_REVALIDATE seconds, so the
  // three helpers below share one upstream request even when a build calls
  // them dozens of times.
  return resolveSiteBundle(await getSiteBundle());
}

export async function resolveServices() {
  return (await resolved()).services;
}

export async function resolveProjects() {
  return (await resolved()).projects;
}

export async function resolveJobs() {
  return (await resolved()).jobs;
}

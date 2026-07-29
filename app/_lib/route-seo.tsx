/**
 * The two lines of SEO wiring every marketing route needs, so no route file
 * hand-rolls them.
 *
 * `routeMetadata(path)` -> the <head> tags, from the seo-data table.
 * `<RouteJsonLd path>`  -> the route's structured-data graph (Organization,
 *                          WebSite, WebPage, BreadcrumbList, ItemList, …).
 *
 * The JSON-LD renders in the body rather than the head. That is not a
 * compromise: Google, Bing and every LLM crawler parse ld+json anywhere in the
 * document, and body placement is what lets content-derived schema (the FAQ
 * list, the rate cards, the team roster) come from the same data the section
 * renders. See src/seo/JsonLd.tsx.
 */
import type { Metadata } from 'next';
import { JsonLd } from '@/seo/JsonLd';
import { jsonLdObjects, resolveSeo, type SeoMeta } from '@/seo/seo-data';
import { seoMetaToMetadata, type SeoExtras } from '@/seo/next-metadata';

export function routeMetadata(path: string, extras?: SeoExtras): Metadata {
  return seoMetaToMetadata(resolveSeo(path), extras);
}

/**
 * JSON-LD for a route whose SeoMeta is built at request time rather than looked
 * up in the static table — blog posts and admin-authored pages, whose titles and
 * descriptions live in the CMS.
 */
export function MetaJsonLd({
  meta,
  extra = [],
}: {
  meta: SeoMeta;
  extra?: Array<Record<string, unknown>>;
}) {
  return <JsonLd data={[...jsonLdObjects(meta), ...extra]} />;
}

export function RouteJsonLd({
  path,
  extra = [],
}: {
  path: string;
  /** Additional nodes appended after the route's own graph. */
  extra?: Array<Record<string, unknown>>;
}) {
  return <JsonLd data={[...jsonLdObjects(resolveSeo(path)), ...extra]} />;
}

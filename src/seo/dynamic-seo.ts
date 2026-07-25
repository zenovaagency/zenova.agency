/**
 * Runtime SEO metadata for API-driven routes (blog posts, standalone SEO
 * pages) whose content is not known to the static tables in seo-data.ts.
 *
 * Pages publish an entry once their data loads (`setDynamicSeo`) and clear it
 * on unmount; <SeoManager> subscribes and prefers a dynamic entry over
 * `resolveSeo()` for the current path. Build-time prerendering handles the
 * same routes separately (vite.config.ts fetches them from the API), so this
 * module only serves client-side navigation and post-hydration correctness.
 */

import { normalizePath, type SeoMeta } from './seo-data';

export interface DynamicSeoEntry {
  meta: SeoMeta;
  /** Open Graph object type; defaults to 'website'. */
  ogType?: 'website' | 'article';
  /** Absolute URL for og:image / twitter:image; falls back to SITE.ogImage. */
  ogImage?: string;
  /** Extra `article:*` meta tags, only emitted when ogType === 'article'. */
  articleMeta?: {
    publishedTime?: string;
    modifiedTime?: string;
    author?: string;
  };
  /** Additional JSON-LD objects appended after jsonLdObjects(meta). */
  extraJsonLd?: Array<Record<string, unknown>>;
}

const entries = new Map<string, DynamicSeoEntry>();
const listeners = new Set<() => void>();

function emit(): void {
  for (const cb of listeners) cb();
}

export function setDynamicSeo(path: string, entry: DynamicSeoEntry): void {
  entries.set(normalizePath(path), entry);
  emit();
}

export function clearDynamicSeo(path: string): void {
  if (entries.delete(normalizePath(path))) emit();
}

export function getDynamicSeo(path: string): DynamicSeoEntry | undefined {
  return entries.get(normalizePath(path));
}

/** Subscribe to changes; returns the unsubscribe function. */
export function subscribeDynamicSeo(cb: () => void): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

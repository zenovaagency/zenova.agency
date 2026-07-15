/**
 * Public (unauthenticated) fetchers for blog posts and standalone SEO pages.
 *
 * Results are memoised in module-level maps so back/forward navigation renders
 * instantly without refetching. The caches live for the page session — admin
 * edits show up on the next full load, which matches how the rest of the
 * public site consumes `/public/site`.
 */

import { api } from '@/lib/api';

export interface PublicBlogListItem {
  slug: string;
  title: string;
  excerpt: string;
  cover_image_url: string | null;
  author_name: string | null;
  tags: string[];
  published_at: string | null;
}

export interface PublicBlogList {
  items: PublicBlogListItem[];
  total: number;
  limit: number;
  offset: number;
}

export interface PublicBlogPost extends PublicBlogListItem {
  content_html: string;
  meta_title: string | null;
  meta_description: string | null;
  og_image_url: string | null;
  updated_at: string;
}

export interface PublicSeoPage {
  slug: string;
  title: string;
  content_html: string;
  meta_title: string | null;
  meta_description: string | null;
  og_image_url: string | null;
  updated_at: string;
}

const listCache = new Map<string, Promise<PublicBlogList>>();
const postCache = new Map<string, Promise<PublicBlogPost>>();
const pageCache = new Map<string, Promise<PublicSeoPage>>();

function cached<T>(cache: Map<string, Promise<T>>, key: string, load: () => Promise<T>): Promise<T> {
  const hit = cache.get(key);
  if (hit) return hit;
  const promise = load().catch((err) => {
    // Don't memoise failures — a retry should hit the network again.
    cache.delete(key);
    throw err;
  });
  cache.set(key, promise);
  return promise;
}

export function fetchBlogList(opts: { limit?: number; offset?: number; tag?: string } = {}): Promise<PublicBlogList> {
  const params = new URLSearchParams();
  if (opts.limit !== undefined) params.set('limit', String(opts.limit));
  if (opts.offset !== undefined) params.set('offset', String(opts.offset));
  if (opts.tag) params.set('tag', opts.tag);
  const qs = params.toString();
  const path = `/public/blog${qs ? `?${qs}` : ''}`;
  return cached(listCache, path, () => api<PublicBlogList>(path));
}

export function fetchBlogPost(slug: string): Promise<PublicBlogPost> {
  return cached(postCache, slug, () =>
    api<PublicBlogPost>(`/public/blog/${encodeURIComponent(slug)}`),
  );
}

export function fetchSeoPage(slug: string): Promise<PublicSeoPage> {
  return cached(pageCache, slug, () =>
    api<PublicSeoPage>(`/public/pages/${encodeURIComponent(slug)}`),
  );
}

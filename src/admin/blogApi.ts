/**
 * Admin blog management — thin typed fetchers over /admin/blog.
 *
 * Like leadsApi.ts, blog posts are admin-only on this surface and consumed by
 * a single section, so they are never cached in localStorage. Public reads
 * live in src/lib/publicContentApi.ts.
 */

import { api } from '@/lib/api';

export type BlogStatus = 'draft' | 'published';

/** Same shape as the backend's BlogPostOut. */
export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content_html: string;
  cover_image_url: string | null;
  author_name: string | null;
  tags: string[];
  status: BlogStatus;
  published_at: string | null;
  meta_title: string | null;
  meta_description: string | null;
  og_image_url: string | null;
  created_at: string;
  updated_at: string;
}

/** Payload for create/replace — the server owns the timestamps. */
export type BlogPostInput = Omit<BlogPost, 'created_at' | 'updated_at'>;

export function listBlogPosts(): Promise<BlogPost[]> {
  return api<BlogPost[]>('/admin/blog', { auth: true });
}

export function getBlogPost(slug: string): Promise<BlogPost> {
  return api<BlogPost>(`/admin/blog/${encodeURIComponent(slug)}`, { auth: true });
}

export function createBlogPost(input: BlogPostInput): Promise<BlogPost> {
  return api<BlogPost>('/admin/blog', { method: 'POST', body: input, auth: true });
}

export function updateBlogPost(slug: string, input: BlogPostInput): Promise<BlogPost> {
  return api<BlogPost>(`/admin/blog/${encodeURIComponent(slug)}`, {
    method: 'PUT',
    body: input,
    auth: true,
  });
}

export function deleteBlogPost(slug: string): Promise<void> {
  return api<void>(`/admin/blog/${encodeURIComponent(slug)}`, { method: 'DELETE', auth: true });
}

/**
 * Admin SEO pages — thin typed fetchers over /admin/seo-pages.
 *
 * SEO pages are standalone landing pages served at top-level URLs
 * (zenova.agency/<slug>), deliberately unlinked from site navigation.
 * Public reads live in src/lib/publicContentApi.ts.
 */

import { api } from '@/lib/api';

/** Same shape as the backend's SeoPageOut. */
export interface SeoPage {
  slug: string;
  title: string;
  content_html: string;
  meta_title: string | null;
  meta_description: string | null;
  og_image_url: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

/** Payload for create/replace — the server owns the timestamps. */
export type SeoPageInput = Omit<SeoPage, 'created_at' | 'updated_at'>;

export function listSeoPages(): Promise<SeoPage[]> {
  return api<SeoPage[]>('/admin/seo-pages', { auth: true });
}

export function getSeoPage(slug: string): Promise<SeoPage> {
  return api<SeoPage>(`/admin/seo-pages/${encodeURIComponent(slug)}`, { auth: true });
}

export function createSeoPage(input: SeoPageInput): Promise<SeoPage> {
  return api<SeoPage>('/admin/seo-pages', { method: 'POST', body: input, auth: true });
}

export function updateSeoPage(slug: string, input: SeoPageInput): Promise<SeoPage> {
  return api<SeoPage>(`/admin/seo-pages/${encodeURIComponent(slug)}`, {
    method: 'PUT',
    body: input,
    auth: true,
  });
}

export function deleteSeoPage(slug: string): Promise<void> {
  return api<void>(`/admin/seo-pages/${encodeURIComponent(slug)}`, {
    method: 'DELETE',
    auth: true,
  });
}

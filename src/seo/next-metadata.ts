/**
 * Bridge from this site's own SEO table (seo-data.ts) to Next's Metadata type.
 *
 * seo-data.ts stays the single source of truth — it also feeds the sitemap, the
 * JSON-LD graph and llms.txt — and this module is the only place that knows how
 * to express a SeoMeta as <head> tags. Routes call it from generateMetadata()
 * and never hand-roll tags, which is what keeps titles, canonicals and OG cards
 * consistent across ~30 routes.
 *
 * Replaces the old pair of implementations: headTagsHtml() in seo-html.ts (the
 * build-time path) and SeoManager.tsx (the runtime path). Those two had drifted
 * — the static path hardcoded og:type="website", so every blog post shipped a
 * generic website card to Facebook/LinkedIn/Slack and only became an article
 * after JS ran, which no scraper does. One implementation cannot drift.
 */
import type { Metadata } from 'next';
import { SITE, type SeoMeta, canonicalUrl } from './seo-data';

export interface SeoExtras {
  /** Open Graph object type; defaults to 'website'. */
  ogType?: 'website' | 'article';
  /** Absolute URL for og:image / twitter:image; falls back to SITE.ogImage. */
  ogImage?: string;
  /** Emitted as article:* tags; only meaningful when ogType === 'article'. */
  article?: {
    publishedTime?: string;
    modifiedTime?: string;
    authors?: string[];
  };
}

/**
 * CMS image URLs may be root-relative ('/uploads/x.png'). Open Graph requires
 * absolute URLs — a relative one is silently dropped by most scrapers, which
 * shows up as "the share card works on some posts but not others".
 */
export function toAbsoluteUrl(url: string): string {
  if (/^https?:\/\//i.test(url)) return url;
  return `${SITE.url}${url.startsWith('/') ? '' : '/'}${url}`;
}

export function seoMetaToMetadata(meta: SeoMeta, extras: SeoExtras = {}): Metadata {
  const url = canonicalUrl(meta.path);
  const custom = extras.ogImage ? toAbsoluteUrl(extras.ogImage) : null;

  // The width/height/alt below describe SITE.ogImage specifically (1600×840,
  // Zenova's own alt text). When a page supplies its own card those numbers
  // would be lies, and LinkedIn/Slack lay the preview out against the box the
  // tags claim — so a custom image ships bare and scrapers measure it
  // themselves. Getting this wrong is the usual cause of "the card renders as a
  // tiny thumbnail on first share".
  const images = custom
    ? [{ url: custom }]
    : [
        {
          url: SITE.ogImage,
          width: SITE.ogImageWidth,
          height: SITE.ogImageHeight,
          type: SITE.ogImageType,
          alt: SITE.ogImageAlt,
        },
      ];

  return {
    title: meta.title,
    description: meta.description,
    alternates: { canonical: url },
    robots: meta.index
      ? { index: true, follow: true }
      : { index: false, follow: true },
    openGraph: {
      type: extras.ogType ?? 'website',
      siteName: SITE.name,
      locale: SITE.locale,
      url,
      title: meta.title,
      description: meta.description,
      images,
      ...(extras.ogType === 'article' && extras.article
        ? {
            publishedTime: extras.article.publishedTime,
            modifiedTime: extras.article.modifiedTime,
            authors: extras.article.authors,
          }
        : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: meta.title,
      description: meta.description,
      images: custom ? [custom] : [{ url: SITE.ogImage, alt: SITE.ogImageAlt }],
    },
  };
}

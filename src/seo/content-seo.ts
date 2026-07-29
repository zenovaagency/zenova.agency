/**
 * SEO derivation for CMS-owned routes — blog posts, the blog index, and
 * standalone admin-authored pages.
 *
 * One implementation, used by the route's generateMetadata() *and* by the
 * JSON-LD rendered into its body. That single-sourcing is the point. Before,
 * the build path (headTagsHtml) and the runtime path (SeoManager) each derived
 * this separately, and they disagreed: the static HTML hardcoded
 * og:type="website" and emitted no BlogPosting at all, so a shared link was a
 * generic website card and the article schema only appeared once JavaScript
 * ran — which no social scraper and no plain crawler ever does.
 *
 * Pure and dependency-light (types only from the API module) so it is safe to
 * import from a server component, a client component, or the sitemap.
 */
import type { PublicBlogListItem, PublicBlogPost, PublicSeoPage } from '@/lib/publicContentApi';
import type { SeoExtras } from './next-metadata';
import { SITE, type SeoMeta, canonicalUrl } from './seo-data';

/** `@id` of the Organization node every other node points back at. */
export const ORG_ID = `${SITE.url}/#organization`;

export interface ContentSeo {
  meta: SeoMeta;
  extras: SeoExtras;
  /** Nodes to render in the body alongside the route's own graph. */
  jsonLd: Array<Record<string, unknown>>;
}

export function blogPostSeo(post: PublicBlogPost): ContentSeo {
  const path = `/blog/${post.slug}`;
  const url = canonicalUrl(path);
  const title = post.meta_title || `${post.title} | Zenova Blog`;
  const description = post.meta_description || post.excerpt || SITE.description;
  const image = post.og_image_url || post.cover_image_url || undefined;

  return {
    meta: {
      path,
      title,
      description,
      h1: post.title,
      intro: post.excerpt,
      index: true,
      breadcrumb: [
        { name: 'Home', path: '/' },
        { name: 'Blog', path: '/blog' },
        { name: post.title, path },
      ],
    },
    extras: {
      ogType: 'article',
      ogImage: image,
      article: {
        publishedTime: post.published_at ?? undefined,
        modifiedTime: post.updated_at,
        authors: post.author_name ? [post.author_name] : undefined,
      },
    },
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: post.title,
        description,
        ...(image ? { image } : {}),
        ...(post.published_at ? { datePublished: post.published_at } : {}),
        dateModified: post.updated_at,
        author: post.author_name
          ? { '@type': 'Person', name: post.author_name }
          : { '@id': ORG_ID },
        publisher: { '@id': ORG_ID },
        mainEntityOfPage: url,
        url,
      },
    ],
  };
}

export function seoPageSeo(page: PublicSeoPage): ContentSeo {
  const path = `/${page.slug}`;
  const title = page.meta_title || `${page.title} | ${SITE.name}`;
  const description = page.meta_description || SITE.description;

  return {
    meta: {
      path,
      title,
      description,
      h1: page.title,
      intro: '',
      index: true,
      breadcrumb: [
        { name: 'Home', path: '/' },
        { name: page.title, path },
      ],
    },
    extras: { ogImage: page.og_image_url || undefined },
    jsonLd: [],
  };
}

/**
 * The `Blog` entity for /blog, listing the posts the page actually renders.
 *
 * A `Blog` node with `blogPost[]`, not an additional ItemList: the other hubs
 * use ItemList because no more specific type exists for them, but Blog *is* the
 * specific type here, and describing the same posts twice in two vocabularies is
 * noise. The route's own WebPage/CollectionPage node still describes the
 * document; this describes the publication.
 */
export function blogIndexJsonLd(
  items: PublicBlogListItem[],
  meta: Pick<SeoMeta, 'title' | 'description'>,
): Array<Record<string, unknown>> {
  if (items.length === 0) return [];
  const url = canonicalUrl('/blog');

  return [
    {
      '@context': 'https://schema.org',
      '@type': 'Blog',
      '@id': `${url}#blog`,
      name: meta.title,
      description: meta.description,
      url,
      publisher: { '@id': ORG_ID },
      mainEntityOfPage: { '@id': `${url}#webpage` },
      blogPost: items.map((p) => ({
        '@type': 'BlogPosting',
        headline: p.title,
        url: canonicalUrl(`/blog/${p.slug}`),
        ...(p.excerpt ? { description: p.excerpt } : {}),
        ...(p.published_at ? { datePublished: p.published_at } : {}),
        ...(p.cover_image_url ? { image: p.cover_image_url } : {}),
        author: p.author_name
          ? { '@type': 'Person', name: p.author_name }
          : { '@id': ORG_ID },
      })),
    },
  ];
}

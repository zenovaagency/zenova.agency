import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SeoCatchAllPage } from '@/views/SeoCatchAllPage';
import { getSeoPage, getSeoPages } from '@/lib/serverContent';
import { seoPageSeo } from '@/seo/content-seo';
import { seoMetaToMetadata } from '@/seo/next-metadata';
import { isExcludedContentSlug } from '@/seo/seo-data';
import { MetaJsonLd } from '../../_lib/route-seo';

/**
 * Admin-authored pages at top-level URLs. Every static route in this group
 * (/about, /blog, /pricing, …) takes precedence over this dynamic segment, so
 * it only ever sees slugs the marketing site does not already own.
 */
export async function generateStaticParams() {
  const pages = await getSeoPages();
  return (pages ?? [])
    .filter((p) => !isExcludedContentSlug(p.slug))
    .map((p) => ({ slug: p.slug }));
}

async function resolvePage(slug: string) {
  // The exclusion is enforced here, not only in the sitemap: without it a
  // direct visit would still render an excluded page, and the crawler that
  // found the URL somewhere else would still index it.
  if (isExcludedContentSlug(slug)) return null;
  return getSeoPage(slug);
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const page = await resolvePage(params.slug);
  if (!page) return { title: 'Page not found | Zenova' };
  const { meta, extras } = seoPageSeo(page);
  return seoMetaToMetadata(meta, extras);
}

export default async function Page({ params }: { params: { slug: string } }) {
  const page = await resolvePage(params.slug);
  if (!page) notFound();

  const { meta } = seoPageSeo(page);
  return (
    <>
      <MetaJsonLd
        meta={meta}
        extra={[
          {
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: page.title,
            description: meta.description,
            url: `https://zenova.agency/${page.slug}/`,
            dateModified: page.updated_at,
          },
        ]}
      />
      <SeoCatchAllPage page={page} />
    </>
  );
}

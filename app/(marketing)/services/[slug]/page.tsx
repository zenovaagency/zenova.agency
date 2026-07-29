import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ServiceDetailPage } from '@/views/ServiceDetailPage';
import { serviceRouteMeta } from '@/seo/seo-data';
import { seoMetaToMetadata } from '@/seo/next-metadata';
import { resolveServices } from '../../../_lib/detail-routes';
import { MetaJsonLd } from '../../../_lib/route-seo';

export async function generateStaticParams() {
  return (await resolveServices()).map((s) => ({ slug: s.slug }));
}

/** Unknown slugs 404 statically — see the note in app/not-found.tsx. */
export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const service = (await resolveServices()).find((s) => s.slug === params.slug);
  if (!service) return { title: 'Service not found | Zenova' };
  return seoMetaToMetadata(serviceRouteMeta(service), { ogImage: service.image || undefined });
}

export default async function Page({ params }: { params: { slug: string } }) {
  const service = (await resolveServices()).find((s) => s.slug === params.slug);
  // A real 404. The old app answered 200 and then client-side <Navigate>d to
  // /services, so every retired or typo'd URL looked like a live page.
  if (!service) notFound();

  return (
    <>
      <MetaJsonLd meta={serviceRouteMeta(service)} />
      <ServiceDetailPage />
    </>
  );
}

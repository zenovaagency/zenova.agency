import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ProjectDetailPage } from '@/views/ProjectDetailPage';
import { projectRouteMeta } from '@/seo/seo-data';
import { seoMetaToMetadata } from '@/seo/next-metadata';
import { resolveProjects } from '../../../_lib/detail-routes';
import { MetaJsonLd } from '../../../_lib/route-seo';

export async function generateStaticParams() {
  return (await resolveProjects()).map((p) => ({ slug: p.slug }));
}

/** Unknown slugs 404 statically — see the note in app/not-found.tsx. */
export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const project = (await resolveProjects()).find((p) => p.slug === params.slug);
  if (!project) return { title: 'Case study not found | Zenova' };
  return seoMetaToMetadata(projectRouteMeta(project), {
    ogImage: project.images?.[0]?.src || undefined,
  });
}

export default async function Page({ params }: { params: { slug: string } }) {
  const project = (await resolveProjects()).find((p) => p.slug === params.slug);
  if (!project) notFound();

  return (
    <>
      <MetaJsonLd meta={projectRouteMeta(project)} />
      <ProjectDetailPage />
    </>
  );
}

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { JobDetailPage } from '@/views/JobDetailPage';
import { jobRouteMeta } from '@/seo/seo-data';
import { seoMetaToMetadata } from '@/seo/next-metadata';
import { resolveJobs } from '../../../_lib/detail-routes';
import { MetaJsonLd } from '../../../_lib/route-seo';

export async function generateStaticParams() {
  return (await resolveJobs()).map((j) => ({ slug: j.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const job = (await resolveJobs()).find((j) => j.slug === params.slug);
  if (!job) return { title: 'Role not found | Zenova' };
  return seoMetaToMetadata(jobRouteMeta(job));
}

export default async function Page({ params }: { params: { slug: string } }) {
  const job = (await resolveJobs()).find((j) => j.slug === params.slug);
  if (!job) notFound();

  return (
    <>
      <MetaJsonLd meta={jobRouteMeta(job)} />
      <JobDetailPage />
    </>
  );
}

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { BlogPostPage } from '@/views/BlogPostPage';
import { getAllBlogPosts, getBlogList, getBlogPost } from '@/lib/serverContent';
import { blogPostSeo } from '@/seo/content-seo';
import { seoMetaToMetadata } from '@/seo/next-metadata';
import { MetaJsonLd } from '../../../_lib/route-seo';

/**
 * Every published post is rendered at build time, and the slug list below is the
 * complete set this route will serve — see `dynamicParams` for why.
 */
export async function generateStaticParams() {
  const posts = await getAllBlogPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

/**
 * An unknown slug 404s statically instead of rendering on demand. That is what
 * makes this route's 404 a real page instead of an empty document — see the
 * "Why every dynamic route sets dynamicParams = false" note in app/not-found.tsx.
 *
 * The cost is that a post published after the last deploy is not reachable until
 * a rebuild. The backend triggers one automatically on any content change; see
 * backend/app/rebuild.py.
 */
export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const post = await getBlogPost(params.slug);
  if (!post) return { title: 'Post not found | Zenova' };
  const { meta, extras } = blogPostSeo(post);
  return seoMetaToMetadata(meta, extras);
}

export default async function Page({ params }: { params: { slug: string } }) {
  const post = await getBlogPost(params.slug);
  if (!post) notFound();

  const { meta, jsonLd } = blogPostSeo(post);

  // Related posts, resolved on the server so the section is in the HTML and
  // gives crawlers three more internal links out of every article.
  const list = await getBlogList(6, 0);
  const related = (list?.items ?? []).filter((p) => p.slug !== post.slug).slice(0, 3);

  return (
    <>
      <MetaJsonLd meta={meta} extra={jsonLd} />
      <BlogPostPage post={post} related={related} />
    </>
  );
}

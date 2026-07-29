import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { BlogPostPage } from '@/views/BlogPostPage';
import { getAllBlogPosts, getBlogList, getBlogPost } from '@/lib/serverContent';
import { blogPostSeo } from '@/seo/content-seo';
import { seoMetaToMetadata } from '@/seo/next-metadata';
import { MetaJsonLd } from '../../../_lib/route-seo';

/**
 * Known posts are rendered at build time; anything else renders on demand and
 * is then cached. dynamicParams stays at its default (true) on purpose — a post
 * published after the last deploy has to be reachable. Under the old static
 * host that URL returned a genuine HTTP 404 and relied on a client-side
 * redirect shim to recover, so newly published articles were invisible to
 * crawlers until someone triggered a rebuild.
 */
export async function generateStaticParams() {
  const posts = await getAllBlogPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

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

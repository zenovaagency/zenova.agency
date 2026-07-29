import { BlogPage } from '@/views/BlogPage';
import { getBlogList } from '@/lib/serverContent';
import { blogIndexJsonLd } from '@/seo/content-seo';
import { resolveSeo } from '@/seo/seo-data';
import { RouteJsonLd, routeMetadata } from '../../_lib/route-seo';

export const metadata = routeMetadata('/blog');

/** Matches PAGE_SIZE in src/views/BlogPage.tsx, so "Load more" pages correctly. */
const PAGE_SIZE = 12;

export default async function Page() {
  const list = await getBlogList(PAGE_SIZE, 0);
  const items = list?.items ?? [];
  const meta = resolveSeo('/blog');

  return (
    <>
      <RouteJsonLd path="/blog" extra={blogIndexJsonLd(items, meta)} />
      <BlogPage initial={list ? { items: list.items, total: list.total } : null} />
    </>
  );
}

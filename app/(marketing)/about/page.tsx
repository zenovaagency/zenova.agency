import { AboutPage } from '@/views/AboutPage';
import { getBlogList } from '@/lib/serverContent';
import { RouteJsonLd, routeMetadata } from '../../_lib/route-seo';

export const metadata = routeMetadata('/about');

export default async function Page() {
  const list = await getBlogList(3, 0);

  return (
    <>
      <RouteJsonLd path="/about" />
      <AboutPage posts={list?.items ?? []} />
    </>
  );
}

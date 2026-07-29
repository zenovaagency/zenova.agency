import { WorkPage } from '@/views/WorkPage';
import { RouteJsonLd, routeMetadata } from '../../_lib/route-seo';

export const metadata = routeMetadata('/work');

export default function Page() {
  return (
    <>
      <RouteJsonLd path="/work" />
      <WorkPage />
    </>
  );
}

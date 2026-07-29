import { CareersPage } from '@/views/CareersPage';
import { RouteJsonLd, routeMetadata } from '../../_lib/route-seo';

export const metadata = routeMetadata('/careers');

export default function Page() {
  return (
    <>
      <RouteJsonLd path="/careers" />
      <CareersPage />
    </>
  );
}

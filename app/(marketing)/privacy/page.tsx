import { LegalPage } from '@/views/LegalPage';
import { RouteJsonLd, routeMetadata } from '../../_lib/route-seo';

export const metadata = routeMetadata('/privacy');

export default function Page() {
  return (
    <>
      <RouteJsonLd path="/privacy" />
      <LegalPage doc="privacy" />
    </>
  );
}

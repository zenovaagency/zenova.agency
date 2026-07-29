import { LegalPage } from '@/views/LegalPage';
import { RouteJsonLd, routeMetadata } from '../../_lib/route-seo';

export const metadata = routeMetadata('/terms');

export default function Page() {
  return (
    <>
      <RouteJsonLd path="/terms" />
      <LegalPage doc="terms" />
    </>
  );
}

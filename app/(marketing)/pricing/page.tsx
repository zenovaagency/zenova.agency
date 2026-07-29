import { PricingPage } from '@/views/PricingPage';
import { RouteJsonLd, routeMetadata } from '../../_lib/route-seo';

export const metadata = routeMetadata('/pricing');

export default function Page() {
  return (
    <>
      <RouteJsonLd path="/pricing" />
      <PricingPage />
    </>
  );
}

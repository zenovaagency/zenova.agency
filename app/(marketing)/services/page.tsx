import { ServicesPage } from '@/views/ServicesPage';
import { RouteJsonLd, routeMetadata } from '../../_lib/route-seo';

export const metadata = routeMetadata('/services');

export default function Page() {
  return (
    <>
      <RouteJsonLd path="/services" />
      <ServicesPage />
    </>
  );
}

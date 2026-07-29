import { ContactPage } from '@/views/ContactPage';
import { RouteJsonLd, routeMetadata } from '../_lib/route-seo';

export const metadata = routeMetadata('/contact');

export default function Page() {
  return (
    <>
      <RouteJsonLd path="/contact" />
      <ContactPage />
    </>
  );
}

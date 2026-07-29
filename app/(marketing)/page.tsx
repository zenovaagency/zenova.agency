import { Home } from '@/views/Home';
import { TWEAK_DEFAULTS } from '@/config/tweaks';
import { RouteJsonLd, routeMetadata } from '../_lib/route-seo';

export const metadata = routeMetadata('/');

export default function HomePage() {
  return (
    <>
      <RouteJsonLd path="/" />
      <Home
        rotateMs={TWEAK_DEFAULTS.rotateMs}
        showMarquee={TWEAK_DEFAULTS.showMarquee}
        showTestimonials={TWEAK_DEFAULTS.showTestimonials}
      />
    </>
  );
}

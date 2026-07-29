/**
 * The public-site chrome: skip link, nav, <main>, footer.
 *
 * Extracted from (marketing)/layout.tsx so the 404 can render byte-identical
 * chrome. A route group's layout does NOT wrap the root not-found boundary —
 * app/not-found.tsx sits outside (marketing) and is wrapped only by the root
 * layout — so without this the 404 would have to re-declare the whole shell and
 * the two copies would drift the first time a nav item changed.
 *
 * The bundle is passed in rather than fetched here: both callers are server
 * components that already await getSiteBundle(), and Next caches that fetch for
 * CONTENT_REVALIDATE seconds, so there is one upstream request either way.
 */
import { Nav } from '@/components/layout/Nav';
import { Footer } from '@/components/layout/Footer';
import { SkipLink } from '@/components/ui/SkipLink';
import type { SiteBundle } from '@/admin/store';
import { SiteEffects } from './SiteEffects';
import { PageTransition } from './PageTransition';
import { SiteStoreProvider } from './SiteStoreProvider';

export function MarketingChrome({
  bundle,
  children,
}: {
  bundle: SiteBundle | null;
  children: React.ReactNode;
}) {
  return (
    <SiteStoreProvider bundle={bundle}>
      <SkipLink />
      <SiteEffects />
      <Nav />
      <PageTransition>
        <main id="main-content">{children}</main>
        <Footer />
      </PageTransition>
    </SiteStoreProvider>
  );
}

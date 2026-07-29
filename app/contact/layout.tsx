/**
 * Chrome for /contact — everything the marketing layout provides except the
 * nav and the footer.
 *
 * The old code expressed this as two `pathname !== '/contact'` conditionals
 * inside the shared layout. Giving the route its own layout says the same thing
 * without the conditionals, and without every other page paying for the check.
 *
 * <main id="main-content"> is still here: the skip link targets it, and the
 * page had it before (the old PublicLayout wrapped every route, including this
 * one — only Nav and Footer were suppressed).
 */
import { SkipLink } from '@/components/ui/SkipLink';
import { getSiteBundle } from '@/lib/serverContent';
import { SiteEffects } from '../_components/SiteEffects';
import { PageTransition } from '../_components/PageTransition';
import { SiteStoreProvider } from '../_components/SiteStoreProvider';

export default async function ContactLayout({ children }: { children: React.ReactNode }) {
  const bundle = await getSiteBundle();

  return (
    <SiteStoreProvider bundle={bundle}>
      <SkipLink />
      <SiteEffects />
      <PageTransition>
        <main id="main-content">{children}</main>
      </PageTransition>
    </SiteStoreProvider>
  );
}

'use client';
/**
 * Seeds the admin store from the `/public/site` bundle the server fetched.
 *
 * This is what puts admin-edited content into the HTML that crawlers read.
 * Previously the server rendered the hardcoded defaults in src/data and the
 * live copy only arrived after hydrateSite() resolved in the browser — so every
 * service page, case study, job posting and legal document that had been edited
 * in the dashboard was served to Google and to AI crawlers as the fallback text.
 *
 * The seeding happens in the render body, not an effect. Effects run after the
 * whole tree has rendered, which is far too late: the children below read the
 * store during their own render, and on the server effects never run at all.
 * seed() is idempotent, so calling it on every render is harmless.
 *
 * `bundle` crosses the server/client boundary as serialised props, so the
 * browser seeds from byte-identical data and the hydration pass produces the
 * same markup the server sent.
 */
import { seedSite, type SiteBundle } from '@/admin/store';

export function SiteStoreProvider({
  bundle,
  children,
}: {
  bundle: SiteBundle | null;
  children: React.ReactNode;
}) {
  seedSite(bundle);
  return <>{children}</>;
}

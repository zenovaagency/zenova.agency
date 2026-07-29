/**
 * Chrome for every public marketing page: skip link, nav, <main>, footer.
 *
 * The shell itself lives in ../_components/MarketingChrome so app/not-found.tsx
 * can render the identical thing — see the note there for why the 404 cannot
 * simply live in this route group and inherit this layout.
 *
 * The shell owning `<main id="main-content">` is deliberate. Previously each
 * page decided for itself, and three detail pages (service/project/job) rendered
 * their own <main> *inside* the shell's, so those documents shipped two `main`
 * landmarks — invalid HTML, and it breaks landmark navigation for screen
 * readers. With the landmark in the shared shell, that is unrepresentable.
 *
 * /contact is NOT in this route group. It suppresses the nav and footer by
 * design (it is a focused conversion page with a single "back to home" link),
 * which the old code expressed as two `pathname !== '/contact'` conditionals.
 * A route group is the same decision without the conditionals.
 *
 * The layout is async because it fetches the CMS bundle. That fetch is shared
 * by every page under it and cached by Next for CONTENT_REVALIDATE seconds, so
 * it costs one upstream request per five minutes, not one per page view.
 */
import { getSiteBundle } from '@/lib/serverContent';
import { MarketingChrome } from '../_components/MarketingChrome';

export default async function MarketingLayout({ children }: { children: React.ReactNode }) {
  const bundle = await getSiteBundle();

  return <MarketingChrome bundle={bundle}>{children}</MarketingChrome>;
}

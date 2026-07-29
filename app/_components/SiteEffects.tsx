'use client';
/**
 * The app-level side effects that used to live in <AppShell> (src/App.tsx).
 *
 * They are all imperative and browser-only — smooth scrolling, the scroll-reveal
 * observer, scroll reset on navigation, the accent palette, and pulling the
 * latest CMS content into the admin store. None of them render anything, so
 * they sit in one null-returning client component that the server layout mounts
 * once. Keeping them out of the layout itself is what lets the layout stay a
 * server component.
 */
import { useEffect } from 'react';
import { startTransition } from 'react';
import { useSmoothScroll } from '@/hooks/useSmoothScroll';
import { useReveal } from '@/hooks/useReveal';
import { useScrollReset } from '@/hooks/useScrollReset';
import { applyPalette, deriveRamp } from '@/lib/palette';
import { applyCachedSite, isSiteSeeded, useBrand } from '@/admin/store';

export function SiteEffects() {
  const [brand] = useBrand();

  useSmoothScroll();
  useReveal();
  useScrollReset();

  // The site-wide accent comes from admin brand settings. On first paint
  // `brand` is the server/default value (Ember orange); once hydrateSite()
  // resolves, the stored accent applies.
  useEffect(() => {
    applyPalette(deriveRamp(brand.accent));
  }, [brand.accent]);

  useEffect(() => {
    // The server already fetched /public/site and rendered this page from it,
    // so there is nothing to catch up on: refetching would spend a request to
    // arrive at the data already on screen, and briefly flip every store to
    // 'loading' while doing it.
    if (isSiteSeeded()) return;

    // Effects run after hydration, so this is the first safe moment to swap in
    // values that differ from the server-rendered HTML. startTransition keeps
    // the resulting re-render non-urgent so it cannot interrupt a Suspense
    // boundary that is still hydrating (React error #421).
    startTransition(() => {
      applyCachedSite();
    });
    // Same reasoning: hydrateSite() synchronously flips every store to
    // 'loading', and that burst can land mid-hydration too.
    import('@/admin/store')
      .then((m) => startTransition(() => { void m.hydrateSite(); }))
      .catch(() => {});
  }, []);

  return null;
}

import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { scrollToTop } from '@/lib/scroll';

/**
 * Resets scroll to the top on every route change, for the whole public layout.
 *
 * This runs in a layout effect on purpose. Route content is lazy, so the
 * incoming Suspense skeleton is far shorter than the page being left; the
 * browser clamps scroll to the new document bottom — where the footer is —
 * the moment React commits. Resetting in a layout effect lands before paint,
 * so that clamped position is never shown.
 *
 * Paths with a hash are skipped: Home and ServicesPage do their own anchor
 * scrolling via scrollToElement().
 */
export function useScrollReset(): void {
  const { pathname, hash } = useLocation();

  useLayoutEffect(() => {
    // Otherwise the browser's own restore fights the reset on back/forward.
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  useLayoutEffect(() => {
    if (hash) return;
    scrollToTop();
  }, [pathname, hash]);
}

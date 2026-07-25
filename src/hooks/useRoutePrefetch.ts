import { useEffect } from 'react';
import { prefetchRoute } from '@/lib/routePrefetch';

/**
 * Warms a route's lazy chunk when the user hovers or tabs to a link pointing
 * at it, so the click usually lands on real content instead of a skeleton.
 *
 * One delegated listener rather than per-link handlers: this covers Nav,
 * Footer and every in-page link, including ones rendered after mount.
 */
export function useRoutePrefetch(): void {
  useEffect(() => {
    const onIntent = (e: Event) => {
      const target = e.target;
      if (!(target instanceof Element)) return;
      const link = target.closest('a[href]');
      if (!(link instanceof HTMLAnchorElement)) return;
      // Same-origin, in-app navigations only.
      if (link.target && link.target !== '_self') return;
      if (link.origin !== window.location.origin) return;
      prefetchRoute(link.href);
    };

    // pointerover fires on hover for mice and on tap for touch; focusin covers
    // keyboard navigation. Both are passive reads.
    document.addEventListener('pointerover', onIntent, { passive: true });
    document.addEventListener('focusin', onIntent, { passive: true });
    return () => {
      document.removeEventListener('pointerover', onIntent);
      document.removeEventListener('focusin', onIntent);
    };
  }, []);
}

import { useEffect, useState } from 'react';

/**
 * Subscribe to a CSS media query and re-render when it changes.
 * SSR-safe (returns `false` when `window`/`matchMedia` is unavailable).
 */
export function useMediaQuery(query: string): boolean {
  // Always false for the first render, even in the browser. The prerendered
  // HTML was produced without matchMedia, so reading the real value here would
  // make the hydration render disagree with the shipped markup and React would
  // throw the server HTML away. The effect below applies the true value on the
  // very next commit, so the correction is a single frame.
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !('matchMedia' in window)) return;
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}

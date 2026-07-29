'use client';
import { useEffect } from 'react';

/**
 * Adds an `.in` class to every element matching `.reveal` once it scrolls into
 * view. A MutationObserver picks up `.reveal` elements mounted after the
 * effect runs (route changes, store hydration, list filters), so a single
 * call at the layout level covers every page.
 */
export function useReveal(deps: ReadonlyArray<unknown> = []): void {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 },
    );
    const observeAll = () => {
      document.querySelectorAll('.reveal:not(.in)').forEach((el) => io.observe(el));
    };
    observeAll();
    const mo = new MutationObserver(observeAll);
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      io.disconnect();
      mo.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

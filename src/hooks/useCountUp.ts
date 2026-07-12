import { useEffect, useState } from 'react';

function prefersReducedMotion() {
  if (typeof window === 'undefined' || !('matchMedia' in window)) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function useCountUp(
  end: number,
  duration = 1600,
  decimals = 0,
): string {
  const reduced = prefersReducedMotion();
  const [value, setValue] = useState(reduced ? end : 0);

  // With reduced motion, jump straight to the target (also covers `end`
  // changing after mount). Reconciled during render, not in an effect.
  const [syncedEnd, setSyncedEnd] = useState(end);
  if (reduced && syncedEnd !== end) {
    setSyncedEnd(end);
    setValue(end);
  }

  useEffect(() => {
    if (reduced) return;

    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      setValue(end * eased);
      if (progress < 1) {
        raf = requestAnimationFrame(tick);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [end, duration, reduced]);

  return value.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

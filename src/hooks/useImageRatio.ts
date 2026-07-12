import { useEffect, useState } from 'react';

/**
 * Measure an image's intrinsic aspect ratio (width / height) once it loads and
 * cache it by URL so every place that shows the same project image measures it
 * only once. SSR-safe: returns `null` during static prerender (no `window`) and
 * whenever `src` is missing, so callers fall back to the CSS default ratio.
 */

// Measured once per URL, shared across all components (homepage, /work, detail).
const ratioCache = new Map<string, number>();

function cachedRatio(src?: string): number | null {
  return src ? ratioCache.get(src) ?? null : null;
}

export function useImageRatio(src?: string): number | null {
  const [state, setState] = useState<{ src?: string; ratio: number | null }>(() => ({
    src,
    ratio: cachedRatio(src),
  }));

  // Sync during render when `src` changes so a new image never briefly shows the
  // previous one's ratio (React re-renders immediately, before the browser paints).
  if (state.src !== src) {
    setState({ src, ratio: cachedRatio(src) });
  }

  useEffect(() => {
    if (!src || typeof window === 'undefined' || ratioCache.has(src)) return;
    let cancelled = false;
    const img = new Image();
    img.onload = () => {
      if (img.naturalWidth && img.naturalHeight) {
        const r = img.naturalWidth / img.naturalHeight;
        ratioCache.set(src, r);
        if (!cancelled) setState({ src, ratio: r });
      }
    };
    img.src = src;
    return () => {
      cancelled = true;
    };
  }, [src]);

  return state.ratio;
}

export interface RatioBounds {
  min: number;
  max: number;
}

/**
 * Safe aspect-ratio ranges per placement. Keeps a tall/portrait image from
 * blowing up the layout while still letting the container match the image.
 */
export const RATIO_BOUNDS = {
  // Big showcase frames (work featured card, project detail hero).
  banner: { min: 4 / 3, max: 21 / 9 }, // ≈ 1.33 … 2.33
  // Cards & rows (homepage row, work list rows, admin thumbnail).
  card: { min: 3 / 4, max: 16 / 9 }, // 0.75 … ≈ 1.78
} as const satisfies Record<string, RatioBounds>;

/** Clamp a measured ratio into `bounds`; passes `null` through untouched. */
export function clampRatio(ratio: number | null, bounds: RatioBounds): number | null {
  if (!ratio) return null;
  return Math.min(bounds.max, Math.max(bounds.min, ratio));
}

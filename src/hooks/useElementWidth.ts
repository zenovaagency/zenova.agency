import { useEffect, useState, type RefObject } from 'react';

/**
 * Track an element's content-box width via ResizeObserver.
 *
 * Preferred over a window-resize listener when a layout depends on the space
 * actually available to the element — it sees padding and gutters, and it
 * updates when an ancestor resizes for reasons unrelated to the viewport.
 * Returns `0` until the first observation, so callers should clamp.
 */
export function useElementWidth(ref: RefObject<HTMLElement>): number {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === 'undefined') return;

    const ro = new ResizeObserver(([entry]) => {
      // contentBoxSize is the spec'd path; contentRect is the fallback.
      const box = entry.contentBoxSize?.[0];
      setWidth(box ? box.inlineSize : entry.contentRect.width);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);

  return width;
}

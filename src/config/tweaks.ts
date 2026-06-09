import type { Tweaks } from '@/types/tweaks';

/**
 * Default tweak values. The EDITMODE-BEGIN/EDITMODE-END markers are honored
 * by the host editor tooling — it rewrites the literal between them when the
 * dev-only tweaks panel persists changes. Keep the JSON-ish shape.
 */
export const TWEAK_DEFAULTS: Tweaks = /*EDITMODE-BEGIN*/ {
  palette: ['#ff813a', '#ff6b1a', '#ff9a5c'],
  theme: 'dark',
  rotateMs: 2400,
  showMarquee: true,
  showTestimonials: true,
} /*EDITMODE-END*/;

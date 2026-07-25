/**
 * Jump to the top of the page, keeping lenis in sync when it's mounted.
 *
 * Both scrolls are issued on purpose. Lenis tracks its own scroll value, and
 * `scrollTo` bails out early when that value already reads 0 — which it can,
 * while the browser has separately clamped native scroll after a shorter route
 * swapped in. Setting native scroll first makes the jump unconditional; lenis'
 * own `immediate` path then adopts it synchronously (and swallows the native
 * scroll event we just caused), so this is safe to call before paint.
 */
export function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'auto' });
  // `force` so a stopped/locked instance still resets.
  window.__lenis?.scrollTo(0, { immediate: true, force: true });
}

/** Smooth-scroll to an element, using lenis when it's mounted. */
export function scrollToElement(el: HTMLElement, offset = 0) {
  if (window.__lenis) {
    window.__lenis.scrollTo(el, { offset });
  } else {
    el.scrollIntoView({ behavior: 'smooth' });
  }
}

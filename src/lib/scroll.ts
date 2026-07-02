/** Jump to the top of the page, using lenis when it's mounted. */
export function scrollToTop() {
  if (window.__lenis) {
    window.__lenis.scrollTo(0, { immediate: true });
  } else {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }
}

/** Smooth-scroll to an element, using lenis when it's mounted. */
export function scrollToElement(el: HTMLElement, offset = 0) {
  if (window.__lenis) {
    window.__lenis.scrollTo(el, { offset });
  } else {
    el.scrollIntoView({ behavior: 'smooth' });
  }
}

/**
 * Plays code-built visuals only while they are on screen.
 *
 * Every [data-visual] gets `data-play` while it intersects the viewport and
 * loses it when it leaves, and the visuals' CSS animations are keyed off that
 * attribute (see components/visuals/visual.css). Offscreen loops cost nothing
 * and a page full of them never runs more than the two or three in view.
 *
 * Under reduced motion nothing is marked, so every visual stays on its
 * composed static frame.
 */
export function initInView() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const els = document.querySelectorAll<HTMLElement>('[data-visual]');
  if (!els.length) return;

  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) e.target.toggleAttribute('data-play', e.isIntersecting);
    },
    { rootMargin: '0px 0px -10% 0px', threshold: 0.15 },
  );
  els.forEach((el) => io.observe(el));
}

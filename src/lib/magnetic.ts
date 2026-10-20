/**
 * Magnetic buttons.
 *
 * Any element with [data-magnetic] drifts up to MAX px toward a fine pointer
 * while it is hovered, then springs back on leave. The drift is written to
 * --mx / --my, which styles/buttons.css composes into the button's own
 * transform alongside its hover lift and press scale — so the three effects
 * add up instead of overwriting each other, and layout never moves.
 *
 * One delegated listener for the whole document, writes batched into rAF.
 * Skipped entirely on touch, without hover, and under reduced motion.
 */
const MAX = 4;
const PULL = 0.16;

export function initMagnetic() {
  const ok =
    matchMedia('(hover: hover) and (pointer: fine)').matches &&
    !matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!ok) return;

  let active: HTMLElement | null = null;
  let frame = 0;
  let x = 0;
  let y = 0;

  const write = () => {
    frame = 0;
    if (!active) return;
    const r = active.getBoundingClientRect();
    const dx = (x - (r.left + r.width / 2)) * PULL;
    const dy = (y - (r.top + r.height / 2)) * PULL;
    const clamp = (v: number) => Math.max(-MAX, Math.min(MAX, v));
    active.style.setProperty('--mx', `${clamp(dx).toFixed(2)}px`);
    active.style.setProperty('--my', `${clamp(dy).toFixed(2)}px`);
  };

  const release = (el: HTMLElement) => {
    el.style.removeProperty('--mx');
    el.style.removeProperty('--my');
  };

  document.addEventListener(
    'pointermove',
    (e) => {
      if (e.pointerType !== 'mouse') return;
      const target = (e.target as Element | null)?.closest<HTMLElement>('[data-magnetic]') ?? null;
      if (target !== active) {
        if (active) release(active);
        active = target;
      }
      if (!active) return;
      x = e.clientX;
      y = e.clientY;
      if (!frame) frame = requestAnimationFrame(write);
    },
    { passive: true },
  );

  document.addEventListener('pointerleave', () => {
    if (active) release(active);
    active = null;
  });
}

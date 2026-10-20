/**
 * Magnetic buttons.
 *
 * Any element with [data-magnetic] drifts up to MAX px toward a fine pointer
 * while it is hovered, then eases back on leave. The drift is written to
 * --mx / --my, which styles/buttons.css applies through the `translate`
 * property — separate from the press `scale` — so the effects add up instead
 * of overwriting each other, and layout never moves.
 *
 * Smoothing is a per-frame lerp rather than a CSS transition: each frame the
 * button covers EASE of the remaining distance to its target, so it glides
 * after the pointer and settles without a visible step when the pointer
 * stops or leaves. The loop runs only while some button is still moving.
 *
 * One delegated listener for the whole document. Skipped entirely on touch,
 * without hover, and under reduced motion.
 */
const MAX = 5;
const PULL = 0.18;
const EASE = 0.14;
const REST = 0.02;

interface Drift {
  x: number;
  y: number;
  tx: number;
  ty: number;
}

export function initMagnetic() {
  const ok =
    matchMedia('(hover: hover) and (pointer: fine)').matches &&
    !matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!ok) return;

  const moving = new Map<HTMLElement, Drift>();
  let active: HTMLElement | null = null;
  let frame = 0;

  const tick = () => {
    frame = 0;
    moving.forEach((d, el) => {
      d.x += (d.tx - d.x) * EASE;
      d.y += (d.ty - d.y) * EASE;
      const settled = Math.abs(d.tx - d.x) < REST && Math.abs(d.ty - d.y) < REST;
      if (settled && d.tx === 0 && d.ty === 0 && el !== active) {
        el.style.removeProperty('--mx');
        el.style.removeProperty('--my');
        moving.delete(el);
        return;
      }
      el.style.setProperty('--mx', `${d.x.toFixed(2)}px`);
      el.style.setProperty('--my', `${d.y.toFixed(2)}px`);
    });
    if (moving.size) frame = requestAnimationFrame(tick);
  };

  const run = () => {
    if (!frame) frame = requestAnimationFrame(tick);
  };

  const drift = (el: HTMLElement) => {
    let d = moving.get(el);
    if (!d) {
      d = { x: 0, y: 0, tx: 0, ty: 0 };
      moving.set(el, d);
    }
    return d;
  };

  const release = (el: HTMLElement) => {
    const d = moving.get(el);
    if (!d) return;
    d.tx = 0;
    d.ty = 0;
    run();
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
      const r = active.getBoundingClientRect();
      const clamp = (v: number) => Math.max(-MAX, Math.min(MAX, v));
      const d = drift(active);
      d.tx = clamp((e.clientX - (r.left + r.width / 2)) * PULL);
      d.ty = clamp((e.clientY - (r.top + r.height / 2)) * PULL);
      run();
    },
    { passive: true },
  );

  document.addEventListener('pointerleave', () => {
    if (active) release(active);
    active = null;
  });
}

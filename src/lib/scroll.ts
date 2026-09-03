import Lenis from 'lenis';
import { reducedMotion } from './motion';

type Gsap = typeof import('gsap')['gsap'];
type ScrollTriggerType = typeof import('gsap/ScrollTrigger')['ScrollTrigger'];

export interface Motion {
  gsap: Gsap;
  ScrollTrigger: ScrollTriggerType;
  reduced: boolean;
}

let motionPromise: Promise<Motion> | null = null;
let lenis: Lenis | null = null;

/** Latest smoothed scroll velocity, in px/frame. Read by the marquee. */
let velocity = 0;
export const getVelocity = () => velocity;
export const getLenis = () => lenis;

/**
 * Boots the scroll layer exactly once and hands back GSAP.
 *
 * GSAP and ScrollTrigger are dynamically imported so they stay off the
 * critical path — nothing here runs before first paint.
 *
 * Under `prefers-reduced-motion` we never construct Lenis at all: native
 * scrolling is returned to the browser, and callers branch on `reduced`
 * to set their final state instead of animating to it.
 */
export function motion(): Promise<Motion> {
  if (motionPromise) return motionPromise;

  motionPromise = (async () => {
    const reduced = reducedMotion();
    const [{ gsap }, { ScrollTrigger }] = await Promise.all([
      import('gsap'),
      import('gsap/ScrollTrigger'),
    ]);
    gsap.registerPlugin(ScrollTrigger);

    if (!reduced) {
      lenis = new Lenis({
        lerp: 0.1,
        smoothWheel: true,
        // Touch devices keep their native scroll physics. Smoothing them
        // fights the platform and breaks momentum on iOS.
        syncTouch: false,
      });

      lenis.on('scroll', (e: { velocity: number }) => {
        velocity = e.velocity;
        ScrollTrigger.update();
      });

      // GSAP's ticker drives Lenis, so `autoRaf` stays false and there is
      // only ever one rAF loop on the page.
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
    }

    return { gsap, ScrollTrigger, reduced };
  })();

  return motionPromise;
}

function tick(time: number) {
  lenis?.raf(time * 1000);
}

/** Used by the nav's mobile drawer to lock the page behind it. */
export function lockScroll(locked: boolean) {
  if (!lenis) {
    document.documentElement.style.overflow = locked ? 'hidden' : '';
    return;
  }
  locked ? lenis.stop() : lenis.start();
}

export function scrollTo(target: string | HTMLElement | number, offset = -80) {
  if (lenis) {
    lenis.scrollTo(target, { offset });
    return;
  }
  // A pixel position, which is what ScrollTrigger hands back in st.start /
  // st.end. There is no element to bring into view, so it is handled before
  // the lookup below rather than falling through it.
  if (typeof target === 'number') {
    window.scrollTo({ top: target + offset });
    return;
  }
  const el =
    typeof target === 'string' ? document.querySelector<HTMLElement>(target) : target;
  el?.scrollIntoView({ behavior: 'auto', block: 'start' });
}

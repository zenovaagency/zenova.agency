'use client';
import { useEffect, useRef } from 'react';
import type LenisType from 'lenis';

declare global {
  interface Window {
    __lenis?: LenisType;
  }
}

function isTouchDevice(): boolean {
  try {
    return (
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      window.matchMedia('(pointer: coarse)').matches
    );
  } catch {
    return false;
  }
}

export function useSmoothScroll() {
  const lenisRef = useRef<LenisType | null>(null);

  useEffect(() => {
    if (isTouchDevice()) return;

    let active = true;
    let rafId = 0;

    async function init() {
      const [{ default: Lenis }] = await Promise.all([
        import('lenis'),
        import('lenis/dist/lenis.css'),
      ]);
      if (!active) return;

      const lenis = new Lenis({
        duration: 1.2,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        lerp: 0.08,
        smoothWheel: true,
        syncTouch: false,
        touchInertiaExponent: 2.5,
        stopInertiaOnNavigate: true,
        autoRaf: false,
      });

      lenisRef.current = lenis;
      window.__lenis = lenis;

      function raf(time: number) {
        if (!lenisRef.current) return;
        lenisRef.current.raf(time);
        rafId = requestAnimationFrame(raf);
      }
      rafId = requestAnimationFrame(raf);
    }

    init();

    return () => {
      active = false;
      if (rafId) cancelAnimationFrame(rafId);
      lenisRef.current?.destroy();
      lenisRef.current = null;
      delete window.__lenis;
    };
  }, []);

  return lenisRef;
}

'use client';
import { useEffect, useRef } from 'react';
import { useMediaQuery } from '@/hooks/useMediaQuery';

interface Particle {
  hx: number;
  hy: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  phase: number;
  drift: number;
}

const TEXT = 'ZENOVA';

/**
 * ── Logo tuning ──────────────────────────────────────────────────────────
 * Every visual knob for the wordmark lives here — edit and hot-reload.
 */
const TUNE = {
  /** Height of the whole logo strip (any CSS length). */
  /** On phones the 24vw resolves ~90px; the min clamps it so it never
   *  vanishes on tiny screens, the max keeps it from towering on desktops. */
  containerHeight: 'clamp(75px, 26vw, 350px)',
  /** Letter height as a fraction of the strip height. */
  sizeFactor: 0.70,
  /** The wordmark never grows wider than this fraction of the strip width. */
  maxWidthFrac: 0.82,
  /** Vertical center of the text as a fraction of the strip height. */
  centerY: 0.52,
  /** Uniform spacing between letters, in em. */
  tracking: 0.04,
  /** Per-pair kerning in em — negative pulls that pair closer together. */
  kern: { VA: -0.15 } as Record<string, number>,
  /** Dot diameter, px. */
  dotSize: 3,
  /** Dot opacity, 0–1. */
  dotAlpha: 0.9,
  /** Dot grid spacing, px. Grows automatically when over the particle budget. */
  dotGap: 6,
  /** Fraction of a grid cell the glyph must cover to earn a dot (0–1).
   *  Lower = more edge dots fill in stair-steps but letters look fuller.
   *  On phones the dot grid is coarser relative to the glyph, so
   *  dropping this helps hide jagged corners. */
  minCoverage: 0.18,
  /** Idle wobble per dot, px (min–max). Adds a gentle shimmer that
   *  visually smooths the stairstep edges, especially at small sizes. */
  driftMin: 0.1,
  driftMax: 0.35,
  /** Pointer repulsion: radius as a fraction of font size, and push strength. */
  repelRadiusFrac: 0.42,
  repelForce: 3.2,
  /** Physics: spring pull toward home and per-frame velocity damping. */
  spring: 0.02,
  damping: 0.88,
  /** Hard cap on the particle count — fewer on phones is plenty. */
  maxParticles: 5000,
  /** Font size of the static prefers-reduced-motion fallback. */
  fallbackFontSize: 'clamp(60px, 18vw, 270px)',
};

/** Normalize any CSS color (hex, rgb, named) to [r, g, b] via a 1px canvas. */
function cssColorToRgb(raw: string, fallback: [number, number, number]): [number, number, number] {
  const c = document.createElement('canvas');
  c.width = c.height = 1;
  const ctx = c.getContext('2d');
  if (!ctx) return fallback;
  ctx.fillStyle = raw;
  ctx.fillRect(0, 0, 1, 1);
  const d = ctx.getImageData(0, 0, 1, 1).data;
  return [d[0], d[1], d[2]];
}

/** Pre-rendered circle sprite — drawImage keeps thousands of round dots cheap. */
function makeDot(rgb: [number, number, number]): HTMLCanvasElement {
  const s = document.createElement('canvas');
  const R = 16;
  s.width = s.height = R * 2;
  const c = s.getContext('2d');
  if (c) {
    c.fillStyle = `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`;
    c.beginPath();
    c.arc(R, R, R, 0, Math.PI * 2);
    c.fill();
  }
  return s;
}

/**
 * The giant footer wordmark, rendered as a field of dust particles. Each
 * particle homes to a pixel of the text, drifts gently, and scatters away
 * from the pointer before settling back. Assembles from scattered dust the
 * first time it scrolls into view. Falls back to static text under
 * prefers-reduced-motion.
 */
export function ParticleWordmark() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const reduced = useMediaQuery('(prefers-reduced-motion: reduce)');

  useEffect(() => {
    if (reduced) return;
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles: Particle[] = [];
    let raf = 0;
    let running = false;
    let width = 0;
    let height = 0;
    let repelR = 100;
    let t = Math.random() * 100;
    const mouse = { x: -1e4, y: -1e4 };
    let dotFg = makeDot([255, 255, 255]);

    const resolvePalette = () => {
      const cs = getComputedStyle(document.documentElement);
      // Pure white dust on the dark theme, pure black on the light theme —
      // decided by the actual background luminance so any theme works.
      const [br, bg, bb] = cssColorToRgb(cs.getPropertyValue('--bg').trim(), [10, 10, 10]);
      const lum = 0.2126 * br + 0.7152 * bg + 0.0722 * bb;
      dotFg = makeDot(lum > 128 ? [0, 0, 0] : [255, 255, 255]);
    };

    const build = () => {
      width = wrap.clientWidth;
      height = wrap.clientHeight;
      if (width < 10 || height < 10) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Rasterize the wordmark offscreen, then sample it into particles.
      const family =
        getComputedStyle(document.documentElement).getPropertyValue('--font-display').trim() ||
        'system-ui, sans-serif';
      const off = document.createElement('canvas');
      off.width = width;
      off.height = height;
      const octx = off.getContext('2d', { willReadFrequently: true });
      if (!octx) return;
      // Manual per-letter layout: uniform tracking plus per-pair kerning
      // (canvas letterSpacing can't tighten a single pair like "VA").
      const layout = (px: number) => {
        octx.font = `700 ${px}px ${family}`;
        const offsets: number[] = [];
        let w = 0;
        for (let i = 0; i < TEXT.length; i++) {
          offsets.push(w);
          w += octx.measureText(TEXT[i]).width;
          if (i < TEXT.length - 1) {
            w += (TUNE.tracking + (TUNE.kern[TEXT.slice(i, i + 2)] ?? 0)) * px;
          }
        }
        return { offsets, width: w };
      };
      let fontSize = height * TUNE.sizeFactor;
      let metrics = layout(fontSize);
      const maxW = width * TUNE.maxWidthFrac;
      if (metrics.width > maxW) {
        fontSize *= maxW / metrics.width;
        metrics = layout(fontSize);
      }
      octx.textAlign = 'left';
      octx.textBaseline = 'middle';
      octx.fillStyle = '#fff';
      const startX = (width - metrics.width) / 2;
      for (let i = 0; i < TEXT.length; i++) {
        octx.fillText(TEXT[i], startX + metrics.offsets[i], height * TUNE.centerY);
      }

      repelR = Math.max(70, fontSize * TUNE.repelRadiusFrac);

      const img = octx.getImageData(0, 0, width, height).data;
      const pts: Particle[] = [];
      // Sample the raster one grid cell at a time and place each dot at the
      // centroid of the glyph pixels inside its cell — interior dots stay on
      // the regular grid while edge dots slide onto the letter contour, which
      // keeps the edges smooth instead of stair-stepped. The gap grows until
      // the particle count fits the budget.
      for (let gap = TUNE.dotGap; gap <= TUNE.dotGap + 5; gap++) {
        pts.length = 0;
        const minCount = gap * gap * TUNE.minCoverage;
        for (let cy = 0; cy < height; cy += gap) {
          for (let cx = 0; cx < width; cx += gap) {
            let n = 0;
            let sx = 0;
            let sy = 0;
            const yMax = Math.min(cy + gap, height);
            const xMax = Math.min(cx + gap, width);
            for (let y = cy; y < yMax; y++) {
              for (let x = cx; x < xMax; x++) {
                if (img[(y * width + x) * 4 + 3] <= 128) continue;
                n++;
                sx += x;
                sy += y;
              }
            }
            if (n < minCount) continue;
            const hx = sx / n;
            const hy = sy / n;
            pts.push({
              hx,
              hy,
              x: hx + (Math.random() - 0.5) * width * 0.5,
              y: hy + (Math.random() - 0.5) * height * 2,
              vx: 0,
              vy: 0,
              phase: Math.random() * Math.PI * 2,
              drift: TUNE.driftMin + Math.random() * (TUNE.driftMax - TUNE.driftMin),
            });
          }
        }
        if (pts.length <= TUNE.maxParticles) break;
      }
      particles = pts;
    };

    const step = () => {
      raf = requestAnimationFrame(step);
      t += 0.016;
      ctx.clearRect(0, 0, width, height);
      ctx.globalAlpha = TUNE.dotAlpha;
      const r2 = repelR * repelR;
      for (const p of particles) {
        const tx = p.hx + Math.cos(t * 0.6 + p.phase) * p.drift;
        const ty = p.hy + Math.sin(t * 0.8 + p.phase) * p.drift;
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < r2 && d2 > 0.0001) {
          const d = Math.sqrt(d2);
          const f = ((repelR - d) / repelR) ** 1.5 * TUNE.repelForce;
          p.vx += (dx / d) * f;
          p.vy += (dy / d) * f;
        }
        p.vx = (p.vx + (tx - p.x) * TUNE.spring) * TUNE.damping;
        p.vy = (p.vy + (ty - p.y) * TUNE.spring) * TUNE.damping;
        p.x += p.vx;
        p.y += p.vy;
        ctx.drawImage(dotFg, p.x, p.y, TUNE.dotSize, TUNE.dotSize);
      }
      ctx.globalAlpha = 1;
    };

    resolvePalette();
    build();
    // Metrics change once the display font finishes loading — resample then.
    document.fonts?.ready.then(() => build()).catch(() => {});

    // Only animate while the footer is on screen.
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        if (!running) {
          running = true;
          raf = requestAnimationFrame(step);
        }
      } else {
        running = false;
        cancelAnimationFrame(raf);
      }
    });
    io.observe(canvas);

    let resizeTimer = 0;
    const ro = new ResizeObserver(() => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(build, 150);
    });
    ro.observe(wrap);

    // Theme toggles swap --bg; re-resolve the dot color without rebuilding.
    const mo = new MutationObserver(resolvePalette);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
    };
    const onLeave = () => {
      mouse.x = -1e4;
      mouse.y = -1e4;
    };
    wrap.addEventListener('pointermove', onMove);
    wrap.addEventListener('pointerleave', onLeave);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.clearTimeout(resizeTimer);
      io.disconnect();
      ro.disconnect();
      mo.disconnect();
      wrap.removeEventListener('pointermove', onMove);
      wrap.removeEventListener('pointerleave', onLeave);
    };
  }, [reduced]);

  if (reduced) {
    return (
      <div
        style={{
          marginTop: 80,
          position: 'relative',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '0 16px',
          overflow: 'hidden',
        }}
      >
        <div
          className="display"
          style={{
            fontSize: TUNE.fallbackFontSize,
            lineHeight: 0.9,
            fontWeight: 700,
            letterSpacing: `${TUNE.tracking}em`,
            color: 'var(--fg)',
            opacity: TUNE.dotAlpha,
          }}
        >
          {TEXT}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={wrapRef}
      role="img"
      aria-label={TEXT}
      style={{
        marginTop: 80,
        position: 'relative',
        width: '100%',
        height: TUNE.containerHeight,
        overflow: 'hidden',
      }}
    >
      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }}
      />
    </div>
  );
}

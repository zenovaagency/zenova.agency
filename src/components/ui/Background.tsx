'use client';
import { useEffect, useRef } from 'react';

interface Shape {
  x: number;
  y: number;
  r: number;
  sides: number;
  rot: number;
  rotSpeed: number;
  vx: number;
  vy: number;
  strokeAlpha: number;
  baseAlpha: number;
  isOrange: boolean;
  pulsePhase: number;
  innerR: number;
}

export function Background() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: -1000, y: -1000, active: false });
  const shapes = useRef<Shape[]>([]);
  const raf = useRef(0);
  const time = useRef(0);
  const gridOffset = useRef(0);
  const running = useRef(false);
  const dims = useRef({ w: 0, h: 0 });
  const dpr = useRef(1);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      dims.current.w = window.innerWidth;
      dims.current.h = window.innerHeight;
      dpr.current = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = dims.current.w * dpr.current;
      canvas.height = dims.current.h * dpr.current;
      canvas.style.width = `${dims.current.w}px`;
      canvas.style.height = `${dims.current.h}px`;
    };

    const initShapes = () => {
      resize();
      const { w, h } = dims.current;
      const isLight = document.documentElement.getAttribute('data-theme') === 'light';
      const count = Math.floor((w * h) / 35000);
      shapes.current = Array.from({ length: count }, () => {
        const sides = Math.random() > 0.4
          ? [3, 4, 6][Math.floor(Math.random() * 3)]
          : 0;
        const isOrange = Math.random() < 0.15;
        const baseAlpha = isOrange
          ? Math.random() * 0.2 + 0.08
          : isLight
            ? Math.random() * 0.25 + 0.15
            : Math.random() * 0.12 + 0.03;
        return {
          x: Math.random() * w,
          y: Math.random() * h,
          r: Math.random() * 28 + 10,
          sides,
          rot: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.004,
          vx: (Math.random() - 0.5) * 0.15,
          vy: (Math.random() - 0.5) * 0.15 - 0.04,
          strokeAlpha: baseAlpha,
          baseAlpha,
          isOrange,
          pulsePhase: Math.random() * Math.PI * 2,
          innerR: sides === 0 ? 0 : Math.random() * 0.4 + 0.3,
        };
      });
    };

    const getFgRgb = () => {
      const theme = document.documentElement.getAttribute('data-theme');
      return theme === 'light' ? '26, 20, 16' : '255, 255, 255';
    };

    const drawPolygon = (cx: number, cy: number, r: number, sides: number, rot: number, alpha: number, isOrange: boolean, innerR: number, fgRgb: string) => {
      if (sides === 0) {
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
      } else {
        ctx.beginPath();
        for (let i = 0; i <= sides; i++) {
          const angle = rot + (i / sides) * Math.PI * 2;
          const px = cx + Math.cos(angle) * r;
          const py = cy + Math.sin(angle) * r;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        if (innerR > 0) {
          for (let i = 0; i <= sides; i++) {
            const angle = rot + Math.PI / sides + (i / sides) * Math.PI * 2;
            const px = cx + Math.cos(angle) * r * innerR;
            const py = cy + Math.sin(angle) * r * innerR;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();
        }
      }
      ctx.strokeStyle = isOrange
        ? `rgba(255, 129, 58, ${alpha})`
        : `rgba(${fgRgb}, ${alpha})`;
      ctx.lineWidth = isOrange ? 1 : 0.6;
      ctx.stroke();
    };

    const draw = () => {
      if (!running.current) return;
      time.current += 0.016;
      gridOffset.current += 0.08;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.scale(dpr.current, dpr.current);

      const fgRgb = getFgRgb();
      const { w, h } = dims.current;
      const mx = mouse.current.x;
      const my = mouse.current.y;
      const mouseActive = mouse.current.active;
      const shapesArr = shapes.current;
      const len = shapesArr.length;

      for (let i = 0; i < len; i++) {
        const s = shapesArr[i];
        s.vy -= 0.0004;
        s.vx *= 0.998;
        s.vy *= 0.998;
        s.x += s.vx;
        s.y += s.vy;
        s.rot += s.rotSpeed;

        if (s.x < -60) s.x = w + 60;
        if (s.x > w + 60) s.x = -60;
        if (s.y < -60) s.y = h + 60;
        if (s.y > h + 60) s.y = -60;

        const glowDist = mouseActive
          ? Math.sqrt((mx - s.x) ** 2 + (my - s.y) ** 2)
          : 9999;
        const mouseBoost = glowDist < 160 ? (1 - glowDist / 160) * 0.25 : 0;
        const pulse = s.isOrange
          ? Math.sin(time.current * 1.2 + s.pulsePhase) * 0.5 + 0.5
          : 0;
        const alpha = s.baseAlpha + mouseBoost + pulse * 0.12;
        drawPolygon(s.x, s.y, s.r, s.sides, s.rot, alpha, s.isOrange, s.innerR, fgRgb);
      }

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      raf.current = requestAnimationFrame(draw);
    };

    const startLoop = () => {
      if (running.current) return;
      running.current = true;
      raf.current = requestAnimationFrame(draw);
    };

    const stopLoop = () => {
      running.current = false;
      cancelAnimationFrame(raf.current);
    };

    initShapes();
    startLoop();

    let resizeTimer = 0;
    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        resize();
        initShapes();
      }, 150);
    };

    const onMove = (e: MouseEvent | TouchEvent) => {
      const cx = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const cy = 'touches' in e ? e.touches[0].clientY : e.clientY;
      mouse.current = { x: cx, y: cy, active: true };
    };

    const onLeave = () => {
      mouse.current.active = false;
    };

    window.addEventListener('resize', onResize);
    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('mouseleave', onLeave);

    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) startLoop();
      else stopLoop();
    });
    io.observe(canvas);

    return () => {
      stopLoop();
      window.clearTimeout(resizeTimer);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('mouseleave', onLeave);
      io.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        willChange: 'transform',
      }}
      aria-hidden
    />
  );
}

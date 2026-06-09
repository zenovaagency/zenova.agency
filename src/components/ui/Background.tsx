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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = 0;
    let h = 0;
    let dpr = window.devicePixelRatio || 1;

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
    };

    const initShapes = () => {
      resize();
      const count = Math.floor((w * h) / 18000);
      shapes.current = Array.from({ length: count }, () => {
        const sides = Math.random() > 0.4
          ? [3, 4, 6][Math.floor(Math.random() * 3)]
          : 0; // 0 = circle
        const isOrange = Math.random() < 0.15;
        const baseAlpha = isOrange
          ? Math.random() * 0.2 + 0.08
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

    const drawPolygon = (cx: number, cy: number, r: number, sides: number, rot: number, alpha: number, isOrange: boolean, innerR: number) => {
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

        // Inner shape
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
        : `rgba(255, 255, 255, ${alpha})`;
      ctx.lineWidth = isOrange ? 1 : 0.6;
      ctx.stroke();
    };

    const drawGrid = () => {
      const spacing = 70;
      const offset = gridOffset.current % spacing;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.lineWidth = 0.5;

      ctx.beginPath();
      for (let x = offset; x < w; x += spacing) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
      }
      for (let y = offset; y < h; y += spacing) {
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
      }
      ctx.stroke();
    };

    const draw = () => {
      time.current += 0.016;
      gridOffset.current += 0.08;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.scale(dpr, dpr);

      drawGrid();

      const mx = mouse.current.x;
      const my = mouse.current.y;
      const mouseActive = mouse.current.active;

      for (let i = 0; i < shapes.current.length; i++) {
        const s = shapes.current[i];

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

        drawPolygon(s.x, s.y, s.r, s.sides, s.rot, alpha, s.isOrange, s.innerR);
      }

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      raf.current = requestAnimationFrame(draw);
    };

    const onMove = (e: MouseEvent | TouchEvent) => {
      const cx = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const cy = 'touches' in e ? e.touches[0].clientY : e.clientY;
      mouse.current = { x: cx, y: cy, active: true };
    };

    const onLeave = () => {
      mouse.current.active = false;
    };

    initShapes();
    draw();

    window.addEventListener('resize', () => {
      resize();
      initShapes();
    });
    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('mouseleave', onLeave);

    return () => {
      cancelAnimationFrame(raf.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('mouseleave', onLeave);
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
      }}
      aria-hidden
    />
  );
}

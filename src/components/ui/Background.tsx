import { useEffect, useRef } from 'react';

type ParticleType = 'dust' | 'glow' | 'spark';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  hue: number;
  opacity: number;
  baseOpacity: number;
  type: ParticleType;
  sparkPhase: number;
}

export function Background() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: -1000, y: -1000, active: false });
  const particles = useRef<Particle[]>([]);
  const raf = useRef(0);
  const time = useRef(0);

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

    const hues = [174, 280, 300]; // teal, purple, magenta

    const init = () => {
      resize();
      const count = Math.floor((w * h) / 6000);

      particles.current = Array.from({ length: count }, () => {
        const roll = Math.random();
        let type: ParticleType;
        let r: number;
        let baseOpacity: number;
        let hue: number;

        if (roll < 0.55) {
          // dust — tiny, subtle, mostly teal/purple
          type = 'dust';
          r = Math.random() * 1.6 + 0.4;
          baseOpacity = Math.random() * 0.35 + 0.08;
          hue = Math.random() > 0.5 ? hues[0] : hues[1];
        } else if (roll < 0.85) {
          // glow — medium, brighter, all hues
          type = 'glow';
          r = Math.random() * 2.8 + 1.4;
          baseOpacity = Math.random() * 0.4 + 0.2;
          hue = hues[Math.floor(Math.random() * 3)];
        } else {
          // spark — larger, pulses, magenta-dominant
          type = 'spark';
          r = Math.random() * 3.5 + 2;
          baseOpacity = Math.random() * 0.35 + 0.25;
          hue = Math.random() > 0.4 ? hues[2] : hues[Math.floor(Math.random() * 3)];
        }

        return {
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.25,
          vy: (Math.random() - 0.5) * 0.25 - 0.08,
          r,
          hue,
          opacity: baseOpacity,
          baseOpacity,
          type,
          sparkPhase: Math.random() * Math.PI * 2,
        };
      });
    };

    const draw = () => {
      time.current += 0.016;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.scale(dpr, dpr);

      const mx = mouse.current.x;
      const my = mouse.current.y;
      const mouseActive = mouse.current.active;

      // Draw connections first (beneath particles)
      for (let i = 0; i < particles.current.length; i++) {
        const a = particles.current[i];
        for (let j = i + 1; j < particles.current.length; j++) {
          const b = particles.current[j];
          // Only connect same-hue particles
          if (a.hue !== b.hue) continue;
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            const alpha = 0.06 * (1 - dist / 100);
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `hsla(${a.hue}, 70%, 58%, ${alpha})`;
            ctx.lineWidth = 0.4;
            ctx.stroke();
          }
        }
      }

      // Draw particles
      for (let i = 0; i < particles.current.length; i++) {
        const p = particles.current[i];

        // Mouse interaction — gentle pull
        if (mouseActive) {
          const dx = mx - p.x;
          const dy = my - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 200 && dist > 0) {
            const force = (1 - dist / 200) * 0.015;
            p.vx += (dx / dist) * force;
            p.vy += (dy / dist) * force;
          }
        }

        // Upward drift bias
        p.vy -= 0.0008;

        // Velocity damping
        p.vx *= 0.998;
        p.vy *= 0.998;

        p.x += p.vx;
        p.y += p.vy;

        // Wrap around
        if (p.x < -30) p.x = w + 30;
        if (p.x > w + 30) p.x = -30;
        if (p.y < -30) p.y = h + 30;
        if (p.y > h + 30) p.y = -30;

        // Calculate visual properties
        const glowDist = mouseActive
          ? Math.sqrt((mx - p.x) ** 2 + (my - p.y) ** 2)
          : 9999;
        const mouseGlow = glowDist < 180 ? 1 - glowDist / 180 : 0;

        let alpha = p.baseOpacity + mouseGlow * 0.25;
        let size = p.r + mouseGlow * 1.5;

        // Spark pulse
        if (p.type === 'spark') {
          const pulse = Math.sin(time.current * 1.8 + p.sparkPhase) * 0.5 + 0.5;
          alpha = p.baseOpacity + pulse * 0.3 + mouseGlow * 0.2;
          size = p.r + pulse * 1.5 + mouseGlow * 1;
        }

        // Dust gets barely any mouse boost
        if (p.type === 'dust') {
          alpha = p.baseOpacity + mouseGlow * 0.1;
          size = p.r + mouseGlow * 0.5;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2);

        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, size);
        const hue = p.hue;
        let color: string;

        if (hue === 174) {
          color = `hsla(174, 85%, 50%, ${alpha})`;
        } else if (hue === 280) {
          color = `hsla(280, 70%, 55%, ${alpha})`;
        } else {
          color = `hsla(300, 80%, 58%, ${alpha})`;
        }

        grad.addColorStop(0, color);
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.fill();
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

    init();
    draw();

    window.addEventListener('resize', () => {
      resize();
      init();
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
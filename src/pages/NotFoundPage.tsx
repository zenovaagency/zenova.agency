import { useEffect } from 'react';
import { GhostButton } from '@/components/ui/GhostButton';
import { NeonButton } from '@/components/ui/NeonButton';

export function NotFoundPage() {
  useEffect(() => {
    window.__lenis?.scrollTo(0, { immediate: true }) ?? window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  return (
    <div
      className="notfound-static"
      style={{
        minHeight: 'calc(100vh - 80px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        padding: '40px 24px',
      }}
    >
      {/* Dot grid */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(circle, var(--line) 1px, transparent 1px)',
          backgroundSize: '30px 30px',
          opacity: 0.45,
          pointerEvents: 'none',
        }}
      />

      {/* Central glow */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 'min(620px, 85vw)',
          height: 'min(620px, 85vw)',
          background:
            'radial-gradient(circle, rgba(255,129,58,0.06) 0%, rgba(255,129,58,0.02) 30%, transparent 55%)',
          pointerEvents: 'none',
        }}
      />

      {/* Radar rings */}
      {[
        { size: 180, anim: 'notfound-ring-1', dur: '2.8s', delay: '0s', brd: 'var(--line-strong)' },
        { size: 290, anim: 'notfound-ring-2', dur: '3.4s', delay: '0.7s', brd: 'var(--line)' },
        { size: 420, anim: 'notfound-ring-3', dur: '4s', delay: '1.4s', brd: 'rgba(255,255,255,0.04)' },
      ].map((r) => (
        <div
          key={r.size}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: r.size,
            height: r.size,
            borderRadius: '50%',
            border: `1px solid ${r.brd}`,
            animation: `${r.anim} ${r.dur} ease-out infinite ${r.delay}`,
            pointerEvents: 'none',
          }}
        />
      ))}

      {/* Scanlines */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 4px)',
          animation: 'notfound-scanlines 0.07s linear infinite',
          pointerEvents: 'none',
          zIndex: 5,
          opacity: 0.5,
        }}
      />

      {/* SVG noise texture */}
      <svg
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 6,
          opacity: 0.03,
          mixBlendMode: 'overlay' as React.CSSProperties['mixBlendMode'],
        }}
        aria-hidden="true"
      >
        <filter id="nf-grain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.78"
            numOctaves="3"
            stitchTiles="stitch"
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#nf-grain)" />
      </svg>

      {/* Content */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          textAlign: 'center',
          maxWidth: 560,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* Mono eyebrow */}
        <div
          className="mono"
          style={{
            color: 'var(--accent-2)',
            marginBottom: 22,
            letterSpacing: '0.22em',
            fontSize: 11,
            animation: 'fade-up 0.7s cubic-bezier(0.2, 0.7, 0.2, 1) both',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
          }}
        >
          <span style={{ width: 22, height: 1, background: 'var(--accent-2)', opacity: 0.6 }} />
          BROADCAST INTERRUPTED
          <span style={{ width: 22, height: 1, background: 'var(--accent-2)', opacity: 0.6 }} />
        </div>

        {/* 404 Glitch text with chromatic aberration */}
        <div
          style={{
            position: 'relative',
            display: 'inline-block',
            marginBottom: 26,
          }}
        >
          {/* Red channel ghost */}
          <span
            className="display"
            aria-hidden="true"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              color: '#ff4477',
              opacity: 0.5,
              animation: 'notfound-channel-red 2.5s ease-in-out infinite',
              fontSize: 'clamp(90px, 16vw, 200px)',
              fontWeight: 600,
              letterSpacing: '-0.04em',
              lineHeight: 0.98,
              whiteSpace: 'nowrap',
              userSelect: 'none',
            }}
          >
            404
          </span>
          {/* Blue channel ghost */}
          <span
            className="display"
            aria-hidden="true"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              color: '#44aaff',
              opacity: 0.5,
              animation: 'notfound-channel-blue 2.5s ease-in-out infinite 0.08s',
              fontSize: 'clamp(90px, 16vw, 200px)',
              fontWeight: 600,
              letterSpacing: '-0.04em',
              lineHeight: 0.98,
              whiteSpace: 'nowrap',
              userSelect: 'none',
            }}
          >
            404
          </span>
          {/* Main text */}
          <h1
            className="display gradient-text"
            style={{
              margin: 0,
              fontSize: 'clamp(90px, 16vw, 200px)',
              fontWeight: 600,
              position: 'relative',
              animation:
                'notfound-glitch-skew 2.5s ease-in-out infinite, notfound-flicker 3s ease-in-out infinite',
            }}
          >
            404
          </h1>
        </div>

        {/* Message */}
        <p
          style={{
            color: 'var(--fg-dim)',
            fontSize: 'clamp(14px, 1.8vw, 17px)',
            lineHeight: 1.65,
            margin: '0 0 36px',
            animation: 'fade-up 0.7s cubic-bezier(0.2, 0.7, 0.2, 1) 0.25s both',
          }}
        >
          This page has been disconnected. The signal was lost,
          <br />
          the coordinates are wrong, or the destination no longer exists.
        </p>

        {/* CTAs */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 14,
            flexWrap: 'wrap',
            animation: 'fade-up 0.7s cubic-bezier(0.2, 0.7, 0.2, 1) 0.5s both',
          }}
        >
          <NeonButton text="Return Home" onClick={() => { window.location.href = '/'; }} />
          <GhostButton text="View Work" onClick={() => { window.location.href = '/work'; }} />
        </div>
      </div>
    </div>
  );
}

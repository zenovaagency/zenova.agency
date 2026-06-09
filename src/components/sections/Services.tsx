import { useCallback, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Icon, type IconComponent } from '@/components/icons/Icon';
import { ServiceVisual } from './ServiceVisual';
import { useServices } from '@/admin/store';

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}
function remap(t: number, a: number, b: number) {
  return clamp((t - a) / (b - a), 0, 1);
}

export function Services() {
  const [SERVICES] = useServices();
  const sectionRef = useRef<HTMLDivElement>(null);
  const elRefs = useRef<(HTMLDivElement | null)[]>([]);
  const headerRef = useRef<HTMLDivElement>(null);

  const tick = useCallback(() => {
    const section = sectionRef.current;
    const cards = elRefs.current.filter(Boolean) as HTMLDivElement[];
    const header = headerRef.current;
    if (!section || cards.length === 0) return;

    const vh = window.innerHeight;
    const vw = window.innerWidth;
    const sr = section.getBoundingClientRect();
    const total = sr.height - vh;
    if (total <= 0) return;

    const p = clamp(-sr.top / total, 0, 1);
    const N = cards.length;
    const isMobile = vw < 860;
    const stackGap = isMobile ? 28 : 44;

    const headH = header ? header.offsetHeight : 120;
    const topPad = headH + (isMobile ? 16 : 20);

    cards.forEach((card, i) => {
      const enterAt = i / N;
      const parkAt = (i + 0.7) / N;
      const t = remap(p, enterAt, parkAt);
      const parkedY = topPad + i * stackGap;
      const baseScale = 1 - i * 0.02;

      let y: number;
      let s: number;
      let o: number;

      if (t <= 0) {
        y = vh + 80;
        s = baseScale + 0.05;
        o = 0;
      } else if (t >= 1) {
        y = parkedY;
        s = baseScale;
        o = 1;
      } else {
        const eased = 1 - Math.pow(1 - t, 3.5);
        y = (vh + 80) + (parkedY - (vh + 80)) * eased;
        s = baseScale + 0.05 * (1 - eased);
        o = eased;
      }

      card.style.transform = `translate3d(0, ${y}px, 0) scale(${s})`;
      card.style.opacity = String(o);
      card.style.zIndex = String(i + (o > 0.01 ? 100 : 0));
      card.style.pointerEvents = o > 0.8 ? 'auto' : 'none';
    });

  }, []);

  useEffect(() => {
    tick();
    window.addEventListener('scroll', tick, { passive: true });
    window.addEventListener('resize', tick);
    return () => {
      window.removeEventListener('scroll', tick);
      window.removeEventListener('resize', tick);
    };
  }, [tick]);

  return (
    <section
      id="services"
      className="sec"
      ref={sectionRef}
      style={{ position: 'relative', height: `${(SERVICES.length + 1.6) * 100}vh` }}
    >
      {/* Single sticky viewport — header + cards together */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          height: '100vh',
          overflow: 'hidden',
        }}
      >
        {/* Section heading — top of viewport */}
        <div
          ref={headerRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
            paddingTop: 44,
            paddingBottom: 12,
          }}
        >
          <div className="svc-header-inner" style={{ maxWidth: 1280, margin: '0 auto', padding: '0 40px' }}>
            <div
              className="mono"
              style={{
                color: 'var(--fg-faint)',
                marginBottom: 10,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <span style={{ width: 24, height: 1, background: 'var(--accent-1)' }} />
              What we do
            </div>
            <h2 className="display" style={{ fontSize: 'clamp(36px,5vw,68px)', margin: 0, fontWeight: 500 }}>
              What we do.
              <br />
              <span style={{ color: 'var(--fg-dim)' }}>All under one roof.</span>
            </h2>
          </div>
        </div>

        {/* Card stack area */}
        <div className="svc-header-inner" style={{ maxWidth: 1280, margin: '0 auto', height: '100%', position: 'relative', padding: '0 40px' }}>
          {SERVICES.map((s, i) => {
            const IconC = Icon[s.icon] as IconComponent;
            return (
              <div
                key={s.slug}
                ref={(el) => { elRefs.current[i] = el; }}
                className="svc-stack-card"
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: 0,
                  transform: 'translate3d(0, 120vh, 0) scale(1)',
                  opacity: 0,
                  willChange: 'transform, opacity',
                }}
              >
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 52,
                    alignItems: 'center',
                    padding: '44px 64px',
                    borderRadius: 24,
                    border: '1px solid var(--line)',
                    background: 'var(--card)',
                    boxShadow: `0 24px 80px rgba(0,0,0,0.5), 0 0 0 1px ${s.hue}08 inset`,
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      top: -60,
                      right: -60,
                      width: 220,
                      height: 220,
                      borderRadius: '50%',
                      background: `radial-gradient(circle, ${s.hue}0d, transparent 65%)`,
                      pointerEvents: 'none',
                    }}
                  />

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 20, position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <span
                        className="mono"
                        style={{
                          fontSize: 46,
                          fontWeight: 500,
                          lineHeight: 1,
                          background: `linear-gradient(180deg, ${s.hue}, ${s.hue}33)`,
                          WebkitBackgroundClip: 'text',
                          backgroundClip: 'text',
                          color: 'transparent',
                          opacity: 0.4,
                        }}
                      >
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <div
                        style={{
                          width: 38,
                          height: 38,
                          borderRadius: 10,
                          border: `1px solid ${s.hue}40`,
                          background: `${s.hue}14`,
                          color: s.hue,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <IconC size={18} />
                      </div>
                      <span
                        className="mono"
                        style={{
                          padding: '4px 10px',
                          borderRadius: 999,
                          border: `1px solid ${s.hue}45`,
                          background: `${s.hue}0e`,
                          color: s.hue,
                          fontSize: 10,
                          letterSpacing: '0.12em',
                        }}
                      >
                        {s.tag}
                      </span>
                    </div>

                    <h3
                      className="display"
                      style={{ fontSize: 'clamp(26px, 3vw, 40px)', fontWeight: 500, margin: 0, lineHeight: 1.12 }}
                    >
                      {s.title}
                    </h3>

                    <p style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--fg-dim)', margin: 0 }}>
                      {s.lede}
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {s.bullets.map((b) => (
                        <div key={b} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--fg)' }}>
                          <span
                            style={{
                              width: 16,
                              height: 16,
                              borderRadius: 5,
                              background: `${s.hue}18`,
                              border: `1px solid ${s.hue}38`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: s.hue,
                              flexShrink: 0,
                            }}
                          >
                            <Icon.Check size={10} />
                          </span>
                          {b}
                        </div>
                      ))}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap', marginTop: 2 }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                        <span
                          className="display"
                          style={{
                            fontSize: 36,
                            fontWeight: 500,
                            background: `linear-gradient(90deg, ${s.hue}, var(--accent-1))`,
                            WebkitBackgroundClip: 'text',
                            backgroundClip: 'text',
                            color: 'transparent',
                            lineHeight: 1,
                          }}
                        >
                          {s.stat[0]}
                        </span>
                        <span style={{ fontSize: 11, color: 'var(--fg-faint)', lineHeight: 1.4, maxWidth: 130 }}>
                          {s.stat[1]}
                        </span>
                      </div>
                      <Link
                        to={`/services/${s.slug}`}
                        className="mono"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 8,
                          padding: '9px 14px',
                          borderRadius: 999,
                          border: `1px solid ${s.hue}50`,
                          background: `${s.hue}10`,
                          color: s.hue,
                          fontSize: 11,
                          letterSpacing: '0.1em',
                          textDecoration: 'none',
                        }}
                      >
                        See full service <Icon.Arrow size={12} />
                      </Link>
                    </div>
                  </div>

                  <div
                    style={{
                      aspectRatio: '5/3.5',
                      borderRadius: 16,
                      background: `linear-gradient(160deg, ${s.hue}0e, ${s.hue}03)`,
                      border: '1px solid var(--line)',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    <ServiceVisual kind={s.visual} hue={s.hue} active={true} />
                  </div>

                  <div
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: '20%',
                      right: '20%',
                      height: 1,
                      background: `linear-gradient(90deg, transparent, ${s.hue}40, transparent)`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

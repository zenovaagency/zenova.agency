import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ServiceVisual } from './ServiceVisual';
import { Icon } from '@/components/icons/Icon';
import { useServices } from '@/admin/store';
import type { ServiceDetail } from '@/data/services';

const MotionLink = motion(Link);

type CardSpec = {
  size: string;
  aspectRatio: string;
  gridColumn: string;
};

interface PlacedService extends ServiceDetail {
  size: string;
  aspectRatio: string;
  gridColumn: string;
}

function getLayout(services: ServiceDetail[]): PlacedService[] {
  const specs: CardSpec[] = [
    { size: 'a', aspectRatio: '4.5 / 3', gridColumn: '1 / span 9' },
    { size: 'b', aspectRatio: '2.5 / 3', gridColumn: '10 / span 5' },
    { size: 'c', aspectRatio: '5 / 3', gridColumn: '1 / span 14' },
    { size: 'd', aspectRatio: '2.5 / 3', gridColumn: '1 / span 7' },
    { size: 'e', aspectRatio: '2.5 / 3', gridColumn: '8 / span 7' },
  ];

  return services.map((s, i) => {
    const spec = specs[i % specs.length];
    return { ...s, ...spec };
  });
}

function ServiceVisualFull({ s, active }: { s: ServiceDetail; active: boolean }) {
  return (
    <div
      className={`svc-bento-visual ${s.image ? 'svc-bento-visual--image' : ''}`}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        background: `linear-gradient(160deg, ${s.hue}14, ${s.hue}04)`,
        overflow: 'hidden',
      }}
    >
      {s.image ? (
        <img
          src={s.image}
          alt=""
          loading="lazy"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
          }}
        />
      ) : (
        <ServiceVisual kind={s.visual} hue={s.hue} active={active} />
      )}
    </div>
  );
}

function CardOverlay({ s }: { s: ServiceDetail }) {
  return (
    <div
      className="svc-bento-overlay"
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        background: `
          linear-gradient(
            to top,
            var(--card) 0%,
            color-mix(in srgb, var(--bg) 92%, transparent) 28%,
            color-mix(in srgb, var(--bg) 55%, transparent) 55%,
            transparent 78%
          ),
          linear-gradient(
            to top,
            ${s.hue}18 0%,
            transparent 50%
          )
        `,
        zIndex: 1,
      }}
    />
  );
}

function BentoCard({ s }: { s: PlacedService }) {
  const [hovered, setHovered] = useState(false);
  const isWide = s.size === 'a' || s.size === 'c';
  return (
    <MotionLink
      to={`/services/${s.slug}`}
      className={`svc-bento-card svc-bento-card--${s.size}`}
      data-size={s.size}
      style={{ aspectRatio: s.aspectRatio, textDecoration: 'none', color: 'inherit' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <ServiceVisualFull s={s} active={hovered} />
      <CardOverlay s={s} />
      <div className="svc-bento-card__cta-center">
        <span className="mono svc-bento-card__cta-btn">
          View details <Icon.Arrow size={12} />
        </span>
      </div>
      <div className="svc-bento-card__content">
        <h3
          className="display"
          style={{
            fontSize: isWide ? 'clamp(22px, 3vw, 36px)' : 'clamp(18px, 2.4vw, 28px)',
            fontWeight: 500,
            margin: '0 0 8px',
            lineHeight: 1.05,
          }}
        >
          {s.title}
        </h3>
        <p
          style={{
            fontSize: isWide ? 'clamp(13px, 1.5vw, 15px)' : 'clamp(12px, 1.3vw, 13px)',
            lineHeight: 1.55,
            color: 'var(--fg-dim)',
            margin: 0,
            maxWidth: isWide ? 560 : undefined,
          }}
        >
          {s.short}
        </p>
      </div>
    </MotionLink>
  );
}

export function Services() {
  const [SERVICES] = useServices();
  const placed = getLayout(SERVICES);

  return (
    <section id="services" className="sec" style={{ position: 'relative', padding: '120px 0 140px' }}>
      <div className="svc-header-inner" style={{ maxWidth: 1280, margin: '0 auto', padding: '0 40px' }}>
        {/* Section heading */}
        <div style={{ marginBottom: 60 }}>
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

        {/* Bento grid */}
        <div className="svc-bento-grid">
          {placed.map((s) => (
            <div key={s.slug} className={`svc-bento-item svc-bento-item--${s.size}`} style={{ gridColumn: s.gridColumn }}>
              <BentoCard s={s} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

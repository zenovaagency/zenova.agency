import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ServiceVisual } from './ServiceVisual';
import { ServiceMedia } from './ServiceMedia';
import { Icon } from '@/components/icons/Icon';
import { useServices } from '@/admin/store';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import type { ServiceDetail } from '@/data/services';

/** Full-bleed visual: uploaded media (image/GIF/video) or the animated placeholder. */
function ServiceVisualFull({ s, active }: { s: ServiceDetail; active: boolean }) {
  return (
    <div
      className={`svc-panel__visual ${s.image ? 'svc-panel__visual--image' : ''}`}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        background: `linear-gradient(160deg, ${s.hue}14, ${s.hue}04)`,
        overflow: 'hidden',
      }}
    >
      {s.image || s.video ? (
        <ServiceMedia image={s.image} video={s.video} alt="" loading="lazy" objectFit="cover" />
      ) : (
        <ServiceVisual kind={s.visual} hue={s.hue} active={active} />
      )}
    </div>
  );
}

/** Bottom-up scrim built from theme tokens (+ hue tint) so text stays legible over any media. */
function CardOverlay({ s }: { s: ServiceDetail }) {
  return (
    <div
      className="svc-panel__scrim"
      aria-hidden="true"
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

function ServicePanel({
  s,
  index,
  total,
  active,
  onActivate,
}: {
  s: ServiceDetail;
  index: number;
  total: number;
  active: boolean;
  onActivate: () => void;
}) {
  const num = String(index + 1).padStart(2, '0');
  return (
    <Link
      to={`/services/${s.slug}`}
      className="svc-panel"
      data-active={active}
      style={{ '--hue': s.hue } as React.CSSProperties}
      onMouseEnter={onActivate}
      onFocus={onActivate}
    >
      <ServiceVisualFull s={s} active={active} />
      <CardOverlay s={s} />
      <span className="svc-panel__bar" aria-hidden="true" />

      {/* Collapsed spine — shown when the panel is not the active one (panels mode). */}
      <div className="svc-panel__spine" aria-hidden="true">
        <span className="mono svc-panel__spine-num">{num}</span>
        <span className="display svc-panel__spine-title">{s.title}</span>
      </div>

      {/* Expanded content — revealed when active. */}
      <div className="svc-panel__body">
        <span className="mono svc-panel__num" aria-hidden="true">
          {num} <span className="svc-panel__num-total">/ {String(total).padStart(2, '0')}</span>
        </span>
        <h3 className="display svc-panel__title">{s.title}</h3>
        <p className="svc-panel__short">{s.short}</p>
        <span className="mono svc-panel__cta">
          View details <Icon.Arrow size={12} />
        </span>
      </div>
    </Link>
  );
}

export function Services() {
  const [SERVICES] = useServices();
  // Expanding panels need a real hover pointer and room; otherwise fall back to a
  // stacked card list where every panel is fully visible and tap-navigable.
  const canExpand = useMediaQuery('(hover: hover) and (pointer: fine) and (min-width: 901px)');
  const [active, setActive] = useState(0);
  const total = SERVICES.length;

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

        {/* Expanding panels */}
        <div className="svc-panels" data-mode={canExpand ? 'panels' : 'stack'}>
          {SERVICES.map((s, i) => (
            <ServicePanel
              key={s.slug}
              s={s}
              index={i}
              total={total}
              active={canExpand ? i === active : true}
              onActivate={() => setActive(i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

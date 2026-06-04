import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '@/components/icons/Icon';

interface Crumb {
  label: string;
  to?: string;
}

interface SecondaryAction {
  label: string;
  to: string;
}

interface PageHeroProps {
  eyebrow: string;
  title: ReactNode;
  sub?: ReactNode;
  crumbs?: Crumb[];
  meta?: Array<[string, string]>;
  secondary?: SecondaryAction;
}

export function PageHero({ eyebrow, title, sub, crumbs, meta, secondary }: PageHeroProps) {
  return (
    <section
      className="page-hero"
      style={{
        position: 'relative',
        padding: '160px 24px 80px',
        overflow: 'hidden',
        borderBottom: '1px solid var(--line)',
      }}
    >
      {/* <div style={{ position: 'absolute', inset: 0, zIndex: -1, overflow: 'hidden' }}>
        <div
          style={{
            position: 'absolute',
            top: '-10%',
            left: '12%',
            width: 520,
            height: 520,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(58,91,255,0.32), transparent 60%)',
            filter: 'blur(80px)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-20%',
            right: '8%',
            width: 480,
            height: 480,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(168,85,247,0.28), transparent 60%)',
            filter: 'blur(80px)',
          }}
        />
      </div> */}

      <div className="container">
        {crumbs && crumbs.length > 0 && (
          <nav
            className="mono"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              color: 'var(--fg-faint)',
              marginBottom: 22,
              fontSize: 12,
            }}
          >
            {crumbs.map((c, i) => (
              <span key={`${c.label}-${i}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                {c.to ? (
                  <Link to={c.to} style={{ color: 'var(--fg-faint)' }}>
                    {c.label}
                  </Link>
                ) : (
                  <span style={{ color: 'var(--fg-dim)' }}>{c.label}</span>
                )}
                {i < crumbs.length - 1 && <span style={{ opacity: 0.5 }}>/</span>}
              </span>
            ))}
          </nav>
        )}

        <div
          className="mono"
          style={{
            color: 'var(--fg-faint)',
            marginBottom: 18,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <span style={{ width: 24, height: 1, background: 'var(--accent-2)' }} />
          {eyebrow}
        </div>

        <h1
          className="display"
          style={{
            fontSize: 'clamp(44px, 7vw, 96px)',
            margin: 0,
            fontWeight: 500,
            lineHeight: 1.02,
            letterSpacing: '-0.02em',
            maxWidth: 1100,
          }}
        >
          {title}
        </h1>

        {sub && (
          <p
            style={{
              marginTop: 28,
              fontSize: 'clamp(16px, 1.4vw, 20px)',
              lineHeight: 1.55,
              color: 'var(--fg-dim)',
              maxWidth: 680,
            }}
          >
            {sub}
          </p>
        )}

        {meta && meta.length > 0 && (
          <div
            className="page-hero__meta"
            style={{
              marginTop: 56,
              display: 'grid',
              gridTemplateColumns: `repeat(auto-fit, minmax(160px, 1fr))`,
              gap: 24,
              maxWidth: 880,
              padding: '24px 0',
              borderTop: '1px solid var(--line)',
              borderBottom: '1px solid var(--line)',
            }}
          >
            {meta.map(([num, label]) => (
              <div key={label}>
                <div className="display" style={{ fontSize: 'clamp(22px,2.4vw,30px)', fontWeight: 500 }}>
                  {num}
                </div>
                <div className="mono" style={{ color: 'var(--fg-faint)', marginTop: 6 }}>
                  {label}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="page-hero__ctas" style={{ marginTop: meta && meta.length > 0 ? 40 : 56, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Link to="/#contact" className="btn-primary" style={{ textDecoration: 'none' }}>
            Get in touch <Icon.Arrow size={16} />
          </Link>
          {secondary && (
            <Link to={secondary.to} className="btn-ghost" style={{ textDecoration: 'none' }}>
              {secondary.label}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

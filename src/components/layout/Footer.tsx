import { Link } from 'react-router-dom';
import { Logo } from './Logo';
import { Icon } from '@/components/icons/Icon';
import { ParticleWordmark } from '@/components/ui/ParticleWordmark';
import { DEFAULT_CONTENT, useBrand, useContent, useServices } from '@/admin/store';

const PLATFORM_ICON: Record<string, keyof typeof Icon> = {
  twitter: 'TwitterX',
  linkedin: 'LinkedIn',
  github: 'GitHub',
  dribbble: 'Dribbble',
  youtube: 'YouTube',
  instagram: 'Instagram',
  facebook: 'Facebook',
};

export function Footer() {
  const [content] = useContent();
  const [brand] = useBrand();
  const [services] = useServices();
  const footer = content.footer ?? DEFAULT_CONTENT.footer!;
  const socials = brand.socials ?? [];

  const serviceLinks = services.map((s) => ({
    id: `fl-svc-${s.slug}`,
    label: s.title,
    href: `/services/${s.slug}`,
  }));

  return (
    <footer
      style={{
        borderTop: '1px solid var(--line)',
        padding: '72px 0 32px',
        position: 'relative',
        background: 'var(--bg)',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: -120,
          left: 0,
          right: 0,
          height: 120,
          background: 'linear-gradient(to bottom, transparent, var(--bg))',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />
      <div className="container" style={{ position: 'relative', zIndex: 2 }}>
        <div className="footer-grid" style={{ display: 'grid', gridTemplateColumns: `minmax(200px, 1fr) repeat(${footer.columns.length}, auto)`, gap: 140, justifyContent: 'end' }}>
          <div>
            <Logo size={25} />
            <p style={{ color: 'var(--fg-dim)', fontSize: 14, lineHeight: 1.55, marginTop: 22, maxWidth: 320 }}>
              {footer.tagline}
            </p>
            <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
              {socials.map((s) => (
                <a
                  key={s.platform}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    border: '1px solid var(--line)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--fg-dim)',
                    textDecoration: 'none',
                    transition: 'color .2s, border-color .2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'var(--fg)';
                    e.currentTarget.style.borderColor = 'var(--fg)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'var(--fg-dim)';
                    e.currentTarget.style.borderColor = 'var(--line)';
                  }}
                >
                  {Icon[PLATFORM_ICON[s.platform]]?.({ size: 16 }) ?? (
                    <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)' }}>
                      {s.platform.slice(0, 2).toUpperCase()}
                    </span>
                  )}
                </a>
              ))}
            </div>
          </div>
          {footer.columns.map((c) => (
            <div key={c.id}>
              <div className="mono" style={{ color: 'var(--fg-faint)', marginBottom: 18 }}>
                {c.title}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {(c.title === 'Services' ? serviceLinks : c.links).map((l) => (
                  <Link
                    key={l.id}
                    to={l.href}
                    style={{ fontSize: 14, color: 'var(--fg-dim)' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--fg)')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--fg-dim)')}
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div
          className="footer-bottom"
          style={{
            marginTop: 64,
            paddingTop: 24,
            borderTop: '1px solid var(--line)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div className="mono" style={{ color: 'var(--fg-faint)' }}>
            {footer.copyright}
          </div>
          <div className="mono" style={{ color: 'var(--fg-faint)' }}>
            {footer.strapline}
          </div>
        </div>
      </div>

      <ParticleWordmark />
    </footer>
  );
}

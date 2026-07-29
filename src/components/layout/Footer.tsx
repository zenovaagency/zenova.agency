import { Link } from 'react-router-dom';
import { LogoBadge } from './Logo';
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

  // Footer content is CMS-managed; guarantee the Blog link even when the
  // stored content predates the blog feature.
  const columnLinks = (c: (typeof footer.columns)[number]) => {
    if (c.title === 'Services') return serviceLinks;
    if (c.title === 'Company' && !c.links.some((l) => l.href === '/blog')) {
      return [...c.links, { id: 'fl-blog', label: 'Blog', href: '/blog' }];
    }
    return c.links;
  };

  return (
    <footer className="site-footer">
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
        <div className="footer-grid">
          <div>
            <LogoBadge size={52} word />
            <p style={{ color: 'var(--fg-dim)', fontSize: 14, lineHeight: 1.55, marginTop: 22, maxWidth: 320 }}>
              {footer.tagline}
            </p>
            <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
              {socials.map((s) => {
                const labelMap: Record<string, string> = {
                  twitter: `Follow Zenova on X (Twitter)`,
                  x: `Follow Zenova on X (Twitter)`,
                  linkedin: `Visit Zenova on LinkedIn`,
                  github: `Visit Zenova on GitHub`,
                  dribbble: `View Zenova on Dribbble`,
                  youtube: `Visit Zenova on YouTube`,
                  instagram: `Follow Zenova on Instagram`,
                  facebook: `Visit Zenova on Facebook`,
                };
                return (
                <a
                  key={s.platform}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={labelMap[s.platform] ?? `Visit Zenova on ${s.platform}`}
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
                );
              })}
            </div>
          </div>
          {footer.columns.map((c) => (
            <div key={c.id}>
              {/*
                <h2> + <nav> rather than two <div>s: each footer column is a
                named group of site links, which is exactly what a labelled
                navigation landmark is for. `margin` and `fontWeight` are
                pinned so the heading renders identically to the div it
                replaced — the visual weight comes from .mono.
              */}
              <h2
                className="mono"
                id={`footer-col-${c.id}`}
                style={{
                  color: 'var(--fg-faint)',
                  margin: '0 0 18px',
                  fontWeight: 'inherit',
                }}
              >
                {c.title}
              </h2>
              <nav
                aria-labelledby={`footer-col-${c.id}`}
                style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
              >
                {columnLinks(c).map((l) => (
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
              </nav>
            </div>
          ))}
        </div>

        <div className="footer-bottom">
          <div style={{ color: 'var(--fg-faint)' }}>
            {footer.copyright}
          </div>
          <div style={{ color: 'var(--fg-faint)' }}>
            {footer.strapline}
          </div>
        </div>
      </div>

      <ParticleWordmark />
    </footer>
  );
}

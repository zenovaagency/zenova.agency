import { Link } from 'react-router-dom';
import { Logo } from './Logo';
import { Icon } from '@/components/icons/Icon';
import { DEFAULT_CONTENT, useBrand, useContent } from '@/admin/store';

export function Footer() {
  const [content] = useContent();
  const [brand] = useBrand();
  const footer = content.footer ?? DEFAULT_CONTENT.footer!;
  const socials = brand.socials ?? [];

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
        <div className="footer-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 1fr) repeat(3, auto)', gap: 140, justifyContent: 'end' }}>
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
                  {Icon[s.platform as keyof typeof Icon]?.({ size: 16 }) ?? (
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
                {c.links.map((l) => (
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

      <div
        style={{
          marginTop: 80,
          position: 'relative',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '0 16px',
          overflow: 'hidden',
        }}
      >
        <div
          className="display"
          style={{
            fontSize: 'clamp(80px, 22vw, 320px)',
            lineHeight: 0.9,
            fontWeight: 700,
            letterSpacing: '-0.05em',
            color: 'var(--fg)',
            maskImage: 'linear-gradient(180deg, rgba(0,0,0,0.65) 10%, transparent 95%)',
            WebkitMaskImage: 'linear-gradient(180deg, rgba(0,0,0,0.65) 10%, transparent 95%)',
          }}
        >
          ZENOVA
        </div>
      </div>
    </footer>
  );
}

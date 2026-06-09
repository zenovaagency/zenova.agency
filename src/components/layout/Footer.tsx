import { Link } from 'react-router-dom';
import { Logo } from './Logo';

interface FooterLink {
  label: string;
  to: { pathname: string; hash?: string };
}

interface FooterCol {
  title: string;
  links: FooterLink[];
}

const COLS: FooterCol[] = [
  {
    title: 'Services',
    links: [
      { label: 'Web Development', to: { pathname: '/services/web' } },
      { label: 'Marketing', to: { pathname: '/services/marketing' } },
      { label: 'Startup Support', to: { pathname: '/services/startup' } },
      { label: 'Operations', to: { pathname: '/services/ops' } },
      { label: 'Content', to: { pathname: '/services/content' } },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', to: { pathname: '/about' } },
      { label: 'Work', to: { pathname: '/work' } },
      { label: 'Process', to: { pathname: '/process' } },
      { label: 'Contact', to: { pathname: '/contact' } },
    ],
  },
];

const SOCIAL = ['Tw', 'Ln', 'Gh', 'Dr'];

export function Footer() {
  return (
    <footer style={{ borderTop: '1px solid var(--line)', padding: '72px 0 32px', position: 'relative' }}>
      <div className="container">
        <div className="footer-grid" style={{ display: 'grid', gridTemplateColumns: '1.4fr repeat(2, 1fr)', gap: 48 }}>
          <div>
            <Logo size={25} />
            <p style={{ color: 'var(--fg-dim)', fontSize: 14, lineHeight: 1.55, marginTop: 22, maxWidth: 320 }}>
              A small team that designs, builds, and grows modern businesses.
            </p>
            <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
              {SOCIAL.map((s) => (
                <a
                  key={s}
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    border: '1px solid var(--line)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 11,
                    color: 'var(--fg-dim)',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  {s}
                </a>
              ))}
            </div>
          </div>
          {COLS.map((c) => (
            <div key={c.title}>
              <div className="mono" style={{ color: 'var(--fg-faint)', marginBottom: 18 }}>
                {c.title}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {c.links.map((l) => (
                  <Link
                    key={l.label}
                    to={l.to}
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
            © 2026 Zenova Solutions, Inc. All rights reserved.
          </div>
          <div className="mono" style={{ color: 'var(--fg-faint)' }}>
            Design, build, and grow
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

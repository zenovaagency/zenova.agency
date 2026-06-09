import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Logo } from './Logo';
import { Icon } from '@/components/icons/Icon';
import type { Theme } from '@/types/tweaks';

const NAV_LINKS = [
  { label: 'Services', to: '/services' },
  { label: 'Process', to: '/process' },
  { label: 'Work', to: '/work' },
  { label: 'About', to: '/about' },
];

const THEME_CYCLE: Theme[] = ['dark', 'light'];
const THEME_LABELS: Record<Theme, string> = {
  dark: 'Dark',
  light: 'Light',
};

function getStoredTheme(): Theme {
  try {
    const stored = localStorage.getItem('zenova-theme');
    if (stored === 'dark' || stored === 'light') return stored;
  } catch { /* noop */ }
  return 'dark';
}

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute('data-theme', theme);
  try { localStorage.setItem('zenova-theme', theme); } catch { /* noop */ }
}

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>(getStoredTheme);
  const location = useLocation();

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 860) setMenuOpen(false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const cycleTheme = () => {
    setTheme((prev) => {
      const idx = THEME_CYCLE.indexOf(prev);
      return THEME_CYCLE[(idx + 1) % THEME_CYCLE.length];
    });
  };

  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        display: 'flex',
        justifyContent: 'center',
        padding: scrolled ? '12px 16px' : '20px 16px',
        transition: 'padding .3s ease',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: scrolled ? 920 : 1200,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 60,
          padding: '0 10px 0 18px',
          borderRadius: 999,
          background: scrolled ? 'var(--nav-bg-strong)' : 'var(--nav-bg)',
          backdropFilter: 'blur(20px) saturate(140%)',
          WebkitBackdropFilter: 'blur(20px) saturate(140%)',
          border: '1px solid var(--line)',
          boxShadow: scrolled ? '0 12px 40px var(--nav-shadow)' : '0 0 0 transparent',
          transition: 'all .35s cubic-bezier(.2,.7,.2,1)',
        }}
      >
        <Link to="/" style={{ display: 'inline-flex' }} onClick={() => setMenuOpen(false)}>
          <Logo size={25} />
        </Link>
        <div className="nav-links" style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          {NAV_LINKS.map((l) => {
            const active = location.pathname === l.to;
            return (
              <Link
                key={l.label}
                to={l.to}
                className="nav-link"
                style={{
                  padding: '8px 14px',
                  borderRadius: 999,
                  fontSize: 14,
                  fontWeight: 500,
                  color: active ? 'var(--fg)' : 'var(--fg-dim)',
                  background: active ? 'var(--card-hover)' : 'transparent',
                  transition: 'color .2s, background .2s',
                }}
              >
                {l.label}
              </Link>
            );
          })}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {/* Theme toggle */}
          <button
            onClick={cycleTheme}
            aria-label={`Theme: ${THEME_LABELS[theme]}`}
            title={`Theme: ${THEME_LABELS[theme]}`}
            style={{
              width: 36,
              height: 36,
              borderRadius: 999,
              border: '1px solid var(--line)',
              background: 'transparent',
              color: 'var(--fg-dim)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: 14,
              transition: 'color 0.2s, background 0.2s',
              padding: 0,
              marginRight: 2,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--accent-1)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--fg-dim)'; }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {theme === 'dark' ? (
                <><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></>
              ) : (
                <><circle cx="12" cy="12" r="5" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /></>
              )}
            </svg>
          </button>

          <div className="nav-desktop-only" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <Link
              to="/contact"
              className="nav-cta"
            >
              <svg className="nav-cta__sparkle" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
              </svg>
              <span className="nav-cta__text">
                <span className="nav-cta__letter">G</span>
                <span className="nav-cta__letter">e</span>
                <span className="nav-cta__letter">t</span>
                <span className="nav-cta__letter">&nbsp;</span>
                <span className="nav-cta__letter">i</span>
                <span className="nav-cta__letter">n</span>
                <span className="nav-cta__letter">&nbsp;</span>
                <span className="nav-cta__letter">t</span>
                <span className="nav-cta__letter">o</span>
                <span className="nav-cta__letter">u</span>
                <span className="nav-cta__letter">c</span>
                <span className="nav-cta__letter">h</span>
              </span>
            </Link>
          </div>

          <button
            className="nav-hamburger"
            aria-label="Open menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
            style={{
              width: 42,
              height: 42,
              borderRadius: 999,
              border: '1px solid var(--line)',
              background: menuOpen ? 'var(--card-hover)' : 'transparent',
              color: 'var(--fg)',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all .25s',
              padding: 0,
            }}
          >
            <span className="hamburger-bars" data-open={menuOpen ? '1' : '0'}>
              <span />
              <span />
              <span />
            </span>
          </button>
        </div>
      </div>

      <div className={`mobile-menu ${menuOpen ? 'is-open' : ''}`}>
        <div className="mobile-menu__inner">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {NAV_LINKS.map((l) => (
              <Link
                key={l.label}
                to={l.to}
                onClick={() => setMenuOpen(false)}
                className="mobile-menu__link"
              >
                {l.label}
                <Icon.Arrow size={16} />
              </Link>
            ))}
          </div>
          <div
            style={{
              marginTop: 14,
              paddingTop: 14,
              borderTop: '1px solid var(--line)',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <Link
              to="/contact"
              onClick={() => setMenuOpen(false)}
              style={{
                flex: 1,
                height: 46,
                borderRadius: 14,
                background: 'rgba(255,255,255,0.04)',
                color: 'var(--fg)',
                fontWeight: 600,
                fontSize: 14,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                textDecoration: 'none',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              Get in touch
            </Link>
          </div>
        </div>
      </div>

      <div
        className={`mobile-backdrop ${menuOpen ? 'is-open' : ''}`}
        onClick={() => setMenuOpen(false)}
        aria-hidden="true"
      />
    </nav>
  );
}

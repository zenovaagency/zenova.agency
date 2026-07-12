import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Icon } from '@/components/icons/Icon';
import { currentUser, logout } from '@/admin/store';

import { LogoMark } from "@/components/layout/Logo";
import type { Theme } from '@/types/tweaks';
import { applyTheme, getInitialTheme, subscribeTheme, toggleTheme } from '@/lib/theme';

const COLLAPSE_KEY = 'zenova.admin.sidebar.collapsed';

function readStoredCollapsed(): boolean {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem(COLLAPSE_KEY) === '1';
}

function writeStoredCollapsed(v: boolean) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(COLLAPSE_KEY, v ? '1' : '0');
}

function initialsOf(name: string | undefined, email: string | undefined): string {
  const source = name?.trim() || email?.trim() || '';
  if (!source) return '?';
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return source.slice(0, 2).toUpperCase();
}

interface NavItem {
  to: string;
  label: string;
  icon: ReactNode;
  end?: boolean;
}

const NAV: NavItem[] = [
  {
    to: '/admin',
    end: true,
    label: 'Overview',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="9" rx="1.5" />
        <rect x="14" y="3" width="7" height="5" rx="1.5" />
        <rect x="14" y="12" width="7" height="9" rx="1.5" />
        <rect x="3" y="16" width="7" height="5" rx="1.5" />
      </svg>
    ),
  },
  {
    to: '/admin/services',
    label: 'Services',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="m8 6-6 6 6 6" />
        <path d="m16 6 6 6-6 6" />
        <path d="m14 4-4 16" />
      </svg>
    ),
  },
  {
    to: '/admin/projects',
    label: 'Projects',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="M3 9h18" />
      </svg>
    ),
  },
  {
    to: '/admin/jobs',
    label: 'Careers',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" />
        <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        <path d="M2 13h20" />
      </svg>
    ),
  },
  {
    to: '/admin/team',
    label: 'Team',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="9" r="3" />
        <path d="M2 20c1.5-3 4-5 7-5s5.5 2 7 5" />
        <circle cx="17" cy="8" r="2.5" />
        <path d="M22 18c-.7-1.5-2.1-2.5-3.8-2.5" />
      </svg>
    ),
  },
  {
    to: '/admin/content',
    label: 'Site content',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16v16H4z" />
        <path d="M4 9h16" />
        <path d="M9 9v11" />
      </svg>
    ),
  },
  {
    to: '/admin/pricing',
    label: 'Pricing',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 13.3 13.3 20a1.6 1.6 0 0 1-2.3 0l-7-7V4h9l7 7a1.6 1.6 0 0 1 0 2.3z" />
        <circle cx="8" cy="8" r="1.2" />
      </svg>
    ),
  },
  {
    to: '/admin/legal',
    label: 'Legal pages',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
        <path d="M14 3v5h5" />
        <path d="M9 13h6" />
        <path d="M9 17h4" />
      </svg>
    ),
  },
  {
    to: '/admin/media',
    label: 'Media',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <circle cx="9" cy="10" r="2" />
        <path d="m21 16-5-5-7 7" />
      </svg>
    ),
  },
  {
    to: '/admin/invoices',
    label: 'Invoices',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
  },
  {
    to: '/admin/inbox',
    label: 'Inbox',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 7 9 6 9-6" />
      </svg>
    ),
  },
  {
    to: '/admin/users',
    label: 'Users',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="10" cy="8" r="3.25" />
        <path d="M3 20c1.4-3.2 4-5 7-5 1.2 0 2.35.27 3.4.8" />
        <path d="M18 14v6" />
        <path d="M15 17h6" />
      </svg>
    ),
  },
  {
    to: '/admin/settings',
    label: 'Settings',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h0a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v0a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
];

export interface AdminCrumb {
  label: string;
  to?: string;
}

export function AdminShell({
  crumbs,
  title,
  sub,
  actions,
  children,
}: {
  crumbs?: AdminCrumb[];
  title: ReactNode;
  sub?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const location = useLocation();
  const [collapsed, setCollapsedRaw] = useState<boolean>(readStoredCollapsed);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const user = currentUser();

  const setCollapsed = (v: boolean) => {
    setCollapsedRaw(v);
    writeStoredCollapsed(v);
  };

  const handleToggleTheme = () => {
    const next = toggleTheme(theme);
    applyTheme(next);
    setTheme(next);
  };

  // Re-sync theme state if another tab (or the public site) flips it.
  useEffect(() => subscribeTheme(setTheme), []);

  // Close user menu on outside click + Esc.
  useEffect(() => {
    if (!userMenuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [userMenuOpen]);

  // Close the mobile drawer when navigating between pages. Adjusted during
  // render (not in an effect) so the drawer never paints open on the new page.
  const [drawerPath, setDrawerPath] = useState(location.pathname);
  if (drawerPath !== location.pathname) {
    setDrawerPath(location.pathname);
    setMobileOpen(false);
  }

  // Esc closes the drawer; lock background scroll while it's open.
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
  }, [mobileOpen]);

  const rootClass = [
    'admin-root',
    collapsed ? 'is-collapsed' : '',
    mobileOpen ? 'is-mobile-open' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <div className={rootClass}>
      <div className="admin-shell">
        <button
          type="button"
          className="admin-backdrop"
          aria-label="Close navigation"
          tabIndex={mobileOpen ? 0 : -1}
          onClick={() => setMobileOpen(false)}
        />

        <aside className="admin-sidebar" aria-label="Admin navigation">
          <div className="admin-sidebar__brand">
            <LogoMark size={25} />
            <div className="admin-sidebar__brand-text">
              <div className="admin-sidebar__brand-name">Zenova</div>
              <div className="admin-sidebar__brand-tag">Admin</div>
            </div>
            <button
              type="button"
              className="admin-sidebar__collapse"
              onClick={() => setCollapsed(!collapsed)}
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              aria-pressed={collapsed}
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                {collapsed ? (
                  <polyline points="9 18 15 12 9 6" />
                ) : (
                  <polyline points="15 18 9 12 15 6" />
                )}
              </svg>
            </button>
          </div>

          <nav className="admin-sidebar__nav" aria-label="Primary">
            <div className="admin-sidebar__section">Manage</div>
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                title={item.label}
                className={({ isActive }) =>
                  `admin-nav-link${isActive ? ' is-active' : ''}`
                }
              >
                <span className="admin-nav-link__icon">{item.icon}</span>
                <span className="admin-nav-link__label">{item.label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="admin-sidebar__footer">
            <Link
              to="/"
              className="admin-nav-link"
              target="_blank"
              rel="noreferrer"
              title="View site"
            >
              <span className="admin-nav-link__icon">
                <Icon.ArrowUpRight size={18} />
              </span>
              <span className="admin-nav-link__label">View site</span>
            </Link>
          </div>
        </aside>

        <main className="admin-main">
          <div className="admin-topbar">
            <div className="admin-topbar__left">
              <button
                type="button"
                className="admin-topbar__menu"
                aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'}
                aria-expanded={mobileOpen}
                onClick={() => setMobileOpen((o) => !o)}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  {mobileOpen ? (
                    <>
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </>
                  ) : (
                    <>
                      <line x1="3" y1="6" x2="21" y2="6" />
                      <line x1="3" y1="12" x2="21" y2="12" />
                      <line x1="3" y1="18" x2="21" y2="18" />
                    </>
                  )}
                </svg>
              </button>
              <div className="admin-topbar__crumbs">
                <Link to="/admin">Admin</Link>
                {crumbs?.map((c, i) => (
                  <span key={i} className="admin-topbar__crumb">
                    <span className="admin-topbar__crumb-sep">/</span>
                    {c.to ? (
                      <Link to={c.to}>{c.label}</Link>
                    ) : (
                      <span className="admin-topbar__crumb-current">{c.label}</span>
                    )}
                  </span>
                ))}
              </div>
            </div>
            <div className="admin-topbar__actions">
              <button
                type="button"
                className="admin-topbar__icon-btn"
                onClick={handleToggleTheme}
                aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
                title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
              >
                {theme === 'dark' ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <circle cx="12" cy="12" r="4" />
                    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                  </svg>
                )}
              </button>

              <div className="admin-user-menu" ref={userMenuRef}>
                <button
                  type="button"
                  className="admin-user-menu__trigger"
                  onClick={() => setUserMenuOpen((o) => !o)}
                  aria-haspopup="menu"
                  aria-expanded={userMenuOpen}
                  aria-label="Account menu"
                >
                  <span className="admin-user-menu__avatar" aria-hidden>
                    {initialsOf(user?.name, user?.email)}
                  </span>
                  <span className="admin-user-menu__meta">
                    <span className="admin-user-menu__name">
                      {user?.name ?? 'Admin'}
                    </span>
                    <span className="admin-user-menu__email">
                      {user?.email ?? 'signed in'}
                    </span>
                  </span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="admin-user-menu__caret">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
                {userMenuOpen && (
                  <div className="admin-user-menu__panel" role="menu">
                    <div className="admin-user-menu__head">
                      <div className="admin-user-menu__avatar admin-user-menu__avatar--lg" aria-hidden>
                        {initialsOf(user?.name, user?.email)}
                      </div>
                      <div className="admin-user-menu__head-text">
                        <div className="admin-user-menu__name">{user?.name ?? 'Admin'}</div>
                        <div className="admin-user-menu__email">{user?.email ?? ''}</div>
                      </div>
                    </div>
                    <div className="admin-user-menu__divider" />
                    <Link
                      to="/"
                      className="admin-user-menu__item"
                      role="menuitem"
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        <path d="M7 17 17 7" />
                        <path d="M7 7h10v10" />
                      </svg>
                      View public site
                    </Link>
                    <Link
                      to="/admin/settings"
                      className="admin-user-menu__item"
                      role="menuitem"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        <circle cx="12" cy="12" r="3" />
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h0a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v0a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                      </svg>
                      Settings
                    </Link>
                    <div className="admin-user-menu__divider" />
                    <button
                      type="button"
                      className="admin-user-menu__item admin-user-menu__item--danger"
                      role="menuitem"
                      onClick={() => {
                        setUserMenuOpen(false);
                        handleLogout();
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                      </svg>
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="admin-page">
            <header className="admin-page__header">
              <div>
                <h1 className="admin-page__title">{title}</h1>
                {sub && <p className="admin-page__sub">{sub}</p>}
              </div>
              {actions && <div className="admin-page__actions">{actions}</div>}
            </header>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

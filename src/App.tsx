import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { Nav } from '@/components/layout/Nav';
import { Footer } from '@/components/layout/Footer';
import { Home } from '@/pages/Home';
import { ServicesPage } from '@/pages/ServicesPage';
import { ServiceDetailPage } from '@/pages/ServiceDetailPage';
import { ProcessPage } from '@/pages/ProcessPage';
import { WorkPage } from '@/pages/WorkPage';
import { ProjectDetailPage } from '@/pages/ProjectDetailPage';
import { AboutPage } from '@/pages/AboutPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { SignIn } from '@/pages/SignIn';
import { Background } from '@/components/ui/Background';
import { AdminLogin, AuthGate } from '@/admin/pages/Login';
import { Overview } from '@/admin/pages/Overview';
import { ClientLogin, ClientAuthGate } from '@/client/pages/Login';
import { ClientOverview } from '@/client/pages/Overview';
import { TeamLogin, TeamAuthGate } from '@/team/pages/Login';
import { TeamOverview } from '@/team/pages/Overview';
import { ServicesAdmin } from '@/admin/pages/ServicesAdmin';
import { ServiceEditor } from '@/admin/pages/ServiceEditor';
import { ProjectsAdmin } from '@/admin/pages/ProjectsAdmin';
import { ProjectEditor } from '@/admin/pages/ProjectEditor';
import { TeamAdmin } from '@/admin/pages/TeamAdmin';
import { ContentAdmin } from '@/admin/pages/ContentAdmin';
import { MediaAdmin } from '@/admin/pages/MediaAdmin';
import { Settings as AdminSettings } from '@/admin/pages/Settings';
import { InputsShowcase } from '@/admin/pages/InputsShowcase';
import { InvoiceList } from '@/admin/pages/InvoiceList';
import { InvoiceEditor } from '@/admin/pages/InvoiceEditor';
import { TWEAK_DEFAULTS } from '@/config/tweaks';
import { useSmoothScroll } from '@/hooks/useSmoothScroll';
import { useTweaks } from '@/hooks/useTweaks';
import { applyPalette } from '@/lib/palette';
import { hydrateSite } from '@/admin/store';
import type { Theme } from '@/types/tweaks';

const THEME_STORAGE_KEY = 'zenova.theme';

function readStoredTheme(fallback: Theme): Theme {
  if (typeof window === 'undefined') return fallback;
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {
    /* private mode etc. */
  }
  return fallback;
}

// Tweaks panel ships only in dev builds — lazy import is tree-shaken in prod.
const ZenovaTweaks = import.meta.env.DEV
  ? lazy(() => import('@/dev/ZenovaTweaks').then((m) => ({ default: m.ZenovaTweaks })))
  : null;

export function App() {
  const [t, setTweak] = useTweaks({
    ...TWEAK_DEFAULTS,
    theme: readStoredTheme(TWEAK_DEFAULTS.theme),
  });

  useEffect(() => {
    void hydrateSite();
  }, []);

  useEffect(() => {
    applyPalette(t.palette);
  }, [t.palette]);

  useEffect(() => {
    const root = document.documentElement;
    const next = t.theme ?? 'dark';
    if (root.getAttribute('data-theme') === next) return;
    const apply = () => {
      root.setAttribute('data-theme', next);
      try {
        localStorage.setItem(THEME_STORAGE_KEY, next);
      } catch {
        /* ignore — private mode etc. */
      }
    };
    if (typeof document.startViewTransition === 'function') {
      document.startViewTransition(apply);
    } else {
      apply();
    }
  }, [t.theme]);

  // Sync with other tabs / the admin shell flipping the theme.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== THEME_STORAGE_KEY) return;
      const next = e.newValue;
      if (next === 'dark' || next === 'light') {
        if (next !== t.theme) setTweak('theme', next);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [t.theme, setTweak]);

  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Background />
      <Routes>
        <Route path="/signin" element={<SignIn />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin/*"
          element={
            <AuthGate>
              <AdminRoutes />
            </AuthGate>
          }
        />
        <Route path="/client/login" element={<ClientLogin />} />
        <Route
          path="/client/*"
          element={
            <ClientAuthGate>
              <ClientRoutes />
            </ClientAuthGate>
          }
        />
        <Route path="/team/login" element={<TeamLogin />} />
        <Route
          path="/team/*"
          element={
            <TeamAuthGate>
              <TeamRoutes />
            </TeamAuthGate>
          }
        />
        <Route
          path="/*"
          element={
            <PublicLayout
              theme={t.theme}
              rotateMs={t.rotateMs}
              showMarquee={t.showMarquee}
              showTestimonials={t.showTestimonials}
              onToggleTheme={() =>
                setTweak('theme', t.theme === 'dark' ? 'light' : 'dark')
              }
            />
          }
        />
      </Routes>
      {ZenovaTweaks && (
        <Suspense fallback={null}>
          <ZenovaTweaks tweaks={t} setTweak={setTweak} />
        </Suspense>
      )}
    </BrowserRouter>
  );
}

interface PublicLayoutProps {
  theme: 'dark' | 'light';
  rotateMs: number;
  showMarquee: boolean;
  showTestimonials: boolean;
  onToggleTheme: () => void;
}

function PublicLayout({
  theme,
  rotateMs,
  showMarquee,
  showTestimonials,
  onToggleTheme,
}: PublicLayoutProps) {
  useSmoothScroll();
  const location = useLocation();
  const isKnownPath =
    /^\/(services|process|work|about)?(\/.*)?$/.test(location.pathname);
  return (
    <>
      <Nav theme={theme} onToggleTheme={onToggleTheme} />
      <AnimatedRoutes
        rotateMs={rotateMs}
        showMarquee={showMarquee}
        showTestimonials={showTestimonials}
      />
      {isKnownPath && <Footer />}
    </>
  );
}

interface AnimatedRoutesProps {
  rotateMs: number;
  showMarquee: boolean;
  showTestimonials: boolean;
}

function AnimatedRoutes({ rotateMs, showMarquee, showTestimonials }: AnimatedRoutesProps) {
  const location = useLocation();
  return (
    <div key={location.pathname} className="page-transition">
      <Routes location={location}>
        <Route
          path="/"
          element={
            <Home
              rotateMs={rotateMs}
              showMarquee={showMarquee}
              showTestimonials={showTestimonials}
            />
          }
        />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/services/:slug" element={<ServiceDetailPage />} />
        <Route path="/process" element={<ProcessPage />} />
        <Route path="/work" element={<WorkPage />} />
        <Route path="/work/:slug" element={<ProjectDetailPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  );
}

function AdminRoutes() {
  return (
    <Routes>
      <Route index element={<Overview />} />
      <Route path="services" element={<ServicesAdmin />} />
      <Route path="services/:slug" element={<ServiceEditor />} />
      <Route path="projects" element={<ProjectsAdmin />} />
      <Route path="projects/:slug" element={<ProjectEditor />} />
      <Route path="team" element={<TeamAdmin />} />
      <Route path="content" element={<ContentAdmin />} />
      <Route path="media" element={<MediaAdmin />} />
      <Route path="invoices" element={<InvoiceList />} />
      <Route path="invoices/:id" element={<InvoiceEditor />} />
      <Route path="settings" element={<AdminSettings />} />
      <Route path="inputs" element={<InputsShowcase />} />
    </Routes>
  );
}

function ClientRoutes() {
  return (
    <Routes>
      <Route index element={<ClientOverview />} />
    </Routes>
  );
}

function TeamRoutes() {
  return (
    <Routes>
      <Route index element={<TeamOverview />} />
    </Routes>
  );
}

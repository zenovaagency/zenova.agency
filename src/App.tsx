import { lazy, Suspense, useEffect, useRef } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { Nav } from '@/components/layout/Nav';
import { Footer } from '@/components/layout/Footer';
import { Home } from '@/pages/Home';
import { ServicesPage } from '@/pages/ServicesPage';
import { ServiceDetailPage } from '@/pages/ServiceDetailPage';
import { ProcessPage } from '@/pages/ProcessPage';
import { WorkPage } from '@/pages/WorkPage';
import { ProjectDetailPage } from '@/pages/ProjectDetailPage';
import { CareersPage } from '@/pages/CareersPage';
import { JobDetailPage } from '@/pages/JobDetailPage';
import { AboutPage } from '@/pages/AboutPage';
import { ContactPage } from '@/pages/ContactPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { Login } from '@/pages/Login';
import { AuthGate } from '@/components/ui/AuthGate';
import { Overview } from '@/admin/pages/Overview';
import { ClientOverview } from '@/client/pages/Overview';
import { TeamOverview } from '@/team/pages/Overview';
import { ServicesAdmin } from '@/admin/pages/ServicesAdmin';
import { ServiceEditor } from '@/admin/pages/ServiceEditor';
import { ProjectsAdmin } from '@/admin/pages/ProjectsAdmin';
import { ProjectEditor } from '@/admin/pages/ProjectEditor';
import { JobsAdmin } from '@/admin/pages/JobsAdmin';
import { JobEditor } from '@/admin/pages/JobEditor';
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
import { applyTheme, getInitialTheme } from '@/lib/theme';
import type { Theme } from '@/types/tweaks';
import { hydrateSite } from '@/admin/store';

// Tweaks panel ships only in dev builds — lazy import is tree-shaken in prod.
const ZenovaTweaks = import.meta.env.DEV
  ? lazy(() => import('@/dev/ZenovaTweaks').then((m) => ({ default: m.ZenovaTweaks })))
  : null;

export function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  useEffect(() => {
    void hydrateSite();
  }, []);

  useEffect(() => {
    applyPalette(t.palette);
  }, [t.palette]);

  // On mount, honor the user's stored theme choice; only follow t.theme when
  // the dev tweaks panel actually changes it (never clobber storage with the
  // static default). Tracking the previous value — not a ran-once flag — keeps
  // StrictMode's double-invoke from writing the default over a stored choice.
  const prevTweakTheme = useRef<Theme | null>(null);
  useEffect(() => {
    if (prevTweakTheme.current === null) {
      prevTweakTheme.current = t.theme;
      applyTheme(getInitialTheme());
      return;
    }
    if (prevTweakTheme.current !== t.theme) {
      prevTweakTheme.current = t.theme;
      applyTheme(t.theme);
    }
  }, [t.theme]);

  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        {/* Unified login endpoint */}
        <Route path="/login" element={<Login />} />

        {/* Backward compatibility: redirect old login URLs to unified login */}
        <Route path="/signin" element={<Navigate to="/login" replace />} />
        <Route path="/admin/login" element={<Navigate to="/login" replace />} />
        <Route path="/client/login" element={<Navigate to="/login" replace />} />
        <Route path="/team/login" element={<Navigate to="/login" replace />} />

        {/* Admin portal - requires admin role */}
        <Route
          path="/admin/*"
          element={
            <AuthGate requiredRoles={['admin']}>
              <AdminRoutes />
            </AuthGate>
          }
        />

        {/* Client portal - requires client or admin role */}
        <Route
          path="/client/*"
          element={
            <AuthGate requiredRoles={['client', 'admin']}>
              <ClientRoutes />
            </AuthGate>
          }
        />

        {/* Team portal - requires team or admin role */}
        <Route
          path="/team/*"
          element={
            <AuthGate requiredRoles={['team', 'admin']}>
              <TeamRoutes />
            </AuthGate>
          }
        />

        {/* Public routes */}
        <Route
          path="/*"
          element={
            <PublicLayout
              rotateMs={t.rotateMs}
              showMarquee={t.showMarquee}
              showTestimonials={t.showTestimonials}
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
  rotateMs: number;
  showMarquee: boolean;
  showTestimonials: boolean;
}

function PublicLayout({
  rotateMs,
  showMarquee,
  showTestimonials,
}: PublicLayoutProps) {
  useSmoothScroll();
  const location = useLocation();
  const isKnownPath =
    /^\/(services|process|work|about|contact|careers)?(\/.*)?$/.test(location.pathname);
  return (
    <>
      <Nav />
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
        <Route path="/careers" element={<CareersPage />} />
        <Route path="/careers/:slug" element={<JobDetailPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
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
      <Route path="jobs" element={<JobsAdmin />} />
      <Route path="jobs/:slug" element={<JobEditor />} />
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

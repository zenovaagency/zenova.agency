import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { Nav } from '@/components/layout/Nav';
import { Footer } from '@/components/layout/Footer';
import { Home } from '@/pages/Home';
import { TWEAK_DEFAULTS } from '@/config/tweaks';
import { useSmoothScroll } from '@/hooks/useSmoothScroll';
import { useReveal } from '@/hooks/useReveal';
import { useTweaks } from '@/hooks/useTweaks';
import { applyPalette, deriveRamp } from '@/lib/palette';
import { useBrand } from '@/admin/store';
import { ConfirmProvider } from '@/admin/components/ConfirmProvider';
import { SeoManager } from '@/seo/SeoManager';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
// Static on purpose: these render before a route's own CSS chunk arrives, so they
// must ship in the entry bundle. Never lazy() them. See Skeleton.css.
import {
  ArticlePageSkeleton,
  DetailPageSkeleton,
  FormPageSkeleton,
  GridPageSkeleton,
  ListPageSkeleton,
  RouteBlank,
} from '@/components/ui/PageSkeletons';
import { SkipLink } from '@/components/ui/SkipLink';

const ServicesPage = lazy(() => import('@/pages/ServicesPage').then(m => ({ default: m.ServicesPage })));
const ServiceDetailPage = lazy(() => import('@/pages/ServiceDetailPage').then(m => ({ default: m.ServiceDetailPage })));
const PricingPage = lazy(() => import('@/pages/PricingPage').then(m => ({ default: m.PricingPage })));
const WorkPage = lazy(() => import('@/pages/WorkPage').then(m => ({ default: m.WorkPage })));
const ProjectDetailPage = lazy(() => import('@/pages/ProjectDetailPage').then(m => ({ default: m.ProjectDetailPage })));
const CareersPage = lazy(() => import('@/pages/CareersPage').then(m => ({ default: m.CareersPage })));
const JobDetailPage = lazy(() => import('@/pages/JobDetailPage').then(m => ({ default: m.JobDetailPage })));
const AboutPage = lazy(() => import('@/pages/AboutPage').then(m => ({ default: m.AboutPage })));
const ContactPage = lazy(() => import('@/pages/ContactPage').then(m => ({ default: m.ContactPage })));
const LegalPage = lazy(() => import('@/pages/LegalPage').then(m => ({ default: m.LegalPage })));
const BlogPage = lazy(() => import('@/pages/BlogPage').then(m => ({ default: m.BlogPage })));
const BlogPostPage = lazy(() => import('@/pages/BlogPostPage').then(m => ({ default: m.BlogPostPage })));
const SeoCatchAllPage = lazy(() => import('@/pages/SeoCatchAllPage').then(m => ({ default: m.SeoCatchAllPage })));
const Login = lazy(() => import('@/pages/Login').then(m => ({ default: m.Login })));
const AuthGate = lazy(() => import('@/components/ui/AuthGate').then(m => ({ default: m.AuthGate })));

const ZenovaTweaks = import.meta.env.DEV
  ? lazy(() => import('@/dev/ZenovaTweaks').then((m) => ({ default: m.ZenovaTweaks })))
  : null;

const AdminRoutesLazy = lazy(() => import('@/admin/AdminRoutes'));
const ClientRoutesLazy = lazy(() => import('@/client/ClientRoutes'));
const TeamRoutesLazy = lazy(() => import('@/team/TeamRoutes'));

export function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [brand] = useBrand();

  // The site-wide accent comes from admin brand settings. On first paint `brand`
  // is the cached/default value (Ember orange); once hydrateSite() resolves, the
  // stored accent applies. The dev ZenovaTweaks panel keeps its own applyPalette
  // effect as an override, so this is the single production driver.
  useEffect(() => {
    applyPalette(deriveRamp(brand.accent));
  }, [brand.accent]);

  useEffect(() => {
    import('@/admin/store').then(m => m.hydrateSite()).catch(() => {});
  }, []);

  // Light-only public site: force the light theme on mount. Set the attribute
  // directly (rather than applyTheme) so it doesn't persist over a portal
  // user's stored preference.
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'light');
  }, []);

  return (
    <ErrorBoundary>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <SeoManager />
      <SkipLink />
      <ConfirmProvider>
      <Routes>
        <Route path="/login" element={
          <Suspense fallback={<FormPageSkeleton variant="auth" fields={2} />}>
            <Login />
          </Suspense>
        } />
        <Route path="/signin" element={<Navigate to="/login" replace />} />
        <Route path="/admin/login" element={<Navigate to="/login" replace />} />
        <Route path="/team/login" element={<Navigate to="/login" replace />} />
        <Route path="/client/login" element={<Navigate to="/login" replace />} />
        <Route
          path="/admin/*"
          element={
            <Suspense fallback={<RouteBlank />}>
              <AuthGate requiredRoles={['admin']}>
                <AdminRoutesLazy />
              </AuthGate>
            </Suspense>
          }
        />
        <Route
          path="/client/*"
          element={
            <Suspense fallback={<RouteBlank />}>
              <AuthGate requiredRoles={['client', 'admin']}>
                <ClientRoutesLazy />
              </AuthGate>
            </Suspense>
          }
        />
        <Route
          path="/team/*"
          element={
            <Suspense fallback={<RouteBlank />}>
              <AuthGate requiredRoles={['team', 'admin']}>
                <TeamRoutesLazy />
              </AuthGate>
            </Suspense>
          }
        />
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
      </ConfirmProvider>
    </BrowserRouter>
    </ErrorBoundary>
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
  useReveal();
  const location = useLocation();
  const isKnownPath =
    /^\/(services|pricing|work|about|contact|careers|blog|privacy|terms)?(\/.*)?$/.test(location.pathname);
  return (
    <>
      <Nav />
      <main id="main-content">
        <AnimatedRoutes
          rotateMs={rotateMs}
          showMarquee={showMarquee}
          showTestimonials={showTestimonials}
        />
      </main>
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
        <Route path="/" element={<Home rotateMs={rotateMs} showMarquee={showMarquee} showTestimonials={showTestimonials} />} />
        <Route path="/services" element={<Suspense fallback={<ListPageSkeleton pillars={3} rows={6} />}><ServicesPage /></Suspense>} />
        <Route path="/services/:slug" element={<Suspense fallback={<DetailPageSkeleton railWidth={340} specCols={4} />}><ServiceDetailPage /></Suspense>} />
        <Route path="/pricing" element={<Suspense fallback={<GridPageSkeleton toolbar count={3} min={260} media={false} />}><PricingPage /></Suspense>} />
        <Route path="/process" element={<Navigate to="/services" replace />} />
        <Route path="/work" element={<Suspense fallback={<ListPageSkeleton feature rows={4} />}><WorkPage /></Suspense>} />
        <Route path="/work/:slug" element={<Suspense fallback={<DetailPageSkeleton banner railWidth={260} specCols={3} />}><ProjectDetailPage /></Suspense>} />
        <Route path="/careers" element={<Suspense fallback={<GridPageSkeleton toolbar count={6} min={320} media={false} />}><CareersPage /></Suspense>} />
        <Route path="/careers/:slug" element={<Suspense fallback={<DetailPageSkeleton railWidth={320} specCols={4} />}><JobDetailPage /></Suspense>} />
        <Route path="/about" element={<Suspense fallback={<GridPageSkeleton count={6} min={280} />}><AboutPage /></Suspense>} />
        <Route path="/contact" element={<Suspense fallback={<FormPageSkeleton variant="split" fields={4} />}><ContactPage /></Suspense>} />
        <Route path="/blog" element={<Suspense fallback={<GridPageSkeleton toolbar feature count={6} min={300} />}><BlogPage /></Suspense>} />
        <Route path="/blog/:slug" element={<Suspense fallback={<ArticlePageSkeleton width={1140} side meta />}><BlogPostPage /></Suspense>} />
        <Route path="/privacy" element={<Suspense fallback={<ArticlePageSkeleton />}><LegalPage doc="privacy" /></Suspense>} />
        <Route path="/terms" element={<Suspense fallback={<ArticlePageSkeleton />}><LegalPage doc="terms" /></Suspense>} />
        {/* Catch-all serves admin-authored SEO pages at /<slug>, or the 404 page. */}
        <Route path="*" element={<Suspense fallback={<ArticlePageSkeleton />}><SeoCatchAllPage /></Suspense>} />
      </Routes>
    </div>
  );
}

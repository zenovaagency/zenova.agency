import { lazy, Suspense, useEffect, type ReactNode } from 'react';
import { Routes, Route } from 'react-router-dom';
import './admin.css';
import '../components/ui/inputs/inputs.css';
import { AdminSpinner } from '@/admin/components/AdminSpinner';
import {
  applyCachedSite,
  contentStore,
  hydrateSite,
  isSiteSeeded,
  useServices,
} from '@/admin/store';

const Overview = lazy(() => import('@/admin/pages/Overview').then(m => ({ default: m.Overview })));
const ServicesAdmin = lazy(() => import('@/admin/pages/ServicesAdmin').then(m => ({ default: m.ServicesAdmin })));
const ServiceEditor = lazy(() => import('@/admin/pages/ServiceEditor').then(m => ({ default: m.ServiceEditor })));
const ProjectsAdmin = lazy(() => import('@/admin/pages/ProjectsAdmin').then(m => ({ default: m.ProjectsAdmin })));
const ProjectEditor = lazy(() => import('@/admin/pages/ProjectEditor').then(m => ({ default: m.ProjectEditor })));
const JobsAdmin = lazy(() => import('@/admin/pages/JobsAdmin').then(m => ({ default: m.JobsAdmin })));
const JobEditor = lazy(() => import('@/admin/pages/JobEditor').then(m => ({ default: m.JobEditor })));
const TeamAdmin = lazy(() => import('@/admin/pages/TeamAdmin').then(m => ({ default: m.TeamAdmin })));
const ContentAdmin = lazy(() => import('@/admin/pages/ContentAdmin').then(m => ({ default: m.ContentAdmin })));
const PricingAdmin = lazy(() => import('@/admin/pages/PricingAdmin').then(m => ({ default: m.PricingAdmin })));
const LegalAdmin = lazy(() => import('@/admin/pages/LegalAdmin').then(m => ({ default: m.LegalAdmin })));
const BlogAdmin = lazy(() => import('@/admin/pages/BlogAdmin').then(m => ({ default: m.BlogAdmin })));
const BlogEditor = lazy(() => import('@/admin/pages/BlogEditor').then(m => ({ default: m.BlogEditor })));
const SeoPagesAdmin = lazy(() => import('@/admin/pages/SeoPagesAdmin').then(m => ({ default: m.SeoPagesAdmin })));
const SeoPageEditor = lazy(() => import('@/admin/pages/SeoPageEditor').then(m => ({ default: m.SeoPageEditor })));
const MediaAdmin = lazy(() => import('@/admin/pages/MediaAdmin').then(m => ({ default: m.MediaAdmin })));
const Settings = lazy(() => import('@/admin/pages/Settings').then(m => ({ default: m.Settings })));
const InputsShowcase = lazy(() => import('@/admin/pages/InputsShowcase').then(m => ({ default: m.InputsShowcase })));
const InvoiceList = lazy(() => import('@/admin/pages/InvoiceList').then(m => ({ default: m.InvoiceList })));
const InvoiceEditor = lazy(() => import('@/admin/pages/InvoiceEditor').then(m => ({ default: m.InvoiceEditor })));
const UsersAdmin = lazy(() => import('@/admin/pages/UsersAdmin').then(m => ({ default: m.UsersAdmin })));
const Inbox = lazy(() => import('@/admin/pages/Inbox').then(m => ({ default: m.Inbox })));

/** Fallback shown by the route-level Suspense boundaries. */
function AdminLoader() {
  return <AdminSpinner label="Loading dashboard…" />;
}

/**
 * Loads live CMS content into the shared stores before the dashboard renders.
 *
 * The public site seeds these stores on the server (SiteStoreProvider) and
 * refreshes them in the browser (SiteEffects, via hydrateSite). This island
 * renders under the root layout with neither mounted, so without this bootstrap
 * the admin reads the hardcoded src/data defaults — it would show placeholder
 * data and, worse, a bulk save or "Reset" would PUT those defaults over live
 * content.
 *
 * Loading strategy:
 *  - If the marketing site already seeded the stores, render immediately.
 *  - Otherwise, promote any localStorage cache to the live value so the UI paints
 *    without waiting for the network.
 *  - If there is still no usable data, show a loading state and fetch from the
 *    API. Failures surface a retry button.
 *  - When cache or seeding made the stores ready, hydration runs silently in the
 *    background so the dashboard never flips back to a loading spinner.
 */
function AdminDataGate({ children }: { children: ReactNode }) {
  const [, , { status, error }] = useServices();

  useEffect(() => {
    // The marketing site already fetched /public/site and seeded the stores.
    // Refetching would spend a request to arrive at the data already on screen
    // and briefly flip every store to 'loading' while doing it.
    if (isSiteSeeded()) return;

    // Promote localStorage cache so the first paint can use real data instead of
    // defaults. The store constructor loads the cache but keeps it pending to avoid
    // disagreeing with server-rendered HTML; this island is client-only, so we
    // can apply it safely here.
    applyCachedSite();

    // If cache gave us data, refresh in the background without showing loading.
    // Otherwise, do a normal fetch with the loading state.
    void hydrateSite(false, contentStore.status === 'ready');
  }, []);

  if (status === 'error') {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
          background: 'var(--bg)',
          color: 'var(--fg)',
        }}
      >
        <div className="adm-card" style={{ maxWidth: 440, textAlign: 'center', padding: 28 }} role="alert">
          <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 8 }}>
            Couldn’t load the dashboard
          </div>
          <p style={{ color: 'var(--fg-dim)', fontSize: 14, margin: '0 0 18px' }}>
            {error ?? 'The content service could not be reached.'}
          </p>
          <button type="button" className="adm-btn" onClick={() => void hydrateSite(true)}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (status !== 'ready') {
    return <AdminSpinner label="Loading dashboard…" />;
  }

  return <>{children}</>;
}

export default function AdminRoutes() {
  return (
    <AdminDataGate>
      <Routes>
        {/* Parent carries the real /admin prefix; children stay relative. The
            router has no basename (see PortalIsland), so to="/admin/services"
            resolves to exactly that, not /admin/admin/services. */}
        <Route path="/admin">
          <Route index element={<Suspense fallback={<AdminLoader />}><Overview /></Suspense>} />
          <Route path="services" element={<Suspense fallback={<AdminLoader />}><ServicesAdmin /></Suspense>} />
          <Route path="services/:slug" element={<Suspense fallback={<AdminLoader />}><ServiceEditor /></Suspense>} />
          <Route path="projects" element={<Suspense fallback={<AdminLoader />}><ProjectsAdmin /></Suspense>} />
          <Route path="projects/:slug" element={<Suspense fallback={<AdminLoader />}><ProjectEditor /></Suspense>} />
          <Route path="jobs" element={<Suspense fallback={<AdminLoader />}><JobsAdmin /></Suspense>} />
          <Route path="jobs/:slug" element={<Suspense fallback={<AdminLoader />}><JobEditor /></Suspense>} />
          <Route path="team" element={<Suspense fallback={<AdminLoader />}><TeamAdmin /></Suspense>} />
          <Route path="content" element={<Suspense fallback={<AdminLoader />}><ContentAdmin /></Suspense>} />
          <Route path="pricing" element={<Suspense fallback={<AdminLoader />}><PricingAdmin /></Suspense>} />
          <Route path="legal" element={<Suspense fallback={<AdminLoader />}><LegalAdmin /></Suspense>} />
          <Route path="blog" element={<Suspense fallback={<AdminLoader />}><BlogAdmin /></Suspense>} />
          <Route path="blog/:slug" element={<Suspense fallback={<AdminLoader />}><BlogEditor /></Suspense>} />
          <Route path="seo-pages" element={<Suspense fallback={<AdminLoader />}><SeoPagesAdmin /></Suspense>} />
          <Route path="seo-pages/:slug" element={<Suspense fallback={<AdminLoader />}><SeoPageEditor /></Suspense>} />
          <Route path="media" element={<Suspense fallback={<AdminLoader />}><MediaAdmin /></Suspense>} />
          <Route path="invoices" element={<Suspense fallback={<AdminLoader />}><InvoiceList /></Suspense>} />
          <Route path="invoices/:id" element={<Suspense fallback={<AdminLoader />}><InvoiceEditor /></Suspense>} />
          <Route path="users" element={<Suspense fallback={<AdminLoader />}><UsersAdmin /></Suspense>} />
          <Route path="inbox" element={<Suspense fallback={<AdminLoader />}><Inbox /></Suspense>} />
          <Route path="settings" element={<Suspense fallback={<AdminLoader />}><Settings /></Suspense>} />
          <Route path="inputs" element={<Suspense fallback={<AdminLoader />}><InputsShowcase /></Suspense>} />
        </Route>
      </Routes>
    </AdminDataGate>
  );
}

'use client';
/**
 * Mounts one of the authenticated portals as a client-only react-router island.
 *
 * The admin, client and team surfaces are ~16,500 lines of multi-level SPA
 * behind a login. None of it can be server-rendered: the session is a JWT in
 * localStorage (src/lib/session.ts), so the server has no idea who the visitor
 * is and would render the logged-out view into the HTML every time. They are
 * also deliberately noindex, so there is nothing for SSR to buy here.
 *
 * Keeping them on real react-router — mounted under an optional catch-all route
 * so Next serves the same document for every sub-path — means none of those
 * files had to change. `ssr: false` is what makes that safe: the island only
 * ever executes in the browser, where localStorage and window exist.
 */
import dynamic from 'next/dynamic';
import { BrowserRouter } from 'react-router-dom';
import { AuthGate } from '@/components/ui/AuthGate';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { ConfirmProvider } from '@/admin/components/ConfirmProvider';
import { AdminSpinner } from '@/admin/components/AdminSpinner';
import type { Role } from '@/lib/session';

// Portal-wide styling. The `.adm-*` classes and the confirm dialog (`.adm-confirm`)
// live in admin.css, and every portal shell — AdminShell, TeamShell, ClientShell —
// and the shared ConfirmProvider dialog below all draw on them. AdminRoutes imports
// admin.css for the admin chunk, but the team and client islands never did, so their
// dashboards rendered unstyled; and the provider mounted here sits above all three
// lazy chunks, so its dialog needs the CSS regardless of which island loads. Loading
// it once here covers every case.
import '@/admin/admin.css';
import '@/components/ui/inputs/inputs.css';

const islands = {
  admin: dynamic(() => import('@/admin/AdminRoutes'), {
    ssr: false,
    loading: () => <AdminSpinner label="Loading admin…" />,
  }),
  client: dynamic(() => import('@/client/ClientRoutes'), {
    ssr: false,
    loading: () => <AdminSpinner label="Loading client portal…" />,
  }),
  team: dynamic(() => import('@/team/TeamRoutes'), {
    ssr: false,
    loading: () => <AdminSpinner label="Loading team portal…" />,
  }),
};

export function PortalIsland({
  portal,
  requiredRoles,
}: {
  portal: keyof typeof islands;
  requiredRoles: Role[];
}) {
  const Island = islands[portal];
  return (
    // AuthGate is outside BrowserRouter on purpose — see the note in AuthGate.
    <AuthGate requiredRoles={requiredRoles}>
      {/* A throw anywhere in a portal page used to unmount the whole island to a
          blank (black, on the dark theme) screen: there is no error.tsx over this
          route. This boundary renders a recoverable message instead. */}
      <ErrorBoundary>
        {/* The admin management pages and the team dashboard call useConfirm().
            The provider was dropped when this island replaced the old SPA root,
            so useConfirm() threw "must be used within <ConfirmProvider>" the
            moment such a page mounted — the direct cause of the black page.
            Mounting it here fixes all three portals at once. */}
        <ConfirmProvider>
          {/* No basename. The islands' own <Route> paths already carry the full
              /admin, /client, /team prefix (see each *Routes.tsx), and every
              internal <Link to="/admin/…"> is likewise absolute. A basename here
              would be prepended on top of those, turning to="/admin/services"
              into /admin/admin/services — a route that matches nothing and
              renders a blank page. */}
          <BrowserRouter>
            <Island />
          </BrowserRouter>
        </ConfirmProvider>
      </ErrorBoundary>
    </AuthGate>
  );
}

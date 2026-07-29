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
import type { Role } from '@/lib/session';

const islands = {
  admin: dynamic(() => import('@/admin/AdminRoutes'), { ssr: false }),
  client: dynamic(() => import('@/client/ClientRoutes'), { ssr: false }),
  team: dynamic(() => import('@/team/TeamRoutes'), { ssr: false }),
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
      <BrowserRouter basename={`/${portal}`}>
        <Island />
      </BrowserRouter>
    </AuthGate>
  );
}

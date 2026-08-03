import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

const TeamOverview = lazy(() => import('@/team/pages/Overview').then(m => ({ default: m.TeamOverview })));

function TeamLoader() {
  return <div style={{ minHeight: '100vh' }} />;
}

export default function TeamRoutes() {
  return (
    <Suspense fallback={<TeamLoader />}>
      <Routes>
        {/* Full path, no basename — see PortalIsland. */}
        <Route path="/team" element={<Suspense fallback={<TeamLoader />}><TeamOverview /></Suspense>} />
      </Routes>
    </Suspense>
  );
}

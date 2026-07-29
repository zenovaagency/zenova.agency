import { PortalIsland } from '../../_PortalIsland';

/**
 * Never indexed — robots.txt disallows /team/ as well, and this is the
 * belt-and-braces half of that. An optional catch-all so every sub-path of the
 * portal is served by this one document and routed client-side.
 */
export const metadata = { title: 'Zenova', robots: { index: false, follow: false } };

export default function Page() {
  return <PortalIsland portal="team" requiredRoles={['team', 'admin']} />;
}

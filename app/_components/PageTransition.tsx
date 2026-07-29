'use client';
/**
 * Re-keys its subtree on every navigation so the `.page-transition` fade in
 * global.css replays — the behaviour the old RouteFrame got from
 * `<div key={location.pathname}>` in src/App.tsx.
 *
 * <main> and the footer are both inside this wrapper on purpose: with the
 * footer outside it, the footer was the only opaque thing on screen for the
 * first 400ms of every navigation, which read as "the footer loads first".
 */
import { usePathname } from 'next/navigation';

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="page-transition">
      {children}
    </div>
  );
}

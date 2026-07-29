'use client';
/**
 * react-router-dom compatibility shim over Next's navigation primitives.
 *
 * The public pages were written against react-router and use a deliberately
 * small slice of it: <Link to>, useLocation().pathname/hash, useParams(),
 * useNavigate(), <Navigate>, useSearchParams(). Re-implementing that slice here
 * means the migration to the App Router is a one-line import swap in each page
 *
 *     -import { Link, useLocation } from 'react-router-dom';
 *     +import { Link, useLocation } from '@/lib/router';
 *
 * rather than a rewrite of ~25 components. The alternative — hand-converting
 * every <Link to> to <Link href> and every useLocation to usePathname — is a
 * large diff across files whose behaviour is not otherwise changing, which is
 * exactly the kind of churn that hides a real regression.
 *
 * The admin/client/team portals do NOT use this. They keep real react-router,
 * mounted as client-only islands (see app/(portal)/), because they are
 * multi-level SPAs behind auth that Next never needs to render on the server.
 *
 * Everything here is client-only by necessity: Next's navigation hooks read
 * from a client context.
 */
import NextLink from 'next/link';
import {
  useParams as useNextParams,
  useSearchParams as useNextSearchParams,
  usePathname,
  useRouter,
} from 'next/navigation';
import { forwardRef, useEffect, useMemo, useSyncExternalStore } from 'react';
import type { ComponentPropsWithoutRef } from 'react';

type AnchorProps = Omit<ComponentPropsWithoutRef<'a'>, 'href'>;

export interface LinkProps extends AnchorProps {
  /** react-router's prop name for the destination. Maps to next/link's href. */
  to: string;
}

/**
 * next/link with react-router's prop name. Keeping `to` (rather than renaming
 * every call site to `href`) is the whole point of this module.
 *
 * next/link renders a real <a href> and prefetches on viewport entry, which
 * replaces the old useRoutePrefetch/routePrefetch hover-warming entirely.
 */
export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link({ to, ...rest }, ref) {
  return <NextLink ref={ref} href={to} {...rest} />;
});

/**
 * The `?search#hash` tail of the current URL, as one string.
 *
 * Read from `window.location` rather than Next's useSearchParams() on purpose.
 * useSearchParams() opts the whole route out of static rendering unless it sits
 * under a Suspense boundary — it would have turned every page that renders a
 * <Nav> (i.e. all of them) into a client-side-rendered shell, which is the
 * exact opposite of the point of this migration.
 *
 * The server snapshot is the empty string. The server genuinely has no hash
 * (browsers never send it) and returning a real value on the client's first
 * render would disagree with the server markup for any visitor arriving on an
 * anchor link.
 *
 * Returning a freshly built string on every call is safe: useSyncExternalStore
 * compares snapshots with Object.is, and equal strings are identical under it.
 */
function subscribeUrlTail(cb: () => void): () => void {
  window.addEventListener('hashchange', cb);
  window.addEventListener('popstate', cb);
  return () => {
    window.removeEventListener('hashchange', cb);
    window.removeEventListener('popstate', cb);
  };
}

function readUrlTail(): string {
  return window.location.search + window.location.hash;
}

function useUrlTail(): string {
  return useSyncExternalStore(subscribeUrlTail, readUrlTail, () => '');
}

export interface Location {
  pathname: string;
  search: string;
  hash: string;
  /**
   * react-router changes this on every navigation, including same-path ones,
   * and Home.tsx uses it as an effect dependency. Next has no equivalent, so
   * this is a synthetic identity: it changes whenever any part of the URL
   * does, which is what the dependency is actually watching for.
   */
  key: string;
}

export function useLocation(): Location {
  // usePathname is typed nullable (null during a static render with no
  // Suspense boundary above); '/' is the honest fallback and matches what the
  // server rendered. It also re-renders on every navigation, which is what
  // makes the useUrlTail() snapshot below refresh after a next/link push —
  // pushState fires no popstate event of its own.
  const pathname = usePathname() ?? '/';
  const tail = useUrlTail();

  return useMemo(() => {
    const hashAt = tail.indexOf('#');
    const hash = hashAt === -1 ? '' : tail.slice(hashAt);
    const search = hashAt === -1 ? tail : tail.slice(0, hashAt);
    return { pathname, search, hash, key: `${pathname}${search}${hash}` };
  }, [pathname, tail]);
}

/**
 * Next's useParams has the same shape for the dynamic segments this site uses
 * ([slug] yields a string). Catch-all segments would yield string[], which no
 * caller here passes through, so the cast keeps call sites like
 * `const { slug = '' } = useParams()` type-correct without a rewrite.
 */
export function useParams<T extends Record<string, string> = Record<string, string>>(): Partial<T> {
  return useNextParams() as Partial<T>;
}

export interface NavigateOptions {
  replace?: boolean;
}

export type NavigateFunction = (to: string | number, options?: NavigateOptions) => void;

export function useNavigate(): NavigateFunction {
  const router = useRouter();
  return useMemo<NavigateFunction>(
    () => (to, options) => {
      // react-router's navigate(-1) idiom for "go back".
      if (typeof to === 'number') {
        if (to < 0) router.back();
        else router.forward();
        return;
      }
      if (options?.replace) router.replace(to);
      else router.push(to);
    },
    [router],
  );
}

/**
 * Declarative redirect, for the "slug did not resolve" branches in the detail
 * pages. It navigates from an effect because a client component cannot redirect
 * during render.
 *
 * Note that in the migrated app these branches are mostly unreachable: the
 * server component for each detail route validates the slug first and answers
 * with a real 404 or 308 before the client component ever mounts. This exists
 * so those defensive branches keep working (e.g. after a client-side
 * navigation to a slug the store no longer knows about).
 */
export function Navigate({ to, replace = false }: { to: string; replace?: boolean }): null {
  const navigate = useNavigate();
  useEffect(() => {
    navigate(to, { replace });
  }, [navigate, to, replace]);
  return null;
}

/**
 * react-router returns a [params, setParams] tuple; Next returns the params
 * alone. The setter is provided for API compatibility and pushes a new query
 * string onto the current path.
 */
export function useSearchParams(): [URLSearchParams, (next: URLSearchParams) => void] {
  const params = useNextSearchParams();
  const router = useRouter();
  const pathname = usePathname() ?? '/';

  return useMemo(() => {
    const setParams = (next: URLSearchParams) => {
      const qs = next.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname);
    };
    return [new URLSearchParams(params?.toString() ?? ''), setParams];
  }, [params, router, pathname]);
}

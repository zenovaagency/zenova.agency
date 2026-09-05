/**
 * Astro's default `directory` build format serves /services as
 * /services/index.html, so `Astro.url.pathname` is "/services/" in the build
 * and "/services" in dev. Comparing either against a href of "/services"
 * silently fails in one of the two environments, so normalise before matching.
 */
export const normalizePath = (path: string): string =>
  path.length > 1 ? path.replace(/\/+$/, '') : path;

/** Exactly this page. Drives `aria-current="page"`, which means precisely that. */
export const isActive = (href: string, pathname: string): boolean =>
  normalizePath(href) === normalizePath(pathname);

/**
 * This page *or a page beneath it*, so the Services nav item stays marked on
 * /services/web. Kept separate from `isActive` because a detail page is not
 * the section index, and saying `aria-current="page"` on both would be a lie
 * to a screen reader. Nav renders this as a class instead.
 *
 * The `href !== '/'` guard is load-bearing: without it the home link is an
 * ancestor of every route on the site.
 */
export const isSection = (href: string, pathname: string): boolean => {
  const h = normalizePath(href);
  const p = normalizePath(pathname);
  return h === p || (h !== '/' && p.startsWith(`${h}/`));
};

export interface ChainItem {
  label: string;
  href: string;
}

/**
 * Reading order across the site. The five nav routes run in the order a
 * prospective client would want them — what we do, what it costs, what we
 * have done, who we are hiring, who we are — and terminate at contact.
 *
 * Process was removed with its page; the four phases now live only on the
 * home page.
 */
export const CHAIN: ChainItem[] = [
  { label: 'Services', href: '/services' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Work', href: '/work' },
  { label: 'Blog', href: '/blog' },
  { label: 'Careers', href: '/careers' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

/**
 * Previous / next within any ordered list of routes.
 *
 * PageNav uses CHAIN on section index pages and a sibling list on detail
 * pages, so /services/web steps to /services/app rather than rendering
 * nothing. A path absent from `items` yields two nulls and no strip.
 */
export const step = (items: ChainItem[], pathname: string) => {
  const here = normalizePath(pathname);
  const i = items.findIndex((c) => normalizePath(c.href) === here);
  return {
    prev: i > 0 ? items[i - 1] : null,
    next: i >= 0 && i < items.length - 1 ? items[i + 1] : null,
  };
};

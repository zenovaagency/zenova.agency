/**
 * Central SEO metadata — the single source of truth for per-route <head>
 * tags, JSON-LD, the XML sitemap, and build-time prerendered HTML.
 *
 * Detail-page routes are DERIVED from the content modules rather than listed
 * here. They used to be hand-maintained copies with a "keep these in sync"
 * comment, and they had silently fallen out of sync: this table still listed
 * /services/ops, /content, /chatbot and /automation, which no longer exist
 * (every one was a redirect, published in the sitemap as a real URL), while
 * the live /services/ai page was absent from the sitemap entirely. Deriving
 * them makes that class of bug unrepresentable.
 *
 * Import cost is nil: admin/store.ts already imports all three modules and is
 * itself imported from App.tsx, so they are in the entry chunk either way.
 *
 * No DOM or Node APIs — this module is imported by the browser bundle
 * (<SeoManager>) as well as by the build-time prerenderer.
 */
import { SERVICES as SERVICE_DATA } from '@/data/services';
import { PROJECTS as PROJECT_DATA } from '@/data/projects';
import { JOBS as JOB_DATA } from '@/data/jobs';

export interface SeoMeta {
  /** Canonical path, no trailing slash (except the home path '/'). */
  path: string;
  /** Full document <title>. */
  title: string;
  /** Meta description (~150 chars). */
  description: string;
  /** Prerendered <h1> shown to non-JS crawlers before React hydrates. */
  h1: string;
  /** Prerendered lead paragraph. */
  intro: string;
  /** false => emit noindex,follow and exclude from the sitemap. */
  index: boolean;
  /**
   * ISO date (YYYY-MM-DD) on which this page's copy last materially changed.
   * Feeds <lastmod> in sitemap.xml. Bump it when you rewrite the page; leave it
   * off if you do not know.
   *
   * Only hand-maintained routes carry this. Detail pages take their date from
   * the record they render (a job's postedAt, a post's updated_at), which is a
   * real timestamp and needs no upkeep. There is no equivalent for the fixed
   * marketing pages: their copy lives across app/(marketing), src/views and
   * src/data/site-content.ts, and git dates them all to the Next migration
   * commit — so the honest options were a curated date or none, and a curated
   * one at least moves when the page does.
   *
   * Never substitute the build date. `changefreq` and `priority` used to live
   * here; both are ignored by Google, and the sitemap no longer emits them.
   */
  contentUpdated?: string;
  /** Breadcrumb trail ending with the current page. Omitted on the homepage. */
  breadcrumb?: Array<{ name: string; path: string }>;
}

export const SITE = {
  url: 'https://zenova.agency',
  name: 'Zenova',
  legalName: 'Zenova, Inc.',
  description:
    'Zenova combines design, development, marketing, and startup support into one seamless partnership for ambitious modern businesses.',
  // NOTE: replace with a dedicated 1200×630 or square logo file when available.
  // The mark is used here because the referenced zenova-logo.png does not exist in the repo.
  logo: 'https://zenova.agency/assets/zenova-mark.png',
  /**
   * Absolute URL to the social share card. Dimensions below must match the real
   * file (public/uploads/og-card.png, verified 1600×840 — a 1.905 ratio, the
   * same shape as 1200×630, which is what every major scraper crops to).
   * If you replace the card, update these numbers or Slack/LinkedIn will lay
   * out the preview against the wrong box.
   */
  ogImage: 'https://zenova.agency/uploads/og-card.png',
  ogImageWidth: 1600,
  ogImageHeight: 840,
  ogImageType: 'image/png',
  ogImageAlt: 'Zenova — one agency for design, development, marketing, and startup support.',
  locale: 'en_US',
  email: 'hello@zenova.agency',
  careersEmail: 'careers@zenova.agency',
  /** Declared brand profiles (rendered in the site footer). Confirm/extend. */
  sameAs: [
    'https://www.instagram.com/zenova.agency',
    'https://www.linkedin.com/company/zenova',
    'https://twitter.com/zenova',
    'https://github.com/zenova',
    'https://facebook.com/zenova',
  ],
  /**
   * Entity facts for AI answer engines (GEO). These are the properties a model
   * reads to decide *what Zenova is* and *when to name it* — keep them factual
   * and consistent with the visible page copy, never keyword-stuffed.
   */
  // Must describe what the site actually sells — see the five entries in
  // src/data/services.ts. Listing expertise the agency does not offer is the
  // fastest way to get an AI assistant to recommend Zenova for the wrong job.
  knowsAbout: [
    'Web development',
    'Web application development',
    'Mobile app development',
    'Brand and product design',
    'Search engine optimization',
    'Digital marketing',
    'Email marketing',
    'Paid advertising',
    'Startup product launch',
    'MVP development',
    'AI agent development',
    'AI chatbot development',
    'Business process automation',
  ],
  /** schema.org priceRange is a coarse signal; keep it symbolic, not a number. */
  priceRange: '$$',
  areaServed: 'Worldwide',
} as const;

/**
 * Physical address + phone for LocalBusiness/ProfessionalService schema.
 *
 * DELIBERATELY DISABLED. The values carried in the admin brand defaults
 * ('123 Atlantic Ave, Brooklyn, NY 11201', '+1 (555) 123-4567') are template
 * placeholders, and publishing placeholder NAP data in structured markup is
 * actively harmful: Google cross-checks name/address/phone against its own
 * business records, and a mismatch suppresses the very local rich results the
 * markup is meant to earn. A 555 number is a recognised fiction.
 *
 * To enable: replace the fields with the real, verified business address and
 * phone, then flip `verified` to true. Nothing else needs to change — the
 * ProfessionalService node picks the properties up automatically.
 */
export const BUSINESS_NAP = {
  verified: false,
  streetAddress: '',
  addressLocality: '',
  addressRegion: '',
  postalCode: '',
  addressCountry: '',
  telephone: '',
} as const;

/** Primary navigation — reused by the prerendered crawlable fallback. */
export const NAV: Array<{ label: string; path: string }> = [
  { label: 'Services', path: '/services' },
  { label: 'Work', path: '/work' },
  { label: 'Pricing', path: '/pricing' },
  { label: 'Blog', path: '/blog' },
  { label: 'About', path: '/about' },
  { label: 'Careers', path: '/careers' },
  { label: 'Contact', path: '/contact' },
];

/** Auth/portal path prefixes that must never be indexed. */
export const NOINDEX_PREFIXES = ['/admin', '/client', '/team', '/login', '/signin'];

/**
 * CMS page slugs that must never be rendered, linked, or listed in the sitemap.
 *
 * `test-seo` is an admin scratch page that reached production and was published
 * in sitemap.xml as a real indexable URL. The right fix is to unpublish it in
 * the dashboard — excluding a page is a content decision, and this list makes it
 * a code deploy. This exists so the site can refuse regardless: a frontend that
 * will publish any row the API hands it into its own sitemap has no way to say
 * no, and a stray draft costs crawl budget on every crawl.
 *
 * Longer term the backend should carry an `is_indexable` flag on /public/pages
 * and this list should shrink to empty.
 */
export const EXCLUDED_CONTENT_SLUGS: ReadonlySet<string> = new Set(['test-seo']);

export function isExcludedContentSlug(slug: string): boolean {
  return EXCLUDED_CONTENT_SLUGS.has(slug.replace(/^\/+|\/+$/g, ''));
}

// --- Main marketing routes -------------------------------------------------

export const MAIN_ROUTES: SeoMeta[] = [
  {
    path: '/',
    title: 'Zenova — One agency for design, development & marketing',
    description: SITE.description,
    h1: 'Building ambitious brands with design, development & marketing',
    intro:
      'Zenova unifies design, development, marketing, and startup support into one seamless partnership — guiding ambitious modern businesses from strategy to launch and beyond.',
    index: true,
    contentUpdated: '2026-07-29',
  },
  {
    path: '/services',
    title: 'Services — Web, App, Marketing, Startup & More | Zenova',
    description:
      'Explore Zenova’s services — web and app development, marketing, startup support, content, operations, automation, and AI chatbots — under one roof.',
    h1: 'Everything you need, under one roof',
    intro:
      'From first sketch to launch and growth: design, development, marketing, and the operational muscle to scale. Explore what Zenova can build for you.',
    index: true,
    contentUpdated: '2026-07-29',
    breadcrumb: [
      { name: 'Home', path: '/' },
      { name: 'Services', path: '/services' },
    ],
  },
  {
    path: '/pricing',
    title: 'Pricing — Transparent, Project-Based Rates | Zenova',
    description:
      'Clear, project-based pricing for web, apps, marketing, startups, content, ops, automation, and chatbots. See exactly what each engagement includes.',
    h1: 'Simple, transparent pricing',
    intro:
      'Project-based rates with no hidden fees. Pick a service to see starter, growth, and custom options — and exactly what’s included at each tier.',
    index: true,
    contentUpdated: '2026-07-29',
    breadcrumb: [
      { name: 'Home', path: '/' },
      { name: 'Pricing', path: '/pricing' },
    ],
  },
  {
    path: '/work',
    title: 'Our Work — Case Studies & Results | Zenova',
    description:
      'A selection of Zenova’s work — rebrands, websites, apps, and growth programs — and the real results they delivered for modern teams.',
    h1: 'Work that speaks for itself',
    intro:
      'A few examples of what we’ve built and grown — from a developer-platform rebrand that doubled signups to a launch that hit 10,000 users in 90 days.',
    index: true,
    contentUpdated: '2026-07-29',
    breadcrumb: [
      { name: 'Home', path: '/' },
      { name: 'Work', path: '/work' },
    ],
  },
  {
    path: '/about',
    title: 'About Zenova — One Agency for Everything Modern',
    description:
      'Zenova is a small, senior team that designs, builds, and grows modern businesses — combining design, development, marketing, and startup support under one roof.',
    h1: 'A small team that designs, builds, and grows modern businesses',
    intro:
      'We bring design, development, marketing, and startup support together so ambitious teams get one partner from strategy to launch and beyond.',
    index: true,
    contentUpdated: '2026-07-29',
    breadcrumb: [
      { name: 'Home', path: '/' },
      { name: 'About', path: '/about' },
    ],
  },
  {
    path: '/contact',
    title: 'Contact Zenova — Start Your Project',
    description:
      'Tell us about your project and book a quick 30-minute call with Zenova — no pitch, just your goals, timeline, and how we can help.',
    h1: 'Let’s build something modern',
    intro:
      'Book a quick 30-minute call — no pitch, just your project. Tell us your goals, your audience, and what success looks like.',
    index: true,
    contentUpdated: '2026-07-29',
    breadcrumb: [
      { name: 'Home', path: '/' },
      { name: 'Contact', path: '/contact' },
    ],
  },
  {
    path: '/careers',
    title: 'Careers — Join Zenova',
    description:
      'Join Zenova — a small, senior team building ambitious brands and products. See our open roles in design, engineering, and growth.',
    h1: 'Build ambitious work with a small, senior team',
    intro:
      'We hire senior people who own their work end to end. See our open roles in design, engineering, and growth.',
    index: true,
    contentUpdated: '2026-07-29',
    breadcrumb: [
      { name: 'Home', path: '/' },
      { name: 'Careers', path: '/careers' },
    ],
  },
  {
    path: '/blog',
    title: 'Blog — Insights on Design, Development & Growth | Zenova',
    description:
      'Practical writing from the Zenova team on design, development, marketing, and building modern businesses — lessons from real client work.',
    h1: 'Notes from the studio',
    intro:
      'Practical writing on design, development, marketing, and building modern businesses — lessons from real client work, not theory.',
    index: true,
    contentUpdated: '2026-07-29',
    breadcrumb: [
      { name: 'Home', path: '/' },
      { name: 'Blog', path: '/blog' },
    ],
  },
  {
    path: '/privacy',
    title: 'Privacy Policy | Zenova',
    description:
      'How Zenova collects, uses, shares, and protects your personal information — including your rights, cookies, data retention, and security.',
    h1: 'Privacy Policy',
    intro:
      'How Zenova collects, uses, and protects your personal information when you visit our website or engage our design, development, and marketing services.',
    index: true,
    contentUpdated: '2026-07-29',
    breadcrumb: [
      { name: 'Home', path: '/' },
      { name: 'Privacy Policy', path: '/privacy' },
    ],
  },
  {
    path: '/terms',
    title: 'Terms & Conditions | Zenova',
    description:
      'The terms governing your use of the Zenova website and services — engagements, fees, intellectual property, liability, and more.',
    h1: 'Terms & Conditions',
    intro:
      'The terms that govern your use of the Zenova website and our design, development, marketing, and startup services.',
    index: true,
    contentUpdated: '2026-07-29',
    breadcrumb: [
      { name: 'Home', path: '/' },
      { name: 'Terms & Conditions', path: '/terms' },
    ],
  },
];

// --- Detail-page metadata --------------------------------------------------
//
// These three builders are exported because the *routes* need them too. The
// slugs a detail route serves come from the CMS at request time, not from
// src/data — an admin can add a sixth service, and it has to get a title, a
// description and a breadcrumb like the other five. The route calls the same
// builder that fills ALL_ROUTES below, so a CMS-authored page and a repo-
// authored one are described identically and neither can drift from the other.
//
// They take structural subsets rather than the full ServiceDetail/ProjectDetail
// /JobDetail types so a caller holding a partial CMS record can still use them.

export function serviceRouteMeta(s: { slug: string; title: string; short: string }): SeoMeta {
  return {
    path: `/services/${s.slug}`,
    title: `${s.title} Services | Zenova`,
    description: s.short,
    h1: s.title,
    intro: s.short,
    index: true,
    breadcrumb: [
      { name: 'Home', path: '/' },
      { name: 'Services', path: '/services' },
      { name: s.title, path: `/services/${s.slug}` },
    ],
  };
}

export function projectRouteMeta(p: {
  slug: string;
  client: string;
  title: string;
  summary: string;
}): SeoMeta {
  return {
    path: `/work/${p.slug}`,
    title: `${p.client} — Case Study | Zenova`,
    description: p.summary,
    h1: p.title,
    intro: p.summary,
    index: true,
    breadcrumb: [
      { name: 'Home', path: '/' },
      { name: 'Work', path: '/work' },
      { name: p.client, path: `/work/${p.slug}` },
    ],
  };
}

const SERVICES = SERVICE_DATA.map((s) => ({ slug: s.slug, title: s.title, short: s.short }));
const SERVICE_ROUTES: SeoMeta[] = SERVICES.map(serviceRouteMeta);

const PROJECTS = PROJECT_DATA.map((p) => ({
  slug: p.slug,
  client: p.client,
  title: p.title,
  summary: p.summary,
}));
const PROJECT_ROUTES: SeoMeta[] = PROJECTS.map(projectRouteMeta);

// --- Open roles (sync with src/data/jobs.ts) -------------------------------

const JOBS = JOB_DATA.map((j) => ({ slug: j.slug, title: j.title, summary: j.summary }));

const JOB_ROUTES: SeoMeta[] = JOBS.map((j) => jobRouteMeta(j));

export function jobRouteMeta(j: { slug: string; title: string; summary: string }): SeoMeta {
  return {
    path: `/careers/${j.slug}`,
    title: `${j.title} — Careers | Zenova`,
    // The role's own summary, not a template: it is real copy, it is unique per
    // role, and it is what a candidate actually sees in search results.
    description:
      j.summary ||
      `${j.title} at Zenova — a remote role. See the responsibilities, requirements, and how to apply.`,
    h1: j.title,
    intro: `We’re hiring a ${j.title}. Read the role, what you’ll own, and how to apply to join Zenova.`,
    index: true,
    breadcrumb: [
      { name: 'Home', path: '/' },
      { name: 'Careers', path: '/careers' },
      { name: j.title, path: `/careers/${j.slug}` },
    ],
  };
}

/** Every prerenderable / sitemap-eligible route, hubs before detail pages. */
export const ALL_ROUTES: SeoMeta[] = [
  ...MAIN_ROUTES,
  ...SERVICE_ROUTES,
  ...PROJECT_ROUTES,
  ...JOB_ROUTES,
];

// --- Helpers ---------------------------------------------------------------

/** Strip query/hash and trailing slashes (keeps '/'). */
export function normalizePath(pathname: string): string {
  if (!pathname) return '/';
  let p = pathname.split('?')[0].split('#')[0];
  if (p.length > 1) p = p.replace(/\/+$/, '');
  return p || '/';
}

export function isNoindexPath(pathname: string): boolean {
  const p = normalizePath(pathname);
  return NOINDEX_PREFIXES.some((pre) => p === pre || p.startsWith(pre + '/'));
}

/**
 * Canonical absolute URL for a path. Sub-pages use a trailing slash because
 * GitHub Pages serves them from `<path>/index.html` (a bare `/path` request
 * 301-redirects to `/path/`), so the trailing-slash form is the resource that
 * actually returns 200.
 */
export function canonicalUrl(path: string): string {
  const p = normalizePath(path);
  return p === '/' ? `${SITE.url}/` : `${SITE.url}${p}/`;
}

/** Resolve SEO metadata for any pathname, including gated/unknown fallbacks. */
export function resolveSeo(pathname: string): SeoMeta {
  const p = normalizePath(pathname);
  const found = ALL_ROUTES.find((r) => r.path === p);
  if (found) return found;
  if (isNoindexPath(p)) {
    return { path: p, title: 'Zenova', description: SITE.description, h1: 'Zenova', intro: '', index: false };
  }
  return {
    path: p,
    title: 'Page not found — Zenova',
    description: 'The page you’re looking for doesn’t exist. Head back to zenova.agency.',
    h1: 'Page not found',
    intro: '',
    index: false,
  };
}

// --- JSON-LD ---------------------------------------------------------------

const ORG_ID = `${SITE.url}/#organization`;
const SITE_ID = `${SITE.url}/#website`;

/**
 * The schema.org type that best describes each route. Google treats a
 * correctly-subtyped WebPage as a stronger signal than a bare one, and answer
 * engines use it to decide which page answers "contact", "about", "pricing".
 */
function pageTypeFor(path: string): string {
  if (path === '/about') return 'AboutPage';
  if (path === '/contact') return 'ContactPage';
  if (path === '/privacy' || path === '/terms') return 'WebPage';
  if (path === '/blog') return 'CollectionPage';
  if (path === '/services' || path === '/work' || path === '/careers') return 'CollectionPage';
  if (path === '/pricing') return 'CollectionPage';
  // Detail routes describe a single item.
  if (/^\/(services|work|careers|blog)\//.test(path)) return 'ItemPage';
  return 'WebPage';
}

/**
 * The organisation node — the anchor of the whole graph. Every other node
 * points at it by @id rather than repeating the fields, which is what lets a
 * crawler merge all pages into one entity.
 *
 * The NAP block is appended only when BUSINESS_NAP.verified is true; see the
 * comment there for why publishing placeholder address data is worse than
 * publishing none.
 */
function organizationNode(): Record<string, unknown> {
  const node: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': BUSINESS_NAP.verified ? ['Organization', 'ProfessionalService'] : 'Organization',
    '@id': ORG_ID,
    name: SITE.name,
    legalName: SITE.legalName,
    url: `${SITE.url}/`,
    logo: {
      '@type': 'ImageObject',
      '@id': `${SITE.url}/#logo`,
      url: SITE.logo,
      caption: SITE.name,
    },
    image: SITE.ogImage,
    description: SITE.description,
    email: SITE.email,
    sameAs: SITE.sameAs,
    knowsAbout: SITE.knowsAbout,
    areaServed: { '@type': 'Place', name: SITE.areaServed },
    priceRange: SITE.priceRange,
    contactPoint: [
      {
        '@type': 'ContactPoint',
        contactType: 'sales',
        email: SITE.email,
        url: canonicalUrl('/contact'),
        availableLanguage: ['English'],
        areaServed: SITE.areaServed,
      },
      {
        '@type': 'ContactPoint',
        contactType: 'human resources',
        email: SITE.careersEmail,
        url: canonicalUrl('/careers'),
        availableLanguage: ['English'],
        areaServed: SITE.areaServed,
      },
    ],
    // The service menu, as one machine-readable list. This is the single most
    // useful node for "which agency does X" style AI queries.
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: `${SITE.name} services`,
      itemListElement: SERVICES.map((s) => ({
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          '@id': `${canonicalUrl(`/services/${s.slug}`)}#service`,
          name: s.title,
          description: s.short,
          url: canonicalUrl(`/services/${s.slug}`),
        },
      })),
    },
  };

  if (BUSINESS_NAP.verified) {
    node.address = {
      '@type': 'PostalAddress',
      streetAddress: BUSINESS_NAP.streetAddress,
      addressLocality: BUSINESS_NAP.addressLocality,
      addressRegion: BUSINESS_NAP.addressRegion,
      postalCode: BUSINESS_NAP.postalCode,
      addressCountry: BUSINESS_NAP.addressCountry,
    };
    node.telephone = BUSINESS_NAP.telephone;
  }

  return node;
}

/** JSON-LD graph for a route (empty for noindex pages). */
export function jsonLdObjects(meta: SeoMeta): Array<Record<string, unknown>> {
  if (!meta.index) return [];

  const url = canonicalUrl(meta.path);
  const hasCrumbs = Boolean(meta.breadcrumb && meta.breadcrumb.length);

  const out: Array<Record<string, unknown>> = [
    organizationNode(),
    // Emitted on every page, not just the homepage, so each page's graph
    // resolves its own isPartOf reference without a second fetch.
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      '@id': SITE_ID,
      name: SITE.name,
      url: `${SITE.url}/`,
      description: SITE.description,
      publisher: { '@id': ORG_ID },
      inLanguage: 'en-US',
    },
  ];

  const webPage: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': pageTypeFor(meta.path),
    '@id': `${url}#webpage`,
    url,
    name: meta.title,
    description: meta.description,
    isPartOf: { '@id': SITE_ID },
    about: { '@id': ORG_ID },
    inLanguage: 'en-US',
    primaryImageOfPage: {
      '@type': 'ImageObject',
      url: SITE.ogImage,
      width: SITE.ogImageWidth,
      height: SITE.ogImageHeight,
    },
  };
  if (hasCrumbs) webPage.breadcrumb = { '@id': `${url}#breadcrumb` };
  out.push(webPage);

  if (hasCrumbs) {
    out.push({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      '@id': `${url}#breadcrumb`,
      itemListElement: meta.breadcrumb!.map((c, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: c.name,
        item: canonicalUrl(c.path),
      })),
    });
  }

  // --- Listing pages: expose the collection as a real ItemList -------------

  if (meta.path === '/services') {
    out.push(
      itemList(url, 'Zenova services', SERVICES.map((s) => ({
        name: s.title,
        description: s.short,
        url: canonicalUrl(`/services/${s.slug}`),
      }))),
    );
  }

  if (meta.path === '/work') {
    out.push(
      itemList(url, 'Zenova case studies', PROJECTS.map((p) => ({
        name: `${p.client} — ${p.title}`,
        description: p.summary,
        url: canonicalUrl(`/work/${p.slug}`),
      }))),
    );
  }

  if (meta.path === '/careers') {
    out.push(
      itemList(url, 'Open roles at Zenova', JOBS.map((j) => ({
        name: j.title,
        description: `${j.title} at ${SITE.name}`,
        url: canonicalUrl(`/careers/${j.slug}`),
      }))),
    );
  }

  // --- Detail pages -------------------------------------------------------

  if (meta.path.startsWith('/services/')) {
    const slug = meta.path.slice('/services/'.length);
    const svc = SERVICES.find((s) => s.slug === slug);
    out.push({
      '@context': 'https://schema.org',
      '@type': 'Service',
      '@id': `${url}#service`,
      name: svc?.title ?? meta.h1,
      description: meta.description,
      url,
      serviceType: svc?.title ?? meta.h1,
      provider: { '@id': ORG_ID },
      brand: { '@id': ORG_ID },
      areaServed: { '@type': 'Place', name: SITE.areaServed },
      audience: {
        '@type': 'BusinessAudience',
        name: 'Startups, scale-ups, and established businesses',
      },
      mainEntityOfPage: { '@id': `${url}#webpage` },
    });
  }

  if (meta.path.startsWith('/work/')) {
    const slug = meta.path.slice('/work/'.length);
    const proj = PROJECTS.find((p) => p.slug === slug);
    out.push({
      '@context': 'https://schema.org',
      '@type': 'CreativeWork',
      '@id': `${url}#casestudy`,
      name: proj?.title ?? meta.h1,
      headline: proj?.title ?? meta.h1,
      description: meta.description,
      url,
      genre: 'Case study',
      creator: { '@id': ORG_ID },
      publisher: { '@id': ORG_ID },
      ...(proj ? { about: { '@type': 'Organization', name: proj.client } } : {}),
      mainEntityOfPage: { '@id': `${url}#webpage` },
    });
  }

  return out;
}

/** Shared shape for the three listing-page collections. */
function itemList(
  pageUrl: string,
  name: string,
  items: Array<{ name: string; description: string; url: string }>,
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    '@id': `${pageUrl}#itemlist`,
    name,
    numberOfItems: items.length,
    itemListOrder: 'https://schema.org/ItemListOrderAscending',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      description: it.description,
      url: it.url,
    })),
  };
}

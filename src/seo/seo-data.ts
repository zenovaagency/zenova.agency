/**
 * Central SEO metadata — the single source of truth for per-route <head>
 * tags, JSON-LD, the XML sitemap, and build-time prerendered HTML.
 *
 * This module is intentionally DEPENDENCY-FREE (no `@/` imports, no runtime
 * libraries, no DOM/Node APIs) so it can be imported by BOTH:
 *   - the app bundle (runtime <SeoManager>, client-side navigation), and
 *   - vite.config.ts (build-time prerender + sitemap plugin).
 *
 * Keep the detail-page maps below in sync with
 *   src/data/services.ts, src/data/projects.ts, src/data/jobs.ts
 * A short unit-style check in scripts guards against drift if you add one.
 */

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
  changefreq?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  priority?: number;
  /** Breadcrumb trail ending with the current page. Omitted on the homepage. */
  breadcrumb?: Array<{ name: string; path: string }>;
}

export const SITE = {
  url: 'https://zenova.agency',
  name: 'Zenova',
  legalName: 'Zenova Solutions, Inc.',
  description:
    'Zenova combines design, development, marketing, and startup support into one seamless partnership for ambitious modern businesses.',
  logo: 'https://zenova.agency/assets/zenova-logo.png',
  /** Absolute URL to the social share image (ideally a 1200×630 card). */
  ogImage: 'https://zenova.agency/uploads/zenova.png',
  locale: 'en_US',
  email: 'hello@zenova.bd',
  /** Declared brand profiles (rendered in the site footer). Confirm/extend. */
  sameAs: [
    'https://www.instagram.com/zenova.agency',
    'https://www.linkedin.com/company/zenova',
    'https://twitter.com/zenova',
    'https://github.com/zenova',
    'https://dribbble.com/zenova',
    'https://facebook.com/zenova',
  ],
} as const;

/** Primary navigation — reused by the prerendered crawlable fallback. */
export const NAV: Array<{ label: string; path: string }> = [
  { label: 'Services', path: '/services' },
  { label: 'Work', path: '/work' },
  { label: 'Pricing', path: '/pricing' },
  { label: 'About', path: '/about' },
  { label: 'Careers', path: '/careers' },
  { label: 'Contact', path: '/contact' },
];

/** Auth/portal path prefixes that must never be indexed. */
export const NOINDEX_PREFIXES = ['/admin', '/client', '/team', '/login', '/signin'];

// --- Main marketing routes -------------------------------------------------

const MAIN_ROUTES: SeoMeta[] = [
  {
    path: '/',
    title: 'Zenova — One agency for design, development & marketing',
    description: SITE.description,
    h1: 'Building ambitious brands with design, development & marketing',
    intro:
      'Zenova unifies design, development, marketing, and startup support into one seamless partnership — guiding ambitious modern businesses from strategy to launch and beyond.',
    index: true,
    changefreq: 'weekly',
    priority: 1.0,
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
    changefreq: 'monthly',
    priority: 0.9,
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
    changefreq: 'monthly',
    priority: 0.8,
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
    changefreq: 'monthly',
    priority: 0.9,
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
    changefreq: 'monthly',
    priority: 0.7,
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
    changefreq: 'yearly',
    priority: 0.8,
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
    changefreq: 'weekly',
    priority: 0.7,
    breadcrumb: [
      { name: 'Home', path: '/' },
      { name: 'Careers', path: '/careers' },
    ],
  },
];

// --- Service detail pages (sync with src/data/services.ts) -----------------

const SERVICES: Array<{ slug: string; title: string; short: string }> = [
  { slug: 'web', title: 'Web Development', short: 'Fast, modern websites and web apps that grow with your business.' },
  { slug: 'marketing', title: 'Marketing', short: 'Get more customers with SEO, ads, and email that actually work.' },
  { slug: 'startup', title: 'Startup Support', short: 'From idea to launch — design, build, and a path to first customers.' },
  { slug: 'ops', title: 'Operations', short: 'Smarter tools and processes so your team can do more with less.' },
  { slug: 'content', title: 'Content', short: 'Blog posts, landing copy, and emails that sound human and rank well.' },
  { slug: 'app', title: 'App Development', short: 'Native and cross-platform apps that your users will love.' },
  { slug: 'chatbot', title: 'Chatbot', short: 'AI-powered assistants that handle support, leads, and more.' },
  { slug: 'automation', title: 'Automation', short: 'Eliminate repetitive work with smart workflows and integrations.' },
];

const SERVICE_ROUTES: SeoMeta[] = SERVICES.map((s) => ({
  path: `/services/${s.slug}`,
  title: `${s.title} Services | Zenova`,
  description: s.short,
  h1: s.title,
  intro: s.short,
  index: true,
  changefreq: 'monthly',
  priority: 0.7,
  breadcrumb: [
    { name: 'Home', path: '/' },
    { name: 'Services', path: '/services' },
    { name: s.title, path: `/services/${s.slug}` },
  ],
}));

// --- Work case studies (sync with src/data/projects.ts) --------------------

const PROJECTS: Array<{ slug: string; client: string; title: string; summary: string }> = [
  { slug: 'northwind-labs', client: 'Northwind Labs', title: 'A new site and brand for a developer platform.', summary: 'A complete rebrand, a faster site, and content that brought in 2x the signups.' },
  { slug: 'aperture-health', client: 'Aperture Health', title: 'A patient portal that actually gets used.', summary: 'We replaced three vendors with one product and saved 38 minutes per appointment.' },
  { slug: 'stellar-capital', client: 'Stellar Capital', title: 'From pitch deck to funded startup in 11 weeks.', summary: 'We helped Stellar build their MVP, pitch investors, and close a $4.2M seed round.' },
  { slug: 'cobalt-studio', client: 'Cobalt Studio', title: 'A content engine that ships 4 articles a week.', summary: 'We helped Cobalt grow traffic 3x and their newsletter 5x — without paid ads.' },
  { slug: 'mosaic', client: 'Mosaic', title: 'Growth from zero to 10,000 users in 90 days.', summary: 'We helped Mosaic launch a growth program that cut their cost per user by 42%.' },
  { slug: 'verge', client: 'Verge', title: 'New billing system. Zero invoices dropped.', summary: 'We rebuilt a tangled billing system and saved their finance team two days every month.' },
];

const PROJECT_ROUTES: SeoMeta[] = PROJECTS.map((p) => ({
  path: `/work/${p.slug}`,
  title: `${p.client} — Case Study | Zenova`,
  description: p.summary,
  h1: p.title,
  intro: p.summary,
  index: true,
  changefreq: 'yearly',
  priority: 0.6,
  breadcrumb: [
    { name: 'Home', path: '/' },
    { name: 'Work', path: '/work' },
    { name: p.client, path: `/work/${p.slug}` },
  ],
}));

// --- Open roles (sync with src/data/jobs.ts) -------------------------------

const JOBS: Array<{ slug: string; title: string }> = [
  { slug: 'senior-product-designer', title: 'Senior Product Designer' },
  { slug: 'senior-engineer', title: 'Senior Engineer' },
  { slug: 'growth-strategist', title: 'Growth Strategist' },
];

const JOB_ROUTES: SeoMeta[] = JOBS.map((j) => ({
  path: `/careers/${j.slug}`,
  title: `${j.title} — Careers | Zenova`,
  description: `${j.title} at Zenova — a remote, full-time role. See the responsibilities, requirements, and how to apply.`,
  h1: j.title,
  intro: `We’re hiring a ${j.title}. Read the role, what you’ll own, and how to apply to join Zenova.`,
  index: true,
  changefreq: 'weekly',
  priority: 0.5,
  breadcrumb: [
    { name: 'Home', path: '/' },
    { name: 'Careers', path: '/careers' },
    { name: j.title, path: `/careers/${j.slug}` },
  ],
}));

/** Every prerenderable / sitemap-eligible route, in priority order. */
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

/** JSON-LD graph for a route (empty for noindex pages). */
export function jsonLdObjects(meta: SeoMeta): Array<Record<string, unknown>> {
  if (!meta.index) return [];

  const organization: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE.url}/#organization`,
    name: SITE.name,
    legalName: SITE.legalName,
    url: `${SITE.url}/`,
    logo: SITE.logo,
    description: SITE.description,
    email: SITE.email,
    sameAs: SITE.sameAs,
  };

  const out: Array<Record<string, unknown>> = [organization];

  if (meta.path === '/') {
    out.push({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      '@id': `${SITE.url}/#website`,
      name: SITE.name,
      url: `${SITE.url}/`,
      publisher: { '@id': `${SITE.url}/#organization` },
      inLanguage: 'en',
    });
  }

  if (meta.breadcrumb && meta.breadcrumb.length) {
    out.push({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: meta.breadcrumb.map((c, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: c.name,
        item: canonicalUrl(c.path),
      })),
    });
  }

  if (meta.path.startsWith('/services/')) {
    out.push({
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: meta.h1,
      description: meta.description,
      url: canonicalUrl(meta.path),
      provider: { '@id': `${SITE.url}/#organization` },
      areaServed: 'Worldwide',
    });
  }

  return out;
}

/**
 * Site content.
 *
 * Ported verbatim from the previous Zenova site (src/data/site-content.ts and
 * src/data/services.ts). This is real, hand-written copy — do not replace it
 * with generated marketing language.
 *
 * Deliberately NOT ported: the six fictional case studies, six testimonials and
 * four fictional team members, plus every remote placeholder image. Phone and
 * address stay empty; the previous codebase is explicit that the old
 * "+1 (555) 123-4567" and Brooklyn address were template filler that had been
 * published as this agency's real details.
 *
 * Also excluded: the previous site's /work page copy. Its title, description
 * and intro ("a developer-platform rebrand that doubled signups", "a launch
 * that hit 10,000 users in 90 days") are results claimed for those fictional
 * case studies. PAGES.work below keeps this site's own framing instead, which
 * describes what a client receives rather than what a client achieved.
 */

export const SITE = {
  name: 'Zenova',
  legalName: 'Zenova, Inc.',
  url: 'https://zenova.agency',
  title: 'Zenova — One agency for everything modern',
  tagline: 'Design, build, and grow — one team.',
  strapline: 'Design, build, and grow',
  description:
    'Zenova combines design, development, marketing, and startup support into one seamless partnership for ambitious modern businesses.',
  email: 'hello@zenova.agency',
  careersEmail: 'careers@zenova.agency',
  copyright: '© 2026 Zenova, Inc. All rights reserved.',
  socials: [
    { label: 'Instagram', url: 'https://instagram.com/zenova.agency' },
    { label: 'LinkedIn', url: 'https://www.linkedin.com/company/zenova' },
    { label: 'X', url: 'https://twitter.com/zenova' },
    { label: 'GitHub', url: 'https://github.com/zenova' },
    { label: 'Dribbble', url: 'https://dribbble.com/zenova' },
  ],
};

/**
 * Primary navigation. Every entry is a real route — nothing here points at an
 * in-page id, so a link works the same from any page on the site.
 */
export const NAV = [
  { label: 'Services', href: '/services' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Work', href: '/work' },
  { label: 'Careers', href: '/careers' },
  { label: 'About', href: '/about' },
];

export const HERO = {
  badge: 'Available for new projects',
  headline: 'Building ambitious brands with',
  headlineAccent: 'thoughtful design',
  sub: 'Design, development, and growth — one team, from strategy to launch.',
  primaryCta: 'Start a project',
  primaryHref: '/contact',
  // Back to /work now that PROJECTS ships entries. If those are ever removed
  // and the portfolio empties out again, point this at /services instead: a
  // hero button landing on an empty state is worse than no second button.
  secondaryCta: 'See our work',
  secondaryHref: '/work',
};

export const MARQUEE = [
  'Branding',
  'Web Design',
  'SEO',
  'Paid Ads',
  'Email',
  'Content',
  'Strategy',
  'Operations',
];

/**
 * The four service slugs are the spine of the site: they key SERVICES,
 * PRICING and DELIVERABLES, and they are the path segment for every
 * /services/... and /pricing/... route. Typing them as a union turns a bad
 * join into a compile error instead of a section that silently renders empty.
 */
export type ServiceSlug = 'web' | 'app' | 'ai' | 'marketing';

/**
 * The line-art drawings in components/ui/Motif.astro.
 *
 * The first four belong to the four services and are the only ones SERVICES
 * uses. The second four exist for projects, so that a project card sitting on
 * /services/<slug> never repeats the drawing in the hero panel directly above
 * it. Nothing enforces that split — it is a convention, and the reason to keep
 * to it is that a repeated drawing reads as a rendering bug rather than a
 * house style.
 */
export type MotifKind =
  | 'browser'
  | 'phone'
  | 'flow'
  | 'chart'
  | 'dashboard'
  | 'cart'
  | 'inbox'
  | 'editor';

export interface Service {
  n: string;
  slug: ServiceSlug;
  title: string;
  short: string;
  hero: string;
  bullets: string[];
  stat: { value: string; label: string };
  meta: [string, string][];
  stack: string[];
  angle: string;
  motif: MotifKind;
}

/**
 * The four services. Copy, stats, phases and stacks are the real ones.
 * "AI Development" is presented as AI Automation and "Marketing" as Digital
 * Marketing, per the brief; Startup Support is out of scope for this page.
 *
 * `angle` rotates each card's gradient so the four never read as one repeated
 * asset, and `motif` picks the abstract visual drawn inside the card.
 */
export const SERVICES: Service[] = [
  {
    n: '01',
    slug: 'web',
    title: 'Web Development',
    short: 'Fast, modern websites and web apps that grow with your business.',
    hero: 'We build websites that load fast, look great, and are easy for your team to update.',
    bullets: ['Modern web apps', 'Easy-to-edit content', 'Fast and optimized', 'Built-in analytics'],
    stat: { value: '<1.2s', label: 'Average load time' },
    meta: [
      ['<1.2s', 'Load time'],
      ['6–10 wks', 'Build time'],
      ['100%', 'Mobile ready'],
      ['12 mo', 'Free support'],
    ],
    stack: ['Next.js', 'TypeScript', 'Tailwind', 'Vercel', 'Sanity CMS'],
    angle: '135deg',
    motif: 'browser',
  },
  {
    n: '02',
    slug: 'app',
    title: 'App Development',
    short: 'Native and cross-platform apps that your users will love.',
    hero: 'We design and build mobile apps that are fast, reliable, and delightful to use.',
    bullets: ['iOS and Android', 'Cross-platform', 'App store launch', 'Ongoing support'],
    stat: { value: '4.8★', label: 'Average app rating' },
    meta: [
      ['4.8★', 'Avg rating'],
      ['8–14 wks', 'Build time'],
      ['2', 'Platforms'],
      ['30 d', 'Free support'],
    ],
    stack: ['React Native', 'Flutter', 'Swift', 'Kotlin', 'Firebase', 'Supabase'],
    angle: '200deg',
    motif: 'phone',
  },
  {
    n: '03',
    slug: 'ai',
    title: 'AI Automation',
    short: 'Custom AI agents, chatbots, and automations wired into your business.',
    hero: 'We build AI that does real work — agents, chatbots, and automations trained on your data and connected to your tools.',
    bullets: ['AI chat agents', 'Workflow automation', 'Custom model training', 'Tool integrations'],
    stat: { value: '73%', label: 'Auto-resolve rate' },
    meta: [
      ['73%', 'Auto-resolve'],
      ['24/7', 'Availability'],
      ['5 min', 'Setup time'],
      ['3', 'Languages'],
    ],
    stack: ['OpenAI', 'LangChain', 'Python', 'Zapier', 'Make', 'Slack API'],
    angle: '310deg',
    motif: 'flow',
  },
  {
    n: '04',
    slug: 'marketing',
    title: 'Digital Marketing',
    short: 'Get more customers with SEO, ads, and email that actually work.',
    hero: 'We help you grow your audience and bring in real customers — not just clicks.',
    bullets: ['SEO that ranks', 'Paid ads that convert', 'Email automation', 'Clear reports'],
    stat: { value: '3.4×', label: 'Average growth in 90 days' },
    meta: [
      ['3.4×', 'Avg growth'],
      ['90 days', 'To see results'],
      ['1', 'Simple dashboard'],
      ['24/7', 'Tracking'],
    ],
    stack: ['HubSpot', 'Google Ads', 'Meta Ads', 'Mailchimp', 'GA4', 'Ahrefs'],
    angle: '25deg',
    motif: 'chart',
  },
];

export const PROCESS = {
  eyebrow: 'How we work',
  title: 'A simple process,',
  titleAccent: 'start to finish.',
  sub: 'Four phases in constant motion.',
  steps: [
    {
      n: '01',
      title: 'Discover',
      timeline: 'Week 1',
      blurb: 'A working session to align on your goals, audience, and what success looks like.',
      deliverables: ['Goals workshop', 'Project plan', 'Timeline', 'Success metrics'],
    },
    {
      n: '02',
      title: 'Design',
      timeline: 'Week 2–4',
      blurb: 'Brand, layout, and product design in one shared file. You see what we see, every day.',
      deliverables: ['Brand identity', 'Page designs', 'Prototype', 'Design review'],
    },
    {
      n: '03',
      title: 'Build',
      timeline: 'Week 4–8',
      blurb: 'We build it in small pieces with weekly demos. Code is yours, written to be easy to maintain.',
      deliverables: ['Working website', 'CMS setup', 'Speed optimization', 'Handoff docs'],
    },
    {
      n: '04',
      title: 'Grow',
      timeline: 'Month 2+',
      blurb: 'After launch we stay involved. Monthly cycles of marketing, SEO, and content to build on what we shipped.',
      deliverables: ['Ad campaigns', 'SEO and content', 'Email automation', 'Monthly report'],
    },
  ],
};

export const FAQS = [
  {
    q: 'How are you different from an agency?',
    a: 'One team handles design, build, and growth. No handoffs between vendors — same people from start to finish.',
  },
  {
    q: 'How long is a typical project?',
    a: '6 to 10 weeks for a build. Many clients stay on monthly for ongoing growth work.',
  },
  {
    q: 'Do we own the code and designs?',
    a: 'Yes. Everything sits in your accounts from day one — your GitHub, your Figma, your domain.',
  },
  {
    q: 'How does pricing work?',
    a: 'Flat fee per phase for builds. Flat monthly fee for ongoing work. No hourly billing.',
  },
  {
    q: 'Can you work with our team?',
    a: 'Yes. We often plug into existing teams and follow your conventions.',
  },
  { q: 'How soon can we start?', a: 'Usually 1 to 2 weeks after our intro call.' },
];

/**
 * The three principles. `title` and `blurb` are the original, real copy and
 * run on the home page and /about; `body` was written for /about/values,
 * which needs more than one line per principle to be worth its own page.
 *
 * Each body names what the principle actually costs. A values page that only
 * makes claims is indistinguishable from every other values page.
 */
export interface Value {
  title: string;
  blurb: string;
  body: string;
}

export const VALUES: Value[] = [
  {
    title: 'One team, start to finish',
    blurb: 'The people you meet on day one are the same people on day ninety. No handoffs.',
    body: 'Most studios sell a senior team and staff a junior one. We do not have the bench to do that even if we wanted to: the people who scope your project are the people who design it, build it, and answer the phone after launch. It is the reason we stay small, and the reason we turn down work that would need a larger team moving in parallel.',
  },
  {
    title: 'Build, then talk',
    blurb: 'We ship working things, not decks about working things.',
    body: 'Slides are cheap and easy to agree with. A working page is neither, which is why we get to one early — usually inside the first fortnight. Weekly demos replace status reports, and every review happens against something you can click rather than something you have to picture. It front-loads the disagreements, which is the point.',
  },
  {
    title: 'Outcomes over output',
    blurb: 'Every project ends with one number we agreed to move. We share it either way.',
    body: 'Before anything gets designed we agree on one number the work is meant to move — signups, load time, support volume, whatever the project is actually for. We report it at the end whether it moved or not. A project that shipped on time and changed nothing is not a success, and calling it one helps nobody.',
  },
];

export const CTA = {
  eyebrow: 'Open for new projects',
  title: 'Got an idea?',
  accent: "Let's talk.",
  sub: 'A quick 30-minute call. No pitch, just your project.',
  primary: 'Book a call',
  primaryHref: '/contact',
  secondary: SITE.email,
  secondaryHref: `mailto:${SITE.email}`,
};

/**
 * What a client actually receives. Real deliverable copy, lifted from the
 * `deliverables` arrays of the previous site.
 *
 * This is the page's proof section. It is built from things we ship rather
 * than from client logos or testimonials, because the only case studies and
 * quotes on the old site were acknowledged placeholders.
 */
export interface Deliverable {
  /** The join to SERVICES. Compile-checked, unlike matching on `label`. */
  service: ServiceSlug;
  /** Display text — the home rail prints this as the card eyebrow. */
  label: string;
  title: string;
  blurb: string;
  art: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
}

export const DELIVERABLES: Deliverable[] = [
  {
    service: 'web',
    label: 'Web',
    title: 'Your website',
    blurb: 'A complete site, fully built and ready to use.',
    art: 1,
  },
  {
    service: 'web',
    label: 'Web',
    title: 'Easy editing',
    blurb: 'A simple admin so your team can update content without us.',
    art: 2,
  },
  {
    service: 'app',
    label: 'App',
    title: 'Working app',
    blurb: 'A fully functional app published on the App Store and Google Play.',
    art: 3,
  },
  {
    service: 'app',
    label: 'App',
    title: 'Backend setup',
    blurb: 'APIs, databases, and auth — everything your app needs to run.',
    art: 4,
  },
  {
    service: 'ai',
    label: 'AI',
    title: 'Working chatbot',
    blurb: 'A trained bot deployed on your website or platform of choice.',
    art: 5,
  },
  {
    service: 'ai',
    label: 'AI',
    title: 'Conversation flows',
    blurb: 'Designed dialogues for common scenarios and edge cases.',
    art: 6,
  },
  {
    service: 'marketing',
    label: 'Marketing',
    title: 'Growth strategy',
    blurb: 'A clear plan focused on the channels that work for your business.',
    art: 7,
  },
  {
    service: 'marketing',
    label: 'Marketing',
    title: 'Reporting',
    blurb: 'One dashboard. Real numbers. Updated daily.',
    art: 8,
  },
];

/* ------------------------------------------------------------------ *
 * Page copy for the four nav routes.
 *
 * Held here rather than inside each page so PageHero stays presentational
 * and every headline on the site is editable from one file.
 *
 * `wash` selects one of four radial recipes in PageHero. They differ on
 * purpose: four pages opening with an identical gradient is the point at
 * which a design system starts reading as a template.
 * ------------------------------------------------------------------ */
export interface PageIntro {
  eyebrow: string;
  headline: string;
  accent: string;
  sub: string;
  /**
   * Numbered recipes belong to section index pages, one each. Detail pages
   * do not get their own number — they pass an `angle` to PageHero instead,
   * which rotates a single shared recipe. Twelve more numbered washes would
   * be twelve more things to keep in contrast budget for no gain.
   */
  wash: 1 | 2 | 3 | 4 | 5;
  title: string;
  description: string;
}

/** The five section index pages, plus the two About sub-pages. */
export type PageKey =
  | 'services'
  | 'pricing'
  | 'work'
  | 'careers'
  | 'about'
  | 'story'
  | 'values';

export const PAGES: Record<PageKey, PageIntro> = {
  services: {
    eyebrow: 'What we do',
    headline: 'Everything you need,',
    accent: 'under one roof.',
    // The ported intro closed with "Explore what Zenova can build for you."
    // Dropped: it instructs rather than informs, and the sentence before it
    // already carries the whole claim.
    sub: 'From first sketch to launch and growth: design, development, marketing, and the operational muscle to scale.',
    wash: 1,
    title: 'Services — Web, App, AI & Marketing | Zenova',
    // Rewritten from the previous site's description, which still listed
    // services this site does not offer (startup support, content, ops).
    description:
      'Web development, app development, AI automation, and digital marketing — what each one includes, what it costs in time, and what you own at the end.',
  },
  /*
   * Rewritten when /work became a portfolio. Its previous copy ("Not a deck.
   * Working things.") described deliverables, and still runs verbatim on the
   * home rail — see components/home/Deliverables.astro. The deliverables
   * themselves now sit on the service that ships them.
   *
   * This copy deliberately promises no results. Until PROJECTS has a
   * non-draft entry the page renders WORK_COPY's empty state, and a headline
   * claiming outcomes above it would be the fictional case studies again by
   * another route.
   */
  work: {
    eyebrow: 'Selected work',
    headline: 'The projects,',
    accent: 'written up properly.',
    sub: 'What the brief was, what we built, and what shipped at the end of it — one page per project.',
    wash: 2,
    title: 'Work — Selected Projects | Zenova',
    description:
      'Recent Zenova projects across web, apps, AI automation and digital marketing: the brief, the build, and the outcome for each.',
  },
  careers: {
    eyebrow: 'Careers',
    headline: 'Small team,',
    accent: 'wide remit.',
    sub: 'We hire people who can take something from sketch to shipped without a handoff at every step. That makes hiring rare and deliberate.',
    wash: 3,
    title: 'Careers — Work at Zenova | Zenova',
    description:
      'Open roles at Zenova, how we hire, and what it is like on a team that designs, builds and grows in one place.',
  },
  about: {
    eyebrow: 'About',
    headline: 'One team,',
    accent: 'start to finish.',
    sub: 'A small studio that designs, builds and grows digital products — the same people from the first call to the ninetieth day.',
    wash: 5,
    title: 'About — One Team, Start to Finish | Zenova',
    description:
      'Who Zenova is, how the studio runs an engagement, and the three principles behind every project we take on.',
  },
  story: {
    eyebrow: 'Our story',
    headline: 'Why the studio',
    accent: 'works this way.',
    sub: 'Most projects do not fail in design or in build. They fail in the gaps between them. Removing those gaps is the whole reason Zenova is shaped the way it is.',
    wash: 5,
    title: 'Our Story | Zenova',
    description:
      'Why Zenova runs design, development and growth as one team rather than three vendors, and what that changes about how a project goes.',
  },
  values: {
    eyebrow: 'What we hold to',
    headline: 'Three principles,',
    accent: 'applied literally.',
    sub: 'Not wall art. Each one costs us something specific — work we turn down, numbers we publish, hours we do not bill.',
    wash: 5,
    title: 'Our Values | Zenova',
    description:
      'One team start to finish, build then talk, outcomes over output — the three principles behind how Zenova scopes and runs work.',
  },
  pricing: {
    eyebrow: 'Pricing — project-based · one-time',
    headline: 'One project.',
    accent: 'One price.',
    sub: 'No retainers, no hourly surprises. Every engagement is scoped once, priced once, and shipped as a project.',
    wash: 4,
    title: 'Pricing — Transparent, Project-Based Rates | Zenova',
    description:
      'Clear, project-based pricing for web, apps, AI automation, and marketing. Starter, growth, and custom tiers — and exactly what each one includes.',
  },
};

/* ------------------------------------------------------------------ *
 * Rate cards.
 *
 * Ported from the previous site's src/data/pricing.ts. These are the real
 * published prices — never regenerate or "refresh" them.
 *
 * Two changes on the way over. The `startup` card is dropped, matching the
 * decision to leave Startup Support out of SERVICES. And `hue` is dropped:
 * those were the previous site's flat palette (#1e5ea7, #4d3589 — the second
 * is purple and belongs to no ramp here). Each service already carries an
 * `angle` in SERVICES, which is what tints its cards on this site.
 *
 * `price` is deliberately free-form. "$8k", "from $24k" and "Custom" are
 * three different commercial claims, and lib/schema.ts keeps them apart when
 * building structured data.
 * ------------------------------------------------------------------ */
export interface PricingPlan {
  id: string;
  name: string;
  info: string;
  /** One-time, project-based price — "$8k", "from $24k", or "Custom". */
  price: string;
  timeline: string;
  features: string[];
  cta: string;
  highlighted?: boolean;
}

export interface PricingService {
  slug: ServiceSlug;
  label: string;
  plans: PricingPlan[];
}

export const PRICING: PricingService[] = [
  {
    slug: 'web',
    label: 'Web Development',
    plans: [
      {
        id: 'web-1',
        name: 'Starter site',
        info: 'A clean, fast site for new businesses and small teams.',
        price: '$8k',
        timeline: '4 – 6 weeks',
        features: ['Up to 6 pages', 'Mobile-friendly design', 'Basic CMS', '30-day support'],
        cta: 'Start this project',
      },
      {
        id: 'web-2',
        name: 'Growth site',
        info: 'A full rebuild for companies replacing an outdated site.',
        price: 'from $24k',
        timeline: '6 – 10 weeks',
        features: [
          'Up to 12 pages',
          'Full CMS + admin',
          'Custom animations',
          'Built-in analytics',
          '90-day support',
        ],
        cta: 'Start this project',
        highlighted: true,
      },
      {
        id: 'web-3',
        name: 'Custom build',
        info: 'Complex products, portals, and web apps — scoped to fit.',
        price: 'Custom',
        timeline: 'Scoped per project',
        features: ['Custom features', 'Third-party integrations', 'Team training', 'Ongoing support'],
        cta: 'Scope it with us',
      },
    ],
  },
  {
    slug: 'app',
    label: 'App Development',
    plans: [
      {
        id: 'app-1',
        name: 'MVP',
        info: 'Test your idea with real users on one platform.',
        price: 'from $20k',
        timeline: '8 weeks',
        features: ['Core features', '1 platform', 'App store launch', '30-day support'],
        cta: 'Start this project',
      },
      {
        id: 'app-2',
        name: 'Full app',
        info: 'A polished launch on both platforms.',
        price: 'from $45k',
        timeline: '12 weeks',
        features: [
          'All features',
          'iOS + Android',
          'Full design system',
          'Backend + APIs',
          '90-day support',
        ],
        cta: 'Start this project',
        highlighted: true,
      },
      {
        id: 'app-3',
        name: 'Product suite',
        info: 'Complex apps with integrations and compliance needs.',
        price: 'Custom',
        timeline: 'Scoped per project',
        features: ['Custom architecture', 'Integrations', 'Security review', 'Team training'],
        cta: 'Scope it with us',
      },
    ],
  },
  {
    slug: 'ai',
    label: 'AI Automation',
    plans: [
      {
        id: 'bot-1',
        name: 'Quick bot',
        info: 'Test AI support on a single channel.',
        price: '$6k',
        timeline: '3 weeks',
        features: ['Basic flows', '1 channel', 'Training data prep', '2-week monitoring'],
        cta: 'Start this project',
      },
      {
        id: 'bot-2',
        name: 'Full assistant',
        info: 'A trained agent across your support channels.',
        price: 'from $15k',
        timeline: '6 weeks',
        features: [
          'Custom training',
          'Multi-channel',
          'CRM integration',
          'Analytics',
          '30-day tuning',
        ],
        cta: 'Start this project',
        highlighted: true,
      },
      {
        id: 'bot-3',
        name: 'Enterprise',
        info: 'Fine-tuned models with compliance and on-premise options.',
        price: 'Custom',
        timeline: 'Scoped per project',
        features: ['Fine-tuned LLM', 'On-premise deploy', 'Compliance review', 'Dedicated support'],
        cta: 'Scope it with us',
      },
    ],
  },
  {
    slug: 'marketing',
    label: 'Digital Marketing',
    plans: [
      {
        id: 'mkt-1',
        name: 'Growth audit',
        info: 'A deep look at your funnel with quick wins you can ship now.',
        price: '$5k',
        timeline: '3 weeks',
        features: ['Channel + funnel audit', 'Tracking setup', 'Quick-win fixes', '90-day roadmap'],
        cta: 'Start this project',
      },
      {
        id: 'mkt-2',
        name: '90-day sprint',
        info: 'A focused push across two channels to find what converts.',
        price: 'from $18k',
        timeline: '12 weeks',
        features: [
          '2 ad channels',
          'Weekly experiments',
          'Ad creative included',
          'SEO foundations',
          'Live dashboard',
        ],
        cta: 'Start this project',
        highlighted: true,
      },
      {
        id: 'mkt-3',
        name: 'Full launch',
        info: 'Multi-channel go-to-market for a product or rebrand.',
        price: 'Custom',
        timeline: 'Scoped per project',
        features: ['All channels', 'Senior strategy', 'Content + creative', 'Team handoff'],
        cta: 'Scope it with us',
      },
    ],
  },
];

/** Assurances that apply to every engagement — the flat-rate promise, spelled out. */
export const TRUST = [
  {
    title: 'Fixed quote',
    body: 'One number, agreed after scoping. It only moves if the scope does.',
  },
  {
    title: 'No retainers',
    body: 'Project-based, not open-ended. No hourly surprises on the invoice.',
  },
  {
    title: 'Senior team',
    body: 'The people who scope your project are the ones who build it.',
  },
  {
    title: 'Support included',
    body: 'Every tier ships with a post-launch support window baked in.',
  },
];

/**
 * Pricing-specific questions. Separate from FAQS on purpose — these are the
 * ones that come up before a scoping call, not the ones about the agency.
 */
export const PRICING_FAQ = [
  {
    q: 'What does the price actually include?',
    a: 'Everything needed to ship the scope we agree on — strategy, design, build, and launch. If it is in the scope, it is in the price.',
  },
  {
    q: 'What if my project does not fit a listed tier?',
    a: 'Most do not fit exactly — the rate cards are honest starting points. Book a scoping call and we will shape a fixed quote around your actual needs.',
  },
  {
    q: 'How do payments work?',
    a: 'Typically split across milestones — a deposit to start, then staged payments as we ship. The full schedule is laid out in your proposal.',
  },
];

export const PRICING_COPY = {
  trustTitle: 'What every engagement includes',
  faqTitle: 'Pricing,',
  faqAccent: 'answered.',
  faqSub: 'The questions we get before every scoping call. If yours is not here, just ask.',
  noteLabel: 'Good to know',
  noteTitle: 'Every quote is fixed',
  noteAccent: 'before we start.',
  noteSub:
    'The rate cards are honest starting points. One scoping call turns them into a fixed quote and a real timeline.',
  notePrimary: 'Book a scoping call',
  notePrimaryHref: '/contact',
  // Pointed at /process until that page was removed; the four phases now
  // live only on the home page, so this sends readers to /about instead.
  noteSecondary: 'How we work',
  noteSecondaryHref: '/about',
};

/* ------------------------------------------------------------------ *
 * About.
 *
 * New copy, written for this restructure. It is editorial — how the studio
 * is shaped and why — and deliberately contains no clients, no testimonials,
 * no team members and no metrics, because none of those exist here in a form
 * that could be published. See this file's header for what was purged.
 * ------------------------------------------------------------------ */
export const ABOUT = {
  lede: 'Zenova is a small studio that designs, builds, and grows digital products. Four disciplines — web, apps, AI automation, and marketing — run by one team rather than four vendors briefing each other.',
  story: [
    {
      n: '01',
      heading: 'Why we work this way',
      body: 'Most projects do not fail in design or in build. They fail in the gaps between them — the handoff from the studio that made the brand, to the shop that wrote the code, to the consultant who ran the ads. Every gap is a re-explanation, and every re-explanation loses something. Zenova exists to remove the gaps, which mostly means staying small enough not to need them.',
    },
    {
      n: '02',
      heading: 'What that means in practice',
      body: 'One team from the first call to the last. A flat fee per phase instead of hourly billing, so nobody is rewarded for taking longer. Weekly demos against working software instead of status decks. And everything in your accounts — your GitHub, your Figma, your domain — from day one, so leaving is always an option you actually have.',
    },
    {
      n: '03',
      heading: 'Who we are a good fit for',
      body: 'Companies replacing something that no longer fits: an outdated site, a manual process, a product that outgrew its first build. We are a good fit when the scope is real and the person who can decide is in the room. We are a poor fit when the work needs a large team moving in parallel, or when what is wanted is a deck rather than a thing. We will tell you which it is on the first call.',
    },
  ],
  storyCta: 'Read the longer version',
  valuesTitle: 'What we hold to',
  valuesCta: 'How each one plays out',
};

/* ------------------------------------------------------------------ *
 * Careers.
 *
 * Also new copy. JOBS lives in data/jobs.ts and is empty by design — this
 * page says so rather than collecting applications for roles that do not
 * exist.
 * ------------------------------------------------------------------ */
export const CAREERS = {
  lede: 'We are small, so every hire changes what the studio can take on. That makes hiring slow, deliberate, and worth doing properly.',
  perksTitle: 'What the job is actually like',
  perks: [
    {
      title: 'Own the whole thing',
      blurb: 'You scope, build, and ship. Nobody inherits a ticket queue here — the team is too small for one to form.',
    },
    {
      title: 'No account layer',
      blurb: 'You are in the room where the work gets decided, talking to the client directly.',
    },
    {
      title: 'Real deadlines, sane hours',
      blurb: 'Projects are scoped once and priced once. That is most of what keeps crunch out of them.',
    },
    {
      title: 'Work you can show',
      blurb: 'What we ship is public-facing and creditable. You leave with a portfolio, not an NDA.',
    },
  ],
  hiringTitle: 'How we hire',
  hiring: [
    {
      n: '01',
      title: 'Send your work',
      blurb: 'Three things you built, and one line each on which part was yours. No cover letter.',
    },
    {
      n: '02',
      title: 'A call',
      blurb: 'Thirty minutes on what you want to be doing and what we actually need. Both directions.',
    },
    {
      n: '03',
      title: 'A paid exercise',
      blurb: 'A small, real piece of scope, paid at our day rate. Never spec work, never unpaid.',
    },
    {
      n: '04',
      title: 'An answer',
      blurb: 'Yes or no within a week, with the reasons either way.',
    },
  ],
  openTitle: 'Open roles',
  emptyTitle: 'No open roles',
  emptyAccent: 'right now.',
  emptyBody: 'We would rather say so than keep a page of listings warm for roles that do not exist. If you would fit here anyway, send your work and we will keep it on file.',
  applyCta: 'Send us your work',
};

/* ------------------------------------------------------------------ *
 * Work.
 *
 * The empty state IS the page until PROJECTS has a non-draft entry, so it
 * carries the whole route. It says why there is nothing here yet and sends
 * the reader somewhere that does have substance.
 * ------------------------------------------------------------------ */
export const WORK_COPY = {
  /**
   * The heading over the project index. Deliberately carries no count: the
   * demos are temporary, and a number written into the copy goes stale the
   * moment PROJECTS changes. It doubles as the affordance for the index rows,
   * which are links but do not look like buttons.
   */
  indexTitle: 'Open any one',
  indexAccent: 'for the full write-up.',
  emptyTitle: 'The case studies are',
  emptyAccent: 'still being written.',
  emptyBody: 'We are writing up recent engagements properly rather than posting client logos without permission or numbers we cannot stand behind. Until they are ready, the clearest picture of what we ship is the deliverables on each service page.',
  emptyPrimary: 'See what we ship',
  emptyPrimaryHref: '/services',
  emptySecondary: 'Start a project',
  emptySecondaryHref: '/contact',
  /**
   * Shown above the grid while any entry in PROJECTS is `demo: true`. It says
   * so out loud rather than letting a reader mistake a sample build for a
   * client engagement, and it stops rendering by itself once the demos are
   * replaced with real work.
   */
  demoNote:
    'These are sample builds, shown while the real case studies are being written up. They are our own projects, not client work, and they claim no results.',
};

/**
 * The ownership promise. Moved off /work together with the deliverables it
 * describes, and now closes each service detail page beside them.
 */
export const OWNERSHIP = {
  title: 'All of it lands in',
  accent: 'your accounts',
  body: 'Your GitHub, your Figma, your domain — from day one, not at handoff. Everything above is yours to run, change, or take elsewhere.',
};

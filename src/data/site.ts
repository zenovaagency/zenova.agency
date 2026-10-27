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
  title: 'Zenova — Software development studio for web, apps and AI',
  tagline: 'Websites, apps and AI automation, designed and built by one team.',
  strapline: 'Design, build, and grow',
  description:
    'Zenova is a software development studio. We design and build websites, web and mobile apps, AI automation and digital marketing for businesses — one team, a fixed price per phase, and everything in your name.',
  email: 'hello@zenova.agency',
  /**
   * Where every "Book a 30-min call" button goes: our Calendly page, opened
   * in a new tab. It is a link, not an embed.
   */
  calendlyUrl: 'https://calendly.com/zenova',
  /**
   * Where the contact form POSTs its brief: the Vercel Function in
   * api/contact.ts, which emails it to us through Resend. If emptied, the form
   * falls back to opening the visitor's mail client with the brief filled in.
   */
  contactEndpoint: '/api/contact',
  careersEmail: 'careers@zenova.agency',
  copyright: '© 2026 Zenova, Inc. All rights reserved.',
  socials: [
    { label: 'Instagram', url: 'https://instagram.com/zenova.agency' },
    { label: 'LinkedIn', url: 'https://www.linkedin.com/company/zenovahq' },
    { label: 'X', url: 'https://twitter.com/zenova' },
    { label: 'GitHub', url: 'https://github.com/zenovaagency' },
    { label: 'Dribbble', url: 'https://dribbble.com/zenova' },
  ],
};

/**
 * Primary navigation. Every entry is a real route — nothing here points at an
 * in-page id, so a link works the same from any page on the site.
 *
 * The header carries the two halves of the business — what we build for
 * clients (Services) and what we build for ourselves (Products) — then the
 * proof (Work) and who we are (About). Blog and Careers are secondary and
 * live in the footer, the sitemap and PageNav's chain.
 */
export const NAV = [
  { label: 'Services', href: '/services' },
  { label: 'Products', href: '/products' },
  { label: 'Works', href: '/work' },
  { label: 'About', href: '/about' },
];

export const HERO = {
  eyebrow: 'Software development studio',
  headline: 'We design and build software',
  headlineAccent: 'for ambitious businesses.',
  sub: 'Websites, web and mobile apps, AI automation and digital marketing — one team from first call to launch, a fixed price per phase, and everything in your name.',
  primaryCta: 'Start a project',
  primaryHref: '/contact',
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
 * SCOPES and DELIVERABLES, and they are the path segment for every
 * /services/... route. Typing them as a union turns a bad
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
  /**
   * Three facts for the strip on /services/<slug>, as [value, label]. Every
   * value is lifted from SCOPES below or from OWNERSHIP, never a measured
   * result: the previous figures here (73% auto-resolve, a 4.8★ average,
   * 3.4× growth, <1.2s loads) had no published source and were removed.
   * No prices either: pricing is agreed on a call, never published.
   */
  meta: [string, string][];
  stack: string[];
  angle: string;
  motif: MotifKind;
}

/**
 * The four services. Copy, phases and stacks are the real ones.
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
    short: 'Marketing sites and web apps that load fast and that your team can update without us.',
    hero: 'We build websites that load fast, look great, and are easy for your team to update.',
    bullets: ['Marketing sites and web apps', 'Easy-to-edit content (CMS)', 'Performance and SEO basics', 'Analytics set up'],
    meta: [
      ['4–10 wks', 'Typical build'],
      ['30–90 days', 'Support included'],
      ['Yours', 'Code and accounts'],
    ],
    stack: ['Next.js', 'TypeScript', 'Tailwind', 'Vercel', 'Sanity CMS'],
    angle: '135deg',
    motif: 'browser',
  },
  {
    n: '02',
    slug: 'app',
    title: 'App Development',
    short: 'iOS and Android apps, with the backend they run on, taken through to the app stores.',
    hero: 'We design and build mobile apps that are fast, reliable, and pleasant to use.',
    bullets: ['iOS and Android', 'Cross-platform builds', 'App Store and Google Play launch', 'Backend, APIs and auth'],
    meta: [
      ['8–12 wks', 'Typical build'],
      ['30–90 days', 'Support included'],
      ['Yours', 'Code and accounts'],
    ],
    stack: ['React Native', 'Flutter', 'Swift', 'Kotlin', 'Firebase', 'Supabase'],
    angle: '200deg',
    motif: 'phone',
  },
  {
    n: '03',
    slug: 'ai',
    title: 'AI Automation',
    short: 'AI assistants and workflow automations that answer from your own content and plug into the tools you use.',
    hero: 'We build AI that does real work — assistants, chatbots and automations that answer from your own content and connect to your tools.',
    bullets: ['AI chat assistants', 'Workflow automation', 'Trained on your own content', 'CRM and tool integrations'],
    meta: [
      ['3–6 wks', 'Typical build'],
      ['2–4 wks', 'Monitoring and tuning'],
      ['Yours', 'Data and accounts'],
    ],
    stack: ['OpenAI', 'LangChain', 'Python', 'Zapier', 'Make', 'Slack API'],
    angle: '310deg',
    motif: 'flow',
  },
  {
    n: '04',
    slug: 'marketing',
    title: 'Digital Marketing',
    short: 'SEO, paid ads and email, planned around the channels that suit your business and reported plainly.',
    hero: 'We help you reach the people who buy from you, and report what each channel actually brings in.',
    bullets: ['SEO foundations', 'Paid ad campaigns', 'Email automation', 'Clear reporting'],
    meta: [
      ['3–12 wks', 'Audit to sprint'],
      ['Weekly', 'Experiments in a sprint'],
      ['Yours', 'Ad and analytics accounts'],
    ],
    stack: ['HubSpot', 'Google Ads', 'Meta Ads', 'Mailchimp', 'GA4', 'Ahrefs'],
    angle: '25deg',
    motif: 'chart',
  },
];

/**
 * The four phases. Timelines are typical for a mid-sized website and are
 * labelled that way; the proposal for a given project sets the real ones.
 */
export const PROCESS = {
  eyebrow: 'How a project runs',
  title: 'Four phases,',
  titleAccent: 'each one signed off.',
  sub: 'You approve the scope before design starts, and the design before anything is built. No phase begins on an assumption.',
  note: 'Week ranges are typical for a mid-sized website. Your proposal sets the real timeline.',
  steps: [
    {
      n: '01',
      title: 'Discovery',
      timeline: 'Typically week 1',
      blurb: 'A working session on your goals, customers and constraints. You get a written scope, a fixed price for each phase and a timeline to approve.',
      deliverables: ['Written scope', 'Fixed price per phase', 'Timeline', 'The one number to move'],
    },
    {
      n: '02',
      title: 'Design',
      timeline: 'Weeks 2–4',
      blurb: 'Pages and key screens in a shared Figma file you can comment on at any time. Nothing is built until you approve it.',
      deliverables: ['Page and screen designs', 'Clickable prototype', 'Design sign-off'],
    },
    {
      n: '03',
      title: 'Build and test',
      timeline: 'Weeks 4–8',
      blurb: 'Built in small pieces with a demo every week, and tested on real phones and browsers as we go. You review working software, not status reports.',
      deliverables: ['Weekly demos', 'Device and browser testing', 'CMS or admin set up', 'Handover docs'],
    },
    {
      n: '04',
      title: 'Launch and support',
      timeline: 'Launch, then 30–90 days',
      blurb: 'We launch, watch it closely and fix what comes up. Every build includes a support window, and ongoing work can continue on a flat monthly fee.',
      deliverables: ['Launch checklist', 'Included support window', 'Every account in your name', 'Optional monthly work'],
    },
  ],
};

/**
 * Questions a buyer asks before signing, answered from the scope options
 * in SCOPES and the ownership terms in OWNERSHIP. If either of those
 * changes, these answers have to change with it.
 */
export const AGENCY_FAQS = [
  {
    q: 'What do you build?',
    a: 'Marketing websites and web apps, iOS and Android apps, AI assistants and workflow automation, and digital marketing: SEO, paid ads and email. Each service page lists what is included and how long it usually takes.',
  },
  {
    q: 'How long does a project take?',
    a: 'It depends on scope. As a guide: a starter website takes 4 to 6 weeks and a larger site 6 to 10, an app MVP about 8 weeks and a two-platform app about 12, and a first AI assistant 3 to 6. Bigger work is scoped individually, and the timeline is fixed in the proposal before anything starts.',
  },
  {
    q: 'How does pricing work?',
    a: 'We talk it through on a call first. You then get a written proposal with a fixed price for each phase, agreed before anything starts. No hourly billing, so nobody is rewarded for taking longer.',
  },
  {
    q: 'Who owns the code, designs and accounts?',
    a: 'You do. The code, design files, domain, hosting and ad accounts sit in your accounts from day one, not at handover, so you can change supplier at any point.',
  },
  {
    q: 'How do revisions work?',
    a: 'You review real designs and working builds every week, and feedback inside the agreed scope is part of the fixed price. If a change alters the scope, we price it as a change and you decide before we do it.',
  },
  {
    q: 'What happens after launch?',
    a: 'Every build includes a support window for fixes and small adjustments: 30 or 90 days depending on the plan, and two weeks to a month of monitoring and tuning for AI work. After that, ongoing work can continue on a flat monthly fee.',
  },
  {
    q: 'Can you work with our in-house team?',
    a: 'Yes. We often plug into existing teams and follow your conventions.',
  },
  {
    q: 'How soon can we start?',
    a: 'Usually one to two weeks after the first call, depending on what is already in progress.',
  },
];

/**
 * Product questions are kept apart from agency ones on purpose: a buyer who
 * hires Zenova and a business that subscribes to Truplexy are making
 * different purchases. Billing, plans and onboarding detail stay on the
 * product's own site — see the header of data/products.ts.
 */
export const PRODUCT_FAQS = [
  {
    q: 'What is the difference between your services and your products?',
    a: 'Services are projects we build for you: you pay for the work and own the result. Products are software we build and run ourselves: you subscribe and use them, and we keep them running and improving.',
  },
  {
    q: 'Is Truplexy included when we hire Zenova?',
    a: 'No. Truplexy is a separate subscription with its own plans, billing and terms on truplexy.com. An agency project does not include it, and you do not need it to work with us.',
  },
  {
    q: 'Where do I find Truplexy pricing, setup and support?',
    a: 'On truplexy.com: the plans, the setup guides for each channel, the API documentation and the terms are all there, and questions go to the Truplexy team at hello@truplexy.com.',
  },
  {
    q: 'Can you build a custom integration that connects to Truplexy?',
    a: 'Truplexy has a REST API and webhooks for exactly this. If you want us to build the integration for you, that is an agency project like any other, scoped and priced on its own.',
  },
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
  title: 'Have a project in mind?',
  accent: "Let's talk.",
  sub: 'A 30-minute call about your project. No pitch deck and no obligation.',
  primary: 'Start a project',
  primaryHref: '/contact',
  secondary: 'Book a 30-min call',
  secondaryHref: SITE.calendlyUrl,
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
  /** Display text — printed as the card eyebrow on the service pages. */
  label: string;
  title: string;
  blurb: string;
  /**
   * Which composition of the service's code-built visual illustrates this
   * deliverable (components/visuals). 'a' is the service's lead visual.
   */
  variant: 'a' | 'b';
}

export const DELIVERABLES: Deliverable[] = [
  {
    service: 'web',
    label: 'Web',
    title: 'Your website',
    blurb: 'A complete site, fully built and ready to use.',
    variant: 'a',
  },
  {
    service: 'web',
    label: 'Web',
    title: 'Easy editing',
    blurb: 'A simple admin so your team can update content without us.',
    variant: 'b',
  },
  {
    service: 'app',
    label: 'App',
    title: 'Working app',
    blurb: 'A fully functional app published on the App Store and Google Play.',
    variant: 'a',
  },
  {
    service: 'app',
    label: 'App',
    title: 'Backend setup',
    blurb: 'APIs, databases, and auth — everything your app needs to run.',
    variant: 'b',
  },
  {
    service: 'ai',
    label: 'AI',
    title: 'Working chatbot',
    blurb: 'A trained bot deployed on your website or platform of choice.',
    variant: 'a',
  },
  {
    service: 'ai',
    label: 'AI',
    title: 'Conversation flows',
    blurb: 'Designed dialogues for common scenarios and edge cases.',
    variant: 'b',
  },
  {
    service: 'marketing',
    label: 'Marketing',
    title: 'Growth strategy',
    blurb: 'A clear plan focused on the channels that work for your business.',
    variant: 'a',
  },
  {
    service: 'marketing',
    label: 'Marketing',
    title: 'Reporting',
    blurb: 'One dashboard. Real numbers. Updated daily.',
    variant: 'b',
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
  wash: 1 | 2 | 3 | 4 | 5 | 6;
  title: string;
  description: string;
}

/** The five section index pages, plus the two About sub-pages. */
export type PageKey =
  | 'services'
  | 'products'
  | 'work'
  | 'blog'
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
    sub: 'Four services for businesses: websites, apps, AI automation and digital marketing. We build it, you own it, and the price is agreed with you on a call before work starts.',
    wash: 1,
    title: 'Services — Web, App, AI & Marketing | Zenova',
    // Rewritten from the previous site's description, which still listed
    // services this site does not offer (startup support, content, ops).
    description:
      'Web development, app development, AI automation, and digital marketing — what each one includes, how long it takes, and what you own at the end.',
  },
  products: {
    eyebrow: 'Our products',
    headline: 'Software we build,',
    accent: 'and run, ourselves.',
    sub: 'Alongside client projects we design, ship and operate our own software. You subscribe to a product instead of commissioning it, and we keep it running.',
    wash: 6,
    title: 'Products — Software Built and Run by Zenova | Zenova',
    description:
      'The software products Zenova builds and operates, starting with Truplexy, an AI customer support platform for businesses that answer customers on more than one channel.',
  },
  /*
   * Rewritten when /work became a portfolio. Its previous copy ("Not a deck.
   * Working things.") described deliverables, which now sit on the service
   * that ships them.
   *
   * This copy deliberately promises no results. Until PROJECTS has a
   * non-draft entry the page renders WORK_COPY's empty state, and a headline
   * claiming outcomes above it would be the fictional case studies again by
   * another route.
   */
  work: {
    eyebrow: 'Selected work',
    headline: 'The projects,',
    accent: 'labelled honestly.',
    sub: 'Client work, our own products and design concepts, each marked for what it is, with one page per project.',
    wash: 2,
    title: 'Works — Selected Projects | Zenova',
    description:
      'Zenova projects across web, apps and AI automation: our own product Truplexy and labelled design concepts, with the brief and the build for each.',
  },
  blog: {
    eyebrow: 'Notes from the studio',
    headline: 'What we have learned,',
    accent: 'written down.',
    sub: 'Practical notes on building for the web — performance, process, and what actually holds up once a project ships.',
    // wash-4 is the quiet recipe: one soft lobe, for a page that opens on a
    // long list of cards where the header has no business competing.
    wash: 4,
    title: 'Blog — Notes from the Studio | Zenova',
    description:
      'Practical notes from the Zenova studio: web performance, design and build process, and what works once a project ships.',
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
};

/* ------------------------------------------------------------------ *
 * Scope options.
 *
 * Three ways to start each service, ported from the previous site's rate
 * cards. The prices were removed on purpose: pricing is agreed on a call and
 * written into the proposal, never published on the site. Do not add a
 * `price` back here.
 *
 * Each option's `id` travels to /contact as ?plan=, where the brief form
 * names the option so nobody has to retype it.
 * ------------------------------------------------------------------ */
export interface ScopeOption {
  id: string;
  name: string;
  info: string;
  timeline: string;
  features: string[];
  cta: string;
}

export interface ServiceScopes {
  slug: ServiceSlug;
  label: string;
  plans: ScopeOption[];
}

export const SCOPES: ServiceScopes[] = [
  {
    slug: 'web',
    label: 'Web Development',
    plans: [
      {
        id: 'web-1',
        name: 'Starter site',
        info: 'A clean, fast site for new businesses and small teams.',
        timeline: '4 – 6 weeks',
        features: ['Up to 6 pages', 'Mobile-friendly design', 'Basic CMS', '30-day support'],
        cta: 'Discuss this scope',
      },
      {
        id: 'web-2',
        name: 'Growth site',
        info: 'A full rebuild for companies replacing an outdated site.',
        timeline: '6 – 10 weeks',
        features: [
          'Up to 12 pages',
          'Full CMS + admin',
          'Custom animations',
          'Built-in analytics',
          '90-day support',
        ],
        cta: 'Discuss this scope',
      },
      {
        id: 'web-3',
        name: 'Custom build',
        info: 'Complex products, portals, and web apps — scoped to fit.',
        timeline: 'Scoped per project',
        features: ['Custom features', 'Third-party integrations', 'Team training', 'Ongoing support'],
        cta: 'Discuss this scope',
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
        timeline: '8 weeks',
        features: ['Core features', '1 platform', 'App store launch', '30-day support'],
        cta: 'Discuss this scope',
      },
      {
        id: 'app-2',
        name: 'Full app',
        info: 'A polished launch on both platforms.',
        timeline: '12 weeks',
        features: [
          'All features',
          'iOS + Android',
          'Full design system',
          'Backend + APIs',
          '90-day support',
        ],
        cta: 'Discuss this scope',
      },
      {
        id: 'app-3',
        name: 'Product suite',
        info: 'Complex apps with integrations and compliance needs.',
        timeline: 'Scoped per project',
        features: ['Custom architecture', 'Integrations', 'Security review', 'Team training'],
        cta: 'Discuss this scope',
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
        timeline: '3 weeks',
        features: ['Basic flows', '1 channel', 'Training data prep', '2-week monitoring'],
        cta: 'Discuss this scope',
      },
      {
        id: 'bot-2',
        name: 'Full assistant',
        info: 'A trained agent across your support channels.',
        timeline: '6 weeks',
        features: [
          'Custom training',
          'Multi-channel',
          'CRM integration',
          'Analytics',
          '30-day tuning',
        ],
        cta: 'Discuss this scope',
      },
      {
        id: 'bot-3',
        name: 'Enterprise',
        info: 'Fine-tuned models with compliance and on-premise options.',
        timeline: 'Scoped per project',
        features: ['Fine-tuned LLM', 'On-premise deploy', 'Compliance review', 'Dedicated support'],
        cta: 'Discuss this scope',
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
        timeline: '3 weeks',
        features: ['Channel + funnel audit', 'Tracking setup', 'Quick-win fixes', '90-day roadmap'],
        cta: 'Discuss this scope',
      },
      {
        id: 'mkt-2',
        name: '90-day sprint',
        info: 'A focused push across two channels to find what converts.',
        timeline: '12 weeks',
        features: [
          '2 ad channels',
          'Weekly experiments',
          'Ad creative included',
          'SEO foundations',
          'Live dashboard',
        ],
        cta: 'Discuss this scope',
      },
      {
        id: 'mkt-3',
        name: 'Full launch',
        info: 'Multi-channel go-to-market for a product or rebrand.',
        timeline: 'Scoped per project',
        features: ['All channels', 'Senior strategy', 'Content + creative', 'Team handoff'],
        cta: 'Discuss this scope',
      },
    ],
  },
];

/* ------------------------------------------------------------------ *
 * About.
 *
 * New copy, written for this restructure. It is editorial — how the studio
 * is shaped and why — and deliberately contains no clients, no testimonials,
 * no team members and no metrics, because none of those exist here in a form
 * that could be published. See this file's header for what was purged.
 * ------------------------------------------------------------------ */
export const ABOUT = {
  lede: 'Zenova is a small studio that designs, builds, and grows digital products. Four disciplines — web, apps, AI automation, and marketing — run by one team rather than four vendors briefing each other. We also build and run software of our own, starting with Truplexy.',
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
  /** The secondary button beside applyCta. Lived hardcoded in the page until
      now, and was the only string on /careers not coming from this object. */
  aboutCta: 'What we are like',
  /** Sits under the empty state, above the mail link. Names what to send, so
      the ask is not just an address. */
  emptyAside: 'Three things you built, a line each on what was yours, and where you want to be doing more of it.',
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
   * Shown above the grid while any entry in PROJECTS is a `demo` or a
   * `concept`. It says so out loud rather than letting a reader mistake a
   * design concept for a client engagement, and it stops rendering by itself
   * once only real work is left.
   */
  demoNote:
    'Each entry is labelled. Concepts are our own design exercises, not client work, and claim no results. Truplexy is a product we built and run ourselves. Client case studies are being written up with permission.',
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

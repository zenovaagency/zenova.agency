export interface ProjectMetric {
  num: string;
  label: string;
}

export interface ProjectSection {
  title: string;
  body: string[];
}

export interface ProjectTestimonial {
  quote: string;
  author: string;
  role: string;
}

export interface ProjectImage {
  src: string;
  alt?: string;
  caption?: string;
}

export interface ProjectDetail {
  slug: string;
  client: string;
  category: string;
  industry: string;
  title: string;
  summary: string;
  tags: string[];
  tone: string;
  year: string;
  duration: string;
  team: string;
  services: string[];
  hero: string;
  metric: [string, string];
  metrics: ProjectMetric[];
  sections: ProjectSection[];
  deliverables: string[];
  stack: string[];
  testimonial: ProjectTestimonial;
  visualIdx: number;
  images?: ProjectImage[];
  liveUrl?: string;
}

export const PROJECTS: ProjectDetail[] = [
  {
    slug: 'northwind-labs',
    client: 'Northwind Labs',
    category: 'SaaS',
    industry: 'Developer tools',
    title: 'A new site and brand for a developer platform.',
    summary: 'A complete rebrand, a faster site, and content that brought in 2x the signups.',
    tags: ['Brand', 'Web', 'Marketing'],
    tone: '#ff813a',
    year: '2025',
    duration: '14 weeks',
    team: '5 people',
    services: ['Web Development', 'Marketing', 'Content'],
    hero: 'Northwind had a great product but an outdated website. We refreshed the brand and built a site that matches their pace.',
    metric: ['+212%', 'More signups'],
    metrics: [
      { num: '+212%', label: 'More signups' },
      { num: '0.9s', label: 'New load time' },
      { num: '+340%', label: 'Organic traffic' },
    ],
    sections: [
      {
        title: 'The problem',
        body: [
          'Northwind had shipped three big product updates but their site still talked about the old version. Signups were buried, the blog was empty, and the brand looked five years old.',
        ],
      },
      {
        title: 'What we did',
        body: [
          'We refreshed the brand, rebuilt the site, and set up a content team to publish weekly. Everything launched in 14 weeks.',
          'By month three, organic traffic had doubled and signups were up over 200%.',
        ],
      },
    ],
    deliverables: ['New brand', 'New website', 'Content engine', 'Analytics dashboard'],
    stack: ['Next.js', 'TypeScript', 'Sanity', 'Vercel'],
    testimonial: {
      quote: 'They shipped the version of the company we kept describing but could never get on screen.',
      author: 'Devon Park',
      role: 'CEO, Northwind Labs',
    },
    visualIdx: 0,
    images: [],
  },
  {
    slug: 'aperture-health',
    client: 'Aperture Health',
    category: 'Healthcare',
    industry: 'Patient portal',
    title: 'A patient portal that actually gets used.',
    summary: 'We replaced three vendors with one product and saved 38 minutes per appointment.',
    tags: ['Product', 'UX'],
    tone: '#e06820',
    year: '2025',
    duration: '22 weeks',
    team: '6 people',
    services: ['Web Development', 'Operations'],
    hero: 'Patients were using three different tools to book, fill forms, and view records. We combined them into one simple portal.',
    metric: ['38 min', 'Saved per visit'],
    metrics: [
      { num: '38 min', label: 'Saved per visit' },
      { num: '92%', label: 'Patients self-onboard' },
      { num: '+24', label: 'NPS improvement' },
    ],
    sections: [
      {
        title: 'The problem',
        body: [
          'Patients had to enter their information into three separate systems. Staff spent hours copying data between them.',
        ],
      },
      {
        title: 'What we did',
        body: [
          'We built a single portal that handles booking, intake, and records in one place. The old tools became invisible to patients.',
          'After six months, staff saved 38 minutes per visit and patient satisfaction was up significantly.',
        ],
      },
    ],
    deliverables: ['Patient login', 'Booking system', 'Intake forms', 'Records UI'],
    stack: ['Next.js', 'Postgres', 'Tailwind'],
    testimonial: {
      quote: 'We thought we were buying a redesign. We bought back forty minutes per visit.',
      author: 'Dr. Lila Okafor',
      role: 'COO, Aperture Health',
    },
    visualIdx: 1,
    images: [],
  },
  {
    slug: 'stellar-capital',
    client: 'Stellar Capital',
    category: 'Fintech',
    industry: 'Startup',
    title: 'From pitch deck to funded startup in 11 weeks.',
    summary: 'We helped Stellar build their MVP, pitch investors, and close a $4.2M seed round.',
    tags: ['Startup', 'GTM'],
    tone: '#ff9a5c',
    year: '2024',
    duration: '11 weeks',
    team: '4 people',
    services: ['Startup Support', 'Web Development', 'Marketing'],
    hero: 'Two founders, 12 weeks of runway, and an idea. We helped them build, launch, and raise.',
    metric: ['$4.2M', 'Seed raised'],
    metrics: [
      { num: '$4.2M', label: 'Seed raised' },
      { num: '11 days', label: 'To first product' },
      { num: '14', label: 'Paid pilots' },
    ],
    sections: [
      {
        title: 'The problem',
        body: [
          'Stellar had a deck and a thesis but no product. Investors wanted to see something real before writing checks.',
        ],
      },
      {
        title: 'What we did',
        body: [
          'In week one we built a working MVP. By week three they had a polished site and pitch deck.',
          'They closed a $4.2M seed eight weeks after kickoff and had 14 paid pilots before launch.',
        ],
      },
    ],
    deliverables: ['Brand', 'Pitch deck', 'MVP', 'Landing site'],
    stack: ['Next.js', 'Supabase', 'Stripe'],
    testimonial: {
      quote: 'They gave us the team we couldn’t have hired in eleven weeks. We closed because of it.',
      author: 'Priya Shah',
      role: 'Co-founder, Stellar Capital',
    },
    visualIdx: 2,
    images: [],
  },
  {
    slug: 'cobalt-studio',
    client: 'Cobalt Studio',
    category: 'Media',
    industry: 'Publishing',
    title: 'A content engine that ships 4 articles a week.',
    summary: 'We helped Cobalt grow traffic 3x and their newsletter 5x — without paid ads.',
    tags: ['Content', 'SEO'],
    tone: '#c06028',
    year: '2025',
    duration: '12 months',
    team: '3 people',
    services: ['Content', 'Marketing'],
    hero: 'Cobalt had three great writers but no system. We added an editor and a clear process.',
    metric: ['4 / wk', 'Articles published'],
    metrics: [
      { num: '4 / wk', label: 'Articles published' },
      { num: '+340%', label: 'Traffic growth' },
      { num: '5×', label: 'Newsletter growth' },
    ],
    sections: [
      {
        title: 'The problem',
        body: [
          'Cobalt had talented writers but no system. Briefs were verbal, SEO was an afterthought, and publishing dates kept slipping.',
        ],
      },
      {
        title: 'What we did',
        body: [
          'We set up an editorial calendar, brief templates, and a clear publishing rhythm. The writers kept their voice — we just gave them better support.',
          'A year later, traffic was up 3x and the newsletter had grown 5x with no paid spend.',
        ],
      },
    ],
    deliverables: ['Editorial calendar', 'Brief templates', 'SEO strategy', 'Newsletter'],
    stack: ['Notion', 'Ghost', 'Ahrefs'],
    testimonial: {
      quote: 'They turned three writers into a publication. The work got better, not just more.',
      author: 'Jules Carrington',
      role: 'Founder, Cobalt Studio',
    },
    visualIdx: 3,
    images: [],
  },
  {
    slug: 'mosaic',
    client: 'Mosaic',
    category: 'Consumer',
    industry: 'App',
    title: 'Growth from zero to 10,000 users in 90 days.',
    summary: 'We helped Mosaic launch a growth program that cut their cost per user by 42%.',
    tags: ['Marketing', 'Web'],
    tone: '#cc6622',
    year: '2024',
    duration: '90 days',
    team: '4 people',
    services: ['Marketing', 'Web Development'],
    hero: 'After their launch buzz faded, Mosaic needed a real growth plan. We built one that worked.',
    metric: ['10k+', 'Users in 90 days'],
    metrics: [
      { num: '10k+', label: 'Users in 90 days' },
      { num: '−42%', label: 'Lower cost per user' },
      { num: '+14pp', label: 'Better retention' },
    ],
    sections: [
      {
        title: 'The problem',
        body: [
          'After a strong launch, growth had stalled. The team had no clear plan for what to do next.',
        ],
      },
      {
        title: 'What we did',
        body: [
          'We tested four different messages, killed what didn’t work, and doubled down on what did. We also added email automation to keep users engaged.',
          'In 90 days they hit 10,000 users at 42% lower cost than before.',
        ],
      },
    ],
    deliverables: ['Landing pages', 'Ad campaigns', 'Email automation', 'Dashboard'],
    stack: ['Next.js', 'Customer.io', 'GA4'],
    testimonial: {
      quote: 'They handed off a real program — not a spreadsheet. Saved us a year of figuring it out.',
      author: 'Mira Iqbal',
      role: 'CEO, Mosaic',
    },
    visualIdx: 0,
    images: [],
  },
  {
    slug: 'verge',
    client: 'Verge',
    category: 'Operations',
    industry: 'Finance',
    title: 'New billing system. Zero invoices dropped.',
    summary: 'We rebuilt a tangled billing system and saved their finance team two days every month.',
    tags: ['Ops', 'Web'],
    tone: '#ff6b1a',
    year: '2024',
    duration: '18 weeks',
    team: '4 people',
    services: ['Operations', 'Web Development'],
    hero: 'Verge’s billing system was held together by two engineers and a folder of recordings. We turned it into something the finance team owns.',
    metric: ['2 days', 'Saved per month'],
    metrics: [
      { num: '2 days', label: 'Saved per month' },
      { num: '0', label: 'Invoices dropped' },
      { num: '−61%', label: 'Faster month-end' },
    ],
    sections: [
      {
        title: 'The problem',
        body: [
          'Closing the books took three days every month. Pricing changes took an engineering quarter.',
        ],
      },
      {
        title: 'What we did',
        body: [
          'We rebuilt the billing system from scratch on Stripe. We ran it alongside the old system for six weeks before switching over.',
          'The first month-end after launch closed in a day and a half. New pricing now ships in a week.',
        ],
      },
    ],
    deliverables: ['Billing service', 'Stripe cleanup', 'Finance dashboard', 'Migration plan'],
    stack: ['TypeScript', 'Stripe', 'Postgres'],
    testimonial: {
      quote: 'The engagement paid for itself in the first month. Finance trusts the numbers now.',
      author: 'Alex Renner',
      role: 'CFO, Verge',
    },
    visualIdx: 1,
    images: [],
  },
];

export function findProject(slug: string): ProjectDetail | undefined {
  return PROJECTS.find((p) => p.slug === slug);
}

export interface JobDetail {
  slug: string;
  title: string;
  department: string;
  location: string;
  /** Employment type, e.g. "Full-time", "Contract", "Part-time". */
  type: string;
  summary: string;
  description: string[];
  responsibilities: string[];
  requirements: string[];
  /** External application link. When empty the Apply button falls back to email. */
  applyUrl: string;
  /** ISO date (YYYY-MM-DD). Shown as "Posted on…" and used to sort newest-first. */
  postedAt: string;
  tone: string;
}

export const JOBS: JobDetail[] = [
  {
    slug: 'senior-product-designer',
    title: 'Senior Product Designer',
    department: 'Design',
    location: 'Remote',
    type: 'Full-time',
    summary:
      'Own end-to-end product and brand design for client work — from first sketch to shipped interface.',
    description: [
      "We're looking for a senior product designer to lead design across a handful of client engagements at once. You'll shape brand, product, and marketing surfaces, and you'll be the same person the client talks to from day one to launch.",
      'This is a hands-on role. You’ll design in Figma, prototype real flows, and work shoulder-to-shoulder with engineers who ship your work quickly.',
    ],
    responsibilities: [
      'Lead design for 2-3 concurrent client projects, from discovery to launch.',
      'Design brand systems, product UI, and marketing pages that hold together.',
      'Prototype and pressure-test flows before they reach engineering.',
      'Present work directly to clients and turn their feedback into decisions.',
    ],
    requirements: [
      '5+ years designing digital products, with a portfolio that shows range.',
      'Fluency in Figma and modern prototyping practices.',
      'Strong opinions on typography, layout, and interaction, loosely held.',
      'Comfortable talking to clients and defending design decisions.',
    ],
    applyUrl: '',
    postedAt: '2026-06-15',
    tone: '#ff813a',
  },
  {
    slug: 'senior-engineer',
    title: 'Senior Engineer',
    department: 'Engineering',
    location: 'Remote',
    type: 'Full-time',
    summary:
      'Build and ship production web apps end-to-end — React on the front, typed APIs on the back.',
    description: [
      "You'll be a core engineer on our build team, taking projects from empty repo to production. We work in TypeScript and React on the frontend and Python/FastAPI on the backend, and we care about shipping fast without leaving a mess behind.",
      'You own your work end to end: architecture, implementation, and the deploy that puts it in front of real users.',
    ],
    responsibilities: [
      'Build full-stack features across React frontends and FastAPI backends.',
      'Own technical decisions on your projects and keep the codebase clean.',
      'Work directly with designers to turn Figma into fast, accessible interfaces.',
      'Set up CI, deploys, and the small tooling that keeps projects moving.',
    ],
    requirements: [
      '5+ years shipping production web applications.',
      'Deep experience with TypeScript and React.',
      'Comfortable in a typed backend (Python/FastAPI, Node, or similar).',
      "You've owned something from architecture to production, not just tickets.",
    ],
    applyUrl: '',
    postedAt: '2026-06-20',
    tone: '#e06820',
  },
  {
    slug: 'growth-strategist',
    title: 'Growth Strategist',
    department: 'Growth',
    location: 'Remote',
    type: 'Full-time',
    summary:
      'Run growth like a product — strategy, channels, and the numbers that prove it worked.',
    description: [
      "We're hiring a growth strategist to own the growth practice across our clients: positioning, channels, campaigns, and the reporting that ties it all to real outcomes.",
      "You'll partner with design and engineering so growth isn't a bolt-on — it's built into the product and the site from the start.",
    ],
    responsibilities: [
      'Own growth strategy for a portfolio of clients and the metrics behind it.',
      'Plan and run campaigns across SEO, paid, email, and content.',
      'Set up analytics and turn the numbers into the next set of bets.',
      'Report outcomes clearly — the wins and the misses.',
    ],
    requirements: [
      '4+ years in growth, performance marketing, or lifecycle.',
      'Fluent with analytics and comfortable owning a number.',
      'Hands-on across at least two of: SEO, paid, email, content.',
      'You think in experiments, not vanity metrics.',
    ],
    applyUrl: '',
    postedAt: '2026-06-25',
    tone: '#ff9a5c',
  },
];

export function findJob(slug: string): JobDetail | undefined {
  return JOBS.find((j) => j.slug === slug);
}

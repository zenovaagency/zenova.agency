import type { IconName } from '@/components/icons/Icon';
import type { ServiceVisualKind } from '@/components/sections/ServiceVisual';

export interface ServiceFAQ {
  q: string;
  a: string;
}

export interface ServicePackage {
  name: string;
  price: string;
  cadence: string;
  fits: string;
  includes: string[];
  featured?: boolean;
}

export interface ServicePhase {
  n: string;
  title: string;
  blurb: string;
  out: string;
}

export interface ServiceDetail {
  slug: string;
  icon: IconName;
  tag: string;
  title: string;
  short: string;
  lede: string;
  hero: string;
  bullets: string[];
  stat: [string, string];
  hue: string;
  visual: ServiceVisualKind;
  meta: Array<[string, string]>;
  deliverables: Array<{ title: string; blurb: string }>;
  phases: ServicePhase[];
  stack: string[];
  packages: ServicePackage[];
  faqs: ServiceFAQ[];
  related: string[];
}

export const SERVICES: ServiceDetail[] = [
  {
    slug: 'web',
    icon: 'Code',
    tag: 'Build',
    title: 'Web Development',
    short: 'Fast, modern websites and web apps that grow with your business.',
    lede: 'Fast, modern websites and web apps that grow with your business.',
    hero: 'We build websites that load fast, look great, and are easy for your team to update.',
    bullets: [
      'Modern web apps',
      'Easy-to-edit content',
      'Fast and optimized',
      'Built-in analytics',
    ],
    stat: ['<1.2s', 'Average load time'],
    hue: '#ff813a',
    visual: 'browser',
    meta: [
      ['<1.2s', 'Load time'],
      ['6 – 10 wks', 'Build time'],
      ['100%', 'Mobile ready'],
      ['12 mo', 'Free support'],
    ],
    deliverables: [
      { title: 'Your website', blurb: 'A complete site, fully built and ready to use.' },
      { title: 'Easy editing', blurb: 'A simple admin so your team can update content without us.' },
      { title: 'Design system', blurb: 'A consistent look across every page.' },
      { title: 'Analytics setup', blurb: 'Know what works. See where visitors come from and what they do.' },
    ],
    phases: [
      { n: '01', title: 'Plan', blurb: 'We agree on goals, structure, and what success looks like.', out: 'Project plan' },
      { n: '02', title: 'Design', blurb: 'Visuals, layout, and a working prototype you can click through.', out: 'Design files' },
      { n: '03', title: 'Build', blurb: 'We code the site with weekly previews you can review.', out: 'Live preview' },
      { n: '04', title: 'Launch', blurb: 'Go live with a clean handoff and analytics in place.', out: 'Your live site' },
    ],
    stack: ['Next.js', 'TypeScript', 'Tailwind', 'Vercel', 'Sanity CMS'],
    packages: [
      {
        name: 'Starter site',
        price: 'from $8k',
        cadence: '4 – 6 weeks',
        fits: 'New businesses or small teams that need a clean, fast website.',
        includes: ['Up to 6 pages', 'Mobile-friendly design', 'Basic CMS', '30-day support'],
      },
      {
        name: 'Growth site',
        price: 'from $24k',
        cadence: '6 – 10 weeks',
        fits: 'Growing companies replacing an outdated site.',
        includes: ['Up to 12 pages', 'Full CMS', 'Animations', '90-day support'],
        featured: true,
      },
      {
        name: 'Custom build',
        price: 'Custom',
        cadence: 'Varies',
        fits: 'Teams with complex needs or building a product.',
        includes: ['Custom features', 'Integrations', 'Ongoing support', 'Team training'],
      },
    ],
    faqs: [
      { q: 'Do we own the code?', a: 'Yes. The code is yours from day one — your GitHub, your domain, your hosting.' },
      { q: 'Can our team take over later?', a: 'Of course. We use tools your team can learn quickly, and we leave clear docs.' },
      { q: 'What about SEO when moving from an old site?', a: 'We keep your search rankings safe with proper redirects and a careful migration plan.' },
      { q: 'Is design included?', a: 'Yes. Design and development are one package — no separate vendors.' },
    ],
    related: ['marketing', 'startup', 'content'],
  },
  {
    slug: 'marketing',
    icon: 'Spark',
    tag: 'Grow',
    title: 'Marketing',
    short: 'Get more customers with SEO, ads, and email that actually work.',
    lede: 'Get more customers with SEO, ads, and email that actually work.',
    hero: 'We help you grow your audience and bring in real customers — not just clicks.',
    bullets: [
      'SEO that ranks',
      'Paid ads that convert',
      'Email automation',
      'Clear reports',
    ],
    stat: ['3.4×', 'Average growth in 90 days'],
    hue: '#ff6b1a',
    visual: 'curve',
    meta: [
      ['3.4×', 'Avg growth'],
      ['90 days', 'To see results'],
      ['1', 'Simple dashboard'],
      ['24/7', 'Tracking'],
    ],
    deliverables: [
      { title: 'Growth strategy', blurb: 'A clear plan focused on the channels that work for your business.' },
      { title: 'Paid ads', blurb: 'Campaigns on Meta, Google, and LinkedIn — managed weekly.' },
      { title: 'SEO', blurb: 'Better rankings with content and technical fixes.' },
      { title: 'Email automation', blurb: 'Onboarding, follow-ups, and win-back emails that run on their own.' },
      { title: 'Reporting', blurb: 'One dashboard. Real numbers. Updated daily.' },
    ],
    phases: [
      { n: '01', title: 'Audit', blurb: 'We review your current marketing and find quick wins.', out: 'Audit report' },
      { n: '02', title: 'Test', blurb: 'We try two channels with weekly experiments.', out: 'First results' },
      { n: '03', title: 'Scale', blurb: 'We double down on what works and stop what doesn’t.', out: 'Growth program' },
      { n: '04', title: 'Handoff', blurb: 'We train your team to run it, or stay on as needed.', out: 'In-house ready' },
    ],
    stack: ['HubSpot', 'Google Ads', 'Meta Ads', 'Mailchimp', 'GA4', 'Ahrefs'],
    packages: [
      {
        name: 'Starter',
        price: '$4k / mo',
        cadence: 'Min. 3 months',
        fits: 'Small businesses testing their first growth channel.',
        includes: ['1 ad channel', 'Basic SEO', 'Monthly reports', 'Email setup'],
      },
      {
        name: 'Full growth',
        price: '$12k / mo',
        cadence: 'Min. 6 months',
        fits: 'Teams ready to scale across channels.',
        includes: ['All channels', 'Weekly campaigns', 'Full tracking', 'Quarterly review'],
        featured: true,
      },
      {
        name: 'Strategic',
        price: 'from $5k / mo',
        cadence: 'Flexible',
        fits: 'You have a team. You need senior direction.',
        includes: ['Weekly calls', 'Strategy support', 'Hiring help', 'Quarterly planning'],
      },
    ],
    faqs: [
      { q: 'Is there a minimum ad budget?', a: 'We recommend at least $3k/month per ad channel to get useful data.' },
      { q: 'What if we only need SEO?', a: 'No problem. SEO-only programs work great for many businesses.' },
      { q: 'Do you make the ad creative?', a: 'Yes — copy, images, and short videos are all included.' },
      { q: 'How do you measure success?', a: 'We agree on the metrics upfront and report against them every month.' },
    ],
    related: ['content', 'web', 'ops'],
  },
  {
    slug: 'startup',
    icon: 'Rocket',
    tag: 'Launch',
    title: 'Startup Support',
    short: 'From idea to launch — design, build, and a path to first customers.',
    lede: 'From idea to launch — design, build, and a path to first customers.',
    hero: 'Have an idea? We help you turn it into a real product and find your first customers.',
    bullets: [
      'Pitch deck',
      'MVP build',
      'Branding',
      'Go-to-market plan',
    ],
    stat: ['11 days', 'Fastest MVP we built'],
    hue: '#cc6622',
    visual: 'rocket',
    meta: [
      ['11 days', 'Fastest MVP'],
      ['8 wks', 'Typical launch'],
      ['1', 'Dedicated team'],
      ['$0', 'Hidden fees'],
    ],
    deliverables: [
      { title: 'Pitch deck', blurb: 'A clear deck for investors and partners.' },
      { title: 'Brand identity', blurb: 'Logo, colors, type, and voice — ready to use.' },
      { title: 'Working product', blurb: 'A real product, not just a prototype. Built to launch.' },
      { title: 'Landing page', blurb: 'A simple site to capture interest and sign-ups.' },
      { title: 'Launch plan', blurb: 'Your first 90 days mapped out — channels, tasks, owners.' },
    ],
    phases: [
      { n: '01', title: 'Discover', blurb: 'A workshop to lock in positioning, audience, and MVP scope.', out: 'Project brief' },
      { n: '02', title: 'Brand & pitch', blurb: 'Identity, deck, and core messaging.', out: 'Investor package' },
      { n: '03', title: 'Build MVP', blurb: 'Daily updates. Working product before week eight.', out: 'Live product' },
      { n: '04', title: 'Launch', blurb: 'Get your first customers and a repeatable sales motion.', out: 'First customers' },
    ],
    stack: ['Next.js', 'Supabase', 'Stripe', 'Figma', 'Notion'],
    packages: [
      {
        name: 'Pitch sprint',
        price: '$8k',
        cadence: '2 weeks',
        fits: 'Founders raising a first round.',
        includes: ['Pitch deck', 'One-pager', 'Brand direction', 'Landing page'],
      },
      {
        name: 'Full launch',
        price: 'from $35k',
        cadence: '8 weeks',
        fits: 'Funded teams ready to build and launch.',
        includes: ['Brand identity', 'MVP build', 'Landing page', 'Launch plan'],
        featured: true,
      },
      {
        name: 'Ongoing team',
        price: 'from $12k / mo',
        cadence: 'Rolling',
        fits: 'Founders who need design and engineering on call.',
        includes: ['Dedicated team', 'Weekly sprints', 'Design + dev', 'Strategy calls'],
      },
    ],
    faqs: [
      { q: 'Do you take equity?', a: 'Only alongside cash, in special cases. Not as a replacement for fees.' },
      { q: 'Can you help us raise money?', a: 'We help you prepare. We don’t pitch on your behalf.' },
      { q: 'What if we already have a developer?', a: 'Even better. We focus on design and growth and work alongside them.' },
      { q: 'How fast can we launch?', a: 'Most MVPs launch in 6 to 8 weeks. Faster is possible for simpler products.' },
    ],
    related: ['web', 'marketing', 'content'],
  },
  {
    slug: 'ops',
    icon: 'Layers',
    tag: 'Operate',
    title: 'Operations',
    short: 'Smarter tools and processes so your team can do more with less.',
    lede: 'Smarter tools and processes so your team can do more with less.',
    hero: 'We help small teams work like big ones — with better tools, clear processes, and weekly routines.',
    bullets: [
      'Tool audits',
      'CRM setup',
      'Team playbooks',
      'Weekly reports',
    ],
    stat: ['38%', 'Time saved per month'],
    hue: '#ffa870',
    visual: 'kanban',
    meta: [
      ['38%', 'Time saved'],
      ['1 mo', 'Quick wins'],
      ['$0', 'Wasted licenses'],
      ['1', 'Source of truth'],
    ],
    deliverables: [
      { title: 'Tool audit', blurb: 'We review what you use and cut what you don’t need.' },
      { title: 'CRM setup', blurb: 'A clean sales pipeline that your team actually uses.' },
      { title: 'Playbooks', blurb: 'Simple docs for how things get done. No more tribal knowledge.' },
      { title: 'Hiring help', blurb: 'Scorecards, interview structure, and onboarding flows.' },
      { title: 'Reports', blurb: 'One weekly view. Founders, team, and board all aligned.' },
    ],
    phases: [
      { n: '01', title: 'Audit', blurb: 'We talk to your team and review your tools.', out: 'Priority list' },
      { n: '02', title: 'Cleanup', blurb: 'Cut waste, document what works, fix what doesn’t.', out: 'Cleaner stack' },
      { n: '03', title: 'Routines', blurb: 'Install the weekly and monthly rhythms that keep things moving.', out: 'Working system' },
      { n: '04', title: 'Handoff', blurb: 'Train your team and step back to a strategic role.', out: 'Self-running ops' },
    ],
    stack: ['HubSpot', 'Notion', 'Linear', 'Slack', 'Zapier', 'Stripe'],
    packages: [
      {
        name: 'Audit',
        price: '$4k',
        cadence: '3 weeks',
        fits: 'Teams not sure where to start.',
        includes: ['Team interviews', 'Tool review', 'Priority memo', 'Roadmap'],
      },
      {
        name: 'Full ops',
        price: '$6k / mo',
        cadence: 'Min. 6 months',
        fits: 'Teams of 10–40 without a head of ops.',
        includes: ['Embedded ops lead', 'Tool setup', 'Playbooks', 'Hiring help'],
        featured: true,
      },
      {
        name: 'Strategic',
        price: 'from $10k / mo',
        cadence: 'Flexible',
        fits: 'Larger teams that need senior support.',
        includes: ['Senior operator', 'Board reporting', 'Vendor management', 'Quarterly planning'],
      },
    ],
    faqs: [
      { q: 'Are you a fractional COO firm?', a: 'Close. We pair an operator with a tools expert so plans actually ship.' },
      { q: 'Will you help us cut tool costs?', a: 'Yes. Most clients see lower SaaS bills within the first two months.' },
      { q: 'What’s the minimum engagement?', a: 'Six months. Most clients keep us on after that, but as needed.' },
      { q: 'Do you help with hiring?', a: 'We set up the process and sit in on early interviews. We don’t recruit for you.' },
    ],
    related: ['marketing', 'web', 'content'],
  },
  {
    slug: 'content',
    icon: 'Pen',
    tag: 'Voice',
    title: 'Content',
    short: 'Blog posts, landing copy, and emails that sound human and rank well.',
    lede: 'Blog posts, landing copy, and emails that sound human and rank well.',
    hero: 'We write content people want to read — and search engines love.',
    bullets: [
      'Brand voice',
      'SEO articles',
      'Landing pages',
      'Newsletters',
    ],
    stat: ['+212%', 'Avg traffic in 6 months'],
    hue: '#ff9a5c',
    visual: 'editor',
    meta: [
      ['+212%', 'Traffic growth'],
      ['4 / wk', 'Articles published'],
      ['100%', 'Original work'],
      ['1', 'Editor on your team'],
    ],
    deliverables: [
      { title: 'Brand voice guide', blurb: 'A short doc that helps anyone write in your tone.' },
      { title: 'Content calendar', blurb: 'Six months of topics, ready to ship.' },
      { title: 'Articles', blurb: 'Long-form posts, written and edited by humans.' },
      { title: 'Landing copy', blurb: 'Headlines and pages that turn visitors into customers.' },
      { title: 'Newsletter', blurb: 'A regular email that builds your audience.' },
    ],
    phases: [
      { n: '01', title: 'Voice', blurb: 'We learn your style and build a writing guide.', out: 'Voice guide' },
      { n: '02', title: 'Plan', blurb: 'A six-month calendar with topics, briefs, and dates.', out: 'Content plan' },
      { n: '03', title: 'Publish', blurb: 'We write, edit, and publish on schedule.', out: 'Growing library' },
      { n: '04', title: 'Promote', blurb: 'We share your work everywhere your audience is.', out: 'Wider reach' },
    ],
    stack: ['Notion', 'WordPress', 'Substack', 'Ahrefs', 'ConvertKit'],
    packages: [
      {
        name: 'Voice + pilot',
        price: '$5k',
        cadence: '4 weeks',
        fits: 'Teams without a clear content voice yet.',
        includes: ['Voice guide', 'Three articles', 'Topic plan', 'Brief template'],
      },
      {
        name: 'Full program',
        price: 'from $4k / mo',
        cadence: 'Min. 6 months',
        fits: 'Teams ready to publish weekly.',
        includes: ['Editor', '4 articles/mo', 'SEO optimization', 'Quarterly review'],
        featured: true,
      },
      {
        name: 'Editor only',
        price: 'from $2k / mo',
        cadence: 'Flexible',
        fits: 'You have writers. You need an editor.',
        includes: ['Weekly edits', 'Voice coaching', 'Brief reviews', 'Quarterly retro'],
      },
    ],
    faqs: [
      { q: 'Do you ghostwrite?', a: 'Yes. Under your byline or your team’s. Every piece is reviewed by an editor.' },
      { q: 'How is this different from a content mill?', a: 'Small team, real editors, human writers. Quality over quantity.' },
      { q: 'Can you write technical content?', a: 'Yes. We have writers experienced with developer tools and B2B software.' },
      { q: 'Do you guarantee rankings?', a: 'No serious SEO firm does. We do forecast traffic ranges and hold to them.' },
    ],
    related: ['marketing', 'web', 'startup'],
  },
];

export function findService(slug: string): ServiceDetail | undefined {
  return SERVICES.find((s) => s.slug === slug);
}

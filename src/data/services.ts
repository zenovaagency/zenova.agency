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
  /** Optional hero image / animated GIF for the service card and detail page. */
  image?: string;
  /** Optional hero video (mp4, webm) for the service card and detail page. Falls back to `image` as poster. */
  video?: string;
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
    related: ['marketing', 'app', 'ai'],
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
    related: ['web', 'startup', 'ai'],
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
    related: ['web', 'app', 'marketing'],
  },
  {
    slug: 'app',
    icon: 'AppDev',
    tag: 'Build',
    title: 'App Development',
    short: 'Native and cross-platform apps that your users will love.',
    lede: 'Native and cross-platform apps that your users will love.',
    hero: 'We design and build mobile apps that are fast, reliable, and delightful to use.',
    bullets: [
      'iOS & Android',
      'Cross-platform',
      'App store launch',
      'Ongoing support',
    ],
    stat: ['4.8★', 'Avg app rating'],
    hue: '#ea580c',
    visual: 'browser',
    meta: [
      ['4.8★', 'Avg rating'],
      ['8 – 14 wks', 'Build time'],
      ['2', 'Platforms'],
      ['30 d', 'Free support'],
    ],
    deliverables: [
      { title: 'Working app', blurb: 'A fully functional app published on the App Store and Google Play.' },
      { title: 'Design system', blurb: 'Consistent UI components and design patterns across every screen.' },
      { title: 'Backend setup', blurb: 'APIs, databases, and auth — everything your app needs to run.' },
      { title: 'App store assets', blurb: 'Screenshots, descriptions, and icons optimized for conversion.' },
    ],
    phases: [
      { n: '01', title: 'Define', blurb: 'We map out user flows, features, and technical requirements.', out: 'Product spec' },
      { n: '02', title: 'Design', blurb: 'High-fidelity screens and interactive prototypes for every view.', out: 'Design file' },
      { n: '03', title: 'Build', blurb: 'Sprint-by-sprint development with test builds you can try.', out: 'Beta app' },
      { n: '04', title: 'Launch', blurb: 'Submit to stores, monitor feedback, and ship v1.0.', out: 'Live app' },
    ],
    stack: ['React Native', 'Flutter', 'Swift', 'Kotlin', 'Firebase', 'Supabase'],
    packages: [
      {
        name: 'MVP',
        price: 'from $20k',
        cadence: '8 weeks',
        fits: 'Startups testing a product idea with real users.',
        includes: ['Core features', '1 platform', 'Basic design', '30-day support'],
      },
      {
        name: 'Full app',
        price: 'from $45k',
        cadence: '12 weeks',
        fits: 'Businesses launching on both platforms.',
        includes: ['All features', 'iOS + Android', 'Full design', '90-day support'],
        featured: true,
      },
      {
        name: 'Ongoing team',
        price: 'from $15k / mo',
        cadence: 'Rolling',
        fits: 'Product teams needing continuous development.',
        includes: ['Dedicated dev team', 'Bi-weekly releases', 'Monitoring', 'Strategy'],
      },
    ],
    faqs: [
      { q: 'Do you build for both iOS and Android?', a: 'Yes. We use cross-platform frameworks that give native performance on both.' },
      { q: 'Can you work with our existing codebase?', a: 'Absolutely. We\'ll audit your code first and plan the work accordingly.' },
      { q: 'Do you handle app store submission?', a: 'Yes — we manage the entire submission process for both stores.' },
      { q: 'What about updates after launch?', a: 'We offer ongoing maintenance plans to keep your app current and bug-free.' },
    ],
    related: ['web', 'ai', 'startup'],
  },
  {
    slug: 'ai',
    icon: 'Bot',
    tag: 'Build',
    title: 'AI Development',
    short: 'Custom AI agents, chatbots, and automations wired into your business.',
    lede: 'Custom AI agents, chatbots, and automations wired into your business.',
    hero: 'We build AI that does real work — agents, chatbots, and automations trained on your data and connected to your tools.',
    bullets: [
      'AI chat agents',
      'Workflow automation',
      'Custom model training',
      'Tool integrations',
    ],
    stat: ['73%', 'Auto-resolve rate'],
    hue: '#c2410c',
    visual: 'editor',
    meta: [
      ['73%', 'Auto-resolve'],
      ['24/7', 'Availability'],
      ['5 min', 'Setup time'],
      ['3', 'Languages'],
    ],
    deliverables: [
      { title: 'Working chatbot', blurb: 'A trained bot deployed on your website or platform of choice.' },
      { title: 'Conversation flows', blurb: 'Designed dialogues for common scenarios and edge cases.' },
      { title: 'Integration', blurb: 'Connected to your CRM, knowledge base, or ticketing system.' },
      { title: 'Analytics', blurb: 'Track conversations, resolution rates, and customer satisfaction.' },
    ],
    phases: [
      { n: '01', title: 'Design', blurb: 'We map out user intents, conversation flows, and personality.', out: 'Flow diagram' },
      { n: '02', title: 'Train', blurb: 'We feed your data and train the model on your domain.', out: 'Trained model' },
      { n: '03', title: 'Deploy', blurb: 'Integrate and launch on your website, Slack, or WhatsApp.', out: 'Live bot' },
      { n: '04', title: 'Optimize', blurb: 'Monitor conversations and improve responses over time.', out: 'Performance report' },
    ],
    stack: ['OpenAI', 'LangChain', 'Python', 'Zapier', 'Make', 'Slack API'],
    packages: [
      {
        name: 'Quick bot',
        price: '$6k',
        cadence: '3 weeks',
        fits: 'Teams wanting to test AI support on a single channel.',
        includes: ['Basic flows', '1 channel', 'Training data prep', '2-week monitoring'],
      },
      {
        name: 'Full assistant',
        price: 'from $15k',
        cadence: '6 weeks',
        fits: 'Companies wanting a comprehensive AI support agent.',
        includes: ['Custom training', 'Multi-channel', 'CRM integration', 'Analytics', '1 month support'],
        featured: true,
      },
      {
        name: 'Enterprise',
        price: 'Custom',
        cadence: 'Varies',
        fits: 'Large teams with complex workflows and compliance needs.',
        includes: ['Custom LLM fine-tuning', 'On-premise deploy', 'Compliance review', 'Dedicated support'],
      },
    ],
    faqs: [
      { q: 'Can it understand our specific industry?', a: 'Yes. We train the bot on your docs, FAQs, and past conversations.' },
      { q: 'What channels does it work on?', a: 'Web chat, Slack, WhatsApp, Messenger, and custom API integrations.' },
      { q: 'How is this different from a FAQ bot?', a: 'It understands context, handles multi-turn conversations, and can take actions like creating tickets.' },
      { q: 'Do you offer human handoff?', a: 'Yes. When the bot can\'t resolve an issue, it seamlessly transfers to a human agent.' },
    ],
    related: ['web', 'app', 'marketing'],
  },
];

export function findService(slug: string): ServiceDetail | undefined {
  return SERVICES.find((s) => s.slug === slug);
}

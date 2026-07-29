/**
 * Default site content and the types describing it.
 *
 * Extracted out of src/admin/store.ts, which is a client-only module (it uses
 * useSyncExternalStore). This data is pure — it is the fallback copy the site
 * renders before, or instead of, anything the CMS returns — and it is consumed
 * by things that must run on the server with no React at all: the /llms.txt and
 * /llms-full.txt route handlers, and the sitemap. Importing it from the store
 * dragged the whole client store into those server modules and failed the build.
 *
 * store.ts re-exports everything here, so existing imports from '@/admin/store'
 * keep working.
 */
import { PRICING as DEFAULT_PRICING, type PricingService } from '@/data/pricing';

export type { PricingPlan, PricingService } from '@/data/pricing';

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  initials: string;
  tone: string;
  avatar?: string;
  socials?: SocialLink[];
}

export interface SocialLink {
  platform: string;
  url: string;
}

export interface FAQItem {
  id: string;
  q: string;
  a: string;
}

export interface TestimonialItem {
  id: string;
  quote: string;
  name: string;
  role: string;
  tone: string;
  image?: string;
}

export interface MarqueeItem {
  id: string;
  label: string;
}

export interface ProcessStep {
  id: string;
  icon: string;
  title: string;
  timeline: string;
  blurb: string;
  deliverables: string[];
}

export interface ProcessContent {
  eyebrow: string;
  title: string;
  titleAccent: string;
  sub: string;
  steps: ProcessStep[];
}

export interface AboutValue {
  id: string;
  icon: string;
  title: string;
  blurb: string;
  hue: string;
}

export interface AboutFounder {
  id: string;
  quote: string;
  name: string;
  role: string;
  avatar?: string;
  tone: string;
}

export interface AboutRole {
  id: string;
  title: string;
  location: string;
  href: string;
}

export interface AboutMilestone {
  id: string;
  year: string;
  what: string;
}

export interface AboutContent {
  values: AboutValue[];
  founders: AboutFounder[];
  roles: AboutRole[];
  timeline: AboutMilestone[];
}

/** Reusable section header: eyebrow, a title with an optional dimmed second line, and sub-copy. */
export interface SectionIntro {
  eyebrow: string;
  title: string;
  titleAccent: string;
  sub: string;
}

export interface FooterLink {
  id: string;
  label: string;
  href: string;
}

export interface FooterColumn {
  id: string;
  title: string;
  links: FooterLink[];
}

export interface FooterContent {
  tagline: string;
  columns: FooterColumn[];
  legalLinks: FooterLink[];
  copyright: string;
  strapline: string;
}

export interface LegalSection {
  id: string;
  heading: string;
  body: string;
}

export interface LegalDoc {
  title: string;
  updated: string;
  /** Rich HTML body authored in the admin Legal editor. */
  body: string;
  /** Legacy fields kept optional so pre-rich-editor content still validates. */
  intro?: string;
  sections?: LegalSection[];
}

export interface LegalContent {
  privacy: LegalDoc;
  terms: LegalDoc;
}

export interface SiteContent {
  hero: {
    badge: string;
    headline: string;
    headlineAccent: string;
    rotatingWords: string[];
    sub: string;
    primaryCta: string;
    primaryCtaHref: string;
    secondaryCta: string;
    secondaryCtaHref: string;
    ratingText: string;
    avatars: string[];
    brands: Array<{ id: string; name: string; image: string }>;
    stats: Array<{ id: string; num: string; label: string }>;
  };
  cta: {
    eyebrow: string;
    title: string;
    accentTitle: string;
    sub: string;
    primary: string;
    primaryHref: string;
    secondary: string;
    secondaryHref: string;
  };
  faqs: FAQItem[];
  faqSection?: SectionIntro;
  testimonials: TestimonialItem[];
  testimonialsSection?: SectionIntro;
  marquee: MarqueeItem[];
  process: ProcessContent;
  contactEmail: string;
  about: AboutContent;
  footer?: FooterContent;
  legal?: LegalContent;
  /** Rate cards for the /pricing page — one entry per service tab. */
  pricing?: PricingService[];
}

export interface BrandSettings {
  studioName: string;
  tagline: string;
  contactEmail: string;
  careersEmail: string;
  phone: string;
  address: string;
  /** Brand accent hex. Drives the site-wide accent ramp (and the logo) at runtime. */
  accent: string;
  locations: Array<{ id: string; city: string; tz: string; detail: string }>;
  socials?: SocialLink[];
}

export const DEFAULT_TEAM: TeamMember[] = [
  { id: 't1', name: 'Mira Aldana', role: 'Co-founder, Design', bio: 'Leads brand and product design. Previously at Linear.', initials: 'MA', tone: '#ff813a' },
  { id: 't2', name: 'Tobias Reinhardt', role: 'Co-founder, Engineering', bio: 'Leads the build team. Previously at Stripe and Vercel.', initials: 'TR', tone: '#e06820' },
  { id: 't3', name: 'Suri Patel', role: 'Head of Growth', bio: 'Runs marketing, paid media and lifecycle programs.', initials: 'SP', tone: '#ff9a5c' },
  { id: 't4', name: 'Jordan Wei', role: 'Editorial Lead', bio: 'Heads up the content and brand voice work.', initials: 'JW', tone: '#cc6622' },
];

// Default legal copy, authored as the rich HTML the Legal editor produces.
// SEO-oriented: descriptive <h2> section headings, scannable lists, and a
// clear last-updated line rendered separately by the page.
const DEFAULT_PRIVACY_HTML = `
<p>This Privacy Policy explains how Zenova ("we", "us", or "our") collects, uses, shares, and protects your personal information when you visit our website, contact us, or engage our design, development, marketing, and startup services. We are committed to handling your data transparently and in line with applicable data protection laws, including the GDPR and CCPA.</p>
<h2>Information We Collect</h2>
<p>We only collect information that helps us respond to you and deliver our services. This includes:</p>
<ul>
  <li><strong>Information you provide.</strong> Your name, email address, phone number, company, and any project details you share through our contact form, email, or during a call.</li>
  <li><strong>Usage data.</strong> Anonymised analytics such as pages visited, referring site, browser type, device, and approximate location, collected to improve our website.</li>
  <li><strong>Cookies and similar technologies.</strong> Small files that remember your preferences and help us understand how the site is used.</li>
</ul>
<h2>How We Use Your Information</h2>
<p>We use the information we collect to:</p>
<ul>
  <li>Respond to your enquiries and provide the services you request;</li>
  <li>Prepare proposals, quotes, and deliverables for your project;</li>
  <li>Send you relevant updates about your engagement (you can opt out at any time);</li>
  <li>Improve our website, content, and overall customer experience;</li>
  <li>Comply with our legal and contractual obligations.</li>
</ul>
<p>We do <strong>not</strong> sell, rent, or trade your personal information to third parties.</p>
<h2>Legal Bases for Processing</h2>
<p>Where the GDPR applies, we rely on the following legal bases: your <em>consent</em>, the performance of a <em>contract</em> with you, our <em>legitimate interests</em> in operating and improving our business, and where necessary to meet a <em>legal obligation</em>.</p>
<h2>Cookies and Tracking</h2>
<p>We use essential cookies to run the site and optional analytics cookies to measure performance. You can control or disable cookies through your browser settings; note that disabling essential cookies may affect how the site works.</p>
<h2>How We Share Information</h2>
<p>We share personal data only with trusted service providers who help us operate — for example hosting, analytics, and email delivery — and only to the extent needed to perform their function. These providers are bound by confidentiality and data-protection obligations. We may also disclose information where required by law.</p>
<h2>Data Retention</h2>
<p>We keep your information only for as long as necessary to fulfil the purposes described here, to comply with our legal obligations, resolve disputes, and enforce our agreements. When it is no longer needed, we securely delete or anonymise it.</p>
<h2>Data Security</h2>
<p>We apply appropriate technical and organisational measures — including encryption in transit, access controls, and regular reviews — to protect your information against unauthorised access, loss, or misuse.</p>
<h2>Your Rights</h2>
<p>Depending on your location, you may have the right to access, correct, delete, or restrict the use of your personal data, to object to processing, and to data portability. To exercise any of these rights, contact us using the details below.</p>
<h2>International Transfers</h2>
<p>Your information may be processed in countries other than your own. Where we transfer data internationally, we take steps to ensure it receives an adequate level of protection consistent with this policy.</p>
<h2>Children's Privacy</h2>
<p>Our website and services are not directed to children under 16, and we do not knowingly collect their personal information.</p>
<h2>Changes to This Policy</h2>
<p>We may update this Privacy Policy from time to time. When we do, we will revise the "last updated" date above. Significant changes will be highlighted on this page.</p>
<h2>Contact Us</h2>
<p>If you have any questions about this Privacy Policy or how we handle your data, please contact us at <a href="mailto:hello@zenova.agency">hello@zenova.agency</a>.</p>
`.trim();

const DEFAULT_TERMS_HTML = `
<p>These Terms &amp; Conditions ("Terms") govern your access to and use of the Zenova website and the design, development, marketing, and startup services we provide. By using our website or engaging our services, you agree to these Terms. Please read them carefully.</p>
<h2>Acceptance of Terms</h2>
<p>By accessing this website or entering into an engagement with Zenova, you confirm that you have read, understood, and agree to be bound by these Terms and by any project-specific agreement or statement of work we sign with you.</p>
<h2>Services We Provide</h2>
<p>Zenova offers web and app development, marketing, content, operations, automation, and startup support. The exact scope, deliverables, timeline, and fees for any engagement are defined in a separate proposal or statement of work, which takes precedence over these Terms where they conflict.</p>
<h2>Client Responsibilities</h2>
<p>To deliver our best work, we rely on you to:</p>
<ul>
  <li>Provide accurate, complete information and timely feedback;</li>
  <li>Supply any content, assets, or access we reasonably need;</li>
  <li>Ensure you hold the rights to any materials you provide to us;</li>
  <li>Use our website and services only for lawful purposes.</li>
</ul>
<h2>Quotes, Fees, and Payment</h2>
<p>Fees are set out in your proposal or statement of work. Unless stated otherwise, invoices are due within the agreed payment terms. Late or missed payments may result in paused work. Deposits and milestone payments, where applicable, are non-refundable once the corresponding work has begun.</p>
<h2>Intellectual Property</h2>
<p>Unless otherwise stated, all content, branding, and materials on this website are the property of Zenova and protected by applicable intellectual-property laws. Ownership of work produced for a client transfers to that client upon full payment, in accordance with the terms of each engagement. We may showcase completed work in our portfolio unless we agree otherwise in writing.</p>
<h2>Confidentiality</h2>
<p>Each party agrees to keep confidential any non-public information shared during an engagement and to use it only for the purpose of delivering the services.</p>
<h2>Warranties and Disclaimers</h2>
<p>Our website and services are provided on an "as is" and "as available" basis. To the fullest extent permitted by law, we disclaim all warranties, express or implied, including fitness for a particular purpose and non-infringement. We do not warrant that the website will be uninterrupted or error-free.</p>
<h2>Limitation of Liability</h2>
<p>To the fullest extent permitted by law, Zenova shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of our website or services. Our total liability for any claim shall not exceed the amount you paid us for the engagement giving rise to the claim.</p>
<h2>Indemnification</h2>
<p>You agree to indemnify and hold Zenova harmless from any claims, losses, or expenses arising from your breach of these Terms or your misuse of our website or services.</p>
<h2>Term and Termination</h2>
<p>Either party may terminate an engagement in accordance with the notice provisions of the relevant statement of work. Upon termination, you agree to pay for all work completed up to the termination date.</p>
<h2>Governing Law</h2>
<p>These Terms are governed by the laws of the jurisdiction in which Zenova operates, without regard to conflict-of-law principles. Any disputes will be subject to the exclusive jurisdiction of the courts of that location.</p>
<h2>Changes to These Terms</h2>
<p>We may update these Terms from time to time. Continued use of our website or services after changes take effect constitutes acceptance of the revised Terms. The "last updated" date above reflects the latest revision.</p>
<h2>Contact Us</h2>
<p>If you have any questions about these Terms &amp; Conditions, please contact us at <a href="mailto:hello@zenova.agency">hello@zenova.agency</a>.</p>
`.trim();

export const DEFAULT_CONTENT: SiteContent = {
  hero: {
    badge: 'Available for new projects',
    headline: 'Building ambitious brands with',
    headlineAccent: 'thoughtful design',
    rotatingWords: ['Web Development', 'App Development', 'Marketing', 'Startup Support', 'AI'],
    sub: 'Design, development, and growth — one team, from strategy to launch.',
    primaryCta: 'Get Started',
    primaryCtaHref: '/contact',
    secondaryCta: 'See our work',
    secondaryCtaHref: '#services',
    ratingText: 'Trusted by 1000+ clients',
    avatars: [
      'https://images.shadcnspace.com/assets/profiles/user-1.jpg',
      'https://images.shadcnspace.com/assets/profiles/user-2.jpg',
      'https://images.shadcnspace.com/assets/profiles/user-3.jpg',
      'https://images.shadcnspace.com/assets/profiles/user-5.jpg',
    ],
    brands: [
      { id: 'b1', name: 'Brand 1', image: 'https://images.shadcnspace.com/assets/brand-logo/logoipsum-1.svg' },
      { id: 'b2', name: 'Brand 2', image: 'https://images.shadcnspace.com/assets/brand-logo/logoipsum-2.svg' },
      { id: 'b3', name: 'Brand 3', image: 'https://images.shadcnspace.com/assets/brand-logo/logoipsum-3.svg' },
      { id: 'b4', name: 'Brand 4', image: 'https://images.shadcnspace.com/assets/brand-logo/logoipsum-4.svg' },
      { id: 'b5', name: 'Brand 5', image: 'https://images.shadcnspace.com/assets/brand-logo/logoipsum-5.svg' },
    ],
    stats: [],
  },
  cta: {
    eyebrow: 'Open for new projects',
    title: 'Got an idea?',
    accentTitle: "Let's talk.",
    sub: 'A quick 30-minute call. No pitch, just your project.',
    primary: 'Book a call',
    primaryHref: '/contact',
    secondary: 'hello@zenova.agency',
    secondaryHref: 'mailto:hello@zenova.agency',
  },
  faqs: [
    { id: 'f1', q: 'How are you different from an agency?', a: 'One team handles design, build, and growth. No handoffs between vendors — same people from start to finish.' },
    { id: 'f2', q: 'How long is a typical project?', a: '6 to 10 weeks for a build. Many clients stay on monthly for ongoing growth work.' },
    { id: 'f3', q: 'Do we own the code and designs?', a: 'Yes. Everything sits in your accounts from day one — your GitHub, your Figma, your domain.' },
    { id: 'f4', q: 'How does pricing work?', a: 'Flat fee per phase for builds. Flat monthly fee for ongoing work. No hourly billing.' },
    { id: 'f5', q: 'Can you work with our team?', a: 'Yes. We often plug into existing teams and follow your conventions.' },
    { id: 'f6', q: 'How soon can we start?', a: 'Usually 1 to 2 weeks after our intro call.' },
  ],
  faqSection: {
    eyebrow: 'FAQ',
    title: 'Common',
    titleAccent: 'questions.',
    sub: 'If you don’t see your question here, just ask.',
  },
  testimonials: [
    { id: 'q1', quote: 'They replaced three of our vendors. One team, one channel, one invoice.', name: 'Maya Okafor', role: 'COO, Northwind', tone: '#ff813a', image: 'https://ui-avatars.com/api/?name=Maya+Okafor&background=ff813a&color=fff' },
    { id: 'q2', quote: 'A working prototype in eleven days. Best momentum we’ve had in years.', name: 'Daniel Reyes', role: 'CEO, Stellar', tone: '#e06820', image: 'https://ui-avatars.com/api/?name=Daniel+Reyes&background=e06820&color=fff' },
    { id: 'q3', quote: 'We came in for a site. We left with a full growth plan and real pipeline.', name: 'Priya Nair', role: 'Head of Growth, Aperture', tone: '#ff9a5c', image: 'https://ui-avatars.com/api/?name=Priya+Nair&background=ff9a5c&color=fff' },
    { id: 'q4', quote: 'The cleanest handoff we’ve ever seen. Our team picked it up the next morning.', name: 'Jonas Weber', role: 'CTO, Cobalt', tone: '#ff6b1a', image: 'https://ui-avatars.com/api/?name=Jonas+Weber&background=ff6b1a&color=fff' },
    { id: 'q5', quote: 'Traffic up 4x. CAC down a third. They run growth like a product team.', name: 'Aisha Mensah', role: 'Founder, Mosaic', tone: '#cc6622', image: 'https://ui-avatars.com/api/?name=Aisha+Mensah&background=cc6622&color=fff' },
    { id: 'q6', quote: 'Most agencies sell a deck. Zenova built us a system and taught us how to run it.', name: 'Leo Castelli', role: 'COO, Verge', tone: '#ffa870', image: 'https://ui-avatars.com/api/?name=Leo+Castelli&background=ffa870&color=fff' },
  ],
  testimonialsSection: {
    eyebrow: 'Testimonials',
    title: 'What our users',
    titleAccent: 'are saying.',
    sub: 'Real feedback from the teams and founders we\'ve partnered with — across branding, product, and growth.',
  },
  marquee: [
    { id: 'm1', label: 'Branding' },
    { id: 'm2', label: 'Web Design' },
    { id: 'm3', label: 'SEO' },
    { id: 'm4', label: 'Paid Ads' },
    { id: 'm5', label: 'Email' },
    { id: 'm6', label: 'Content' },
    { id: 'm7', label: 'Strategy' },
    { id: 'm8', label: 'Operations' },
  ],
  process: {
    eyebrow: 'How we work',
    title: 'A simple process,',
    titleAccent: 'start to finish.',
    sub: 'Four phases in constant motion. Select one to see what happens inside it.',
    steps: [
      {
        id: 'p1',
        icon: 'Compass',
        title: 'Discover',
        timeline: 'Week 1',
        blurb: 'A working session to align on your goals, audience, and what success looks like.',
        deliverables: ['Goals workshop', 'Project plan', 'Timeline', 'Success metrics'],
      },
      {
        id: 'p2',
        icon: 'Pen',
        title: 'Design',
        timeline: 'Week 2–4',
        blurb: 'Brand, layout, and product design in one shared file. You see what we see, every day.',
        deliverables: ['Brand identity', 'Page designs', 'Prototype', 'Design review'],
      },
      {
        id: 'p3',
        icon: 'Code',
        title: 'Build',
        timeline: 'Week 4–8',
        blurb: 'We build it in small pieces with weekly demos. Code is yours, written to be easy to maintain.',
        deliverables: ['Working website', 'CMS setup', 'Speed optimization', 'Handoff docs'],
      },
      {
        id: 'p4',
        icon: 'Rocket',
        title: 'Grow',
        timeline: 'Month 2+',
        blurb: 'After launch we stay involved. Monthly cycles of marketing, SEO, and content to build on what we shipped.',
        deliverables: ['Ad campaigns', 'SEO & content', 'Email automation', 'Monthly report'],
      },
    ],
  },
  contactEmail: 'hello@zenova.agency',
  about: {
    values: [
      { id: 'v1', icon: 'Layers', title: 'One team, start to finish', blurb: 'The people you meet on day one are the same people on day ninety. No handoffs.', hue: '#ff813a' },
      { id: 'v2', icon: 'Spark', title: 'Build, then talk', blurb: 'We ship working things, not decks about working things.', hue: '#e06820' },
      { id: 'v3', icon: 'Compass', title: 'Outcomes over output', blurb: 'Every project ends with one number we agreed to move. We share it either way.', hue: '#ff9a5c' },
    ],
    founders: [
      {
        id: 'f1',
        quote:
          'We kept meeting founders who had three vendors and no one accountable for the result. That gap is the whole reason Zenova exists.',
        name: 'Mira Aldana',
        role: 'Co-founder, Design',
        tone: '#ff813a',
      },
      {
        id: 'f2',
        quote:
          'Everything we ship has to survive contact with real users. If it only looks good in a deck, we have not finished the job.',
        name: 'Tobias Reinhardt',
        role: 'Co-founder, Engineering',
        tone: '#e06820',
      },
    ],
    roles: [
      { id: 'r1', title: 'Senior product designer', location: 'Remote', href: '' },
      { id: 'r2', title: 'Senior engineer', location: 'Remote', href: '' },
      { id: 'r3', title: 'Growth strategist', location: 'Remote', href: '' },
    ],
    timeline: [
      { id: 'tl1', year: '2019', what: 'Mira and Tobias start Zenova.' },
      { id: 'tl2', year: '2021', what: 'First long-term client. Growth becomes a core practice.' },
      { id: 'tl3', year: '2023', what: 'Content and operations teams join.' },
      { id: 'tl4', year: '2026', what: 'Working with 8 active clients across 3 continents.' },
    ],
  },
  footer: {
    tagline: 'A small team that designs, builds, and grows modern businesses.',
    columns: [
      {
        id: 'fc1',
        title: 'Services',
        links: [
          { id: 'fl1', label: 'Web Development', href: '/services/web' },
          { id: 'fl2', label: 'Marketing', href: '/services/marketing' },
          { id: 'fl3', label: 'Startup Support', href: '/services/startup' },
          { id: 'fl4', label: 'Operations', href: '/services/ops' },
          { id: 'fl5', label: 'Content', href: '/services/content' },
        ],
      },
      {
        id: 'fc2',
        title: 'Company',
        links: [
          { id: 'fl6', label: 'About', href: '/about' },
          { id: 'fl7', label: 'Work', href: '/work' },
          { id: 'fl8', label: 'Pricing', href: '/pricing' },
          { id: 'fl10', label: 'Blog', href: '/blog' },
          { id: 'fl9', label: 'Contact', href: '/contact' },
        ],
      },
      {
        id: 'fc3',
        title: 'About',
        links: [
          { id: 'fll1', label: 'Privacy Policy', href: '/privacy' },
          { id: 'fll2', label: 'Terms & Conditions', href: '/terms' },
        ],
      },
    ],
    legalLinks: [],
    copyright: '© 2026 Zenova, Inc. All rights reserved.',
    strapline: 'Design, build, and grow',
  },
  legal: {
    privacy: {
      title: 'Privacy Policy',
      updated: 'Last updated: January 2026',
      body: DEFAULT_PRIVACY_HTML,
    },
    terms: {
      title: 'Terms & Conditions',
      updated: 'Last updated: January 2026',
      body: DEFAULT_TERMS_HTML,
    },
  },
  pricing: DEFAULT_PRICING,
};

export const DEFAULT_BRAND: BrandSettings = {
  studioName: 'Zenova',
  tagline: 'Design, build, and grow — one team.',
  contactEmail: 'hello@zenova.agency',
  careersEmail: 'careers@zenova.agency',
  // Intentionally empty, not seeded with a sample. These fed the public
  // contact page directly, so the fictional 555 number and filler street
  // address were being published as this agency's real details. Fill them in
  // under Admin → Brand settings; the contact page hides an empty row and
  // shows it again as soon as a real value is saved.
  phone: '',
  address: '',
  accent: '#ff813a',
  locations: [
    { id: 'l1', city: 'Brooklyn, NY', tz: 'EST', detail: 'Headquarters' },
    { id: 'l2', city: 'Berlin', tz: 'CET', detail: 'European hub' },
    { id: 'l3', city: 'Remote', tz: 'Global', detail: 'We hire worldwide' },
  ],
  socials: [
    { platform: 'twitter', url: 'https://twitter.com/zenova' },
    { platform: 'linkedin', url: 'https://www.linkedin.com/company/zenova' },
    { platform: 'github', url: 'https://github.com/zenova' },
    { platform: 'dribbble', url: 'https://dribbble.com/zenova' },
    { platform: 'facebook', url: 'https://facebook.com/zenova' },
  ],
};

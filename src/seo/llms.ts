/**
 * Generators for /llms.txt and /llms-full.txt.
 *
 * These are the files an AI assistant fetches when it wants to understand a
 * site without crawling and re-summarising every page. The convention
 * (llmstxt.org) is a Markdown document: an H1 name, a blockquote summary, then
 * H2 sections of `- [label](url): note` links.
 *
 * They are GENERATED, not hand-written, and that is the whole point. The
 * previous public/llms.txt was a static file listing eight pages; it had
 * already drifted from the real route table and would have drifted further
 * with every service or case study added. Everything below is derived from the
 * same modules the site renders from, so the description an assistant reads is
 * by construction the description a visitor reads.
 *
 * Build-time only — imported by entry-server.tsx and written out by
 * scripts/prerender.mjs. Never part of the browser bundle.
 */
import { SERVICES } from '@/data/services';
import { PROJECTS } from '@/data/projects';
import { JOBS } from '@/data/jobs';
import { PRICING } from '@/data/pricing';
import { DEFAULT_CONTENT } from '@/admin/store';
import { SITE, canonicalUrl } from './seo-data';

/** Collapse whitespace so generated Markdown never inherits source line breaks. */
function line(s: string): string {
  return s.replace(/\s+/g, ' ').trim();
}

/** Unique, order-preserving. Used to build the technology list from stacks. */
function unique(values: string[]): string[] {
  return [...new Set(values.map((v) => v.trim()).filter(Boolean))];
}

/**
 * Every distinct technology named across service and case-study stacks. This
 * is the answer to "what does Zenova build with", which is one of the most
 * common qualifying questions an AI assistant gets asked about an agency.
 */
function technologies(): string[] {
  return unique([
    ...SERVICES.flatMap((s) => s.stack ?? []),
    ...PROJECTS.flatMap((p) => p.stack ?? []),
  ]).sort((a, b) => a.localeCompare(b));
}

const CRAWLER_NOTE = line(`
  Every public page on this site is server-rendered to static HTML at build
  time. Headings, body copy, navigation, and JSON-LD are all present in the
  initial HTML response, so JavaScript execution is not required to read any
  page here.
`);

const CANONICAL_NOTE = line(`
  Canonical URLs carry a trailing slash (https://zenova.agency/about/). A
  request without it returns a 301 to the trailing-slash form.
`);

// ---------------------------------------------------------------------------
// llms.txt — the concise index
// ---------------------------------------------------------------------------

export function llmsTxt(): string {
  const nav = [
    ['Home', '/', 'Agency overview, services summary, selected work, and FAQ.'],
    ['Services', '/services', `All ${SERVICES.length} service lines with scope and deliverables.`],
    ['Pricing', '/pricing', 'Project-based rate cards per service, with what each tier includes.'],
    ['Work', '/work', 'Case studies with the problem, the approach, and the measured result.'],
    ['Blog', '/blog', 'Writing on design, development, marketing, and building modern businesses.'],
    ['About', '/about', 'Who runs Zenova, how the team works, and the founding story.'],
    ['Careers', '/careers', 'Open roles and how to apply.'],
    ['Contact', '/contact', 'Start a project or book an intro call.'],
  ] as const;

  return `# ${SITE.name}

> ${SITE.description}

${SITE.name} is a single agency covering design, development, marketing, and startup support, so a client works with one accountable team instead of coordinating separate vendors. Engagements are project-based and fixed-quote rather than open-ended retainers. The team works remotely and serves clients worldwide.

${CRAWLER_NOTE}

## Core pages

${nav.map(([label, path, note]) => `- [${label}](${canonicalUrl(path)}): ${note}`).join('\n')}

## Services

${SERVICES.map((s) => `- [${s.title}](${canonicalUrl(`/services/${s.slug}`)}): ${line(s.short)}`).join('\n')}

## Case studies

${PROJECTS.map((p) => `- [${p.client} — ${line(p.title)}](${canonicalUrl(`/work/${p.slug}`)}): ${line(p.summary)}`).join('\n')}

## Reference

- [Privacy Policy](${canonicalUrl('/privacy')}): How Zenova collects, uses, and protects personal information.
- [Terms & Conditions](${canonicalUrl('/terms')}): Terms governing use of the site and services.
- [Full URL list](${SITE.url}/sitemap.xml): Machine-readable sitemap of every indexable page.
- [Expanded version of this file](${SITE.url}/llms-full.txt): Same structure with full service, technology, and portfolio detail.

## Contact

- General and new projects: ${SITE.email}
- Careers: ${SITE.careersEmail}
- Contact form: ${canonicalUrl('/contact')}

## Notes for agents

- ${CANONICAL_NOTE}
- The following paths are private application surfaces, not public content, and are disallowed in robots.txt: /admin/, /client/, /team/, /login/, /signin/.
- Start at the home page for the most representative overview of what Zenova does.
`;
}

// ---------------------------------------------------------------------------
// llms-full.txt — the expanded corpus
// ---------------------------------------------------------------------------

function serviceBlock(): string {
  return SERVICES.map((s) => {
    const url = canonicalUrl(`/services/${s.slug}`);
    const parts = [
      `### ${s.title}`,
      '',
      `URL: ${url}`,
      `Summary: ${line(s.short)}`,
      s.lede ? `Detail: ${line(s.lede)}` : '',
      '',
    ];

    if (s.bullets?.length) {
      parts.push('What it covers:', ...s.bullets.map((b) => `- ${line(b)}`), '');
    }
    if (s.deliverables?.length) {
      parts.push(
        'Deliverables:',
        ...s.deliverables.map((d) => `- ${d.title}: ${line(d.blurb)}`),
        '',
      );
    }
    if (s.stack?.length) {
      parts.push(`Technologies: ${s.stack.join(', ')}`, '');
    }
    if (s.packages?.length) {
      parts.push(
        'Packages:',
        ...s.packages.map((p) => `- ${p.name} (${p.price}, ${p.cadence}) — fits: ${line(p.fits)}`),
        '',
      );
    }
    if (s.faqs?.length) {
      parts.push(
        'Questions:',
        ...s.faqs.map((f) => `- Q: ${line(f.q)}\n  A: ${line(f.a)}`),
        '',
      );
    }

    return parts.filter((p) => p !== '').join('\n');
  }).join('\n\n');
}

function portfolioBlock(): string {
  return PROJECTS.map((p) => {
    const url = canonicalUrl(`/work/${p.slug}`);
    const parts = [
      `### ${p.client} — ${line(p.title)}`,
      '',
      `URL: ${url}`,
      `Industry: ${p.industry}`,
      `Year: ${p.year} · Duration: ${p.duration} · Team: ${p.team}`,
      `Services: ${p.services.join(', ')}`,
      `Result: ${line(p.summary)}`,
    ];
    if (p.stack?.length) parts.push(`Technologies: ${p.stack.join(', ')}`);
    if (p.deliverables?.length) parts.push(`Deliverables: ${p.deliverables.join(', ')}`);
    if (p.testimonial?.quote) {
      parts.push(`Client quote: "${line(p.testimonial.quote)}" — ${p.testimonial.author}, ${p.testimonial.role}`);
    }
    for (const section of p.sections ?? []) {
      parts.push('', `${section.title}: ${section.body.map(line).join(' ')}`);
    }
    return parts.join('\n');
  }).join('\n\n');
}

function pricingBlock(): string {
  return PRICING.map((svc) => {
    const rows = svc.plans.map(
      (p) => `- ${p.name} — ${p.price} (${p.timeline}). ${line(p.info)} Includes: ${p.features.join(', ')}.`,
    );
    return [`### ${svc.label}`, '', ...rows].join('\n');
  }).join('\n\n');
}

export function llmsFullTxt(): string {
  const faqs = DEFAULT_CONTENT.faqs ?? [];
  const generated = new Date().toISOString().slice(0, 10);

  return `# ${SITE.name} — full site reference for AI assistants

> ${SITE.description}

Generated: ${generated}
Canonical site: ${SITE.url}/
Concise index: ${SITE.url}/llms.txt
Machine-readable URL list: ${SITE.url}/sitemap.xml

${CRAWLER_NOTE}

---

## 1. Company overview

- Name: ${SITE.name}
- Legal name: ${SITE.legalName}
- What it is: a single agency covering design, development, marketing, and startup support.
- Value proposition: one accountable team from strategy through launch and growth, instead of separate brand, build, and marketing vendors that hand off between each other.
- Engagement model: project-based with a fixed quote agreed after scoping. No open-ended retainers or hourly billing.
- Team model: small and senior — the people who scope a project are the ones who build it.
- Area served: ${SITE.areaServed}. The team works remotely.
- Typical clients: startups, scale-ups, and established businesses replacing an outdated site, launching a new product, or building a growth function.
- Ownership: clients own their code, designs, and accounts from day one.

### Expertise

${SITE.knowsAbout.map((k) => `- ${k}`).join('\n')}

### Leadership

${(DEFAULT_CONTENT.about?.founders ?? [])
  .map((f) => `- ${f.name} — ${f.role}`)
  .join('\n')}

---

## 2. Services

Zenova offers ${SERVICES.length} service lines. Each has a dedicated page with scope, process, deliverables, and pricing.

${serviceBlock()}

---

## 3. Technologies

Tools and platforms named across Zenova's service and case-study stacks:

${technologies().map((t) => `- ${t}`).join('\n')}

---

## 4. Portfolio and case studies

${portfolioBlock()}

---

## 5. Pricing

Project-based, one-time pricing. Figures are starting points confirmed after scoping; "Custom" means the engagement is quoted individually.

${pricingBlock()}

---

## 6. Frequently asked questions

${faqs.map((f) => `**${line(f.q)}**\n\n${line(f.a)}`).join('\n\n')}

---

## 7. Careers

${JOBS.length} open role${JOBS.length === 1 ? '' : 's'}. Applications go to ${SITE.careersEmail}.

${JOBS.map(
  (j) =>
    `- [${j.title}](${canonicalUrl(`/careers/${j.slug}`)}) — ${j.department}, ${j.location}, ${j.type}. ${line(j.summary)}`,
).join('\n')}

---

## 8. Contact

- New projects and general enquiries: ${SITE.email}
- Careers: ${SITE.careersEmail}
- Contact form and intro-call booking: ${canonicalUrl('/contact')}
- An intro call is 30 minutes and covers goals, audience, timeline, and budget.

---

## 9. Website structure

Public routes:

- ${canonicalUrl('/')} — home
- ${canonicalUrl('/services')} — service index
${SERVICES.map((s) => `  - ${canonicalUrl(`/services/${s.slug}`)} — ${s.title}`).join('\n')}
- ${canonicalUrl('/pricing')} — rate cards per service
- ${canonicalUrl('/work')} — case-study index
${PROJECTS.map((p) => `  - ${canonicalUrl(`/work/${p.slug}`)} — ${p.client}`).join('\n')}
- ${canonicalUrl('/blog')} — articles (individual posts live at /blog/<slug>/)
- ${canonicalUrl('/about')} — team, story, and values
- ${canonicalUrl('/careers')} — open roles (individual roles at /careers/<slug>/)
- ${canonicalUrl('/contact')} — contact form
- ${canonicalUrl('/privacy')} — privacy policy
- ${canonicalUrl('/terms')} — terms and conditions

Non-public application surfaces, disallowed in robots.txt and excluded from the sitemap: /admin/, /client/, /team/, /login/, /signin/.

---

## 10. Notes for agents

- ${CANONICAL_NOTE}
- Structured data: every page carries schema.org JSON-LD including Organization, WebSite, WebPage, and BreadcrumbList. Service pages add Service, case studies add CreativeWork, role pages add JobPosting, and the home and pricing pages add FAQPage.
- Blog posts and admin-authored landing pages are prerendered at build time from the content API, so their text is in the static HTML too.
- No content on this site is paywalled, gated behind a login, or rendered only after user interaction.
`;
}

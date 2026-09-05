/**
 * Structured data builders.
 *
 * Organization schema lives in Base.astro and applies site-wide. Everything
 * here is per-page and injected through Base's `head` slot.
 */

import { SITE, type PricingService } from '../data/site';

const abs = (path: string) => new URL(path, SITE.url).href;

/**
 * The @id of the site-wide Organization node, which Base.astro emits.
 *
 * Exported because Base.astro has to stamp the *same* string onto that node.
 * It used to be a private constant here, the Organization node carried no
 * `@id` at all, and so every `{'@id': ORG}` below pointed at nothing. That is
 * merely untidy for `provider`, but `hiringOrganization` is required for
 * JobPosting rich results, so it made every role page fail validation.
 */
export const ORG = `${SITE.url}/#organization`;

/**
 * Turn a free-form rate-card price into schema.org price fields.
 *
 * Ported from the previous site, and the distinction it draws is the whole
 * point of the function. The cards carry marketing strings ("$8k",
 * "from $24k", "Custom") because that is what reads well on the page;
 * structured data needs numbers. The three cases are genuinely different
 * commercial claims, and flattening them publishes a price we do not offer:
 *
 *   "$8k"       -> a fixed price
 *   "from $24k" -> a minimum, expressed as a PriceSpecification
 *   "Custom"    -> no price at all, so emit none
 */
export function priceFields(raw: string): Record<string, unknown> {
  const text = raw.trim().toLowerCase();
  const match = text.match(/\$?\s*([\d,.]+)\s*(k|m)?/);
  if (!match) return {};

  const digits = Number(match[1].replace(/,/g, ''));
  if (!Number.isFinite(digits)) return {};

  const scale = match[2] === 'k' ? 1_000 : match[2] === 'm' ? 1_000_000 : 1;
  const amount = digits * scale;
  const isFrom = /\bfrom\b|\bstarting\b|^\s*\+/.test(text);

  return isFrom
    ? {
        priceSpecification: {
          '@type': 'PriceSpecification',
          minPrice: amount,
          priceCurrency: 'USD',
        },
      }
    : { price: amount, priceCurrency: 'USD' };
}

/**
 * One service's three plans as an OfferCatalog node.
 *
 * `url` is the service's own rate-card page. It used to be /pricing#<slug>,
 * which stopped resolving when each service got a route of its own.
 */
function serviceOffers(svc: PricingService) {
  const url = abs(`/pricing/${svc.slug}`);
  return {
    '@type': 'OfferCatalog',
    name: svc.label,
    url,
    itemListElement: svc.plans.map((plan) => ({
      '@type': 'Offer',
      name: plan.name,
      description: plan.info,
      category: svc.label,
      availability: 'https://schema.org/InStock',
      url,
      ...priceFields(plan.price),
      itemOffered: {
        '@type': 'Service',
        name: `${svc.label} — ${plan.name}`,
        serviceType: svc.label,
        provider: { '@id': ORG },
      },
    })),
  };
}

/** The full rate card as one nested OfferCatalog. For /pricing only. */
export function pricingCatalog(pricing: PricingService[]) {
  const url = abs('/pricing');
  return {
    '@context': 'https://schema.org',
    '@type': 'OfferCatalog',
    '@id': `${url}#pricing`,
    name: `${SITE.name} pricing`,
    url,
    provider: { '@id': ORG },
    itemListElement: pricing.map(serviceOffers),
  };
}

/**
 * One service's rate card, for /pricing/<slug>.
 *
 * Separate from pricingCatalog because five pages emitting the same catalog
 * under the same @id is one entity claiming five canonical URLs. This gives
 * each detail page an @id derived from its own route.
 */
export function serviceCatalog(svc: PricingService) {
  const url = abs(`/pricing/${svc.slug}`);
  return {
    '@context': 'https://schema.org',
    ...serviceOffers(svc),
    '@id': `${url}#pricing`,
    name: `${svc.label} pricing`,
    provider: { '@id': ORG },
  };
}

export function faqPage(path: string, items: { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${abs(path)}#faq`,
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  };
}

/**
 * Home is always the first crumb, so callers pass only the trail below it.
 *
 * Takes a list rather than one page because the site is two levels deep now:
 * /services/web is Home > Services > Web Development, and flattening that to
 * two crumbs would describe a hierarchy the site does not have.
 */
export function breadcrumb(trail: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: abs('/') },
      ...trail.map((crumb, i) => ({
        '@type': 'ListItem',
        position: i + 2,
        name: crumb.name,
        item: abs(crumb.path),
      })),
    ],
  };
}

/**
 * A BlogPosting, for /blog/<slug>.
 *
 * `author` defaults to the studio. An unnamed byline is not invented: if a
 * post carries a frontmatter author we emit a Person, otherwise the post is
 * authored by the organization and we say so — a fabricated person node would
 * claim a writer who does not exist.
 *
 * Google requires image, author, datePublished and either headline or
 * name for article rich results; publisher points at the site-wide
 * Organization node rather than restating it, matching the other builders.
 */
export function blogPosting(post: {
  slug: string;
  title: string;
  description: string;
  pubDate: Date;
  updatedDate?: Date;
  author?: string;
  image?: string;
}) {
  const url = abs(`/blog/${post.slug}`);
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': `${url}#posting`,
    headline: post.title,
    description: post.description,
    image: abs(post.image ?? '/og-card.png'),
    datePublished: post.pubDate.toISOString(),
    // dateModified is optional, but an absent one makes Google assume the
    // published date — saying "never edited" explicitly is more honest than
    // letting that assumption stand when updatedDate exists.
    dateModified: (post.updatedDate ?? post.pubDate).toISOString(),
    author: post.author
      ? { '@type': 'Person', name: post.author }
      : { '@id': ORG },
    publisher: { '@id': ORG },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
  };
}

/**
 * A JobPosting, for /careers/<slug>.
 *
 * Only ever built for a published role — data/jobs.ts filters drafts out of
 * getStaticPaths, so a placeholder can never reach this. A live JobPosting
 * for a role that is not open is a Search Console problem and, more to the
 * point, wastes a candidate's time.
 *
 * `validThrough` is omitted rather than guessed when absent: a posting with a
 * fabricated expiry is worse than one with none. `datePosted` follows the same
 * rule — a role dated today because nobody set a date is worse than one with
 * no date, even though Google asks for it.
 */
export function jobPosting(job: {
  slug: string;
  title: string;
  team: string;
  type: string;
  location: string;
  summary: string;
  intro: string;
  responsibilities: string[];
  posted?: string;
}) {
  const url = abs(`/careers/${job.slug}`);

  // Remote and on-site are different postings, not one posting with a flag.
  // This used to emit jobLocationType TELECOMMUTE and applicantLocationRequirements
  // unconditionally, which published every role as fully remote — including the
  // city-based ones data/jobs.ts explicitly allows ("Remote, or a city").
  const remote = /remote|anywhere|distributed/i.test(job.location);

  // "Remote — EU", "Remote (US)" — whatever is left after the word itself is
  // the region an applicant has to be in. Google wants applicantLocationRequirements
  // on every TELECOMMUTE posting, so a remote role that names no region emits
  // none and gets flagged. That is the right outcome: the posting has not said.
  const region = job.location.replace(/remote/i, '').replace(/^[\s—–\-(,]+|[\s)]+$/g, '');

  const where = remote
    ? {
        jobLocationType: 'TELECOMMUTE',
        ...(region
          ? { applicantLocationRequirements: { '@type': 'Place', name: region } }
          : {}),
      }
    : {
        jobLocation: {
          '@type': 'Place',
          address: { '@type': 'PostalAddress', addressLocality: job.location },
        },
      };

  return {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    '@id': `${url}#posting`,
    title: job.title,
    description: [job.intro, ...job.responsibilities].join(' '),
    employmentType: job.type.toUpperCase().replace(/[\s-]+/g, '_'),
    hiringOrganization: { '@id': ORG },
    occupationalCategory: job.team,
    directApply: true,
    url,
    ...(job.posted ? { datePosted: job.posted } : {}),
    ...where,
  };
}

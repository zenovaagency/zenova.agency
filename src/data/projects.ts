/**
 * Projects — the /work portfolio.
 *
 * WHAT IS IN HERE TODAY: four demo entries, so the portfolio has something to
 * show while the real case studies are being written. They are sample builds.
 * They name no client, claim no metric, and say "Demo" on the card and on the
 * page. That labelling is the whole reason they are safe to ship.
 *
 * WHY THAT MATTERS. The previous Zenova site shipped six fictional case
 * studies (Northwind Labs, Aperture Health, Stellar Capital, Cobalt Studio,
 * Mosaic, Verge) with invented clients and invented results — see the header of
 * data/site.ts. Those were purged. A demo entry is not a quiet way to bring
 * them back: the moment one of these acquires a client name or a percentage,
 * it has become the thing that was removed.
 *
 * TO REMOVE THE DEMOS
 *   Delete the four `demo: true` objects. /work falls back to the WORK_COPY
 *   empty state on its own, and the service pages drop their project band.
 *   HERO.secondaryHref in data/site.ts should go back to /services at the same
 *   time, so the hero button stops pointing at an empty page.
 *
 * TO PUBLISH A REAL PROJECT
 *   1. Fill in `client` — real name, and only with their agreement to be named.
 *      If they would rather not be, leave the entry drafted rather than
 *      anonymising it into something a reader cannot verify.
 *   2. Check `outcomes` — a number goes in only if it can be stood behind and
 *      the client has agreed to publish it. An empty array is fine; the detail
 *      page renders without the block.
 *   3. Leave `demo` unset.
 *   4. Set `draft: false`.
 *
 * `draft` still works and is still the right tool for a real write-up that is
 * half finished: drafts never reach getStaticPaths, so they cannot be linked
 * to, indexed, or reached by guessing the URL.
 */

import type { MotifKind, ServiceSlug } from './site';

export interface Project {
  slug: string;
  /** Drafts never reach getStaticPaths. Flip only when the entry is real. */
  draft: boolean;
  /**
   * A sample build shipped to fill the portfolio, not a client engagement.
   * Rendered as a visible "Demo" label everywhere the project appears — never
   * dressed up as real work.
   */
  demo?: boolean;
  title: string;
  /**
   * Optional, and absent on demos. There is no client behind a demo, and
   * inventing one is exactly what the header of this file exists to prevent.
   */
  client?: string;
  service: ServiceSlug;
  year: string;
  /** One line, used on the /work card. */
  summary: string;
  /** The detail page lede, under the h1. */
  intro: string;
  /** What we actually did. */
  scope: string[];
  stack: string[];
  /** Published numbers only. Empty is valid and renders no block. */
  outcomes: { value: string; label: string }[];
  /** The narrative body of the case study. */
  sections: { heading: string; body: string }[];
  /**
   * Card and hero artwork. Defaults to the service's own motif.
   *
   * Deliberately NOT an Artifact index: all eight of those drawings are spoken
   * for by DELIVERABLES and now render on the service pages, so a project
   * reusing one would show the reader the same drawing they just saw labelled
   * "Your website" — which reads as a rendering bug, not as a house style.
   *
   * For the same reason each project below picks one of the four project
   * motifs rather than falling through to its service's drawing, which sits in
   * the hero panel directly above it on /services/<slug>.
   */
  motif?: MotifKind;
  /** Overrides the service's gradient rotation, if this project wants its own. */
  angle?: string;
  /**
   * A real screenshot, once one exists. Preferred over the motif when set.
   * Declared now so that publishing a real project is additive rather than a
   * change to this interface.
   */
  image?: { src: string; alt: string };
}

export const PROJECTS: Project[] = [
  {
    slug: 'ledger',
    draft: false,
    demo: true,
    title: 'Ledger',
    service: 'web',
    year: '2026',
    motif: 'dashboard',
    summary:
      'A sample web build: a marketing site and a client-facing invoicing dashboard, running from one codebase.',
    intro:
      'Ledger is a demonstration build rather than a client engagement. It shows the shape most of our web work takes: a fast public site, an authenticated area behind it, and both shipping from the same repository and the same deploy.',
    scope: [
      'Marketing site and design system',
      'Authenticated client dashboard',
      'Deploy pipeline with preview builds',
    ],
    stack: ['Astro', 'TypeScript', 'Tailwind', 'Postgres'],
    outcomes: [],
    sections: [
      {
        heading: 'What it shows',
        body: 'The split every business site eventually needs: pages that have to be fast and indexable, and screens that have to be logged into. Keeping both in one project means one design system, one build, and no second codebase to maintain when a marketing page needs a number that only the app knows.',
      },
    ],
  },
  {
    slug: 'field-kit',
    draft: false,
    demo: true,
    title: 'Field Kit',
    service: 'app',
    year: '2026',
    motif: 'cart',
    summary:
      'A sample app build: ordering for teams working away from a desk, with a queue that survives losing signal.',
    intro:
      'Field Kit is a demonstration build rather than a client engagement. It stands in for the app work we are asked for most often — a small, fast interface for people entering the same few things all day, on connections that drop.',
    scope: [
      'iOS and Android from one codebase',
      'Offline-first order queue',
      'Separate access for crews and admins',
    ],
    stack: ['React Native', 'Expo', 'TypeScript', 'SQLite'],
    outcomes: [],
    sections: [
      {
        heading: 'What it shows',
        body: 'Offline handling as a starting assumption rather than a late fix. Every action is written locally first and reconciled when the connection returns, so the person using it never has to wonder whether it saved — which is the difference between an app a crew uses and one they work around.',
      },
    ],
  },
  {
    slug: 'triage',
    draft: false,
    demo: true,
    title: 'Triage',
    service: 'ai',
    year: '2026',
    motif: 'inbox',
    summary:
      'A sample automation: inbound email and form submissions read, sorted, and routed to the right person.',
    intro:
      'Triage is a demonstration build rather than a client engagement. It shows what our AI work usually is in practice: not a chatbot bolted onto a website, but a piece of routing that takes a daily sorting job off someone.',
    scope: [
      'Intake from email, forms and webhooks',
      'Classification with a human review step',
      'Handoff into the tools already in use',
    ],
    stack: ['Claude API', 'TypeScript', 'Postgres', 'Cloudflare Workers'],
    outcomes: [],
    sections: [
      {
        heading: 'What it shows',
        body: 'A review step in the middle, on purpose. The model proposes a category and a destination; a person confirms it until the confirmations get boring. That ordering is how an automation earns its way into a workflow instead of being switched off the first week it guesses wrong.',
      },
    ],
  },
  {
    slug: 'signal',
    draft: false,
    demo: true,
    title: 'Signal',
    service: 'marketing',
    year: '2026',
    motif: 'editor',
    summary:
      'A sample content programme: a publishing workflow, a technical SEO pass, and reporting that covers both.',
    intro:
      'Signal is a demonstration build rather than a client engagement. It sketches how a marketing engagement runs here: fix what the site already does badly, then publish on a schedule someone can actually keep.',
    scope: [
      'Technical SEO audit and fixes',
      'Editorial calendar and publishing workflow',
      'Analytics and reporting setup',
    ],
    stack: ['Astro Content Collections', 'GA4', 'Search Console', 'Looker Studio'],
    outcomes: [],
    sections: [
      {
        heading: 'What it shows',
        body: 'The audit comes first because publishing into a slow, badly structured site is paying twice for the same traffic. Once that is cleared the work is a cadence rather than a campaign — and the reporting has to make the cadence visible, or it quietly stops.',
      },
    ],
  },
];

/** The only list any page should render. Drafts are never published. */
export const published = (): Project[] => PROJECTS.filter((p) => !p.draft);

/** Published projects for one service, used on /services/[slug]. */
export const projectsFor = (service: ServiceSlug): Project[] =>
  published().filter((p) => p.service === service);

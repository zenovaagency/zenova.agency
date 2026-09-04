/**
 * Open roles — the /careers listing.
 *
 * EMPTY BY DESIGN, on the same principle as data/projects.ts: a careers page
 * listing roles that do not exist wastes applicants' time. Every entry below
 * is `draft: true` and is filtered out of getStaticPaths, so /careers renders
 * CAREERS.emptyTitle until a real role is added.
 *
 * ---------------------------------------------------------------------------
 * THE THREE ROLES BELOW ARE INVENTED. THEY ARE NOT OPEN AND MUST NEVER SHIP.
 *
 * They exist only so the populated half of this feature can be looked at: the
 * roles list on /careers and the whole of /careers/[slug] had never rendered in
 * any build, because the file previously held one all-TODO stub. To review that
 * markup, flip a single entry to `draft: false`, look at it, and flip it back.
 *
 * The set is deliberately spread so it exercises the real branches:
 *   - one Engineering, one Design, one Growth
 *   - two remote (one naming a region, one not) and one city-based, which is
 *     what separates jobLocationType TELECOMMUTE from jobLocation in
 *     lib/schema.ts
 *   - one with an empty niceToHave, since [slug].astro drops empty blocks
 *   - one with no `posted`, since datePosted is omitted rather than guessed
 *
 * Replace the copy with a real role before ever setting `draft: false` for
 * production. Invented listings are the same credibility problem as invented
 * case studies, and this file is the last place on the site still holding any.
 * ---------------------------------------------------------------------------
 *
 * TO OPEN A ROLE
 *   1. Replace the placeholder strings with the real ones.
 *   2. Set `draft: false`.
 * The role then appears on /careers and gets its own /careers/<slug> page.
 */

export interface Job {
  slug: string;
  /** Drafts never reach getStaticPaths. */
  draft: boolean;
  title: string;
  /** Engineering · Design · Growth */
  team: string;
  /**
   * "Remote", "Remote — EU" or a city. lib/schema.ts branches on this: the
   * word "remote" selects a TELECOMMUTE posting and anything left over after
   * it is read as the region applicants must be in; anything else becomes a
   * jobLocation with that city as the locality.
   */
  location: string;
  /** Full-time · Contract · Part-time */
  type: string;
  /** One line, used on the /careers card. */
  summary: string;
  /** The detail page lede. */
  intro: string;
  responsibilities: string[];
  requirements: string[];
  niceToHave: string[];
  /**
   * ISO date the role opened, for JobPosting.datePosted. Optional, and left
   * unset rather than guessed — Google asks for it, but a posting dated today
   * because nobody filled this in is worse than one carrying no date.
   */
  posted?: string;
}

export const JOBS: Job[] = [
  {
    slug: 'senior-product-engineer',
    draft: true,
    title: 'Senior Product Engineer',
    team: 'Engineering',
    location: 'Remote — EU',
    type: 'Full-time',
    summary: 'Own client builds end to end, from the first architecture call to the handover.',
    intro:
      'You would be the third engineer here, which means you take projects rather than tickets. Most of our work is a Next.js or Astro front end against a headless CMS, shipped in eight to twelve weeks with one designer alongside you. You talk to the client yourself.',
    responsibilities: [
      'Scope and build client projects end to end, with a designer and no account layer in between',
      'Make the architecture calls on your own projects and write down why',
      'Review the other engineers, and be reviewed by them',
      'Carry the support window after launch, so the thing you built stays yours',
    ],
    requirements: [
      'Five or more years building for the web, some of it in a studio or agency',
      'Fluent in TypeScript and one modern React framework',
      'Comfortable owning a deadline you helped set',
      'Able to explain a technical trade-off to someone who is not technical',
    ],
    niceToHave: [
      'Experience with a headless CMS in production',
      'Something public we can read — writing, talks, or open source',
    ],
    posted: '2026-09-01',
  },
  {
    slug: 'brand-product-designer',
    draft: true,
    title: 'Brand and Product Designer',
    team: 'Design',
    location: 'Lisbon',
    type: 'Full-time',
    summary: 'Design the thing and then sit with the engineer who builds it.',
    intro:
      'A studio role rather than a product one: you move between identity work and interface work, sometimes on the same project. You would be our second designer, working in the room with the engineers rather than handing files over a wall.',
    responsibilities: [
      'Take projects from brief to design direction to built screens',
      'Work in the browser with the engineer on your project, not only in Figma',
      'Keep the design system honest as it gets used across client work',
    ],
    requirements: [
      'A portfolio with both identity and interface work in it',
      'Strong typographic judgement, and able to say why a thing is set the way it is',
      'Happy to be edited, and to edit',
    ],
    niceToHave: ['Enough front-end to prototype your own ideas'],
  },
  {
    slug: 'growth-lead',
    draft: true,
    title: 'Growth Lead',
    team: 'Growth',
    location: 'Remote',
    type: 'Contract',
    summary: 'Run the post-launch half of an engagement: acquisition, measurement, iteration.',
    intro:
      'Our projects do not stop at launch, and this is the person who owns what happens next. Part strategy, part hands-on: you set what gets measured, run the acquisition work, and tell the client the honest version of how it went.',
    responsibilities: [
      'Own the growth plan for three or four concurrent client engagements',
      'Set up measurement properly at launch, not retroactively',
      'Report what actually happened, including when it did not work',
    ],
    requirements: [
      'A track record running paid and organic acquisition for small teams',
      'Comfortable in analytics without needing an analyst',
      'Willing to argue with a client about a bad idea',
    ],
    niceToHave: [],
  },
];

/** The only list any page should render. */
export const openRoles = (): Job[] => JOBS.filter((j) => !j.draft);

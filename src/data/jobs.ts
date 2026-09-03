/**
 * Open roles — the /careers listing.
 *
 * EMPTY BY DESIGN, on the same principle as data/projects.ts: a careers page
 * listing roles that do not exist wastes applicants' time. Every entry below
 * is `draft: true` and is filtered out of getStaticPaths, so /careers renders
 * CAREERS.emptyTitle until a real role is added.
 *
 * TO OPEN A ROLE
 *   1. Replace the TODO strings.
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
}

export const JOBS: Job[] = [
  {
    slug: 'todo-role',
    draft: true,
    title: 'TODO — role title',
    team: 'TODO — Engineering, Design or Growth',
    location: 'TODO — Remote, or a city',
    type: 'Full-time',
    summary: 'TODO — one line on what this person would own.',
    intro: 'TODO — two or three sentences: what the role exists to do, and who it works with.',
    responsibilities: ['TODO', 'TODO', 'TODO'],
    requirements: ['TODO', 'TODO', 'TODO'],
    niceToHave: ['TODO'],
  },
];

/** The only list any page should render. */
export const openRoles = (): Job[] => JOBS.filter((j) => !j.draft);

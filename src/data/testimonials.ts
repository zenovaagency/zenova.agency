/**
 * Testimonials — the home page quote wall.
 *
 * WHAT IS IN HERE TODAY: six SAMPLE entries, written so the section has real
 * shape and copy length while genuine client quotes are collected. Every one
 * is flagged `sample: true`; the section renders a visible "Sample" tag on
 * each card and a disclosure line above the grid. That labelling is the whole
 * reason they are safe to ship. The people and companies are invented and
 * deliberately generic — none refers to a real person or business.
 *
 * The previous site shipped six unlabelled fictional testimonials (see the
 * header of data/site.ts). Those were purged. Dropping the `sample` flag, or
 * hiding the label, would bring them back.
 *
 * TO PUBLISH A REAL TESTIMONIAL
 *   1. Replace the entry: real name, role and company, and only with the
 *      person's written agreement to be quoted and named.
 *   2. Use their words. Trim for length, never reword.
 *   3. Leave `sample` unset. Optionally add `photo` (a path under /public, or
 *      an imported asset URL) — only a photo they supplied or approved.
 *   4. Once no entry has `sample: true`, the label and disclosure disappear.
 *
 * Avatars: with no `photo`, the card draws a monogram on the brand gradient.
 * It is intentionally not a stock face, which would imply a real person.
 */

export interface Testimonial {
  id: string;
  /** Marks invented placeholder copy. Rendered as a visible label. */
  sample?: boolean;
  quote: string;
  name: string;
  role: string;
  company: string;
  /** Approved headshot. Falls back to a monogram when absent. */
  photo?: { src: string; alt: string };
  /** Which service the quote is about, for the small tag on the card. */
  service: 'web' | 'app' | 'ai' | 'marketing';
}

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 't1',
    sample: true,
    service: 'web',
    quote:
      'We went from a site nobody wanted to touch to one our team edits on a Tuesday afternoon. Launch was on the date we were given in the first call.',
    name: 'Maya Okafor',
    role: 'Head of Marketing',
    company: 'Harbour & Pine',
  },
  {
    id: 't2',
    sample: true,
    service: 'app',
    quote:
      'The crews stopped asking whether an order had saved. It works with no signal, and that is the only thing they ever wanted from it.',
    name: 'Daniel Reyes',
    role: 'Operations Lead',
    company: 'Fieldwork Supply Co.',
  },
  {
    id: 't3',
    sample: true,
    service: 'ai',
    quote:
      'The automation sorts the inbox and a person confirms it. After a month we barely needed the confirming, which is exactly how we hoped it would go.',
    name: 'Priya Natarajan',
    role: 'Founder',
    company: 'Lumen Bookkeeping',
  },
  {
    id: 't4',
    sample: true,
    service: 'marketing',
    quote:
      'They fixed what the site was doing badly before they wrote a single new post. Our reporting finally tells us what happened last month, in plain English.',
    name: 'Tom Albrecht',
    role: 'Managing Director',
    company: 'Albrecht Joinery',
  },
  {
    id: 't5',
    sample: true,
    service: 'web',
    quote:
      'One team did the design, the build and the handover. Nobody had to translate between three agencies, and everything sits in our own accounts.',
    name: 'Sofia Lindqvist',
    role: 'Co-founder',
    company: 'Northlight Studio',
  },
  {
    id: 't6',
    sample: true,
    service: 'marketing',
    quote:
      'Straight answers on price and timeline from the first call. The scope we agreed is the scope we got, which has not been our experience before.',
    name: 'James Whitfield',
    role: 'Owner',
    company: 'Whitfield Dental',
  },
];

export const TESTIMONIALS_COPY = {
  eyebrow: 'Kind words',
  title: 'What working with us',
  accent: 'feels like.',
  sampleNote:
    'These are sample quotes from invented people, shown while real client testimonials are collected. They are placeholders, not endorsements.',
};

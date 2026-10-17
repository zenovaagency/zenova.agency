/**
 * Testimonials — the home page testimonial carousel.
 *
 * WHAT IS IN HERE TODAY: twelve SAMPLE entries, written so the section has
 * real shape, copy length and outcome figures while genuine client quotes are
 * collected. Every one is flagged `sample: true`; the section renders a
 * visible "Sample" tag on each card and a disclosure line above it. That
 * labelling is the whole reason they are safe to ship. The people, companies
 * and figures are invented — none refers to a real person or business.
 *
 * The previous site shipped six unlabelled fictional testimonials (see the
 * header of data/site.ts). Those were purged. Dropping the `sample` flag, or
 * hiding the label, would bring them back — and with stock faces attached
 * they would read as real endorsements, which consumer-protection rules on
 * fake reviews (e.g. the FTC's 2024 rule) prohibit outright.
 *
 * PHOTOS: the faces are free stock portraits hotlinked from Unsplash, cropped
 * by its image CDN (see photoUrl below). The Unsplash licence allows
 * commercial use but not implying that the person pictured endorses you, so
 * a stock face must never sit on an unlabelled quote. If a photo ever fails
 * to load, the card falls back to a monogram on the brand gradient.
 *
 * TO PUBLISH A REAL TESTIMONIAL
 *   1. Replace the entry: real name, role and company, and only with the
 *      person's written agreement to be quoted and named.
 *   2. Use their words. Trim for length, never reword. Only quote a `result`
 *      the client can stand behind.
 *   3. Leave `sample` unset, and swap the stock `photo` for one they supplied
 *      or approved (a path under /public works), with real alt text.
 *   4. Once no entry has `sample: true`, the label and disclosure disappear.
 */

import type { ServiceSlug } from './site';

export interface Testimonial {
  id: string;
  /** Marks invented placeholder copy. Rendered as a visible label. */
  sample?: boolean;
  quote: string;
  name: string;
  role: string;
  company: string;
  location: string;
  /**
   * Headshot. `alt` stays empty for stock portraits: the name is printed
   * beside the photo, and describing a model's face would add nothing true.
   */
  photo?: { src: string; alt?: string };
  /** One headline outcome, shown beside the quote. */
  result?: { value: string; label: string };
  /** Which service the quote is about, for the small tag on the card. */
  service: ServiceSlug;
}

const unsplash = (id: string) => `https://images.unsplash.com/${id}`;

/**
 * Sizes an Unsplash photo on their CDN: face-aware crop, modern format. Any
 * other source (a local headshot) is returned untouched.
 */
export function photoUrl(src: string, w: number, h: number): string {
  if (!src.startsWith('https://images.unsplash.com/')) return src;
  const url = new URL(src);
  url.searchParams.set('w', String(w));
  url.searchParams.set('h', String(h));
  url.searchParams.set('fit', 'crop');
  url.searchParams.set('crop', 'faces');
  url.searchParams.set('auto', 'format');
  url.searchParams.set('q', '75');
  return url.toString();
}

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 't1',
    sample: true,
    service: 'web',
    quote:
      'We went from a site nobody wanted to touch to one our team edits on a Tuesday afternoon without raising a ticket. Launch landed on the date we were given in the first call, and the new checkout had paid for the project inside a quarter.',
    name: 'Maya Okafor',
    role: 'Head of Marketing',
    company: 'Harbour & Pine',
    location: 'Bristol, UK',
    photo: { src: unsplash('photo-1573496359142-b8d87734a5a2') },
    result: { value: '+38%', label: 'Online orders in the first 90 days' },
  },
  {
    id: 't2',
    sample: true,
    service: 'app',
    quote:
      'The crews stopped asking whether an order had saved. It works in a basement with no signal and syncs when they walk back out, which is the only thing they ever wanted from an app. Nobody has asked for the paper forms back.',
    name: 'Daniel Reyes',
    role: 'Operations Lead',
    company: 'Fieldwork Supply Co.',
    location: 'Austin, TX',
    photo: { src: unsplash('photo-1507003211169-0a1dd7228f2d') },
    result: { value: '11 hrs', label: 'Admin saved per crew, every week' },
  },
  {
    id: 't3',
    sample: true,
    service: 'ai',
    quote:
      'The automation sorts the inbox and drafts the reply, and a person confirms it. After a month we barely needed the confirming, which is exactly how they said it would go. I got my evenings back.',
    name: 'Priya Natarajan',
    role: 'Founder',
    company: 'Lumen Bookkeeping',
    location: 'Toronto, Canada',
    photo: { src: unsplash('photo-1580489944761-15a19d654956') },
    result: { value: '72%', label: 'Of client email triaged automatically' },
  },
  {
    id: 't4',
    sample: true,
    service: 'marketing',
    quote:
      'They fixed what the site was doing badly before they wrote a single new post. Six months on, the phone rings with the jobs we actually want, and the monthly report tells us why in plain English.',
    name: 'Tom Albrecht',
    role: 'Managing Director',
    company: 'Albrecht Joinery',
    location: 'Munich, Germany',
    photo: { src: unsplash('photo-1560250097-0b93528c311a') },
    result: { value: '3.1×', label: 'Qualified enquiries, year on year' },
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
    location: 'Stockholm, Sweden',
    photo: { src: unsplash('photo-1438761681033-6461ffad8d80') },
    result: { value: '6 wks', label: 'Kickoff to launch' },
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
    location: 'Leeds, UK',
    photo: { src: unsplash('photo-1472099645785-5658abf4ff4e') },
    result: { value: '+54%', label: 'New-patient bookings' },
  },
  {
    id: 't7',
    sample: true,
    service: 'ai',
    quote:
      'Tenants get a real answer at 2am now, and anything it is unsure about lands on my desk with the context already written up. It knows when to hand over.',
    name: 'Hannah Brooks',
    role: 'COO',
    company: 'Kettle & Co. Lettings',
    location: 'Manchester, UK',
    photo: { src: unsplash('photo-1494790108377-be9c29b29330') },
    result: { value: '4 min', label: 'Median first reply, down from 9 hrs' },
  },
  {
    id: 't8',
    sample: true,
    service: 'app',
    quote:
      'Our physios used to email PDFs of exercises. Now patients get a plan with videos and reminders, and we can see who is actually doing it.',
    name: 'Marcus Bell',
    role: 'Product Lead',
    company: 'Stride Physio',
    location: 'Melbourne, Australia',
    photo: { src: unsplash('photo-1506794778202-cad84cf45f1d') },
    result: { value: '81%', label: 'Patients finishing their plan' },
  },
  {
    id: 't9',
    sample: true,
    service: 'web',
    quote:
      'The old shop took five seconds to show a bag of coffee. The new one is instant on a phone, and subscriptions finally stopped leaking at checkout.',
    name: 'Elena Marchetti',
    role: 'Brand Director',
    company: 'Verde Coffee Roasters',
    location: 'Portland, OR',
    photo: { src: unsplash('photo-1544005313-94ddf0286df2') },
    result: { value: '1.1s', label: 'Mobile load time' },
  },
  {
    id: 't10',
    sample: true,
    service: 'marketing',
    quote:
      'They cut half our ad spend in week one and sign-ups went up. Every change came with a reason, and the ones that did not work were switched off fast.',
    name: 'Ryan Doyle',
    role: 'Founder',
    company: 'Doyle Climbing Gyms',
    location: 'Dublin, Ireland',
    photo: { src: unsplash('photo-1519244703995-f4e0f30006d5') },
    result: { value: '−31%', label: 'Cost per membership sign-up' },
  },
  {
    id: 't11',
    sample: true,
    service: 'ai',
    quote:
      'New enquiries arrive as a tidy summary with the conflict check already run. Our solicitors review instead of retype, and nothing goes out unchecked.',
    name: 'Claire Dubois',
    role: 'Head of Client Services',
    company: 'Meridian Legal',
    location: 'London, UK',
    photo: { src: unsplash('photo-1534528741775-53994a69daeb') },
    result: { value: '6 hrs', label: 'Saved per fee-earner, weekly' },
  },
  {
    id: 't12',
    sample: true,
    service: 'app',
    quote:
      'We handed over a half-finished codebase and a lot of apologies. They shipped a stable release, then wrote docs good enough that our new hire was productive in days.',
    name: 'Ben Hartley',
    role: 'CTO',
    company: 'Parcelpoint',
    location: 'Auckland, New Zealand',
    photo: { src: unsplash('photo-1500648767791-00dcc994a43e') },
    result: { value: '99.98%', label: 'Uptime since handover' },
  },
];

export const TESTIMONIALS_COPY = {
  titleLead: 'There is so much',
  accent: 'hype',
  titleTail: 'around us',
  sub: 'We’re helping businesses grow at record speed.',
  sampleNote:
    'These are sample quotes from invented people, pictured with stock photos, shown while real client testimonials are collected. They are placeholders, not endorsements.',
};

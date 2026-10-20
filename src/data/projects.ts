/**
 * Projects — the /work portfolio.
 *
 * WHAT IS IN HERE TODAY: one live product of our own (Truplexy) and three
 * design concepts (NEXA Properties, Savoré, HomeEase). None names a client,
 * and none claims a metric.
 *
 * WHY THAT MATTERS. The previous Zenova site shipped six fictional case
 * studies (Northwind Labs, Aperture Health, Stellar Capital, Cobalt Studio,
 * Mosaic, Verge) with invented clients and invented results — see the header of
 * data/site.ts. Those were purged. A concept is not a quiet way to bring them
 * back: the moment one of these acquires a client name or a percentage, it has
 * become the thing that was removed.
 *
 * THE THREE KINDS OF ENTRY
 *   - `concept: true` — a design exercise we did for ourselves. Labelled
 *     "Concept" on the card and on the page.
 *   - `demo: true` — a sample build with nothing shipped. Labelled "Demo".
 *   - neither — real work. Truplexy is our own product, so it has no `client`
 *     and reads "Self-initiated"; its `url` adds a link to the live site.
 *
 * TO PUBLISH A CLIENT PROJECT
 *   1. Fill in `client` — real name, and only with their agreement to be named.
 *      If they would rather not be, leave the entry drafted rather than
 *      anonymising it into something a reader cannot verify.
 *   2. Check `outcomes` — a number goes in only if it can be stood behind and
 *      the client has agreed to publish it. An empty array is fine; the detail
 *      page renders without the block.
 *   3. Leave `demo` and `concept` unset.
 *   4. Set `draft: false`.
 *
 * `draft` still works and is still the right tool for a real write-up that is
 * half finished: drafts never reach getStaticPaths, so they cannot be linked
 * to, indexed, or reached by guessing the URL.
 *
 * IMAGES live in src/assets/works/ and are imported, so astro:assets resizes
 * and re-encodes them at build. scripts/works-art.mjs produces them, at the
 * ratio of each frame they appear in.
 */

import type { MotifKind, ServiceSlug } from './site';
import truplexy from '../assets/works/truplexy.webp';
import truplexySmall from '../assets/works/truplexy-small.webp';
import truplexyWide from '../assets/works/truplexy-wide.webp';
import nexaProperties from '../assets/works/nexa-properties.webp';
import nexaPropertiesSmall from '../assets/works/nexa-properties-small.webp';
import nexaPropertiesWide from '../assets/works/nexa-properties-wide.webp';
import nexaPropertiesFull from '../assets/works/nexa-properties-full.webp';
import savore from '../assets/works/savore.webp';
import savoreSmall from '../assets/works/savore-small.webp';
import savoreWide from '../assets/works/savore-wide.webp';
import savoreFull from '../assets/works/savore-full.webp';
import homeease from '../assets/works/homeease.webp';
import homeeaseSmall from '../assets/works/homeease-small.webp';
import homeeaseWide from '../assets/works/homeease-wide.webp';
import homeeaseFull from '../assets/works/homeease-full.webp';

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
  /**
   * A design concept made for ourselves, not a client engagement. Rendered as
   * a visible "Concept" label everywhere the project appears.
   */
  concept?: boolean;
  title: string;
  /**
   * Optional, and absent on demos and concepts. There is no client behind
   * them, and inventing one is exactly what the header of this file exists to
   * prevent.
   */
  client?: string;
  /** The live site, for a project that has shipped. Linked from its page. */
  url?: string;
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
   * Card and hero artwork when there is no `image`. Defaults to the service's
   * own motif.
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
   * A screenshot or showcase. Preferred over the motif when set.
   *
   * Three crops of the same work, one per tile frame on /work, so the picture
   * fills its frame instead of being cut by it: `src` is the showcase at the
   * feature tile's ratio, `small` and `wide` are the lead screen at 9:5 and
   * 3:2. `full` is the whole showcase at its own ratio, shown uncropped on the
   * detail page. scripts/works-art.mjs makes them; keep the ratios in step with
   * .mosaic--img in work/index.astro.
   */
  image?: {
    src: ImageMetadata;
    small: ImageMetadata;
    wide: ImageMetadata;
    full: ImageMetadata;
    alt: string;
  };
}

export const PROJECTS: Project[] = [
  {
    slug: 'truplexy',
    draft: false,
    title: 'Truplexy',
    service: 'ai',
    year: '2026',
    url: 'https://truplexy.com',
    motif: 'inbox',
    image: {
      src: truplexy,
      small: truplexySmall,
      wide: truplexyWide,
      full: truplexy,
      alt: 'The Truplexy website: the home page headline "Every channel. One platform.", the pricing page, the channels directory and the setup docs.',
    },
    summary:
      'Our own AI customer support platform: one assistant on every channel, one inbox for the team, a person when it matters.',
    intro:
      'Truplexy is a product we built and run ourselves. It puts a human-like AI assistant on the channels customers already use and brings every conversation into a single inbox, handing over to a person with the whole conversation attached.',
    scope: [
      'Product design and the marketing site',
      'AI assistant, knowledge base and human handoff',
      'Channel integrations, REST API and webhooks',
      'Docs, pricing and the sign-up flow',
    ],
    stack: ['Astro', 'REST API', 'Webhooks', 'Web chat SDK'],
    outcomes: [],
    sections: [
      {
        heading: 'Every channel, one platform',
        body: 'Customers do not pick a support channel to suit the business. Truplexy meets them on website chat, Telegram, Discord, WhatsApp, Messenger, Instagram and email, and connects to Shopify, WooCommerce, WordPress, HubSpot, Zendesk, Slack and Microsoft Teams, so the team works from one inbox instead of seven.',
      },
      {
        heading: 'Human when it matters',
        body: "The assistant answers first, from the business's own knowledge, and the moment a person is needed it hands over with the whole conversation and what it knows about the customer attached. Nobody has to ask the question again.",
      },
      {
        heading: 'Built to be built on',
        body: 'A website chat SDK, a REST API and webhooks sit next to the dashboard, so teams can add a channel of their own or push conversations into the tools they already run.',
      },
    ],
  },
  {
    slug: 'nexa-properties',
    draft: false,
    concept: true,
    title: 'NEXA Properties',
    service: 'web',
    year: '2026',
    motif: 'browser',
    image: {
      src: nexaProperties,
      small: nexaPropertiesSmall,
      wide: nexaPropertiesWide,
      full: nexaPropertiesFull,
      alt: 'NEXA Properties real estate website concept: home page with property search, a listings grid, a property detail page and an about page.',
    },
    summary:
      'A real estate website concept: property search, listings, detail pages with virtual tours, and direct agent enquiries.',
    intro:
      'NEXA Properties is a design concept rather than a client engagement. It explores how a property site can make finding, buying, selling and renting a home feel simple, with architectural photography doing the selling and a minimalist interface staying out of the way.',
    scope: [
      'UI/UX design for desktop, tablet and mobile',
      'Property search and filter flow',
      'Listing, detail and enquiry pages',
    ],
    stack: ['Figma', 'UI/UX design', 'Responsive design'],
    outcomes: [],
    sections: [
      {
        heading: 'Search first',
        body: 'Location, property type, price and bedrooms sit in one search bar over the hero, with Buy, Rent and Sell as tabs, so the most common task is the first thing a visitor can do. Listings carry photographs, price, location and the essentials, and detail pages add galleries, specifications, video tours and an enquiry form.',
      },
      {
        heading: 'Minimalist luxury',
        body: 'Deep forest green, warm neutral backgrounds, refined type and generous space aim for trust, sophistication and comfort rather than the noise most listing sites default to.',
      },
    ],
  },
  {
    slug: 'savore',
    draft: false,
    concept: true,
    title: 'Savoré',
    service: 'app',
    year: '2026',
    motif: 'phone',
    image: {
      src: savore,
      small: savoreSmall,
      wide: savoreWide,
      full: savoreFull,
      alt: 'Savoré restaurant and food delivery app concept: dish discovery, restaurant explorer, meal customisation, cart and live order tracking screens.',
    },
    summary:
      'A restaurant and food delivery app concept: discovery, meal customisation, checkout and live order tracking.',
    intro:
      'Savoré is a design concept rather than a client engagement. It sketches an iOS and Android food delivery app where large food photography leads, customising a dish takes a tap or two, and the order can be followed to the door.',
    scope: [
      'Mobile UI/UX design for iOS and Android',
      'Discovery, menu and customisation flows',
      'Cart, checkout and live tracking screens',
    ],
    stack: ['Figma', 'UI/UX design', 'Mobile design'],
    outcomes: [],
    sections: [
      {
        heading: 'From craving to doorstep',
        body: 'Browse dishes and cuisines, find restaurants by rating and delivery speed, choose portion sizes and extra ingredients, apply a promo code at checkout, then watch the delivery with an estimated arrival. A profile holds addresses, past orders, payment methods and favourites.',
      },
      {
        heading: 'Warm and appetising',
        body: 'Cream backgrounds, rich chocolate tones and a vibrant red accent frame big photographs, with rounded components and clearly placed actions so the interface never competes with the food.',
      },
    ],
  },
  {
    slug: 'homeease',
    draft: false,
    concept: true,
    title: 'HomeEase',
    service: 'web',
    year: '2026',
    motif: 'cart',
    image: {
      src: homeease,
      small: homeeaseSmall,
      wide: homeeaseWide,
      full: homeeaseFull,
      alt: 'HomeEase home services booking website concept: service categories, service details, the booking flow and customer reviews.',
    },
    summary:
      'A home services booking website concept: cleaning, plumbing, electrical, AC, pest control and painting, booked online.',
    intro:
      'HomeEase is a design concept rather than a client engagement. It explores a responsive booking site that connects homeowners with verified professionals, with transparent pricing and a short path from choosing a service to a confirmed appointment.',
    scope: [
      'Responsive UI/UX design',
      'Service discovery and booking flow',
      'Provider profiles, reviews and booking management',
    ],
    stack: ['Figma', 'UI/UX design', 'Responsive design'],
    outcomes: [],
    sections: [
      {
        heading: 'Booked in a few steps',
        body: 'Pick a service, then a date, time and location. Each service shows what is included and what it costs before anything is booked, with ratings and reviews for the professionals who do the work, and appointments stay manageable afterwards.',
      },
      {
        heading: 'Clean and trustworthy',
        body: 'A white and blue palette with turquoise accents, modern type and plainly placed calls to action keep it professional and welcoming across desktop, tablet and mobile.',
      },
    ],
  },
];

/** The only list any page should render. Drafts are never published. */
export const published = (): Project[] => PROJECTS.filter((p) => !p.draft);

/** Published projects for one service, used on /services/[slug]. */
export const projectsFor = (service: ServiceSlug): Project[] =>
  published().filter((p) => p.service === service);


/** True while any project is a demo or concept, which is what the /work disclosure keys off. */
export const hasSamples = (list: Project[]): boolean => list.some((p) => p.demo || p.concept);

/**
 * Which of the three shelves on /work an entry sits on. Derived rather than
 * stored, so it cannot disagree with the demo/concept flags or with `client`.
 * Our own shipped work with no client is a product.
 */
export type ProjectKind = 'client' | 'product' | 'concept';

export const projectKind = (p: Project): ProjectKind =>
  p.demo || p.concept ? 'concept' : p.client ? 'client' : 'product';

export const KIND_LABEL: Record<ProjectKind, string> = {
  client: 'Client work',
  product: 'Our product',
  concept: 'Design concept',
};

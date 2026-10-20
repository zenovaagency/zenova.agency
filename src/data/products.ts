/**
 * Products — software Zenova builds and runs itself, sold by subscription.
 *
 * A product is not a service and not a portfolio entry:
 *   - SERVICES (data/site.ts) is work we do for a client and hand over.
 *   - PROJECTS (data/projects.ts) is the write-up of how something was built.
 *   - PRODUCTS is what a business can sign up for today.
 *
 * WHAT IS VERIFIED. Every field below was checked against the product's own
 * public site on 2026-10-20. Nothing here goes beyond what that site says.
 *
 * WHAT IS DELIBERATELY ABSENT
 *   - Prices, plan names and trial terms. They belong to the product's own
 *     pricing page, which changes on its own schedule; a copy here would go
 *     stale silently and contradict it.
 *   - Customer counts, ratings, resolution rates or any other metric. None are
 *     published, so none are claimed.
 *   - Any suggestion that a subscription comes with an agency engagement. It
 *     does not; PRODUCT_FAQS in data/site.ts says so in plain words.
 *
 * TO ADD A PRODUCT: add an entry with a real, public destination. Do not add a
 * placeholder for something unreleased; the Products page and the home band
 * render one block per entry, so an empty slot would be visible.
 */

import type { ImageMetadata } from 'astro';
import truplexyWide from '../assets/works/truplexy-wide.webp';
import truplexyFull from '../assets/works/truplexy.webp';

export interface Product {
  slug: string;
  name: string;
  /** Category, in the words a buyer would search with. */
  category: string;
  /** One line. */
  tagline: string;
  whatItDoes: string;
  whoFor: string;
  /** The problems it removes, in the customer's terms. */
  problems: string[];
  /** The same problems as one sentence, for the compact home-page block. */
  problemSummary: string;
  channels: string[];
  integrations: string[];
  developer: string[];
  /** Plain-language status. "Live" only when anyone can sign up today. */
  availability: string;
  status: 'live' | 'beta' | 'waitlist';
  url: string;
  docsUrl?: string;
  /** The /work write-up of how it was built, if there is one. */
  caseStudy?: string;
  image: { wide: ImageMetadata; full: ImageMetadata; alt: string };
}

export const PRODUCTS: Product[] = [
  {
    slug: 'truplexy',
    name: 'Truplexy',
    category: 'AI customer support platform',
    tagline: 'An AI assistant on every channel your customers use, and one inbox for your team.',
    whatItDoes:
      'Answers customer questions from your own docs and policies, on every channel you connect, and brings every conversation into one inbox. When a person is needed, it hands over with the whole conversation attached.',
    whoFor:
      'Businesses that support customers on more than one channel, from small teams to larger support organisations.',
    problems: [
      'Switching between a separate app for every channel',
      'Messages that get missed or answered twice',
      'Questions that arrive outside business hours',
      'Chatbots that leave people stuck with no way to reach a person',
    ],
    problemSummary:
      'A separate app for every channel, missed messages, questions after hours, and chatbots that leave customers stuck.',
    channels: ['Website chat', 'WhatsApp', 'Messenger', 'Instagram', 'Telegram', 'Discord', 'Email'],
    integrations: [
      'Shopify',
      'WooCommerce',
      'WordPress',
      'HubSpot',
      'Zendesk',
      'Slack',
      'Microsoft Teams',
    ],
    developer: ['REST API', 'Webhooks', 'Website chat SDK'],
    availability: 'Live. Businesses sign up directly on truplexy.com.',
    status: 'live',
    url: 'https://truplexy.com',
    docsUrl: 'https://truplexy.com/docs',
    caseStudy: '/work/truplexy',
    image: {
      wide: truplexyWide,
      full: truplexyFull,
      alt: 'The Truplexy website: the home page headline "Every channel. One platform.", the pricing page, the channels directory and the setup docs.',
    },
  },
];

/**
 * Content collections.
 *
 * The blog is the first collection on this site. Everything else (services,
 * pricing, projects, jobs) lives in typed TS data modules, which is fine for
 * structured records — but posts are prose, and prose belongs in markdown
 * where the heading hierarchy, links and image alt text are authored with the
 * text rather than assembled from fields.
 *
 * The schema below is deliberately strict, because every field feeds a live
 * SEO surface: `title` is the <h1> and the <title>, `description` is the meta
 * description, OG description and JSON-LD, and the dates are emitted in
 * <time datetime>, the article OG tags and BlogPosting. A missing description
 * would ship an empty meta tag, so it is required, not defaulted.
 */
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string().min(1),
    /** Meta description, OG description, and JSON-LD description. Keep under 160 chars. */
    description: z.string().min(1),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    /** Byline. Defaults to the studio itself — see blogPosting() in lib/schema.ts. */
    author: z.string().optional(),
    /** Per-post OG/hero image. Falls back to the site-wide /og-card.png. */
    image: z.string().optional(),
    /**
     * Alt text for that image — required whenever `image` is set. Google
     * treats alt as a ranking and accessibility surface, and an image with no
     * alt is a lint error on every audit, so the schema enforces the pairing
     * rather than trusting memory. Refined with .refine below.
     */
    imageAlt: z.string().optional(),
    /**
     * Drafts never reach getStaticPaths, the index, or the RSS feed — the same
     * rule data/projects.ts applies. They cannot be linked to, indexed, or
     * reached by guessing the URL.
     */
    draft: z.boolean().default(false),
  })
  .refine((data) => !data.image || !!data.imageAlt, {
    message: 'imageAlt is required when image is set — an image never ships without alt text.',
  }),
});

export const collections = { blog };

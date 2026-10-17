// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import { rename, rm, access } from 'node:fs/promises';
import { readFileSync, readdirSync } from 'node:fs';

/**
 * <lastmod> per blog post URL, from frontmatter (updatedDate, else pubDate).
 *
 * Google only trusts lastmod when it is consistently accurate, so it is set
 * only where a real edit date exists. The other pages have none — a build
 * timestamp would claim every page changed on every deploy — so they get no
 * lastmod rather than a wrong one. Read straight from the markdown because
 * the config runs before content collections are available.
 *
 * @returns {Map<string, string>}
 */
function blogLastmod() {
  const dir = new URL('./src/content/blog/', import.meta.url);
  /** @type {Map<string, string>} */
  const dates = new Map();
  for (const name of readdirSync(dir).filter((f) => f.endsWith('.md'))) {
    const frontmatter = readFileSync(new URL(name, dir), 'utf8').split(/^---$/m)[1] ?? '';
    const field = (/** @type {string} */ key) =>
      frontmatter.match(new RegExp(`^${key}:\\s*['"]?([\\d-]+)`, 'm'))?.[1];
    const date = field('updatedDate') ?? field('pubDate');
    if (date) dates.set(`https://zenova.agency/blog/${name.replace(/\.md$/, '')}`, date);
  }
  return dates;
}

/**
 * Publishes the sitemap as a single /sitemap-main.xml file.
 *
 * @astrojs/sitemap always writes an index (sitemap-index.xml) pointing at
 * numbered chunks (sitemap-0.xml, ...), and has no option for one flat file.
 * The site is far below the 45,000-URL chunk limit, so there is only ever one
 * chunk: rename it to sitemap-main.xml and drop the index. Must be listed after
 * sitemap() — Astro runs build:done hooks in integration order.
 *
 * Fails the build if a second chunk ever appears, because renaming only the
 * first would silently drop every URL in the rest.
 *
 * @returns {import('astro').AstroIntegration}
 */
function singleSitemap() {
  return {
    name: 'single-sitemap',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        const file = (/** @type {string} */ name) => new URL(name, dir);
        const exists = (/** @type {string} */ name) =>
          access(file(name)).then(() => true, () => false);

        if (await exists('sitemap-1.xml')) {
          throw new Error('Sitemap split into multiple chunks; sitemap-main.xml would be incomplete.');
        }
        await rename(file('sitemap-0.xml'), file('sitemap-main.xml'));
        await rm(file('sitemap-index.xml'), { force: true });
        logger.info('`sitemap-main.xml` written as a single file');
      },
    },
  };
}

const lastmods = blogLastmod();

// https://astro.build/config
export default defineConfig({
  site: 'https://zenova.agency',

  // One URL per page. Every internal link is written without the slash, so the
  // sitemap and canonicals must be too; vercel.json 308s /foo/ to /foo. With
  // both forms live and the canonical disagreeing with the links, Google was
  // left choosing between duplicates instead of indexing either.
  trailingSlash: 'never',

  integrations: [
    react(),
    // The /process entry below builds a meta-refresh stub, not a page. Keeping
    // it out of the sitemap stops crawlers being handed a URL whose only job
    // is to send them somewhere else.
    sitemap({
      filter: (page) => !page.includes('/process'),
      // Google's documented format: the sitemaps.org namespace only. The site
      // has no news, image, video or hreflang entries to declare.
      namespaces: { news: false, xhtml: false, image: false, video: false },
      serialize: (item) => {
        const lastmod = lastmods.get(item.url);
        return lastmod ? { ...item, lastmod } : item;
      },
    }),
    singleSitemap(),
  ],

  // /process was a nav route, a footer link and a sitemap entry before this
  // restructure removed it; the four phases now live only on the home page.
  // Static output has no server, so this emits an HTML stub with a zero-delay
  // meta refresh and a canonical link. Weaker than a 301, so vercel.json now
  // issues the real 301 in production; this stub only covers other hosts.
  redirects: {
    '/process': '/about',
  },

  vite: {
    plugins: [tailwindcss()]
  }
});
// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

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
    sitemap({ filter: (page) => !page.includes('/process') }),
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
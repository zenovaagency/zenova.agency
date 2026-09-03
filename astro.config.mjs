// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://zenova.agency',

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
  // meta refresh and a canonical link. Weaker than a 301 — if the host
  // supports real redirects (Netlify/Cloudflare _redirects, vercel.json),
  // configure `/process /about 301` there and delete this block.
  redirects: {
    '/process': '/about',
  },

  vite: {
    plugins: [tailwindcss()]
  }
});
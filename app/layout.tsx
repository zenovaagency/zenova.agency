/**
 * Root layout — replaces index.html.
 *
 * Everything the old shell put in <head> lives here, in two halves: the
 * declarative `metadata` export below (title/description/icons/manifest, which
 * Next dedupes and per-route metadata can override) and the raw <link> tags in
 * the JSX (preconnects and the async font loader, which the metadata API has no
 * vocabulary for). Next hoists both into <head>.
 *
 * Two things from the old index.html are deliberately GONE:
 *   - the `?/` query decoder script, which existed only to unpack the GitHub
 *     Pages 404 redirect. Next serves real routes, so there is nothing to undo.
 *   - <meta name="base-segments">, which told 404.html how many path segments
 *     to strip under a project-site deploy. No base path any more.
 */
import type { Metadata, Viewport } from 'next';
import { SITE } from '@/seo/seo-data';

import '@/styles/tailwind.css';
import '@/styles/global.css';
import '@/components/ui/Skeleton.css';

const SATOSHI_HREF =
  'https://api.fontshare.com/v2/css?f[]=satoshi@300,400,500,600,700&display=swap';
const GOOGLE_FONTS_HREF =
  'https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;500&display=swap';

/**
 * Scroll-reveal elements start at opacity:0 and are revealed by an
 * IntersectionObserver (src/hooks/useReveal.ts). With JS disabled that observer
 * never runs, so without this the server-rendered text would be present in the
 * DOM but invisible on screen. Crawlers read the DOM either way; this is for
 * real no-JS visitors and for anything that screenshots the page.
 *
 * `.faq-panel` is the same class of problem: the accordion collapses to
 * max-height:0 and only React's onClick reopens it, so with JS off every answer
 * is in the HTML but unreadable. Expanding all of them is the correct no-JS
 * presentation — a plain list of questions and answers.
 *
 * Ported verbatim from the old src/seo/seo-html.ts, which injected it into
 * every prerendered document.
 */
const NOSCRIPT_REVEAL_CSS =
  '.reveal{opacity:1!important;transform:none!important}' +
  '.faq-panel{max-height:none!important;opacity:1!important}';

/**
 * Flip the font stylesheets from media="print" (non-blocking) to media="all"
 * once they have loaded — the standard async-CSS trick the old index.html used.
 * Inline and synchronous so it runs before the sheets can finish loading; the
 * `l.sheet` check handles the race where one already did.
 */
const ASYNC_FONT_SCRIPT = `
document.querySelectorAll('link[data-font-async]').forEach(function (l) {
  if (l.sheet) { l.media = 'all'; }
  else { l.addEventListener('load', function () { l.media = 'all'; }); }
});`;

export const metadata: Metadata = {
  // Makes every relative `alternates.canonical` in a route's generateMetadata
  // resolve against the production origin instead of the deploy preview URL.
  metadataBase: new URL(SITE.url),
  title: 'Zenova — One agency for everything modern',
  description: SITE.description,
  applicationName: SITE.name,
  manifest: '/site.webmanifest',
  icons: {
    // Google Search harvests ONE favicon per hostname and resolves it from the
    // site root. KEEP /favicon.ico STABLE: changing it resets Google's crawl
    // (days to weeks). The .ico embeds multiple sizes, the SVG gives vector
    // browsers a crisp icon, and the explicit 16/32 PNG links cover legacy
    // browser tabs and bookmarks.
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/assets/favicon/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
  },
  appleWebApp: { capable: true, title: SITE.name },
  other: {
    'mobile-web-app-capable': 'yes',
    'msapplication-TileColor': '#faf8f5',
    'msapplication-TileImage': '/assets/favicon/ms-icon-144x144.png',
    'msapplication-config': '/assets/favicon/browserconfig.xml',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#faf8f5',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // data-theme is set statically rather than by an inline script (as the old
    // shell did) so the first paint is already correct. The portal shells still
    // override it at runtime for users with a stored dark preference.
    <html lang="en" data-theme="light">
      <head>
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
        <link rel="dns-prefetch" href="https://api.fontshare.com" />
        <link rel="dns-prefetch" href="https://cdn.fontshare.com" />
        <link rel="dns-prefetch" href="https://api.zenova.agency" />
        <link rel="dns-prefetch" href="https://ui-avatars.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="preconnect" href="https://api.fontshare.com" />
        <link rel="preconnect" href="https://cdn.fontshare.com" crossOrigin="" />
        <link rel="preconnect" href="https://api.zenova.agency" crossOrigin="" />
        <link rel="preconnect" href="https://ui-avatars.com" crossOrigin="" />

        <link rel="preload" href={SATOSHI_HREF} as="style" />
        <link rel="preload" href={GOOGLE_FONTS_HREF} as="style" />
        <link rel="stylesheet" href={SATOSHI_HREF} media="print" data-font-async="" />
        <link rel="stylesheet" href={GOOGLE_FONTS_HREF} media="print" data-font-async="" />
        <noscript>
          <link rel="stylesheet" href={SATOSHI_HREF} />
          <link rel="stylesheet" href={GOOGLE_FONTS_HREF} />
        </noscript>

        {/* Matches --bg from :root[data-theme='light'] in global.css, so the
            paint before the app stylesheet loads is not a dark flash. */}
        <style
          dangerouslySetInnerHTML={{
            __html: 'html,body{margin:0;padding:0;background:#faf8f5}',
          }}
        />
        <noscript>
          <style dangerouslySetInnerHTML={{ __html: NOSCRIPT_REVEAL_CSS }} />
        </noscript>
        <script dangerouslySetInnerHTML={{ __html: ASYNC_FONT_SCRIPT }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

/* eslint-disable react-refresh/only-export-components --
   This module runs in Node at build time and is never part of the browser
   bundle, so Fast Refresh boundaries do not apply. Mixing the render() entry
   with the re-exports below is the point: it gives scripts/prerender.mjs a
   single built file to import. */
/**
 * Build-time SSR entry. Consumed by scripts/prerender.mjs — never shipped to
 * the browser.
 *
 * Why renderToPipeableStream + onAllReady (and not renderToString):
 * every public page in App.tsx is a React.lazy() route behind <Suspense>.
 * renderToString cannot await a suspended boundary — it emits the *fallback*,
 * so every prerendered page would freeze as a loading skeleton. onAllReady
 * fires only once every lazy chunk has resolved and every boundary holds real
 * content, which is exactly the "full HTML before JS" guarantee we need.
 *
 * Data note: effects never run during SSR, so the API-backed stores in
 * admin/store.ts stay on their synchronous DEFAULT_* values. Store.loadCache()
 * already returns null when `window` is undefined, so the server snapshot is
 * deterministic — see the getServerSnapshot() note in admin/store.ts for how
 * that same value is replayed during client hydration.
 */
import { StrictMode } from 'react';
import { Writable } from 'node:stream';
import { renderToPipeableStream } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import createDOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';
import { AppShell } from './App';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { setSanitizer } from './lib/sanitize';
import { setDocumentFactory } from './lib/dom';

// Give DOMPurify a DOM before any component renders. jsdom is a devDependency
// and this module never reaches the browser bundle, so the client is unaffected.
// Same library + same config on both sides ⇒ identical markup ⇒ clean hydration.
const purify = createDOMPurify(new JSDOM('').window as unknown as Window & typeof globalThis);
setSanitizer((html, config) => purify.sanitize(html, config ?? {}));

// Same treatment for DOMParser, which BlogPostPage uses to add stable ids to
// article headings. Without this the blog posts render their body only in the
// browser — which is exactly the gap the SSR payload was added to close.
setDocumentFactory((html) => new JSDOM(html).window.document as unknown as Document);

/** Abort a stuck render rather than hanging the build forever. */
const RENDER_TIMEOUT_MS = 20_000;

const BASE = import.meta.env.BASE_URL || '/';

/**
 * Map an app path ('/about') onto the exact URL the browser will be sitting on
 * when it hydrates this file: '<base>/about/'.
 *
 * The trailing slash is load-bearing. GitHub Pages serves dist/about/index.html
 * at /about/ and 301-redirects /about to it, so the client's
 * useLocation().pathname is '/about/'. Rendering the server pass at '/about'
 * would give the two sides different pathnames and any component comparing it
 * would render differently on each — which is exactly how the active nav pill
 * came to exist only in the server HTML.
 */
function toLocation(path: string): string {
  const prefix = BASE.replace(/\/+$/, '');
  return path === '/' ? `${prefix}/` : `${prefix}${path}/`;
}

export function render(path: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let fatal: unknown = null;

    const sink = new Writable({
      write(chunk: Buffer, _enc, cb) {
        chunks.push(Buffer.from(chunk));
        cb();
      },
    });

    sink.on('finish', () => {
      if (fatal) reject(fatal);
      else resolve(Buffer.concat(chunks).toString('utf8'));
    });
    sink.on('error', reject);

    const { pipe, abort } = renderToPipeableStream(
      <StrictMode>
        <ErrorBoundary>
          <StaticRouter basename={BASE} location={toLocation(path)}>
            <AppShell />
          </StaticRouter>
        </ErrorBoundary>
      </StrictMode>,
      {
        onAllReady() {
          clearTimeout(timer);
          pipe(sink);
        },
        // Thrown during render (not a recoverable Suspense retry) — fail loudly
        // so a broken page can never ship as an empty shell.
        onError(err) {
          fatal = err;
        },
      },
    );

    const timer = setTimeout(() => {
      fatal = new Error(`SSR render timed out after ${RENDER_TIMEOUT_MS}ms: ${path}`);
      abort();
    }, RENDER_TIMEOUT_MS);
  });
}

/**
 * Re-exported so scripts/prerender.mjs can pull routes, head injection and
 * sitemap generation from this one built ESM file. Without this the plain-Node
 * script would need a TypeScript loader just to read seo-data.ts.
 */
export { applySeoToTemplate, prerenderRoutes, sitemapXml } from './seo/seo-html';
export { SITE, canonicalUrl } from './seo/seo-data';
export { llmsTxt, llmsFullTxt } from './seo/llms';
/**
 * Lets scripts/prerender.mjs hand API-fetched content to the render pass, so
 * blog posts and admin-authored pages server-render their real body instead of
 * a loading skeleton. See src/lib/ssrData.ts.
 */
export { setSsrPayload } from './lib/ssrData';

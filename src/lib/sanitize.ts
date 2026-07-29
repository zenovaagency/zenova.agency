/**
 * Isomorphic HTML sanitisation.
 *
 * DOMPurify needs a real DOM. In the browser it binds to `window` on import and
 * just works; under Node its default export has no `sanitize` at all, which is
 * why rendering /privacy, /terms or any post body on the server used to throw
 * `DOMPurify.sanitize is not a function`.
 *
 * The server path builds a jsdom-backed DOMPurify on first use and caches it.
 * jsdom is a ~50 MB Node-only dependency, so it must never reach the browser
 * bundle: next.config.mjs aliases `jsdom` to false for the client build, and
 * the require below sits behind a `typeof window` guard that is unreachable
 * there anyway.
 *
 * Both sides run the same DOMPurify version with the same config, so the markup
 * the server produces is what the client would have produced — which is what
 * keeps hydration clean. That invariant is load-bearing: if the two disagree,
 * React discards the server HTML for that subtree.
 */
import DOMPurify from 'dompurify';

export type SanitizeConfig = {
  FORBID_ATTR?: string[];
  ALLOWED_TAGS?: string[];
  ALLOWED_ATTR?: string[];
};

type Sanitizer = (html: string, config?: SanitizeConfig) => string;

let injected: Sanitizer | null = null;

/** Override the sanitizer (tests, or a host that supplies its own DOM). */
export function setSanitizer(fn: Sanitizer): void {
  injected = fn;
}

let nodeSanitizer: Sanitizer | null = null;

/**
 * Build the Node sanitizer once. Constructing a JSDOM window is expensive
 * (tens of ms) and every server render of a legal page, blog post or CMS page
 * would otherwise pay it.
 */
function getNodeSanitizer(): Sanitizer {
  if (nodeSanitizer) return nodeSanitizer;
  // eslint-disable-next-line @typescript-eslint/no-require-imports -- see the module header: this branch is server-only and webpack must not resolve jsdom for the browser
  const { JSDOM } = require('jsdom') as typeof import('jsdom');
  // dompurify's default export is a factory when there is no global window.
  const purify = (DOMPurify as unknown as (w: unknown) => { sanitize: Sanitizer })(
    new JSDOM('').window,
  );
  nodeSanitizer = (html, config) => purify.sanitize(html, config ?? {});
  return nodeSanitizer;
}

export function sanitizeHtml(html: string, config?: SanitizeConfig): string {
  if (injected) return injected(html, config);
  if (typeof window === 'undefined') return getNodeSanitizer()(html, config);
  return DOMPurify.sanitize(html, config ?? {});
}

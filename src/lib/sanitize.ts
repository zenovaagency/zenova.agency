/**
 * Isomorphic HTML sanitisation.
 *
 * DOMPurify needs a real DOM. In the browser it binds to `window` on import and
 * just works; under Node (build-time prerendering) its default export has no
 * `sanitize`, which is why calling it directly used to crash the prerender of
 * /privacy and /terms.
 *
 * Rather than importing jsdom here — which would drag a ~50 MB Node-only
 * dependency into the client graph and break the browser build — the server
 * implementation is *injected*: entry-server.tsx, which is never part of the
 * client bundle, calls setSanitizer() with a jsdom-backed DOMPurify instance.
 * Both sides therefore run the same DOMPurify version with the same config, so
 * prerendered markup matches what the client produces and hydration is clean.
 */
import DOMPurify from 'dompurify';

export type SanitizeConfig = {
  FORBID_ATTR?: string[];
  ALLOWED_TAGS?: string[];
  ALLOWED_ATTR?: string[];
};

type Sanitizer = (html: string, config?: SanitizeConfig) => string;

let injected: Sanitizer | null = null;

/** Install a DOM-backed sanitizer. Build-time SSR only — see entry-server.tsx. */
export function setSanitizer(fn: Sanitizer): void {
  injected = fn;
}

export function sanitizeHtml(html: string, config?: SanitizeConfig): string {
  if (injected) return injected(html, config);
  return DOMPurify.sanitize(html, config ?? {});
}

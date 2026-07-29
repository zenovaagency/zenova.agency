/**
 * Isomorphic HTML parsing, the sibling of lib/sanitize.ts and for the same
 * reason: `DOMParser` is a browser global that does not exist in Node, so any
 * component using it to post-process HTML crashes the build-time prerender.
 *
 * The server implementation is injected by entry-server.tsx (which is never
 * part of the client bundle) rather than imported here, so jsdom stays out of
 * the browser graph. Same contract as setSanitizer(): both sides must produce
 * the same markup, or hydration will not match.
 */

type DocumentFactory = (html: string) => Document;

let injected: DocumentFactory | null = null;

/** Install a Node-backed parser. Build-time SSR only — see entry-server.tsx. */
export function setDocumentFactory(fn: DocumentFactory): void {
  injected = fn;
}

/** Parse an HTML fragment into a document. Works in the browser and in Node. */
export function parseHtmlDocument(html: string): Document {
  if (injected) return injected(html);
  return new DOMParser().parseFromString(html, 'text/html');
}

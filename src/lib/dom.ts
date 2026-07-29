/**
 * Isomorphic HTML parsing, the sibling of lib/sanitize.ts and for the same
 * reason: `DOMParser` is a browser global that does not exist in Node, so any
 * component using it to post-process HTML crashes a server render.
 *
 * Same shape as sanitize.ts — a lazily built jsdom parser on the server, the
 * native one in the browser — and the same contract: both sides must produce
 * the same markup, or hydration will not match. jsdom is kept out of the client
 * bundle by the `jsdom: false` alias in next.config.mjs.
 */

type DocumentFactory = (html: string) => Document;

let injected: DocumentFactory | null = null;

/** Override the parser (tests, or a host that supplies its own DOM). */
export function setDocumentFactory(fn: DocumentFactory): void {
  injected = fn;
}

let nodeFactory: DocumentFactory | null = null;

function getNodeFactory(): DocumentFactory {
  if (nodeFactory) return nodeFactory;
  // eslint-disable-next-line @typescript-eslint/no-require-imports -- see the module header: this branch is server-only and webpack must not resolve jsdom for the browser
  const { JSDOM } = require('jsdom') as typeof import('jsdom');
  nodeFactory = (html: string) => new JSDOM(html).window.document as unknown as Document;
  return nodeFactory;
}

/** Parse an HTML fragment into a document. Works in the browser and in Node. */
export function parseHtmlDocument(html: string): Document {
  if (injected) return injected(html);
  if (typeof window === 'undefined') return getNodeFactory()(html);
  return new DOMParser().parseFromString(html, 'text/html');
}

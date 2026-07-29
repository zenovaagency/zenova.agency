/**
 * Renders a schema.org JSON-LD block into the document body.
 *
 * Why in the body rather than <head>: the blocks that use this component are
 * built from content the *component* owns (the FAQ list, the testimonial
 * quotes, the team roster, the rate cards). Sourcing the schema from the same
 * data the section renders means an admin edit updates the markup and the
 * structured data together — a static copy in seo-data.ts would silently drift
 * the moment someone edits a FAQ answer in the dashboard.
 *
 * Google, Bing, and every LLM crawler parse ld+json anywhere in the document,
 * so body placement costs nothing. Route-level schema that is *not* derived
 * from live content (Organization, WebSite, BreadcrumbList) still ships in the
 * <head> via seo-html.ts, because the prerenderer knows it without rendering.
 *
 * dangerouslySetInnerHTML rather than a text child: React escapes `<`, `>` and
 * `&` inside a text child into HTML entities, which is invalid *inside* a
 * <script> element — the JSON would reach the parser as `&quot;` and fail. We
 * escape only what actually matters for script-tag safety (see below).
 */

/** Escape a JSON payload for safe embedding inside a <script> element. */
function serialize(data: unknown): string {
  return (
    JSON.stringify(data)
      // `</script>` inside a string value would close the tag early. Escaping
      // the `<` is the standard fix and stays valid JSON.
      .replace(/</g, '\\u003c')
      // U+2028/U+2029 are valid inside a JSON string but are line terminators
      // in JavaScript source, which would break the script block.
      .replace(/[\u2028\u2029]/g, (c) =>
        c === '\u2028' ? '\\u2028' : '\\u2029',
      )
  );
}

interface JsonLdProps {
  /** A single schema.org node, or an array of nodes to emit as one block. */
  data: Record<string, unknown> | Array<Record<string, unknown>>;
}

export function JsonLd({ data }: JsonLdProps) {
  if (Array.isArray(data) && data.length === 0) return null;
  return (
    <script
      type="application/ld+json"
      // Marks these as body-rendered so SeoManager's head cleanup, which
      // targets [data-seo-jsonld], never removes them.
      data-seo-jsonld-body=""
      dangerouslySetInnerHTML={{ __html: serialize(data) }}
    />
  );
}

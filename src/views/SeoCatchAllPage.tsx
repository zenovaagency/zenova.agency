import { sanitizeHtml } from '@/lib/sanitize';
import type { PublicSeoPage } from '@/lib/publicContentApi';
import './LegalPage.css';

/**
 * An admin-authored standalone page, served at a top-level URL (`/<slug>`).
 *
 * A server component with no client JavaScript at all. It used to be a client
 * component that resolved the slug from the URL, fetched the page in an effect,
 * rendered a skeleton meanwhile, and published its own head tags — all of which
 * the route now does before rendering. Unknown slugs never reach this component:
 * the route answers a real 404 instead of a 200 carrying a spinner.
 */
export function SeoCatchAllPage({ page }: { page: PublicSeoPage }) {
  // Strip inline styles so legacy saved content cannot hardcode colours that
  // clash with the active theme. Safe structural tags are preserved.
  const bodyHtml = sanitizeHtml(page.content_html, { FORBID_ATTR: ['style'] });

  return (
    <section className="legal">
      <div className="container legal__inner">
        <header className="legal__head">
          <h1 className="legal__title display">{page.title}</h1>
        </header>
        <article className="legal-prose" dangerouslySetInnerHTML={{ __html: bodyHtml }} />
      </div>
    </section>
  );
}

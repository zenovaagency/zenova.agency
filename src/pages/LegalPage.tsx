import { useMemo } from 'react';
import DOMPurify from 'dompurify';
import { DEFAULT_CONTENT, useContent } from '@/admin/store';
import './LegalPage.css';

interface LegalPageProps {
  doc: 'privacy' | 'terms';
}

export function LegalPage({ doc }: LegalPageProps) {
  const [content] = useContent();

  const current = content.legal?.[doc];
  const fallback = DEFAULT_CONTENT.legal![doc];

  const title = current?.title || fallback.title;
  const updated = current?.updated || fallback.updated;
  // Prefer admin-authored rich body; fall back to the SEO default copy until
  // the backend has stored one. Sanitize before injecting to prevent XSS.
  const rawBody = current?.body?.trim() ? current.body : fallback.body;
  const bodyHtml = useMemo(() => {
    if (!rawBody) return '';
    return DOMPurify.sanitize(rawBody, { FORBID_ATTR: ['style'] });
  }, [rawBody]);

  return (
    <section className="legal">
      <div className="container legal__inner">
        <header className="legal__head">
          <h1 className="legal__title display reveal reveal-blur">{title}</h1>
          {updated && <p className="legal__updated mono reveal reveal-d1">{updated}</p>}
        </header>
        <article
          className="legal-prose reveal reveal-d2"
          dangerouslySetInnerHTML={{ __html: bodyHtml }}
        />
      </div>
    </section>
  );
}

import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { fetchSeoPage, type PublicSeoPage } from '@/lib/publicContentApi';
import { setDynamicSeo, clearDynamicSeo } from '@/seo/dynamic-seo';
import { SITE, canonicalUrl } from '@/seo/seo-data';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { ArticlePageSkeleton } from '@/components/ui/PageSkeletons';
import { Footer } from '@/components/layout/Footer';
import { ApiError } from '@/lib/api';
import { scrollToTop } from '@/lib/scroll';
import './LegalPage.css';

/** Slug shape accepted by the backend — anything else can't be a page. */
const SLUG_RE = /^[a-z0-9][a-z0-9\-_]*$/;

/**
 * Catch-all route: serves admin-authored standalone SEO pages at top-level
 * URLs (`/<slug>`). Unknown slugs (or paths that can't be a page slug) render
 * the 404 page; `resolveSeo()` already emits noindex metadata for them.
 */
export function SeoCatchAllPage() {
  const { pathname } = useLocation();
  // "/web-design-dubai/" -> "web-design-dubai"; multi-segment paths -> null.
  const slug = useMemo(() => {
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length !== 1) return null;
    const candidate = segments[0].toLowerCase();
    return SLUG_RE.test(candidate) ? candidate : null;
  }, [pathname]);

  const [page, setPage] = useState<PublicSeoPage | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    scrollToTop();
  }, [slug]);

  // No reset here: the public route tree is keyed by pathname (App.tsx), so
  // navigating to a different slug remounts this component with fresh state.
  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    fetchSeoPage(slug)
      .then((data) => {
        if (!cancelled) setPage(data);
      })
      .catch((err) => {
        if (cancelled) return;
        // Treat load failures as 404 rather than surfacing an error page on
        // arbitrary URLs — a real page will recover on the next navigation.
        if (err instanceof ApiError && err.status === 404) setNotFound(true);
        else setError(err instanceof Error ? err.message : 'Failed to load.');
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  useEffect(() => {
    if (!page) return;
    const path = `/${page.slug}`;
    const title = page.meta_title || `${page.title} | ${SITE.name}`;
    const description = page.meta_description || SITE.description;
    setDynamicSeo(path, {
      meta: {
        path,
        title,
        description,
        h1: page.title,
        intro: '',
        index: true,
        breadcrumb: [
          { name: 'Home', path: '/' },
          { name: page.title, path },
        ],
      },
      ogImage: page.og_image_url || undefined,
      extraJsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: page.title,
          description,
          url: canonicalUrl(path),
          dateModified: page.updated_at,
          isPartOf: { '@id': `${SITE.url}/#website` },
          publisher: { '@id': `${SITE.url}/#organization` },
        },
      ],
    });
    return () => clearDynamicSeo(path);
  }, [page]);

  const bodyHtml = useMemo(() => {
    if (!page) return '';
    // Strip inline styles so legacy saved content cannot hardcode colors that
    // clash with the active theme. Safe structural tags are preserved.
    return DOMPurify.sanitize(page.content_html, {
      FORBID_ATTR: ['style'],
    });
  }, [page]);

  if (!slug || notFound || error) return <NotFoundPage />;
  if (!page) return <ArticlePageSkeleton />;

  return (
    <>
      <section className="legal">
        <div className="container legal__inner">
          <header className="legal__head">
            <h1 className="legal__title display">{page.title}</h1>
          </header>
          <article
            className="legal-prose"
            dangerouslySetInnerHTML={{ __html: bodyHtml }}
          />
        </div>
      </section>
      {/* The global footer is gated to known paths (App.tsx); render it here so
          resolved SEO pages keep the site's internal linking while 404s stay bare. */}
      <Footer />
    </>
  );
}

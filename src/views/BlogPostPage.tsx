'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from '@/lib/router';
import { type PublicBlogListItem, type PublicBlogPost } from '@/lib/publicContentApi';
import { sanitizeHtml } from '@/lib/sanitize';
import { parseHtmlDocument } from '@/lib/dom';
import { canonicalUrl } from '@/seo/seo-data';
import { formatDateLong } from '@/lib/date';
import { NeonButton } from '@/components/ui/NeonButton';
import './LegalPage.css';
import './BlogPostPage.css';

// Was a private copy of lib/date.ts with `month: 'long'` and an implicit
// locale/time zone. Now imported so both share the pinned locale — see the note
// there about server/browser disagreement causing hydration mismatches.
const formatDate = formatDateLong;

function readingMinutes(html: string): number {
  const words = html
    .replace(/<[^>]+>/g, ' ')
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

function headingId(text: string): string {
  return (
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/[\s-]+/g, '-')
      .slice(0, 64) || 'section'
  );
}

/**
 * Sanitize the post body, then give every h2/h3 a stable id so headings can
 * be deep-linked (`/blog/post#heading`).
 */
function prepareBody(rawHtml: string): string {
  // Both helpers are isomorphic (lib/sanitize.ts, lib/dom.ts). Calling
  // DOMPurify and DOMParser directly here worked in the browser but threw
  // during the prerender, so the post body never reached the static HTML.
  const clean = sanitizeHtml(rawHtml, { FORBID_ATTR: ['style'] });
  const doc = parseHtmlDocument(clean);
  const seen = new Map<string, number>();
  doc.body.querySelectorAll('h2, h3').forEach((h) => {
    const text = h.textContent?.trim() ?? '';
    if (!text) return;
    const base = headingId(text);
    const n = (seen.get(base) ?? 0) + 1;
    seen.set(base, n);
    h.id = n === 1 ? base : `${base}-${n}`;
  });
  return doc.body.innerHTML;
}

const SHARE_ICONS = {
  x: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117l11.966 15.644Z',
  linkedin:
    'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286ZM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124ZM7.119 20.452H3.555V9h3.564v11.452Z',
  facebook:
    'M24 12.073C24 5.446 18.627.073 12 .073S0 5.446 0 12.073c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953h-1.514c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073Z',
} as const;

function ShareIcon({ path }: { path: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d={path} />
    </svg>
  );
}

function RelatedCard({ post }: { post: PublicBlogListItem }) {
  const date = formatDate(post.published_at);
  return (
    <Link to={`/blog/${post.slug}`} className="bpp-rel__card">
      <span className="bpp-rel__thumb" aria-hidden="true">
        {post.cover_image_url ? (
          <img src={post.cover_image_url} alt="" loading="lazy" decoding="async" />
        ) : (
          <span className="bpp-rel__initial display">{post.title.slice(0, 1).toUpperCase()}</span>
        )}
      </span>
      <span className="bpp-rel__text">
        <span className="bpp-rel__title">{post.title}</span>
        {date && (
          <time className="bpp-rel__date mono" dateTime={post.published_at ?? undefined}>
            {date}
          </time>
        )}
      </span>
    </Link>
  );
}

export interface BlogPostPageProps {
  /** The article, fetched on the server. The route 404s before rendering if it does not exist. */
  post: PublicBlogPost;
  /** Up to three other recent posts, also fetched on the server. */
  related?: PublicBlogListItem[];
}

export function BlogPostPage({ post, related = [] }: BlogPostPageProps) {
  // `post` and `related` arrive as props from the server component rather than
  // being fetched here. That removes the loading, error and not-found states
  // this component used to carry: the route resolves the article before it
  // renders anything, so the first byte of HTML is the finished article and an
  // unknown slug is a real 404 rather than a 200 with a spinner in it.
  const [_progress, setProgress] = useState(0);
  const [copied, setCopied] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);
  const copyTimer = useRef<number | undefined>(undefined);

  // The head tags and the BlogPosting JSON-LD used to be published from an
  // effect here. They are now derived by blogPostSeo() in src/seo/content-seo.ts
  // and emitted by the route, so they are in the HTML the server sends. That is
  // the fix for blog posts shipping og:type="website" and no article schema:
  // effects do not run for a crawler, and social scrapers never execute JS.
  const bodyHtml = useMemo(() => prepareBody(post.content_html), [post.content_html]);

  // Scroll-driven UI: reading progress. One rAF-throttled listener; the initial
  // frame runs async, so no effect-time setState.
  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const rect = el.getBoundingClientRect();
      const span = rect.height - window.innerHeight;
      const p = span > 0 ? Math.min(1, Math.max(0, -rect.top / span)) : rect.top < 0 ? 1 : 0;
      setProgress(Math.round(p * 1000) / 1000);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    onScroll();
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [bodyHtml]);

  useEffect(() => () => window.clearTimeout(copyTimer.current), []);

  const published = formatDate(post.published_at);
  const minutes = readingMinutes(post.content_html);
  const updated =
    post.published_at &&
    new Date(post.updated_at).getTime() - new Date(post.published_at).getTime() > 86_400_000
      ? formatDate(post.updated_at)
      : '';
  const shareUrl = canonicalUrl(`/blog/${post.slug}`);
  const authorName = post.author_name?.trim() || 'Zenova Team';

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.clearTimeout(copyTimer.current);
      copyTimer.current = window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable (permissions/insecure context) — leave the
      // button as-is; the share links still work.
    }
  };

  return (
    <article className="bpp">
      {/* <div className="bpp-progress" aria-hidden="true">
        <span style={{ width: `${progress * 100}%` }} />
      </div> */}
      <div className="container bpp__inner">
        <nav className="bpp-crumb mono reveal" aria-label="Breadcrumb">
          <Link to="/blog" className="bpp-crumb__link">
            ← Blog
          </Link>
        </nav>

        <header className="bpp-head">
          <h1 className="bpp-title display reveal reveal-blur">{post.title}</h1>
          <div className="bpp-meta mono reveal reveal-d1">
            {post.author_name && <span>{post.author_name}</span>}
            {post.author_name && published && <span className="bpp-meta__sep" aria-hidden="true" />}
            {published && <time dateTime={post.published_at ?? undefined}>{published}</time>}
            <span className="bpp-meta__sep" aria-hidden="true" />
            <span>{minutes} min read</span>
            {updated && (
              <>
                <span className="bpp-meta__sep" aria-hidden="true" />
                <span className="bpp-meta__updated">
                  Updated <time dateTime={post.updated_at}>{updated}</time>
                </span>
              </>
            )}
          </div>
        </header>

        {post.cover_image_url && (
          <figure className="bpp-cover reveal reveal-d2">
            {/* The article cover — the LCP element on a post page. */}
            <img src={post.cover_image_url} alt="" fetchPriority="high" decoding="async" />
          </figure>
        )}

        <div className="bpp-layout">
          <div className="bpp-main">
            <div
              ref={bodyRef}
              className="legal-prose bpp-body reveal reveal-d2"
              dangerouslySetInnerHTML={{ __html: bodyHtml }}
            />

            <div className="bpp-author reveal">
              <span className="bpp-author__avatar display" aria-hidden="true">
                {authorName.slice(0, 1).toUpperCase()}
              </span>
              <div className="bpp-author__text">
                <p className="bpp-author__name">{authorName}</p>
                <p className="bpp-author__bio">
                  Design, development &amp; growth studio — we write about what we ship.
                </p>
              </div>
            </div>

            <footer className="bpp-foot reveal">
              <Link to="/blog" className="bpp-retry">
                ← More from the blog
              </Link>
            </footer>
          </div>

          <aside className="bpp-side reveal reveal-d2">
            {related && related.length > 0 && (
              <section className="bpp-side__block bpp-rel" aria-label="Related posts">
                <h2 className="bpp-side__label mono">More from the blog</h2>
                <div className="bpp-rel__list">
                  {related.map((p) => (
                    <RelatedCard key={p.slug} post={p} />
                  ))}
                </div>
              </section>
            )}

            <div className="bpp-side__block bpp-share">
              <h2 className="bpp-side__label mono">Share</h2>
              <div className="bpp-share__row">
                <a
                  className="bpp-share__btn"
                  href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(post.title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Share on X"
                >
                  <ShareIcon path={SHARE_ICONS.x} />
                </a>
                <a
                  className="bpp-share__btn"
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Share on LinkedIn"
                >
                  <ShareIcon path={SHARE_ICONS.linkedin} />
                </a>
                <a
                  className="bpp-share__btn"
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Share on Facebook"
                >
                  <ShareIcon path={SHARE_ICONS.facebook} />
                </a>
                <button className="bpp-share__copy mono" onClick={copyLink}>
                  {copied ? 'Copied ✓' : 'Copy link'}
                </button>
              </div>
            </div>

            <div className="bpp-side__block bpp-cta">
              <p className="bpp-cta__title">Have a project in mind?</p>
              <p className="bpp-cta__text">
                We design, build, and grow digital products for ambitious brands.
              </p>
              <NeonButton to="/contact" text="Start a project" size="sm" />
            </div>
          </aside>
        </div>
      </div>
    </article>
  );
}

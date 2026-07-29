'use client';
import { useEffect, useState } from 'react';
import { Link } from '@/lib/router';
import { fetchBlogList, type PublicBlogListItem } from '@/lib/publicContentApi';
import { SkeletonListBody } from '@/components/ui/Skeleton';
import { formatDate } from '@/lib/date';
import './BlogPage.css';

const PAGE_SIZE = 12;

function BlogCard({ post, index }: { post: PublicBlogListItem; index: number }) {
  const date = formatDate(post.published_at);
  return (
    <Link
      to={`/blog/${post.slug}`}
      className="blg-card reveal"
      style={{ '--blg-i': index % 6 } as React.CSSProperties}
    >
      <div className="blg-card__media">
        {post.cover_image_url ? (
          <img
            src={post.cover_image_url}
            alt=""
            loading="lazy"
            decoding="async"
            className="blg-card__img"
          />
        ) : (
          <div className="blg-card__placeholder" aria-hidden="true">
            <span className="display">{post.title.slice(0, 1).toUpperCase()}</span>
          </div>
        )}
      </div>
      <div className="blg-card__body">
        <h2 className="blg-card__title">{post.title}</h2>
        {post.excerpt && <p className="blg-card__excerpt">{post.excerpt}</p>}
        <div className="blg-card__meta mono">
          {post.author_name && <span>{post.author_name}</span>}
          {post.author_name && date && <span className="blg-card__sep" aria-hidden="true" />}
          {date && <time dateTime={post.published_at ?? undefined}>{date}</time>}
        </div>
      </div>
    </Link>
  );
}

function FeaturedCard({ post }: { post: PublicBlogListItem }) {
  const date = formatDate(post.published_at);
  return (
    <Link to={`/blog/${post.slug}`} className="blg-feat reveal">
      <div className="blg-feat__media">
        {post.cover_image_url ? (
          <img
            src={post.cover_image_url}
            alt=""
            decoding="async"
            className="blg-feat__img"
          />
        ) : (
          <div className="blg-card__placeholder" aria-hidden="true">
            <span className="display">{post.title.slice(0, 1).toUpperCase()}</span>
          </div>
        )}
      </div>
      <div className="blg-feat__body">
        <div className="blg-feat__kicker mono">
          <span className="blg-feat__tick" />
          Latest
        </div>
        <h2 className="blg-feat__title">{post.title}</h2>
        {post.excerpt && <p className="blg-feat__excerpt">{post.excerpt}</p>}
        <div className="blg-card__meta mono">
          {post.author_name && <span>{post.author_name}</span>}
          {post.author_name && date && <span className="blg-card__sep" aria-hidden="true" />}
          {date && <time dateTime={post.published_at ?? undefined}>{date}</time>}
          <span className="blg-feat__read" aria-hidden="true">
            Read →
          </span>
        </div>
      </div>
    </Link>
  );
}

export interface BlogPageProps {
  /**
   * The first page of posts, fetched on the server. Null only when the API was
   * unreachable at render time, in which case the page falls back to its old
   * client-fetch behaviour.
   */
  initial?: { items: PublicBlogListItem[]; total: number } | null;
}

export function BlogPage({ initial = null }: BlogPageProps) {
  const [result, setResult] = useState<{
    key: number;
    items: PublicBlogListItem[] | null;
    total: number;
    failure: string | null;
  }>(() =>
    // Seeded from the server's own fetch so the very first render — on both
    // sides — is the real list. This page used to render a six-card loading
    // skeleton into the static HTML with no links in it at all, which meant
    // crawlers had no path from the blog hub to a single article.
    //
    // The seed must happen in the initialiser, not an effect: effects never run
    // during a server render, and a later assignment would make the client's
    // first render disagree with the markup the server sent.
    initial
      ? { key: 0, items: initial.items, total: initial.total, failure: null }
      : { key: 0, items: null, total: 0, failure: null },
  );
  const [loadingMore, setLoadingMore] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const items = result.key === reloadKey ? result.items : null;
  const total = result.key === reloadKey ? result.total : 0;
  const failure = result.key === reloadKey ? result.failure : null;

  useEffect(() => {
    let cancelled = false;
    fetchBlogList({ limit: PAGE_SIZE, offset: 0 })
      .then((res) => {
        if (!cancelled) {
          setResult({ key: reloadKey, items: res.items, total: res.total, failure: null });
        }
      })
      .catch((err) => {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : 'Failed to load posts.';
        setResult((prev) => {
          // A failed background refresh must never blank out posts that are
          // already on screen. The server rendered this list into the HTML; if
          // the API is merely cold right now, showing "Failed to load posts"
          // over perfectly good content is strictly worse than showing the
          // content. The key still advances so a retry is not stuck rendering
          // the skeleton forever.
          if (prev.items && prev.items.length > 0) {
            return { key: reloadKey, items: prev.items, total: prev.total, failure: null };
          }
          return { key: reloadKey, items: null, total: 0, failure: message };
        });
      });
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const loadMore = async () => {
    if (!items || loadingMore) return;
    setLoadingMore(true);
    try {
      const res = await fetchBlogList({ limit: PAGE_SIZE, offset: items.length });
      setResult((prev) =>
        prev && prev.key === reloadKey
          ? { key: prev.key, items: [...prev.items!, ...res.items], total: res.total, failure: null }
          : prev,
      );
    } catch {
      // Leave the list as-is; the button stays visible so the user can retry.
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div className="blg">
      <header className="blg-masthead">
        <div className="container">
          <div className="blg-masthead__kicker mono reveal">
            <span className="blg-masthead__tick" />
            Blog
          </div>
          <h1 className="blg-masthead__title display reveal reveal-blur reveal-d1">
            Notes from
            <br />
            <em>the studio.</em>
          </h1>
          <p className="blg-masthead__intro reveal reveal-d2">
            Practical writing on design, development, marketing, and building modern businesses —
            lessons from real client work, not theory.
          </p>
        </div>
      </header>

      <section className="blg-list">
        <div className="container">
          {failure ? (
            <div className="blg-state">
              <p>{failure}</p>
              <button className="blg-more" onClick={() => setReloadKey((k) => k + 1)}>
                Try again
              </button>
            </div>
          ) : items === null ? (
            <SkeletonListBody feature count={6} min={300} />
          ) : items.length === 0 ? (
            <div className="blg-state">
              <p>No posts yet — check back soon.</p>
            </div>
          ) : (
            <>
              <FeaturedCard post={items[0]} />
              {items.slice(1).length > 0 && (
                <div className="blg-grid">
                  {items.slice(1).map((post, i) => (
                    <BlogCard key={post.slug} post={post} index={i} />
                  ))}
                </div>
              )}
              {items.length < total && (
                <div className="blg-list__foot">
                  <button className="blg-more" onClick={loadMore} disabled={loadingMore}>
                    {loadingMore ? 'Loading…' : 'Load more'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}

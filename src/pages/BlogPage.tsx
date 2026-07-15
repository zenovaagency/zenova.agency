import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { fetchBlogList, type PublicBlogListItem } from '@/lib/publicContentApi';
import { scrollToTop } from '@/lib/scroll';
import './BlogPage.css';

const PAGE_SIZE = 12;

function formatDate(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

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
        {post.tags.length > 0 && (
          <div className="blg-card__tags mono">
            {post.tags.slice(0, 3).map((t) => (
              <span key={t} className="blg-chip">
                {t}
              </span>
            ))}
          </div>
        )}
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
        {post.tags.length > 0 && (
          <div className="blg-card__tags mono">
            {post.tags.slice(0, 3).map((t) => (
              <span key={t} className="blg-chip">
                {t}
              </span>
            ))}
          </div>
        )}
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

export function BlogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tag = searchParams.get('tag') ?? '';

  // Results are keyed by the request that produced them (tag + retry
  // counter): when the key changes, the derived `items` falls back to null
  // (skeleton) without resetting state inside the fetch effect.
  const [result, setResult] = useState<{
    key: string;
    items: PublicBlogListItem[];
    total: number;
  } | null>(null);
  const [failure, setFailure] = useState<{ key: string; message: string } | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const requestKey = `${reloadKey}:${tag}`;
  const items = result?.key === requestKey ? result.items : null;
  const total = result?.key === requestKey ? result.total : 0;
  const error = failure?.key === requestKey ? failure.message : null;

  useEffect(() => {
    scrollToTop();
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetchBlogList({ limit: PAGE_SIZE, offset: 0, tag: tag || undefined })
      .then((res) => {
        if (!cancelled) setResult({ key: requestKey, items: res.items, total: res.total });
      })
      .catch((err) => {
        if (!cancelled) {
          setFailure({
            key: requestKey,
            message: err instanceof Error ? err.message : 'Failed to load posts.',
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [requestKey, tag]);

  const loadMore = async () => {
    if (!items || loadingMore) return;
    setLoadingMore(true);
    try {
      const res = await fetchBlogList({ limit: PAGE_SIZE, offset: items.length, tag: tag || undefined });
      setResult((prev) =>
        prev && prev.key === requestKey
          ? { key: prev.key, items: [...prev.items, ...res.items], total: res.total }
          : prev,
      );
    } catch {
      // Leave the list as-is; the button stays visible so the user can retry.
    } finally {
      setLoadingMore(false);
    }
  };

  const tags = useMemo(
    () => Array.from(new Set((items ?? []).flatMap((p) => p.tags))).slice(0, 10),
    [items],
  );

  const setTag = (next: string) => {
    if (next) setSearchParams({ tag: next }, { replace: false });
    else setSearchParams({}, { replace: false });
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
          {(tags.length > 0 || tag || (items !== null && items.length > 0)) && (
            <div className="blg-toolbar reveal">
              <div className="blg-filters mono" role="group" aria-label="Filter posts by tag">
                {(tags.length > 0 || tag) && (
                  <>
                    <button
                      className={`blg-chip blg-chip--btn${tag === '' ? ' is-active' : ''}`}
                      onClick={() => setTag('')}
                    >
                      All
                    </button>
                    {(tag && !tags.includes(tag) ? [tag, ...tags] : tags).map((t) => (
                      <button
                        key={t}
                        className={`blg-chip blg-chip--btn${tag === t ? ' is-active' : ''}`}
                        onClick={() => setTag(t === tag ? '' : t)}
                      >
                        {t}
                      </button>
                    ))}
                  </>
                )}
              </div>
              {items !== null && items.length > 0 && (
                <span className="blg-count mono">
                  {total} {total === 1 ? 'post' : 'posts'}
                </span>
              )}
            </div>
          )}

          {error ? (
            <div className="blg-state">
              <p>{error}</p>
              <button className="blg-more" onClick={() => setReloadKey((k) => k + 1)}>
                Try again
              </button>
            </div>
          ) : items === null ? (
            <div aria-hidden="true">
              {!tag && (
                <div className="blg-feat blg-card--skeleton">
                  <div className="blg-feat__media" />
                  <div className="blg-feat__body">
                    <div className="blg-skel blg-skel--title" />
                    <div className="blg-skel" />
                    <div className="blg-skel blg-skel--short" />
                  </div>
                </div>
              )}
              <div className="blg-grid">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="blg-card blg-card--skeleton">
                    <div className="blg-card__media" />
                    <div className="blg-card__body">
                      <div className="blg-skel blg-skel--title" />
                      <div className="blg-skel" />
                      <div className="blg-skel blg-skel--short" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : items.length === 0 ? (
            <div className="blg-state">
              <p>{tag ? `No posts tagged “${tag}” yet.` : 'No posts yet — check back soon.'}</p>
              {tag && (
                <button className="blg-more" onClick={() => setTag('')}>
                  Show all posts
                </button>
              )}
            </div>
          ) : (
            <>
              {/* The newest post gets a full-width feature slot when the list
                  is unfiltered; tag views stay a plain grid. */}
              {!tag && <FeaturedCard post={items[0]} />}
              {(!tag ? items.slice(1) : items).length > 0 && (
                <div className="blg-grid">
                  {(!tag ? items.slice(1) : items).map((post, i) => (
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

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/admin/components/Button';
import { AdminShell } from '@/admin/components/AdminShell';
import { useConfirm } from '@/admin/components/confirm-context';
import { Toast } from '@/admin/components/Form';
import { deleteBlogPost, listBlogPosts, type BlogPost } from '@/admin/blogApi';

const GRID = '1.6fr 0.9fr 110px 130px 190px';

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, { dateStyle: 'medium' });
}

export function BlogAdmin() {
  const [posts, setPosts] = useState<BlogPost[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const confirm = useConfirm();

  const [reloadKey, setReloadKey] = useState(0);
  const retry = () => {
    setLoadError(null);
    setReloadKey((k) => k + 1);
  };

  useEffect(() => {
    let cancelled = false;
    listBlogPosts()
      .then((data) => {
        if (!cancelled) setPosts(data);
      })
      .catch((err) => {
        if (!cancelled) setLoadError(err instanceof Error ? err.message : 'Failed to load posts.');
      });
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const remove = async (post: BlogPost) => {
    if (
      !(await confirm({
        title: `Delete "${post.title}"?`,
        body: 'This cannot be undone.',
        confirmLabel: 'Delete',
        danger: true,
      }))
    )
      return;
    setBusy(post.slug);
    try {
      await deleteBlogPost(post.slug);
      setPosts((list) => (list ?? []).filter((p) => p.slug !== post.slug));
      setToast(`"${post.title}" deleted.`);
    } catch (err) {
      setToast(err instanceof Error ? err.message : 'Delete failed.');
    } finally {
      setBusy(null);
    }
  };

  return (
    <AdminShell
      crumbs={[{ label: 'Blog' }]}
      title="Blog"
      sub="Posts published here appear on /blog. Drafts stay private until you publish them."
      actions={
        <Button asChild>
          <Link to="/admin/blog/new">+ New post</Link>
        </Button>
      }
    >
      {loadError ? (
        <div className="adm-card" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ color: 'var(--adm-danger-text)', fontSize: 13 }}>{loadError}</span>
          <button className="adm-btn adm-btn--sm" onClick={retry}>
            Retry
          </button>
        </div>
      ) : posts === null ? (
        <div className="adm-card" style={{ color: 'var(--fg-dim)', fontSize: 13 }}>Loading posts…</div>
      ) : posts.length === 0 ? (
        <div className="adm-card" style={{ color: 'var(--fg-dim)', fontSize: 13 }}>
          No posts yet — write the first one.
        </div>
      ) : (
        <div className="adm-list">
          <div className="adm-list__row adm-list__row--head" style={{ gridTemplateColumns: GRID }}>
            <div>Title</div>
            <div>Slug</div>
            <div>Status</div>
            <div>Published</div>
            <div style={{ textAlign: 'right' }}>Actions</div>
          </div>
          {posts.map((post) => (
            <div key={post.slug} className="adm-list__row" style={{ gridTemplateColumns: GRID }}>
              <div className="adm-list__cell adm-list__cell--primary">
                <div style={{ fontSize: 14, fontWeight: 500 }}>{post.title}</div>
                <div style={{ fontSize: 12, color: 'var(--fg-faint)' }}>{post.excerpt}</div>
              </div>
              <div className="adm-list__cell" data-label="Slug">
                <span className="adm-badge">{post.slug}</span>
              </div>
              <div className="adm-list__cell" data-label="Status">
                <span
                  className="adm-badge"
                  style={
                    post.status === 'published'
                      ? { color: 'var(--adm-ok-text, #4caf7d)', borderColor: 'currentColor' }
                      : { color: 'var(--fg-dim)' }
                  }
                >
                  {post.status === 'published' ? 'Published' : 'Draft'}
                </span>
              </div>
              <div className="adm-list__cell" data-label="Published" style={{ color: 'var(--fg-dim)', fontSize: 13 }}>
                {formatDate(post.published_at)}
              </div>
              <div className="adm-list__cell adm-list__actions">
                {post.status === 'published' && (
                  <Link
                    to={`/blog/${post.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="adm-btn adm-btn--sm"
                  >
                    View
                  </Link>
                )}
                <Link to={`/admin/blog/${post.slug}`} className="adm-btn adm-btn--sm">
                  Edit
                </Link>
                <button
                  className="adm-btn adm-btn--sm adm-btn--danger"
                  onClick={() => remove(post)}
                  disabled={busy === post.slug}
                >
                  {busy === post.slug ? '…' : 'Delete'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      <Toast message={toast} onClear={() => setToast(null)} />
    </AdminShell>
  );
}

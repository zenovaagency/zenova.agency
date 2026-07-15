import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/admin/components/Button';
import { AdminShell } from '@/admin/components/AdminShell';
import { useConfirm } from '@/admin/components/confirm-context';
import { Toast } from '@/admin/components/Form';
import { deleteSeoPage, listSeoPages, type SeoPage } from '@/admin/seoPagesApi';

const GRID = '1.5fr 1fr 120px 130px 190px';

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, { dateStyle: 'medium' });
}

export function SeoPagesAdmin() {
  const [pages, setPages] = useState<SeoPage[] | null>(null);
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
    listSeoPages()
      .then((data) => {
        if (!cancelled) setPages(data);
      })
      .catch((err) => {
        if (!cancelled) setLoadError(err instanceof Error ? err.message : 'Failed to load pages.');
      });
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const remove = async (page: SeoPage) => {
    if (
      !(await confirm({
        title: `Delete "${page.title}"?`,
        body: 'This cannot be undone.',
        confirmLabel: 'Delete',
        danger: true,
      }))
    )
      return;
    setBusy(page.slug);
    try {
      await deleteSeoPage(page.slug);
      setPages((list) => (list ?? []).filter((p) => p.slug !== page.slug));
      setToast(`"${page.title}" deleted.`);
    } catch (err) {
      setToast(err instanceof Error ? err.message : 'Delete failed.');
    } finally {
      setBusy(null);
    }
  };

  return (
    <AdminShell
      crumbs={[{ label: 'SEO Pages' }]}
      title="SEO Pages"
      sub="Standalone landing pages served at zenova.agency/<slug>. Not linked from site navigation — reachable by direct URL and the sitemap."
      actions={
        <Button asChild>
          <Link to="/admin/seo-pages/new">+ New page</Link>
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
      ) : pages === null ? (
        <div className="adm-card" style={{ color: 'var(--fg-dim)', fontSize: 13 }}>Loading pages…</div>
      ) : pages.length === 0 ? (
        <div className="adm-card" style={{ color: 'var(--fg-dim)', fontSize: 13 }}>
          No SEO pages yet — create the first landing page.
        </div>
      ) : (
        <div className="adm-list">
          <div className="adm-list__row adm-list__row--head" style={{ gridTemplateColumns: GRID }}>
            <div>Title</div>
            <div>URL</div>
            <div>Status</div>
            <div>Updated</div>
            <div style={{ textAlign: 'right' }}>Actions</div>
          </div>
          {pages.map((page) => (
            <div key={page.slug} className="adm-list__row" style={{ gridTemplateColumns: GRID }}>
              <div className="adm-list__cell adm-list__cell--primary">
                <div style={{ fontSize: 14, fontWeight: 500 }}>{page.title}</div>
              </div>
              <div className="adm-list__cell" data-label="URL">
                <span className="adm-badge">/{page.slug}</span>
              </div>
              <div className="adm-list__cell" data-label="Status">
                <span
                  className="adm-badge"
                  style={
                    page.is_published
                      ? { color: 'var(--adm-ok-text, #4caf7d)', borderColor: 'currentColor' }
                      : { color: 'var(--fg-dim)' }
                  }
                >
                  {page.is_published ? 'Published' : 'Hidden'}
                </span>
              </div>
              <div className="adm-list__cell" data-label="Updated" style={{ color: 'var(--fg-dim)', fontSize: 13 }}>
                {formatDate(page.updated_at)}
              </div>
              <div className="adm-list__cell adm-list__actions">
                {page.is_published && (
                  <Link
                    to={`/${page.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="adm-btn adm-btn--sm"
                  >
                    View
                  </Link>
                )}
                <Link to={`/admin/seo-pages/${page.slug}`} className="adm-btn adm-btn--sm">
                  Edit
                </Link>
                <button
                  className="adm-btn adm-btn--sm adm-btn--danger"
                  onClick={() => remove(page)}
                  disabled={busy === page.slug}
                >
                  {busy === page.slug ? '…' : 'Delete'}
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

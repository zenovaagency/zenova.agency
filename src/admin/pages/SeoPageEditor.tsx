import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/admin/components/Button';
import { AdminShell } from '@/admin/components/AdminShell';
import { SlugField, TextArea, TextField, Toast, ToggleField } from '@/admin/components/Form';
import { ImageField } from '@/admin/components/ImageField';
import { RichTextEditor } from '@/admin/components/RichTextEditor';
import { isReservedSlug, isValidSlug, slugify } from '@/admin/lib/validate';
import { ApiError } from '@/lib/api';
import {
  createSeoPage,
  getSeoPage,
  updateSeoPage,
  type SeoPage,
  type SeoPageInput,
} from '@/admin/seoPagesApi';

type Tab = 'content' | 'seo';

function emptyPage(): SeoPageInput {
  return {
    slug: '',
    title: '',
    content_html: '',
    meta_title: null,
    meta_description: null,
    og_image_url: null,
    is_published: false,
  };
}

function toInput(page: SeoPage): SeoPageInput {
  const { created_at: _c, updated_at: _u, ...input } = page;
  return input;
}

export function SeoPageEditor() {
  const { slug = '' } = useParams();
  // Keying by slug remounts the form whenever the route param changes
  // (page -> page, page -> new), so all draft state resets without any
  // effect-time setState.
  return <SeoPageEditorForm key={slug} slug={slug} />;
}

function SeoPageEditorForm({ slug }: { slug: string }) {
  const nav = useNavigate();
  const isNew = slug === 'new';

  const [draft, setDraft] = useState<SeoPageInput | null>(isNew ? emptyPage() : null);
  const [notFound, setNotFound] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>('content');
  const [toast, setToast] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [slugTouched, setSlugTouched] = useState(!isNew);

  const [reloadKey, setReloadKey] = useState(0);
  const retry = () => {
    setLoadError(null);
    setReloadKey((k) => k + 1);
  };

  useEffect(() => {
    if (isNew) return;
    let cancelled = false;
    getSeoPage(slug)
      .then((page) => {
        if (!cancelled) setDraft(toInput(page));
      })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 404) setNotFound(true);
        else setLoadError(err instanceof Error ? err.message : 'Failed to load the page.');
      });
    return () => {
      cancelled = true;
    };
  }, [slug, isNew, reloadKey]);

  if (notFound) {
    return (
      <AdminShell title="Page not found" crumbs={[{ label: 'SEO Pages', to: '/admin/seo-pages' }, { label: '404' }]}>
        <p style={{ color: 'var(--fg-dim)' }}>That slug does not exist.</p>
      </AdminShell>
    );
  }

  if (loadError) {
    return (
      <AdminShell title="SEO Pages" crumbs={[{ label: 'SEO Pages', to: '/admin/seo-pages' }, { label: 'Error' }]}>
        <div className="adm-card" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ color: 'var(--adm-danger-text)', fontSize: 13 }}>{loadError}</span>
          <button className="adm-btn adm-btn--sm" onClick={retry}>
            Retry
          </button>
        </div>
      </AdminShell>
    );
  }

  if (!draft) {
    return (
      <AdminShell title="Loading…" crumbs={[{ label: 'SEO Pages', to: '/admin/seo-pages' }, { label: '…' }]}>
        <div className="adm-card" style={{ color: 'var(--fg-dim)', fontSize: 13 }}>Loading page…</div>
      </AdminShell>
    );
  }

  const update = <K extends keyof SeoPageInput>(key: K, value: SeoPageInput[K]) => {
    setDraft((d) => (d ? { ...d, [key]: value } : d));
  };

  const setTitle = (title: string) => {
    setDraft((d) => {
      if (!d) return d;
      const next = { ...d, title };
      if (isNew && !slugTouched) next.slug = slugify(title);
      return next;
    });
  };

  const save = async () => {
    if (!draft || saving) return;
    if (!draft.title.trim()) {
      setToast('Give the page a title.');
      return;
    }
    if (!isValidSlug(draft.slug)) {
      setToast('Enter a valid slug — lowercase letters, numbers, and dashes.');
      return;
    }
    if (isReservedSlug(draft.slug)) {
      setToast(`"/${draft.slug}" is reserved by the site — pick another slug.`);
      return;
    }
    setSaving(true);
    try {
      const saved = isNew ? await createSeoPage(draft) : await updateSeoPage(slug, draft);
      setDraft(toInput(saved));
      setToast(isNew ? 'Page created' : 'Saved');
      if (isNew || saved.slug !== slug) nav(`/admin/seo-pages/${saved.slug}`, { replace: true });
    } catch (err) {
      setToast(err instanceof Error ? err.message : 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  const TABS: Array<{ id: Tab; label: string }> = [
    { id: 'content', label: 'Content' },
    { id: 'seo', label: 'SEO' },
  ];

  return (
    <AdminShell
      crumbs={[
        { label: 'SEO Pages', to: '/admin/seo-pages' },
        { label: isNew ? 'New' : draft.title || slug },
      ]}
      title={isNew ? 'New SEO page' : draft.title || slug}
      sub={
        draft.is_published
          ? `Live at /${draft.slug}`
          : 'Hidden — not reachable on the public site'
      }
      actions={
        <>
          {!isNew && draft.is_published && (
            <a href={`/${draft.slug}`} target="_blank" rel="noreferrer" className="adm-btn">
              ↗ View
            </a>
          )}
          <button onClick={() => nav('/admin/seo-pages')} className="adm-btn">
            Cancel
          </button>
          <Button onClick={save} disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </>
      }
    >
      <div className="adm-tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`adm-tab${tab === t.id ? ' is-active' : ''}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'content' && (
        <div className="adm-card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="adm-row adm-row--2">
            <TextField
              label="Title"
              value={draft.title}
              onChange={setTitle}
              placeholder="Web Design in Dubai"
            />
            <SlugField
              label="Slug"
              value={draft.slug}
              onChange={(v) => {
                setSlugTouched(true);
                update('slug', v);
              }}
              hint="Becomes zenova.agency/<slug>. Route names like /pricing are reserved."
            />
          </div>
          <ToggleField
            label="Published"
            description="Hidden pages return 404 on the public site."
            value={draft.is_published}
            onChange={(v) => update('is_published', v)}
          />
          <div className="adm-field">
            <span className="adm-label">Body</span>
            <RichTextEditor
              value={draft.content_html}
              onChange={(html) => update('content_html', html)}
              placeholder="Write the page content…"
            />
          </div>
        </div>
      )}

      {tab === 'seo' && (
        <div className="adm-card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <TextField
            label="Meta title"
            value={draft.meta_title ?? ''}
            onChange={(v) => update('meta_title', v || null)}
            placeholder={draft.title ? `${draft.title} | Zenova` : 'Falls back to the page title'}
            hint="Shown in search results and browser tabs. Falls back to the page title."
          />
          <TextArea
            label="Meta description"
            value={draft.meta_description ?? ''}
            onChange={(v) => update('meta_description', v || null)}
            rows={2}
            hint="Aim for ~150 characters."
          />
          <ImageField
            label="Social share image"
            value={draft.og_image_url ?? ''}
            onChange={(v) => update('og_image_url', v || null)}
            prefix="pages"
            hint="1200×630 works best. Falls back to the site-wide OG card."
          />
        </div>
      )}

      <Toast message={toast} onClear={() => setToast(null)} />
    </AdminShell>
  );
}

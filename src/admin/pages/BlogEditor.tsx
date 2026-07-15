import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/admin/components/Button';
import { AdminShell } from '@/admin/components/AdminShell';
import {
  DateField,
  Select,
  SlugField,
  TextArea,
  TextField,
  Toast,
  TokenField,
} from '@/admin/components/Form';
import { ImageField } from '@/admin/components/ImageField';
import { RichTextEditor } from '@/admin/components/RichTextEditor';
import { isValidSlug, slugify } from '@/admin/lib/validate';
import { ApiError } from '@/lib/api';
import {
  createBlogPost,
  getBlogPost,
  updateBlogPost,
  type BlogPost,
  type BlogPostInput,
} from '@/admin/blogApi';

type Tab = 'content' | 'publishing' | 'seo';

function emptyPost(): BlogPostInput {
  return {
    slug: '',
    title: '',
    excerpt: '',
    content_html: '',
    cover_image_url: null,
    author_name: null,
    tags: [],
    status: 'draft',
    published_at: null,
    meta_title: null,
    meta_description: null,
    og_image_url: null,
  };
}

function toInput(post: BlogPost): BlogPostInput {
  const { created_at: _c, updated_at: _u, ...input } = post;
  return input;
}

export function BlogEditor() {
  const { slug = '' } = useParams();
  // Keying by slug remounts the form whenever the route param changes
  // (post -> post, post -> new), so all draft state resets without any
  // effect-time setState.
  return <BlogEditorForm key={slug} slug={slug} />;
}

function BlogEditorForm({ slug }: { slug: string }) {
  const nav = useNavigate();
  const isNew = slug === 'new';

  const [draft, setDraft] = useState<BlogPostInput | null>(isNew ? emptyPost() : null);
  const [notFound, setNotFound] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>('content');
  const [toast, setToast] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  // Once the admin edits the slug by hand, stop auto-deriving it from the title.
  const [slugTouched, setSlugTouched] = useState(!isNew);

  const [reloadKey, setReloadKey] = useState(0);
  const retry = () => {
    setLoadError(null);
    setReloadKey((k) => k + 1);
  };

  useEffect(() => {
    if (isNew) return;
    let cancelled = false;
    getBlogPost(slug)
      .then((post) => {
        if (!cancelled) setDraft(toInput(post));
      })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 404) setNotFound(true);
        else setLoadError(err instanceof Error ? err.message : 'Failed to load the post.');
      });
    return () => {
      cancelled = true;
    };
  }, [slug, isNew, reloadKey]);

  if (notFound) {
    return (
      <AdminShell title="Post not found" crumbs={[{ label: 'Blog', to: '/admin/blog' }, { label: '404' }]}>
        <p style={{ color: 'var(--fg-dim)' }}>That slug does not exist.</p>
      </AdminShell>
    );
  }

  if (loadError) {
    return (
      <AdminShell title="Blog" crumbs={[{ label: 'Blog', to: '/admin/blog' }, { label: 'Error' }]}>
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
      <AdminShell title="Loading…" crumbs={[{ label: 'Blog', to: '/admin/blog' }, { label: '…' }]}>
        <div className="adm-card" style={{ color: 'var(--fg-dim)', fontSize: 13 }}>Loading post…</div>
      </AdminShell>
    );
  }

  const update = <K extends keyof BlogPostInput>(key: K, value: BlogPostInput[K]) => {
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
      setToast('Give the post a title.');
      return;
    }
    if (!isValidSlug(draft.slug)) {
      setToast('Enter a valid slug — lowercase letters, numbers, and dashes.');
      return;
    }
    if (draft.slug === 'new') {
      setToast('Slug "new" is reserved — pick another.');
      return;
    }
    setSaving(true);
    try {
      const saved = isNew ? await createBlogPost(draft) : await updateBlogPost(slug, draft);
      setDraft(toInput(saved));
      setToast(isNew ? 'Post created' : 'Saved');
      if (isNew || saved.slug !== slug) nav(`/admin/blog/${saved.slug}`, { replace: true });
    } catch (err) {
      setToast(err instanceof Error ? err.message : 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  const TABS: Array<{ id: Tab; label: string }> = [
    { id: 'content', label: 'Content' },
    { id: 'publishing', label: 'Publishing' },
    { id: 'seo', label: 'SEO' },
  ];

  return (
    <AdminShell
      crumbs={[
        { label: 'Blog', to: '/admin/blog' },
        { label: isNew ? 'New' : draft.title || slug },
      ]}
      title={isNew ? 'New post' : draft.title || slug}
      sub={draft.status === 'published' ? 'Published' : 'Draft — not visible on the public site'}
      actions={
        <>
          {!isNew && draft.status === 'published' && (
            <a href={`/blog/${draft.slug}`} target="_blank" rel="noreferrer" className="adm-btn">
              ↗ View
            </a>
          )}
          <button onClick={() => nav('/admin/blog')} className="adm-btn">
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
              placeholder="How we ship design systems"
            />
            <SlugField
              label="Slug"
              value={draft.slug}
              onChange={(v) => {
                setSlugTouched(true);
                update('slug', v);
              }}
              hint="Becomes /blog/<slug>."
            />
          </div>
          <TextArea
            label="Excerpt"
            hint="Shown on the /blog listing card and used as the default meta description."
            value={draft.excerpt}
            onChange={(v) => update('excerpt', v)}
            rows={2}
          />
          <ImageField
            label="Cover image"
            value={draft.cover_image_url ?? ''}
            onChange={(v) => update('cover_image_url', v || null)}
            prefix="blog"
          />
          <div className="adm-field">
            <span className="adm-label">Body</span>
            <RichTextEditor
              value={draft.content_html}
              onChange={(html) => update('content_html', html)}
              placeholder="Write the post…"
            />
          </div>
        </div>
      )}

      {tab === 'publishing' && (
        <div className="adm-card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="adm-row adm-row--2">
            <Select
              label="Status"
              value={draft.status}
              options={[
                { value: 'draft', label: 'Draft' },
                { value: 'published', label: 'Published' },
              ]}
              onChange={(v) => update('status', v as BlogPostInput['status'])}
              hint="Drafts are hidden from the public site."
            />
            <DateField
              label="Publish date"
              value={draft.published_at ? draft.published_at.slice(0, 10) : ''}
              onChange={(v) => update('published_at', v ? `${v}T00:00:00+00:00` : null)}
              hint="Leave empty to stamp automatically on first publish."
              clearable
            />
          </div>
          <div className="adm-row adm-row--2">
            <TextField
              label="Author"
              value={draft.author_name ?? ''}
              onChange={(v) => update('author_name', v || null)}
              placeholder="Zenova Team"
            />
            <TokenField
              label="Tags"
              values={draft.tags}
              onChange={(v) => update('tags', v)}
              placeholder="design, engineering…"
              hint="Used for the tag filter on /blog."
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
            placeholder={draft.title ? `${draft.title} | Zenova Blog` : 'Falls back to the post title'}
            hint="Shown in search results and browser tabs. Falls back to the post title."
          />
          <TextArea
            label="Meta description"
            value={draft.meta_description ?? ''}
            onChange={(v) => update('meta_description', v || null)}
            rows={2}
            placeholder="Falls back to the excerpt."
            hint="Aim for ~150 characters. Falls back to the excerpt."
          />
          <ImageField
            label="Social share image"
            value={draft.og_image_url ?? ''}
            onChange={(v) => update('og_image_url', v || null)}
            prefix="blog"
            hint="1200×630 works best. Falls back to the cover image."
          />
        </div>
      )}

      <Toast message={toast} onClear={() => setToast(null)} />
    </AdminShell>
  );
}

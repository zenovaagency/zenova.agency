import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/admin/components/Button';
import { AdminShell } from '@/admin/components/AdminShell';
import {
  ColorField,
  ComboField,
  Field,
  SlugField,
  StringList,
  TextArea,
  TextField,
  Toast,
  TokenField,
} from '@/admin/components/Form';
import { SegmentedControl } from '@/components/ui/inputs';
import { ImageField } from '@/admin/components/ImageField';
import { isValidHex, isValidSlug } from '@/admin/lib/validate';
import { patchProject, projectsStore, useProjects, useServices } from '@/admin/store';
import type {
  ProjectDetail,
  ProjectImage,
  ProjectMetric,
  ProjectSection,
} from '@/data/projects';
import { emptyProject } from './ProjectsAdmin';

type Tab = 'basics' | 'images' | 'metrics' | 'sections' | 'meta' | 'testimonial';

export function ProjectEditor() {
  const { slug = '' } = useParams();
  const nav = useNavigate();
  const [projects] = useProjects();
  const [services] = useServices();
  const isNew = slug === 'new';
  const existing = useMemo(
    () => (isNew ? emptyProject() : projects.find((p) => p.slug === slug)),
    [slug, projects, isNew]
  );

  const [draft, setDraft] = useState<ProjectDetail | null>(existing ?? null);
  const [tab, setTab] = useState<Tab>('basics');
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (existing) setDraft(existing);
  }, [existing]);

  const categorySuggestions = useMemo(() => projects.map((p) => p.category), [projects]);
  const industrySuggestions = useMemo(() => projects.map((p) => p.industry), [projects]);
  const yearSuggestions = useMemo(() => {
    const now = new Date().getFullYear();
    const recent = Array.from({ length: 7 }, (_, i) => String(now - i));
    return [...recent, ...projects.map((p) => p.year)];
  }, [projects]);
  const tagSuggestions = useMemo(() => projects.flatMap((p) => p.tags), [projects]);
  const serviceSuggestions = useMemo(
    () => [...services.map((s) => s.title), ...projects.flatMap((p) => p.services)],
    [services, projects]
  );

  if (!draft) {
    return (
      <AdminShell title="Case study not found" crumbs={[{ label: 'Projects', to: '/admin/projects' }, { label: '404' }]}>
        <p style={{ color: 'var(--fg-dim)' }}>That slug does not exist.</p>
      </AdminShell>
    );
  }

  const update = <K extends keyof ProjectDetail>(key: K, value: ProjectDetail[K]) => {
    setDraft((d) => (d ? { ...d, [key]: value } : d));
  };

  const save = async () => {
    if (!draft) return;
    if (!isValidSlug(draft.slug)) {
      setToast('Enter a valid slug — lowercase letters, numbers, and dashes.');
      return;
    }
    if (!isValidHex(draft.tone)) {
      setToast('Accent tone must be a hex color like #ff813a.');
      return;
    }
    if (isNew) {
      if (projects.some((p) => p.slug === draft.slug)) {
        setToast(`Slug "${draft.slug}" already exists — pick another.`);
        return;
      }
      try {
        await projectsStore.set([...projects, draft]);
        setToast('Case study created');
        nav(`/admin/projects/${draft.slug}`, { replace: true });
      } catch (err) {
        setToast(err instanceof Error ? err.message : 'Save failed.');
      }
    } else {
      try {
        await patchProject(slug, draft);
        setToast('Saved');
        if (draft.slug !== slug) nav(`/admin/projects/${draft.slug}`, { replace: true });
      } catch (err) {
        setToast(err instanceof Error ? err.message : 'Save failed.');
      }
    }
  };

  const TABS: Array<{ id: Tab; label: string }> = [
    { id: 'basics', label: 'Basics' },
    { id: 'images', label: `Images (${draft.images?.length ?? 0})` },
    { id: 'metrics', label: `Metrics (${draft.metrics.length})` },
    { id: 'sections', label: `Narrative (${draft.sections.length})` },
    { id: 'meta', label: 'Stack & deliverables' },
    { id: 'testimonial', label: 'Testimonial' },
  ];

  return (
    <AdminShell
      crumbs={[
        { label: 'Projects', to: '/admin/projects' },
        { label: isNew ? 'New' : draft.client },
      ]}
      title={isNew ? 'New case study' : draft.client}
      sub={draft.title}
      actions={
        <>
          {!isNew && (
            <a
              href={`/work/${draft.slug}`}
              target="_blank"
              rel="noreferrer"
              className="adm-btn"
            >
              ↗ Preview
            </a>
          )}
          <button onClick={() => nav('/admin/projects')} className="adm-btn">
            Cancel
          </button>
          <Button onClick={save}>Save</Button>
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

      {tab === 'basics' && (
        <div className="adm-card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="adm-row adm-row--2">
            <SlugField label="Slug" value={draft.slug} onChange={(v) => update('slug', v)} hint="Becomes /work/<slug>." />
            <TextField label="Client" value={draft.client} onChange={(v) => update('client', v)} />
          </div>
          <div className="adm-row adm-row--3">
            <ComboField label="Category" value={draft.category} suggestions={categorySuggestions} onChange={(v) => update('category', v)} placeholder="e.g. SaaS" />
            <ComboField label="Industry" value={draft.industry} suggestions={industrySuggestions} onChange={(v) => update('industry', v)} placeholder="e.g. Fintech" />
            <ComboField label="Year" value={draft.year} suggestions={yearSuggestions} onChange={(v) => update('year', v)} placeholder="2025" />
          </div>
          <TextField label="Title" value={draft.title} onChange={(v) => update('title', v)} />
          <TextField
            label="Live site URL"
            value={draft.liveUrl ?? ''}
            onChange={(v) => update('liveUrl', v)}
            placeholder="https://example.com"
            hint="Optional. Adds a 'Visit live site' button on the project detail hero."
          />
          <TextArea label="Summary" hint="Shown on the /work card." value={draft.summary} onChange={(v) => update('summary', v)} rows={2} />
          <TextArea label="Hero copy" hint="Opening sentences on the detail page." value={draft.hero} onChange={(v) => update('hero', v)} rows={3} />
          <div className="adm-row adm-row--3">
            <TextField label="Duration" value={draft.duration} onChange={(v) => update('duration', v)} placeholder="14 weeks" />
            <TextField label="Team shape" value={draft.team} onChange={(v) => update('team', v)} placeholder="5 people · 1 Slack channel" />
            <ColorField label="Accent tone" value={draft.tone} onChange={(v) => update('tone', v)} />
          </div>
          <TokenField
            label="Tags"
            hint="Drive the filter chips on /work."
            values={draft.tags}
            onChange={(v) => update('tags', v)}
            suggestions={tagSuggestions}
            placeholder="Add a tag…"
          />
          <TokenField
            label="Services"
            hint="Labels shown in the sidebar."
            values={draft.services}
            onChange={(v) => update('services', v)}
            suggestions={serviceSuggestions}
            placeholder="Add a service…"
          />
          <Field label="Headline metric (the big one on cards)">
            <div className="adm-row adm-row--2">
              <input
                className="adm-input"
                value={draft.metric[0]}
                placeholder="+212%"
                onChange={(e) => update('metric', [e.target.value, draft.metric[1]])}
              />
              <input
                className="adm-input"
                value={draft.metric[1]}
                placeholder="Trial signups, Q over Q"
                onChange={(e) => update('metric', [draft.metric[0], e.target.value])}
              />
            </div>
          </Field>
          <Field label="Visual variant" hint="The animated SVG shown when no hero image is set.">
            <SegmentedControl
              value={draft.visualIdx}
              onChange={(v) => update('visualIdx', v)}
              ariaLabel="Visual variant"
              options={Array.from(
                { length: Math.min(11, Math.max(4, draft.visualIdx + 1)) },
                (_, i) => ({ value: i, label: `Variant ${i + 1}` })
              )}
            />
          </Field>
        </div>
      )}

      {tab === 'images' && (
        <ImagesEditor
          images={draft.images ?? []}
          onChange={(v) => update('images', v)}
        />
      )}

      {tab === 'metrics' && (
        <MetricsEditor metrics={draft.metrics} onChange={(v) => update('metrics', v)} />
      )}

      {tab === 'sections' && (
        <SectionEditor sections={draft.sections} onChange={(v) => update('sections', v)} />
      )}

      {tab === 'meta' && (
        <div className="adm-card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <StringList
            label="Stack"
            values={draft.stack}
            onChange={(v) => update('stack', v)}
            placeholder="e.g. Next.js"
          />
          <StringList
            label="Deliverables"
            values={draft.deliverables}
            onChange={(v) => update('deliverables', v)}
            placeholder="e.g. New brand system"
          />
        </div>
      )}

      {tab === 'testimonial' && (
        <div className="adm-card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <TextArea
            label="Quote"
            value={draft.testimonial.quote}
            onChange={(v) =>
              update('testimonial', { ...draft.testimonial, quote: v })
            }
            rows={4}
          />
          <div className="adm-row adm-row--2">
            <TextField
              label="Author"
              value={draft.testimonial.author}
              onChange={(v) => update('testimonial', { ...draft.testimonial, author: v })}
            />
            <TextField
              label="Role"
              value={draft.testimonial.role}
              onChange={(v) => update('testimonial', { ...draft.testimonial, role: v })}
            />
          </div>
        </div>
      )}

      <Toast message={toast} onClear={() => setToast(null)} />
    </AdminShell>
  );
}

function ImagesEditor({
  images,
  onChange,
}: {
  images: ProjectImage[];
  onChange: (next: ProjectImage[]) => void;
}) {
  const update = (i: number, patch: Partial<ProjectImage>) => {
    const next = [...images];
    next[i] = { ...next[i], ...patch };
    onChange(next);
  };
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= images.length) return;
    const next = [...images];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <p className="adm-help" style={{ margin: 0 }}>
        First image is used as the card thumbnail and detail-page hero. Any extras
        render as a gallery below the hero. Leave empty to use the animated SVG fallback.
      </p>
      {images.map((img, i) => (
        <div key={i} className="adm-card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
            <div className="adm-label">
              {i === 0 ? 'Hero image' : `Image ${i + 1}`}
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                className="adm-btn adm-btn--sm"
                onClick={() => move(i, -1)}
                disabled={i === 0}
              >
                ↑
              </button>
              <button
                className="adm-btn adm-btn--sm"
                onClick={() => move(i, 1)}
                disabled={i === images.length - 1}
              >
                ↓
              </button>
              <button
                className="adm-btn adm-btn--sm adm-btn--danger"
                onClick={() => onChange(images.filter((_, idx) => idx !== i))}
              >
                Remove
              </button>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: 14, alignItems: 'start' }}>
            <div
              style={{
                aspectRatio: '4 / 3',
                borderRadius: 12,
                overflow: 'hidden',
                border: '1px solid var(--line)',
                background: '#0a0b13',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--fg-faint)',
                fontSize: 12,
              }}
            >
              {img.src ? (
                <img
                  src={img.src}
                  alt={img.alt ?? ''}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                'No URL'
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <ImageField
                value={img.src}
                onChange={(v) => update(i, { src: v })}
                prefix="projects"
                showPreview={false}
              />
              <div className="adm-row adm-row--2">
                <TextField
                  label="Alt text"
                  value={img.alt ?? ''}
                  onChange={(v) => update(i, { alt: v })}
                  placeholder="Short description"
                />
                <TextField
                  label="Caption (optional)"
                  value={img.caption ?? ''}
                  onChange={(v) => update(i, { caption: v })}
                  placeholder="Shown under gallery images"
                />
              </div>
            </div>
          </div>
        </div>
      ))}
      <button
        className="adm-btn"
        onClick={() => onChange([...images, { src: '', alt: '' }])}
        style={{ alignSelf: 'flex-start' }}
      >
        + Add image
      </button>
    </div>
  );
}

function MetricsEditor({
  metrics,
  onChange,
}: {
  metrics: ProjectMetric[];
  onChange: (next: ProjectMetric[]) => void;
}) {
  const update = (i: number, patch: Partial<ProjectMetric>) => {
    const next = [...metrics];
    next[i] = { ...next[i], ...patch };
    onChange(next);
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {metrics.map((m, i) => (
        <div key={i} className="adm-card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="adm-label">Metric {i + 1}</div>
            <button
              className="adm-btn adm-btn--sm adm-btn--danger"
              onClick={() => onChange(metrics.filter((_, idx) => idx !== i))}
            >
              Remove
            </button>
          </div>
          <div className="adm-row adm-row--2">
            <TextField label="Number" value={m.num} onChange={(v) => update(i, { num: v })} />
            <TextField label="Label" value={m.label} onChange={(v) => update(i, { label: v })} />
          </div>
        </div>
      ))}
      <button
        className="adm-btn"
        onClick={() => onChange([...metrics, { num: '', label: '' }])}
        style={{ alignSelf: 'flex-start' }}
      >
        + Add metric
      </button>
    </div>
  );
}

function SectionEditor({
  sections,
  onChange,
}: {
  sections: ProjectSection[];
  onChange: (next: ProjectSection[]) => void;
}) {
  const update = (i: number, patch: Partial<ProjectSection>) => {
    const next = [...sections];
    next[i] = { ...next[i], ...patch };
    onChange(next);
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {sections.map((s, i) => (
        <div key={i} className="adm-card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="adm-label">Section {i + 1}</div>
            <button
              className="adm-btn adm-btn--sm adm-btn--danger"
              onClick={() => onChange(sections.filter((_, idx) => idx !== i))}
            >
              Remove
            </button>
          </div>
          <TextField label="Title" value={s.title} onChange={(v) => update(i, { title: v })} placeholder="The challenge" />
          <Field label="Paragraphs" hint="One textarea per paragraph.">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {s.body.map((p, bi) => (
                <div key={bi} style={{ display: 'flex', gap: 8 }}>
                  <textarea
                    className="adm-textarea"
                    rows={3}
                    value={p}
                    onChange={(e) => {
                      const next = [...s.body];
                      next[bi] = e.target.value;
                      update(i, { body: next });
                    }}
                  />
                  <button
                    className="adm-btn adm-btn--sm adm-btn--danger"
                    onClick={() => update(i, { body: s.body.filter((_, x) => x !== bi) })}
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                className="adm-btn adm-btn--sm"
                onClick={() => update(i, { body: [...s.body, ''] })}
                style={{ alignSelf: 'flex-start' }}
              >
                + Add paragraph
              </button>
            </div>
          </Field>
        </div>
      ))}
      <button
        className="adm-btn"
        onClick={() => onChange([...sections, { title: '', body: [''] }])}
        style={{ alignSelf: 'flex-start' }}
      >
        + Add section
      </button>
    </div>
  );
}

import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/admin/components/Button';
import { AdminShell } from '@/admin/components/AdminShell';
import {
  ColorField,
  ComboField,
  Select,
  SlugField,
  StringList,
  TextArea,
  TextField,
  Toast,
  TokenField,
  Field,
} from '@/admin/components/Form';
import { MediaField } from '@/admin/components/MediaField';
import { Toggle } from '@/components/ui/inputs';
import { isValidHex, isValidSlug } from '@/admin/lib/validate';
import { createService, patchService, useServices } from '@/admin/store';
import type {
  ServiceDetail,
  ServicePackage,
  ServicePhase,
  ServiceFAQ,
} from '@/data/services';
import { Icon, type IconName } from '@/components/icons/Icon';
import type { ServiceVisualKind } from '@/components/sections/ServiceVisual';
import { ICON_OPTIONS, VISUAL_OPTIONS, emptyService } from './ServicesAdmin';

type Tab = 'basics' | 'meta' | 'deliverables' | 'phases' | 'packages' | 'faqs';

export function ServiceEditor() {
  const { slug = '' } = useParams();
  const nav = useNavigate();
  const [services] = useServices();
  const isNew = slug === 'new';
  const existing = useMemo(
    () => (isNew ? emptyService() : services.find((s) => s.slug === slug)),
    [slug, services, isNew]
  );

  const [draft, setDraft] = useState<ServiceDetail | null>(existing ?? null);
  const [tab, setTab] = useState<Tab>('basics');
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (existing) setDraft(existing);
  }, [existing]);

  const tagSuggestions = useMemo(
    () => ['Build', 'Grow', 'Launch', 'Operate', 'Voice', ...services.map((s) => s.tag)],
    [services]
  );
  const relatedSuggestions = useMemo(
    () => services.filter((s) => s.slug !== draft?.slug).map((s) => s.slug),
    [services, draft?.slug]
  );

  if (!draft) {
    return (
      <AdminShell title="Service not found" crumbs={[{ label: 'Services', to: '/admin/services' }, { label: '404' }]}>
        <p style={{ color: 'var(--fg-dim)' }}>That slug does not exist.</p>
      </AdminShell>
    );
  }

  const update = <K extends keyof ServiceDetail>(key: K, value: ServiceDetail[K]) => {
    setDraft((d) => (d ? { ...d, [key]: value } : d));
  };

  const save = async () => {
    if (!draft) return;
    if (!isValidSlug(draft.slug)) {
      setToast('Enter a valid slug — lowercase letters, numbers, and dashes.');
      return;
    }
    if (!isValidHex(draft.hue)) {
      setToast('Accent hue must be a hex color like #ff813a.');
      return;
    }
    if (isNew) {
      if (services.some((s) => s.slug === draft.slug)) {
        setToast(`Slug "${draft.slug}" already exists — pick another.`);
        return;
      }
      try {
        await createService(draft);
        setToast('Service created');
        nav(`/admin/services/${draft.slug}`, { replace: true });
      } catch (err) {
        setToast(err instanceof Error ? err.message : 'Save failed.');
      }
    } else {
      try {
        await patchService(slug, draft);
        setToast('Saved');
        if (draft.slug !== slug) nav(`/admin/services/${draft.slug}`, { replace: true });
      } catch (err) {
        setToast(err instanceof Error ? err.message : 'Save failed.');
      }
    }
  };

  const TABS: Array<{ id: Tab; label: string }> = [
    { id: 'basics', label: 'Basics' },
    { id: 'meta', label: 'Stats & visual' },
    { id: 'deliverables', label: `Deliverables (${draft.deliverables.length})` },
    { id: 'phases', label: `Phases (${draft.phases.length})` },
    { id: 'packages', label: `Packages (${draft.packages.length})` },
    { id: 'faqs', label: `FAQs (${draft.faqs.length})` },
  ];

  return (
    <AdminShell
      crumbs={[
        { label: 'Services', to: '/admin/services' },
        { label: isNew ? 'New' : draft.title },
      ]}
      title={isNew ? 'New service' : draft.title}
      sub={isNew ? 'Create a new service surface.' : 'Edit the marketing surface for this service.'}
      actions={
        <>
          {!isNew && (
            <a
              href={`/services/${draft.slug}`}
              target="_blank"
              rel="noreferrer"
              className="adm-btn"
            >
              ↗ Preview
            </a>
          )}
          <button onClick={() => nav('/admin/services')} className="adm-btn">
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
            <SlugField label="Slug" hint="Lowercase, dash-separated. Becomes /services/<slug>." value={draft.slug} onChange={(v) => update('slug', v)} />
            <TextField label="Title" value={draft.title} onChange={(v) => update('title', v)} />
          </div>
          <div className="adm-row adm-row--3">
            <ComboField label="Tag" hint="Short label, e.g. Build / Grow." value={draft.tag} suggestions={tagSuggestions} onChange={(v) => update('tag', v)} />
            <Select
              label="Icon"
              value={draft.icon}
              options={ICON_OPTIONS.map((name) => {
                const IconC = Icon[name as IconName];
                return {
                  value: name,
                  label: name,
                  icon: IconC ? (
                    <span style={{ color: draft.hue, display: 'inline-flex' }}>
                      <IconC size={20} />
                    </span>
                  ) : undefined,
                };
              })}
              onChange={(v) => update('icon', v as IconName)}
            />
            <ColorField label="Accent hue" value={draft.hue} onChange={(v) => update('hue', v)} />
          </div>
          <TextArea
            label="Short description"
            hint="One sentence — shown in lists and previews."
            value={draft.short}
            onChange={(v) => update('short', v)}
            rows={2}
          />
          <TextArea
            label="Lede"
            hint="Slightly longer subheading on the detail page."
            value={draft.lede}
            onChange={(v) => update('lede', v)}
            rows={3}
          />
          <TextArea
            label="Hero copy"
            hint="The long-form paragraph in the detail-page hero."
            value={draft.hero}
            onChange={(v) => update('hero', v)}
            rows={4}
          />
          <StringList
            label="Bullets"
            hint="Quick selling points (shown in the homepage list)."
            values={draft.bullets}
            onChange={(v) => update('bullets', v)}
            placeholder="e.g. Next.js & TypeScript engineering"
          />
          <TokenField
            label="Related services"
            hint="Slugs of other services to surface as 'pairs well with'."
            values={draft.related}
            onChange={(v) => update('related', v)}
            suggestions={relatedSuggestions}
            placeholder="Add a service slug…"
          />
        </div>
      )}

      {tab === 'meta' && (
        <div className="adm-card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Select
            label="Visual style"
            value={draft.visual}
            options={VISUAL_OPTIONS.map((v) => ({ value: v, label: v }))}
            onChange={(v) => update('visual', v as ServiceVisualKind)}
          />
          <MediaField
            label="Card media"
            hint="Upload or pick an image (poster/fallback) and optionally add a video that plays on hover."
            image={draft.image ?? ''}
            video={draft.video ?? ''}
            onImageChange={(v) => update('image', v)}
            onVideoChange={(v) => update('video', v)}
            prefix="services"
          />
          <div className="adm-row adm-row--2">
            <TextField
              label="Headline stat — number"
              value={draft.stat[0]}
              onChange={(v) => update('stat', [v, draft.stat[1]])}
            />
            <TextField
              label="Headline stat — label"
              value={draft.stat[1]}
              onChange={(v) => update('stat', [draft.stat[0], v])}
            />
          </div>
          <div>
            <label className="adm-label">Hero metrics (number + label, up to 4 shown)</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
              {draft.meta.map((row, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr auto', gap: 8 }}>
                  <input
                    className="adm-input"
                    value={row[0]}
                    placeholder="Number"
                    onChange={(e) => {
                      const next = [...draft.meta];
                      next[i] = [e.target.value, row[1]];
                      update('meta', next);
                    }}
                  />
                  <input
                    className="adm-input"
                    value={row[1]}
                    placeholder="Label"
                    onChange={(e) => {
                      const next = [...draft.meta];
                      next[i] = [row[0], e.target.value];
                      update('meta', next);
                    }}
                  />
                  <button
                    className="adm-btn adm-btn--sm adm-btn--danger"
                    onClick={() => update('meta', draft.meta.filter((_, idx) => idx !== i))}
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                className="adm-btn adm-btn--sm"
                onClick={() => update('meta', [...draft.meta, ['', '']])}
                style={{ alignSelf: 'flex-start' }}
              >
                + Add metric
              </button>
            </div>
          </div>
          <StringList
            label="Stack"
            hint="Tools / frameworks shown as chips."
            values={draft.stack}
            onChange={(v) => update('stack', v)}
            placeholder="e.g. Next.js 15"
          />
        </div>
      )}

      {tab === 'deliverables' && (
        <DeliverableEditor
          deliverables={draft.deliverables}
          onChange={(v) => update('deliverables', v)}
        />
      )}

      {tab === 'phases' && (
        <PhaseEditor phases={draft.phases} onChange={(v) => update('phases', v)} />
      )}

      {tab === 'packages' && (
        <PackageEditor packages={draft.packages} onChange={(v) => update('packages', v)} />
      )}

      {tab === 'faqs' && (
        <FaqEditor faqs={draft.faqs} onChange={(v) => update('faqs', v)} />
      )}

      <Toast message={toast} onClear={() => setToast(null)} />
    </AdminShell>
  );
}

function DeliverableEditor({
  deliverables,
  onChange,
}: {
  deliverables: ServiceDetail['deliverables'];
  onChange: (next: ServiceDetail['deliverables']) => void;
}) {
  const update = (i: number, patch: Partial<{ title: string; blurb: string }>) => {
    const next = [...deliverables];
    next[i] = { ...next[i], ...patch };
    onChange(next);
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {deliverables.map((d, i) => (
        <div key={i} className="adm-card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="adm-label">Deliverable {i + 1}</div>
            <button
              className="adm-btn adm-btn--sm adm-btn--danger"
              onClick={() => onChange(deliverables.filter((_, idx) => idx !== i))}
            >
              Remove
            </button>
          </div>
          <TextField label="Title" value={d.title} onChange={(v) => update(i, { title: v })} />
          <TextArea label="Description" value={d.blurb} onChange={(v) => update(i, { blurb: v })} rows={2} />
        </div>
      ))}
      <button
        className="adm-btn"
        onClick={() => onChange([...deliverables, { title: '', blurb: '' }])}
        style={{ alignSelf: 'flex-start' }}
      >
        + Add deliverable
      </button>
    </div>
  );
}

function PhaseEditor({
  phases,
  onChange,
}: {
  phases: ServicePhase[];
  onChange: (next: ServicePhase[]) => void;
}) {
  const update = (i: number, patch: Partial<ServicePhase>) => {
    const next = [...phases];
    next[i] = { ...next[i], ...patch };
    onChange(next);
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {phases.map((p, i) => (
        <div key={i} className="adm-card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="adm-label">Phase {i + 1}</div>
            <button
              className="adm-btn adm-btn--sm adm-btn--danger"
              onClick={() => onChange(phases.filter((_, idx) => idx !== i))}
            >
              Remove
            </button>
          </div>
          <div className="adm-row adm-row--2">
            <TextField label="Number" value={p.n} onChange={(v) => update(i, { n: v })} />
            <TextField label="Title" value={p.title} onChange={(v) => update(i, { title: v })} />
          </div>
          <TextArea label="Description" value={p.blurb} onChange={(v) => update(i, { blurb: v })} rows={2} />
          <TextField label="Output" value={p.out} onChange={(v) => update(i, { out: v })} />
        </div>
      ))}
      <button
        className="adm-btn"
        onClick={() =>
          onChange([
            ...phases,
            {
              n: String(phases.length + 1).padStart(2, '0'),
              title: '',
              blurb: '',
              out: '',
            },
          ])
        }
        style={{ alignSelf: 'flex-start' }}
      >
        + Add phase
      </button>
    </div>
  );
}

function PackageEditor({
  packages,
  onChange,
}: {
  packages: ServicePackage[];
  onChange: (next: ServicePackage[]) => void;
}) {
  const update = (i: number, patch: Partial<ServicePackage>) => {
    const next = [...packages];
    next[i] = { ...next[i], ...patch };
    onChange(next);
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {packages.map((p, i) => (
        <div key={i} className="adm-card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="adm-label">Package {i + 1}</div>
            <button
              className="adm-btn adm-btn--sm adm-btn--danger"
              onClick={() => onChange(packages.filter((_, idx) => idx !== i))}
            >
              Remove
            </button>
          </div>
          <div className="adm-row adm-row--3">
            <TextField label="Name" value={p.name} onChange={(v) => update(i, { name: v })} />
            <TextField label="Price" value={p.price} onChange={(v) => update(i, { price: v })} />
            <TextField label="Cadence" value={p.cadence} onChange={(v) => update(i, { cadence: v })} />
          </div>
          <TextArea label="Best fit" value={p.fits} onChange={(v) => update(i, { fits: v })} rows={2} />
          <StringList
            label="Includes"
            values={p.includes}
            onChange={(v) => update(i, { includes: v })}
            placeholder="e.g. CMS + content model"
          />
          <Field label="Featured?">
            <Toggle
              checked={!!p.featured}
              onChange={(v) => update(i, { featured: v })}
              label="Mark as the most-picked package"
            />
          </Field>
        </div>
      ))}
      <button
        className="adm-btn"
        onClick={() =>
          onChange([
            ...packages,
            { name: '', price: '', cadence: '', fits: '', includes: [] },
          ])
        }
        style={{ alignSelf: 'flex-start' }}
      >
        + Add package
      </button>
    </div>
  );
}

function FaqEditor({
  faqs,
  onChange,
}: {
  faqs: ServiceFAQ[];
  onChange: (next: ServiceFAQ[]) => void;
}) {
  const update = (i: number, patch: Partial<ServiceFAQ>) => {
    const next = [...faqs];
    next[i] = { ...next[i], ...patch };
    onChange(next);
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {faqs.map((f, i) => (
        <div key={i} className="adm-card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="adm-label">FAQ {i + 1}</div>
            <button
              className="adm-btn adm-btn--sm adm-btn--danger"
              onClick={() => onChange(faqs.filter((_, idx) => idx !== i))}
            >
              Remove
            </button>
          </div>
          <TextField label="Question" value={f.q} onChange={(v) => update(i, { q: v })} />
          <TextArea label="Answer" value={f.a} onChange={(v) => update(i, { a: v })} rows={3} />
        </div>
      ))}
      <button
        className="adm-btn"
        onClick={() => onChange([...faqs, { q: '', a: '' }])}
        style={{ alignSelf: 'flex-start' }}
      >
        + Add FAQ
      </button>
    </div>
  );
}

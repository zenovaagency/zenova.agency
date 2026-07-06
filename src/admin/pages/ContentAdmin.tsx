import { useEffect, useState } from 'react';
import { AdminShell } from '@/admin/components/AdminShell';
import { ImageField } from '@/admin/components/ImageField';
import {
  ColorField,
  Field,
  Select,
  StringList,
  TextArea,
  TextField,
  Toast,
} from '@/admin/components/Form';
import {
  contentStore,
  useContent,
  type AboutContent,
  type AboutMilestone,
  type AboutRole,
  type AboutValue,
  type ProcessContent,
  type ProcessStep,
  type SiteContent,
} from '@/admin/store';
import { Button } from '@/admin/components/Button';
import { Icon } from '@/components/icons/Icon';

type Tab = 'hero' | 'cta' | 'process' | 'faq' | 'testimonials' | 'marquee' | 'about';

const ICON_OPTIONS = Object.keys(Icon).map((k) => ({ value: k, label: k }));

function uid(prefix: string) {
  return prefix + Math.random().toString(36).slice(2, 9);
}

function emptyAbout(): AboutContent {
  return { values: [], roles: [], timeline: [] };
}

export function ContentAdmin() {
  const [content] = useContent();
  const [draft, setDraft] = useState<SiteContent>(content);
  const [tab, setTab] = useState<Tab>('hero');
  const [toast, setToast] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDraft(content);
  }, [content]);

  // Defensive: older payloads may not have `about` / `process` yet.
  const about: AboutContent = draft.about ?? emptyAbout();
  const process: ProcessContent = draft.process ?? contentStore.getDefaults().process;

  const dirty = JSON.stringify(draft) !== JSON.stringify(content);

  const update = (delta: Partial<SiteContent>) => {
    setDraft((d) => ({ ...d, ...delta }));
  };
  const updateHero = (delta: Partial<SiteContent['hero']>) => {
    setDraft((d) => ({ ...d, hero: { ...d.hero, ...delta } }));
  };
  const updateCta = (delta: Partial<SiteContent['cta']>) => {
    setDraft((d) => ({ ...d, cta: { ...d.cta, ...delta } }));
  };
  const updateAbout = (delta: Partial<AboutContent>) => {
    setDraft((d) => ({ ...d, about: { ...(d.about ?? emptyAbout()), ...delta } }));
  };

  const save = async () => {
    setSaving(true);
    try {
      // Make sure `about` and `process` are always populated when we persist.
      await contentStore.set({ ...draft, about, process });
      setToast('Saved.');
    } catch (err) {
      setToast(err instanceof Error ? err.message : 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  const discard = () => setDraft(content);

  const tabs: Array<{ id: Tab; label: string }> = [
    { id: 'hero', label: 'Hero' },
    { id: 'cta', label: 'CTA' },
    { id: 'process', label: `Process (${process.steps.length})` },
    { id: 'faq', label: `FAQs (${draft.faqs.length})` },
    { id: 'testimonials', label: `Testimonials (${draft.testimonials.length})` },
    { id: 'marquee', label: `Marquee (${draft.marquee.length})` },
    { id: 'about', label: 'About page' },
  ];

  return (
    <AdminShell
      crumbs={[{ label: 'Site content' }]}
      title="Site content"
      sub="Hero, CTA, the process orbit, FAQs, testimonials, the rotating word strip, and the About page. Click Save to publish changes."
      actions={
        <>
          {dirty && (
            <button className="adm-btn" onClick={discard} disabled={saving}>
              Discard
            </button>
          )}
          <Button
            onClick={save}
            disabled={!dirty || saving}
          >
            {saving ? 'Saving…' : dirty ? 'Save changes' : 'Saved'}
          </Button>
          <button
            className="adm-btn"
            onClick={() => {
              if (window.confirm('Reset site content to defaults?')) {
                contentStore.reset().catch((err) =>
                  setToast(err instanceof Error ? err.message : 'Reset failed.'),
                );
              }
            }}
          >
            Reset
          </button>
        </>
      }
    >
      <div className="adm-tabs">
        {tabs.map((t) => (
          <button
            key={t.id}
            className={`adm-tab${tab === t.id ? ' is-active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'hero' && (
        <div className="adm-card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <TextField
            label="Headline"
            value={draft.hero.headline}
            onChange={(v) => updateHero({ headline: v })}
          />
          <TextField
            label="Accent phrase (gradient, italic)"
            hint="Appended after the headline in the brand gradient. Leave empty to omit."
            value={draft.hero.headlineAccent ?? ''}
            onChange={(v) => updateHero({ headlineAccent: v })}
          />
          <TextArea
            label="Sub-copy"
            value={draft.hero.sub}
            onChange={(v) => updateHero({ sub: v })}
            rows={3}
          />
          <Field label="Primary button">
            <div className="adm-row adm-row--2">
              <input
                className="adm-input"
                value={draft.hero.primaryCta}
                placeholder="Label"
                onChange={(e) => updateHero({ primaryCta: e.target.value })}
              />
              <input
                className="adm-input"
                value={draft.hero.primaryCtaHref ?? ''}
                placeholder="Link (/contact, #services, https://…)"
                onChange={(e) => updateHero({ primaryCtaHref: e.target.value })}
              />
            </div>
          </Field>
          <TextField
            label="Rating text"
            hint="Shown next to the avatar stack, e.g. “Trusted by 1000+ clients”. Leave empty to hide the rating block."
            value={draft.hero.ratingText ?? ''}
            onChange={(v) => updateHero({ ratingText: v })}
          />

          <Field
            label="Avatar images"
            hint="Small circular headshots shown as social proof next to the star rating."
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {(draft.hero.avatars ?? []).map((src, i) => (
                <div
                  key={i}
                  style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 8, alignItems: 'start' }}
                >
                  <ImageField
                    label=""
                    hint=""
                    showPreview={false}
                    prefix="hero"
                    value={src}
                    onChange={(v) =>
                      updateHero({
                        avatars: (draft.hero.avatars ?? []).map((x, idx) => (idx === i ? v : x)),
                      })
                    }
                  />
                  <button
                    className="adm-btn adm-btn--sm adm-btn--danger"
                    onClick={() =>
                      updateHero({
                        avatars: (draft.hero.avatars ?? []).filter((_, idx) => idx !== i),
                      })
                    }
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                className="adm-btn adm-btn--sm"
                style={{ alignSelf: 'flex-start' }}
                onClick={() => updateHero({ avatars: [...(draft.hero.avatars ?? []), ''] })}
              >
                + Add avatar
              </button>
            </div>
          </Field>

          <Field
            label="Brand logos"
            hint="Scrolling logo strip shown below the hero. Add a name and a logo image for each."
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {(draft.hero.brands ?? []).map((b, i) => (
                <div
                  key={b.id}
                  style={{ display: 'grid', gridTemplateColumns: '1fr 2fr auto', gap: 8, alignItems: 'start' }}
                >
                  <input
                    className="adm-input"
                    value={b.name}
                    placeholder="Name"
                    onChange={(e) =>
                      updateHero({
                        brands: (draft.hero.brands ?? []).map((x, idx) =>
                          idx === i ? { ...x, name: e.target.value } : x,
                        ),
                      })
                    }
                  />
                  <ImageField
                    label=""
                    hint=""
                    showPreview={false}
                    prefix="brands"
                    value={b.image}
                    onChange={(v) =>
                      updateHero({
                        brands: (draft.hero.brands ?? []).map((x, idx) =>
                          idx === i ? { ...x, image: v } : x,
                        ),
                      })
                    }
                  />
                  <button
                    className="adm-btn adm-btn--sm adm-btn--danger"
                    onClick={() =>
                      updateHero({
                        brands: (draft.hero.brands ?? []).filter((_, idx) => idx !== i),
                      })
                    }
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                className="adm-btn adm-btn--sm"
                style={{ alignSelf: 'flex-start' }}
                onClick={() =>
                  updateHero({
                    brands: [...(draft.hero.brands ?? []), { id: uid('b'), name: '', image: '' }],
                  })
                }
              >
                + Add brand
              </button>
            </div>
          </Field>
        </div>
      )}

      {tab === 'cta' && (
        <div className="adm-card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <TextField
            label="Eyebrow"
            value={draft.cta.eyebrow}
            onChange={(v) => updateCta({ eyebrow: v })}
          />
          <div className="adm-row adm-row--2">
            <TextField
              label="Title"
              value={draft.cta.title}
              onChange={(v) => updateCta({ title: v })}
            />
            <TextField
              label="Accent (gradient) title"
              value={draft.cta.accentTitle}
              onChange={(v) => updateCta({ accentTitle: v })}
            />
          </div>
          <TextArea
            label="Sub-copy"
            value={draft.cta.sub}
            onChange={(v) => updateCta({ sub: v })}
            rows={3}
          />
          <Field label="Primary button">
            <div className="adm-row adm-row--2">
              <input
                className="adm-input"
                value={draft.cta.primary}
                placeholder="Label"
                onChange={(e) => updateCta({ primary: e.target.value })}
              />
              <input
                className="adm-input"
                value={draft.cta.primaryHref ?? ''}
                placeholder="Link (#contact, https://cal.com/…)"
                onChange={(e) => updateCta({ primaryHref: e.target.value })}
              />
            </div>
          </Field>
          <Field label="Secondary button">
            <div className="adm-row adm-row--2">
              <input
                className="adm-input"
                value={draft.cta.secondary}
                placeholder="Label"
                onChange={(e) => updateCta({ secondary: e.target.value })}
              />
              <input
                className="adm-input"
                value={draft.cta.secondaryHref ?? ''}
                placeholder="Link (mailto:hi@…, https://…)"
                onChange={(e) => updateCta({ secondaryHref: e.target.value })}
              />
            </div>
          </Field>
        </div>
      )}

      {tab === 'process' && (
        <ProcessEditor
          process={process}
          onChange={(p) => update({ process: p })}
        />
      )}

      {tab === 'faq' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {draft.faqs.map((f, i) => (
            <div
              key={f.id}
              className="adm-card"
              style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="adm-label">FAQ {i + 1}</div>
                <button
                  className="adm-btn adm-btn--sm adm-btn--danger"
                  onClick={() =>
                    update({ faqs: draft.faqs.filter((_, idx) => idx !== i) })
                  }
                >
                  Remove
                </button>
              </div>
              <TextField
                label="Question"
                value={f.q}
                onChange={(v) => {
                  const faqs = draft.faqs.map((x, idx) =>
                    idx === i ? { ...x, q: v } : x,
                  );
                  update({ faqs });
                }}
              />
              <TextArea
                label="Answer"
                value={f.a}
                rows={3}
                onChange={(v) => {
                  const faqs = draft.faqs.map((x, idx) =>
                    idx === i ? { ...x, a: v } : x,
                  );
                  update({ faqs });
                }}
              />
            </div>
          ))}
          <button
            className="adm-btn"
            style={{ alignSelf: 'flex-start' }}
            onClick={() =>
              update({ faqs: [...draft.faqs, { id: uid('f'), q: '', a: '' }] })
            }
          >
            + Add FAQ
          </button>
        </div>
      )}

      {tab === 'testimonials' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 14 }}>
          {draft.testimonials.map((t, i) => (
            <div
              key={t.id}
              className="adm-card"
              style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="adm-label">Testimonial {i + 1}</div>
                <button
                  className="adm-btn adm-btn--sm adm-btn--danger"
                  onClick={() =>
                    update({
                      testimonials: draft.testimonials.filter((_, idx) => idx !== i),
                    })
                  }
                >
                  ✕
                </button>
              </div>
              <TextArea
                label="Quote"
                value={t.quote}
                rows={4}
                onChange={(v) => {
                  const testimonials = draft.testimonials.map((x, idx) =>
                    idx === i ? { ...x, quote: v } : x,
                  );
                  update({ testimonials });
                }}
              />
              <div className="adm-row adm-row--2">
                <TextField
                  label="Name"
                  value={t.name}
                  onChange={(v) => {
                    const testimonials = draft.testimonials.map((x, idx) =>
                      idx === i ? { ...x, name: v } : x,
                    );
                    update({ testimonials });
                  }}
                />
                <TextField
                  label="Role"
                  value={t.role}
                  onChange={(v) => {
                    const testimonials = draft.testimonials.map((x, idx) =>
                      idx === i ? { ...x, role: v } : x,
                    );
                    update({ testimonials });
                  }}
                />
              </div>
              <ColorField
                label="Tone"
                value={t.tone}
                onChange={(v) => {
                  const testimonials = draft.testimonials.map((x, idx) =>
                    idx === i ? { ...x, tone: v } : x,
                  );
                  update({ testimonials });
                }}
              />
              <ImageField
                label="Avatar image"
                hint="Upload a headshot or pick one from the media library."
                value={t.image ?? ''}
                onChange={(v) => {
                  const testimonials = draft.testimonials.map((x, idx) =>
                    idx === i ? { ...x, image: v || undefined } : x,
                  );
                  update({ testimonials });
                }}
                prefix="testimonials"
              />
            </div>
          ))}
          <button
            className="adm-btn"
            style={{ alignSelf: 'flex-start' }}
            onClick={() =>
              update({
                testimonials: [
                  ...draft.testimonials,
                  { id: uid('q'), quote: '', name: '', role: '', tone: '#e06820', image: undefined },
                ],
              })
            }
          >
            + Add testimonial
          </button>
        </div>
      )}

      {tab === 'marquee' && (
        <div className="adm-card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="adm-label">Marquee labels</div>
          <p className="adm-help" style={{ marginTop: -4 }}>
            Shown on the strip below the hero. Treat as ALL CAPS / lowercase styled tokens — text is rendered as-is.
          </p>
          <StringList
            label=""
            values={draft.marquee.map((m) => m.label)}
            onChange={(values) =>
              update({
                marquee: values.map((label, idx) => ({
                  id: draft.marquee[idx]?.id ?? uid('m'),
                  label,
                })),
              })
            }
            placeholder="e.g. NORTHWIND"
          />
        </div>
      )}

      {tab === 'about' && (
        <AboutEditor
          about={about}
          onValues={(values: AboutValue[]) => updateAbout({ values })}
          onRoles={(roles: AboutRole[]) => updateAbout({ roles })}
          onTimeline={(timeline: AboutMilestone[]) => updateAbout({ timeline })}
        />
      )}

      <Toast message={toast} onClear={() => setToast(null)} />
    </AdminShell>
  );
}

function ProcessEditor({
  process,
  onChange,
}: {
  process: ProcessContent;
  onChange: (p: ProcessContent) => void;
}) {
  const setSteps = (steps: ProcessStep[]) => onChange({ ...process, steps });
  const patchStep = (i: number, delta: Partial<ProcessStep>) =>
    setSteps(process.steps.map((x, idx) => (idx === i ? { ...x, ...delta } : x)));
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= process.steps.length) return;
    const steps = process.steps.slice();
    [steps[i], steps[j]] = [steps[j], steps[i]];
    setSteps(steps);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div className="adm-card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="adm-label">Section header</div>
        <TextField
          label="Eyebrow"
          value={process.eyebrow}
          onChange={(v) => onChange({ ...process, eyebrow: v })}
        />
        <div className="adm-row adm-row--2">
          <TextField
            label="Title"
            value={process.title}
            onChange={(v) => onChange({ ...process, title: v })}
          />
          <TextField
            label="Title second line (dimmed)"
            value={process.titleAccent}
            onChange={(v) => onChange({ ...process, titleAccent: v })}
          />
        </div>
        <TextArea
          label="Sub-copy"
          value={process.sub}
          rows={2}
          onChange={(v) => onChange({ ...process, sub: v })}
        />
      </div>

      <div className="adm-card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="adm-label">Phases (orbit order)</div>
          <button
            className="adm-btn adm-btn--sm"
            onClick={() =>
              setSteps([
                ...process.steps,
                { id: uid('p'), icon: 'Compass', title: '', timeline: '', blurb: '', deliverables: [] },
              ])
            }
          >
            + Add phase
          </button>
        </div>
        {process.steps.map((s, i) => (
          <div
            key={s.id}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              padding: 12,
              border: '1px solid var(--line)',
              borderRadius: 12,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="adm-label">Phase {i + 1}</div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  className="adm-btn adm-btn--sm"
                  disabled={i === 0}
                  title="Move earlier in the orbit"
                  onClick={() => move(i, -1)}
                >
                  ↑
                </button>
                <button
                  className="adm-btn adm-btn--sm"
                  disabled={i === process.steps.length - 1}
                  title="Move later in the orbit"
                  onClick={() => move(i, 1)}
                >
                  ↓
                </button>
                <button
                  className="adm-btn adm-btn--sm adm-btn--danger"
                  onClick={() => setSteps(process.steps.filter((_, idx) => idx !== i))}
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="adm-row adm-row--2">
              <Select
                label="Icon"
                value={s.icon}
                options={ICON_OPTIONS}
                onChange={(v) => patchStep(i, { icon: v })}
              />
              <TextField
                label="Timeline"
                value={s.timeline}
                onChange={(v) => patchStep(i, { timeline: v })}
              />
            </div>
            <TextField
              label="Title"
              value={s.title}
              onChange={(v) => patchStep(i, { title: v })}
            />
            <TextArea
              label="Blurb"
              value={s.blurb}
              rows={2}
              onChange={(v) => patchStep(i, { blurb: v })}
            />
            <StringList
              label="Deliverables"
              values={s.deliverables}
              onChange={(deliverables) => patchStep(i, { deliverables })}
              placeholder="e.g. Project plan"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function AboutEditor({
  about,
  onValues,
  onRoles,
  onTimeline,
}: {
  about: AboutContent;
  onValues: (v: AboutValue[]) => void;
  onRoles: (r: AboutRole[]) => void;
  onTimeline: (t: AboutMilestone[]) => void;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div className="adm-card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="adm-label">Values (three cards)</div>
          <button
            className="adm-btn adm-btn--sm"
            onClick={() =>
              onValues([
                ...about.values,
                { id: uid('v'), icon: 'Layers', title: '', blurb: '', hue: '#ff813a' },
              ])
            }
          >
            + Add value
          </button>
        </div>
        {about.values.map((v, i) => (
          <div
            key={v.id}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              padding: 12,
              border: '1px solid var(--line)',
              borderRadius: 12,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="adm-label">Value {i + 1}</div>
              <button
                className="adm-btn adm-btn--sm adm-btn--danger"
                onClick={() => onValues(about.values.filter((_, idx) => idx !== i))}
              >
                ✕
              </button>
            </div>
            <div className="adm-row adm-row--2">
              <Select
                label="Icon"
                value={v.icon}
                options={ICON_OPTIONS}
                onChange={(val) =>
                  onValues(about.values.map((x, idx) => (idx === i ? { ...x, icon: val } : x)))
                }
              />
              <ColorField
                label="Hue"
                value={v.hue}
                onChange={(val) =>
                  onValues(about.values.map((x, idx) => (idx === i ? { ...x, hue: val } : x)))
                }
              />
            </div>
            <TextField
              label="Title"
              value={v.title}
              onChange={(val) =>
                onValues(about.values.map((x, idx) => (idx === i ? { ...x, title: val } : x)))
              }
            />
            <TextArea
              label="Blurb"
              value={v.blurb}
              rows={2}
              onChange={(val) =>
                onValues(about.values.map((x, idx) => (idx === i ? { ...x, blurb: val } : x)))
              }
            />
          </div>
        ))}
      </div>

      <div className="adm-card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="adm-label">Open roles</div>
          <button
            className="adm-btn adm-btn--sm"
            onClick={() =>
              onRoles([
                ...about.roles,
                { id: uid('r'), title: '', location: 'Remote', href: '' },
              ])
            }
          >
            + Add role
          </button>
        </div>
        {about.roles.map((r, i) => (
          <div
            key={r.id}
            className="adm-grid-row"
            style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr 2fr auto',
              gap: 10,
              alignItems: 'center',
            }}
          >
            <input
              className="adm-input"
              placeholder="Role title"
              value={r.title}
              onChange={(e) =>
                onRoles(about.roles.map((x, idx) => (idx === i ? { ...x, title: e.target.value } : x)))
              }
            />
            <input
              className="adm-input"
              placeholder="Location"
              value={r.location}
              onChange={(e) =>
                onRoles(
                  about.roles.map((x, idx) => (idx === i ? { ...x, location: e.target.value } : x)),
                )
              }
            />
            <input
              className="adm-input"
              placeholder="Link (mailto:, https://…) — optional"
              value={r.href}
              onChange={(e) =>
                onRoles(about.roles.map((x, idx) => (idx === i ? { ...x, href: e.target.value } : x)))
              }
            />
            <button
              className="adm-btn adm-btn--sm adm-btn--danger"
              onClick={() => onRoles(about.roles.filter((_, idx) => idx !== i))}
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <div className="adm-card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="adm-label">Timeline / milestones</div>
          <button
            className="adm-btn adm-btn--sm"
            onClick={() => onTimeline([...about.timeline, { id: uid('tl'), year: '', what: '' }])}
          >
            + Add milestone
          </button>
        </div>
        {about.timeline.map((m, i) => (
          <div
            key={m.id}
            style={{
              display: 'grid',
              gridTemplateColumns: '120px 1fr auto',
              gap: 10,
              alignItems: 'center',
            }}
          >
            <input
              className="adm-input"
              placeholder="Year"
              value={m.year}
              onChange={(e) =>
                onTimeline(
                  about.timeline.map((x, idx) => (idx === i ? { ...x, year: e.target.value } : x)),
                )
              }
            />
            <input
              className="adm-input"
              placeholder="What happened"
              value={m.what}
              onChange={(e) =>
                onTimeline(
                  about.timeline.map((x, idx) => (idx === i ? { ...x, what: e.target.value } : x)),
                )
              }
            />
            <button
              className="adm-btn adm-btn--sm adm-btn--danger"
              onClick={() => onTimeline(about.timeline.filter((_, idx) => idx !== i))}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

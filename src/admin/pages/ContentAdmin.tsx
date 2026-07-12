import { useState } from 'react';
import { AdminShell } from '@/admin/components/AdminShell';
import { useConfirm } from '@/admin/components/confirm-context';
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
  useBrand,
  useContent,
  type AboutContent,
  type AboutMilestone,
  type AboutRole,
  type AboutValue,
  type FooterColumn,
  type FooterContent,
  type FooterLink,
  type PricingPlan,
  type PricingService,
  type ProcessContent,
  type ProcessStep,
  type SectionIntro,
  type SiteContent,
} from '@/admin/store';
import { Button } from '@/admin/components/Button';
import { Dropdown, Toggle } from '@/components/ui/inputs';
import { Icon } from '@/components/icons/Icon';

type Tab =
  | 'hero'
  | 'cta'
  | 'process'
  | 'faq'
  | 'testimonials'
  | 'marquee'
  | 'pricing'
  | 'about'
  | 'footer';

const ICON_OPTIONS = Object.keys(Icon).map((k) => ({ value: k, label: k }));

const SOCIAL_PLATFORMS = [
  'twitter',
  'linkedin',
  'github',
  'dribbble',
  'youtube',
  'instagram',
  'facebook',
] as const;

const PLATFORM_ICON: Record<string, keyof typeof Icon> = {
  twitter: 'TwitterX',
  linkedin: 'LinkedIn',
  github: 'GitHub',
  dribbble: 'Dribbble',
  youtube: 'YouTube',
  instagram: 'Instagram',
  facebook: 'Facebook',
};

function socialIcon(platform: string) {
  const key = PLATFORM_ICON[platform];
  return key ? Icon[key]({ size: 16 }) : null;
}

function emptyFooterColumn(): FooterColumn {
  return { id: uid('fc'), title: '', links: [] };
}

function emptyFooterLink(): FooterLink {
  return { id: uid('fl'), label: '', href: '' };
}

function uid(prefix: string) {
  return prefix + Math.random().toString(36).slice(2, 9);
}

function emptyAbout(): AboutContent {
  return { values: [], roles: [], timeline: [] };
}

function emptyIntro(): SectionIntro {
  return { eyebrow: '', title: '', titleAccent: '', sub: '' };
}

export function ContentAdmin() {
  const [content] = useContent();
  const confirm = useConfirm();
  const [draft, setDraft] = useState<SiteContent>(content);
  const [tab, setTab] = useState<Tab>('hero');
  const [toast, setToast] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Re-seed the draft when the published content changes (save, reset,
  // cross-tab). Reconciled during render instead of in an effect to avoid a
  // cascading re-render. `content` is a stable reference from the store.
  const [syncedContent, setSyncedContent] = useState(content);
  if (syncedContent !== content) {
    setSyncedContent(content);
    setDraft(content);
  }

  // Defensive: older payloads may not have `about` / `process` yet.
  const about: AboutContent = draft.about ?? emptyAbout();
  const process: ProcessContent = draft.process ?? contentStore.getDefaults().process;
  const faqSection: SectionIntro =
    draft.faqSection ?? contentStore.getDefaults().faqSection ?? emptyIntro();
  const testimonialsSection: SectionIntro =
    draft.testimonialsSection ?? contentStore.getDefaults().testimonialsSection ?? emptyIntro();
  const pricing: PricingService[] =
    draft.pricing ?? contentStore.getDefaults().pricing ?? [];

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
  const updateFaqSection = (delta: Partial<SectionIntro>) => {
    setDraft((d) => ({ ...d, faqSection: { ...(d.faqSection ?? emptyIntro()), ...delta } }));
  };
  const updateTestimonialsSection = (delta: Partial<SectionIntro>) => {
    setDraft((d) => ({
      ...d,
      testimonialsSection: { ...(d.testimonialsSection ?? emptyIntro()), ...delta },
    }));
  };
  const updateFooter = (delta: Partial<FooterContent>) => {
    setDraft((d) => ({
      ...d,
      footer: { ...(d.footer ?? contentStore.getDefaults().footer!), ...delta },
    }));
  };

  const save = async () => {
    setSaving(true);
    try {
      // Make sure `about`, `process` and the section headers are always
      // populated when we persist.
      await contentStore.set({
        ...draft,
        about,
        process,
        faqSection: draft.faqSection ?? emptyIntro(),
        testimonialsSection: draft.testimonialsSection ?? emptyIntro(),
        footer: draft.footer ?? contentStore.getDefaults().footer,
        pricing,
      });
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
    { id: 'pricing', label: `Pricing (${pricing.length})` },
    { id: 'about', label: 'About page' },
    { id: 'footer', label: 'Footer' },
  ];

  return (
    <AdminShell
      crumbs={[{ label: 'Site content' }]}
      title="Site content"
      sub="Hero, CTA, the process orbit, FAQs, testimonials, the rotating word strip, the pricing page, and the About page. Click Save to publish changes."
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
            onClick={async () => {
              if (
                await confirm({
                  title: 'Reset site content?',
                  body: 'Restores the default site copy. Local edits will be lost.',
                  confirmLabel: 'Reset',
                  danger: true,
                })
              ) {
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
            label="Availability pill text"
            hint="The small pill above the headline, e.g. “Available for new projects”."
            value={draft.hero.badge ?? ''}
            onChange={(v) => updateHero({ badge: v })}
          />
          <TextField
            label="Headline"
            value={draft.hero.headline}
            onChange={(v) => updateHero({ headline: v })}
          />
          <Field
            label="Rotating words"
            hint="The gradient words that cycle beneath the headline."
          >
            <StringList
              label=""
              values={draft.hero.rotatingWords ?? []}
              onChange={(rotatingWords) => updateHero({ rotatingWords })}
              placeholder="e.g. Web Development"
            />
          </Field>
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
          <Field label="Secondary button">
            <div className="adm-row adm-row--2">
              <input
                className="adm-input"
                value={draft.hero.secondaryCta}
                placeholder="Label"
                onChange={(e) => updateHero({ secondaryCta: e.target.value })}
              />
              <input
                className="adm-input"
                value={draft.hero.secondaryCtaHref ?? ''}
                placeholder="Link (#services, /work, https://…)"
                onChange={(e) => updateHero({ secondaryCtaHref: e.target.value })}
              />
            </div>
          </Field>

          <Field
            label="Stats"
            hint="The four-up numbers strip below the buttons. Each has a value and a label."
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {(draft.hero.stats ?? []).map((s, i) => (
                <div
                  key={s.id}
                  style={{ display: 'grid', gridTemplateColumns: '1fr 2fr auto', gap: 8, alignItems: 'start' }}
                >
                  <input
                    className="adm-input"
                    value={s.num}
                    placeholder="Value (e.g. 20+)"
                    onChange={(e) =>
                      updateHero({
                        stats: (draft.hero.stats ?? []).map((x, idx) =>
                          idx === i ? { ...x, num: e.target.value } : x,
                        ),
                      })
                    }
                  />
                  <input
                    className="adm-input"
                    value={s.label}
                    placeholder="Label (e.g. Projects shipped)"
                    onChange={(e) =>
                      updateHero({
                        stats: (draft.hero.stats ?? []).map((x, idx) =>
                          idx === i ? { ...x, label: e.target.value } : x,
                        ),
                      })
                    }
                  />
                  <button
                    className="adm-btn adm-btn--sm adm-btn--danger"
                    onClick={() =>
                      updateHero({
                        stats: (draft.hero.stats ?? []).filter((_, idx) => idx !== i),
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
                    stats: [...(draft.hero.stats ?? []), { id: uid('s'), num: '', label: '' }],
                  })
                }
              >
                + Add stat
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
          <SectionIntroEditor intro={faqSection} onChange={updateFaqSection} />
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <SectionIntroEditor
            intro={testimonialsSection}
            onChange={updateTestimonialsSection}
          />
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

      {tab === 'pricing' && (
        <PricingEditor
          services={pricing}
          onChange={(next) => update({ pricing: next })}
        />
      )}

      {tab === 'footer' && (
        <FooterEditor
          footer={draft.footer ?? contentStore.getDefaults().footer!}
          onChange={updateFooter}
        />
      )}

      <Toast message={toast} onClear={() => setToast(null)} />
    </AdminShell>
  );
}

function SectionIntroEditor({
  intro,
  onChange,
}: {
  intro: SectionIntro;
  onChange: (delta: Partial<SectionIntro>) => void;
}) {
  return (
    <div className="adm-card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="adm-label">Section header</div>
      <TextField
        label="Eyebrow"
        value={intro.eyebrow}
        onChange={(v) => onChange({ eyebrow: v })}
      />
      <div className="adm-row adm-row--2">
        <TextField
          label="Title"
          value={intro.title}
          onChange={(v) => onChange({ title: v })}
        />
        <TextField
          label="Title second line (dimmed)"
          value={intro.titleAccent}
          onChange={(v) => onChange({ titleAccent: v })}
        />
      </div>
      <TextArea
        label="Sub-copy"
        value={intro.sub}
        rows={2}
        onChange={(v) => onChange({ sub: v })}
      />
    </div>
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

function FooterEditor({
  footer,
  onChange,
}: {
  footer: FooterContent;
  onChange: (delta: Partial<FooterContent>) => void;
}) {
  const [brand, setBrand] = useBrand();
  const socials = brand.socials ?? [];

  const updateSocials = (socials: typeof brand.socials) => {
    setBrand({ ...brand, socials });
  };

  const setColumns = (columns: FooterColumn[]) => onChange({ columns });
  const setLinks = (colIdx: number, links: FooterLink[]) =>
    setColumns(
      footer.columns.map((c, i) => (i === colIdx ? { ...c, links } : c)),
    );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div className="adm-card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="adm-label">General</div>
        <TextArea
          label="Tagline"
          value={footer.tagline}
          rows={2}
          onChange={(v) => onChange({ tagline: v })}
        />
        <TextField
          label="Copyright"
          value={footer.copyright}
          onChange={(v) => onChange({ copyright: v })}
        />
        <TextField
          label="Strapline"
          value={footer.strapline}
          onChange={(v) => onChange({ strapline: v })}
        />
      </div>

      <div className="adm-card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="adm-label">Columns</div>
          <button
            className="adm-btn adm-btn--sm"
            onClick={() => setColumns([...footer.columns, emptyFooterColumn()])}
          >
            + Add column
          </button>
        </div>
        {footer.columns.map((col, ci) => (
          <div
            key={col.id}
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
              <div className="adm-label">Column {ci + 1}</div>
              <button
                className="adm-btn adm-btn--sm adm-btn--danger"
                onClick={() => setColumns(footer.columns.filter((_, i) => i !== ci))}
              >
                ✕
              </button>
            </div>
            <TextField
              label="Title"
              value={col.title}
              onChange={(v) =>
                setColumns(
                  footer.columns.map((c, i) => (i === ci ? { ...c, title: v } : c)),
                )
              }
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div className="adm-label" style={{ fontSize: 12 }}>Links</div>
                <button
                  className="adm-btn adm-btn--sm"
                  onClick={() =>
                    setLinks(ci, [...col.links, emptyFooterLink()])
                  }
                >
                  + Add link
                </button>
              </div>
              {col.links.map((link, li) => (
                <div
                  key={link.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr auto',
                    gap: 8,
                    alignItems: 'center',
                  }}
                >
                  <input
                    className="adm-input"
                    placeholder="Label"
                    value={link.label}
                    onChange={(e) =>
                      setLinks(
                        ci,
                        col.links.map((x, idx) =>
                          idx === li ? { ...x, label: e.target.value } : x,
                        ),
                      )
                    }
                  />
                  <input
                    className="adm-input"
                    placeholder="/path or https://…"
                    value={link.href}
                    onChange={(e) =>
                      setLinks(
                        ci,
                        col.links.map((x, idx) =>
                          idx === li ? { ...x, href: e.target.value } : x,
                        ),
                      )
                    }
                  />
                  <button
                    className="adm-btn adm-btn--sm adm-btn--danger"
                    onClick={() =>
                      setLinks(ci, col.links.filter((_, i) => i !== li))
                    }
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="adm-card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="adm-label">Legal links (bottom bar)</div>
          <button
            className="adm-btn adm-btn--sm"
            onClick={() =>
              onChange({ legalLinks: [...footer.legalLinks, emptyFooterLink()] })
            }
          >
            + Add legal link
          </button>
        </div>
        {footer.legalLinks.map((link, i) => (
          <div
            key={link.id}
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr auto',
              gap: 8,
              alignItems: 'center',
            }}
          >
            <input
              className="adm-input"
              placeholder="Label"
              value={link.label}
              onChange={(e) =>
                onChange({
                  legalLinks: footer.legalLinks.map((x, idx) =>
                    idx === i ? { ...x, label: e.target.value } : x,
                  ),
                })
              }
            />
            <input
              className="adm-input"
              placeholder="/path or https://…"
              value={link.href}
              onChange={(e) =>
                onChange({
                  legalLinks: footer.legalLinks.map((x, idx) =>
                    idx === i ? { ...x, href: e.target.value } : x,
                  ),
                })
              }
            />
            <button
              className="adm-btn adm-btn--sm adm-btn--danger"
              onClick={() =>
                onChange({
                  legalLinks: footer.legalLinks.filter((_, idx) => idx !== i),
                })
              }
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <div className="adm-card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="adm-label">Social links</div>
          <button
            className="adm-btn adm-btn--sm"
            onClick={() =>
              updateSocials([...socials, { platform: 'twitter', url: '' }])
            }
          >
            + Add social
          </button>
        </div>
        {socials.map((s, i) => (
          <div
            key={i}
            style={{
              display: 'grid',
              gridTemplateColumns: '36px 1fr 1.5fr auto',
              gap: 10,
              alignItems: 'center',
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                border: '1px solid var(--line)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--fg-dim)',
              }}
            >
              {socialIcon(s.platform) ?? (
                <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)' }}>{s.platform.slice(0, 2)}</span>
              )}
            </div>
            <Dropdown
              value={s.platform}
              options={SOCIAL_PLATFORMS.map((p) => ({
                value: p,
                label: p.charAt(0).toUpperCase() + p.slice(1),
                icon: socialIcon(p),
              }))}
              onChange={(v) =>
                updateSocials(
                  socials.map((x, idx) =>
                    idx === i ? { ...x, platform: v } : x,
                  ),
                )
              }
            />
            <input
              className="adm-input"
              placeholder="https://…"
              value={s.url}
              onChange={(e) =>
                updateSocials(
                  socials.map((x, idx) =>
                    idx === i ? { ...x, url: e.target.value } : x,
                  ),
                )
              }
            />
            <button
              className="adm-btn adm-btn--sm adm-btn--danger"
              onClick={() =>
                updateSocials(socials.filter((_, idx) => idx !== i))
              }
            >
              ✕
            </button>
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

function emptyPricingPlan(): PricingPlan {
  return {
    id: uid('pp'),
    name: '',
    info: '',
    price: '',
    timeline: '',
    features: [],
    cta: 'Start this project',
  };
}

function emptyPricingService(): PricingService {
  return {
    slug: uid('ps'),
    label: 'New service',
    hue: '#ff813a',
    plans: [emptyPricingPlan(), emptyPricingPlan(), emptyPricingPlan()],
  };
}

function PricingEditor({
  services,
  onChange,
}: {
  services: PricingService[];
  onChange: (next: PricingService[]) => void;
}) {
  const confirm = useConfirm();
  const [selected, setSelected] = useState(0);
  const sel = Math.min(selected, Math.max(services.length - 1, 0));
  const svc = services[sel];

  const patchService = (i: number, delta: Partial<PricingService>) =>
    onChange(services.map((x, idx) => (idx === i ? { ...x, ...delta } : x)));
  const patchPlan = (pi: number, delta: Partial<PricingPlan>) =>
    patchService(sel, {
      plans: svc.plans.map((p, idx) => (idx === pi ? { ...p, ...delta } : p)),
    });
  const moveService = (dir: -1 | 1) => {
    const j = sel + dir;
    if (j < 0 || j >= services.length) return;
    const next = services.slice();
    [next[sel], next[j]] = [next[j], next[sel]];
    onChange(next);
    setSelected(j);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div className="adm-tabs">
        {services.map((s, i) => (
          <button
            key={s.slug}
            className={`adm-tab${sel === i ? ' is-active' : ''}`}
            onClick={() => setSelected(i)}
          >
            {s.label || 'Untitled'}
          </button>
        ))}
        <button
          className="adm-btn adm-btn--sm"
          onClick={() => {
            onChange([...services, emptyPricingService()]);
            setSelected(services.length);
          }}
        >
          + Add service tab
        </button>
      </div>

      {svc && (
        <>
          <div className="adm-card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="adm-label">Service tab</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="adm-btn adm-btn--sm" onClick={() => moveService(-1)} disabled={sel === 0}>
                  ← Move
                </button>
                <button
                  className="adm-btn adm-btn--sm"
                  onClick={() => moveService(1)}
                  disabled={sel === services.length - 1}
                >
                  Move →
                </button>
                <button
                  className="adm-btn adm-btn--sm adm-btn--danger"
                  onClick={async () => {
                    if (
                      !(await confirm({
                        title: `Remove the "${svc.label}" tab?`,
                        body: 'This removes the pricing tab and all of its plans.',
                        confirmLabel: 'Remove tab',
                        danger: true,
                      }))
                    )
                      return;
                    onChange(services.filter((_, idx) => idx !== sel));
                    setSelected(Math.max(sel - 1, 0));
                  }}
                >
                  Remove tab
                </button>
              </div>
            </div>
            <div className="adm-row adm-row--2">
              <TextField
                label="Tab label"
                value={svc.label}
                onChange={(v) => patchService(sel, { label: v })}
              />
              <ColorField
                label="Accent color"
                hint="Tints the tab pill, prices, and check marks for this service."
                value={svc.hue}
                onChange={(v) => patchService(sel, { hue: v })}
              />
            </div>
          </div>

          {svc.plans.map((p, pi) => (
            <div key={p.id} className="adm-card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="adm-label">Card {pi + 1}</div>
                <button
                  className="adm-btn adm-btn--sm adm-btn--danger"
                  onClick={() =>
                    patchService(sel, { plans: svc.plans.filter((_, idx) => idx !== pi) })
                  }
                >
                  Remove
                </button>
              </div>
              <div className="adm-row adm-row--3">
                <TextField label="Name" value={p.name} onChange={(v) => patchPlan(pi, { name: v })} />
                <TextField
                  label="Price"
                  hint="Free-form, e.g. $8k, from $24k, Custom."
                  value={p.price}
                  onChange={(v) => patchPlan(pi, { price: v })}
                />
                <TextField
                  label="Timeline"
                  hint="Shown after “One-time ·”."
                  value={p.timeline}
                  onChange={(v) => patchPlan(pi, { timeline: v })}
                />
              </div>
              <TextArea
                label="Info line"
                value={p.info}
                onChange={(v) => patchPlan(pi, { info: v })}
                rows={2}
              />
              <StringList
                label="Features"
                values={p.features}
                onChange={(v) => patchPlan(pi, { features: v })}
                placeholder="e.g. Up to 6 pages"
              />
              <div className="adm-row adm-row--2">
                <TextField
                  label="Button label"
                  value={p.cta}
                  onChange={(v) => patchPlan(pi, { cta: v })}
                />
                <Field label="Popular?">
                  <Toggle
                    checked={!!p.highlighted}
                    onChange={(v) => patchPlan(pi, { highlighted: v })}
                    label="Badge + glow — mark one card per tab"
                  />
                </Field>
              </div>
            </div>
          ))}
          <button
            className="adm-btn"
            style={{ alignSelf: 'flex-start' }}
            onClick={() => patchService(sel, { plans: [...svc.plans, emptyPricingPlan()] })}
          >
            + Add card
          </button>
        </>
      )}
    </div>
  );
}

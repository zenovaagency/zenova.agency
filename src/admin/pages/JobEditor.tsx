import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/admin/components/Button';
import { AdminShell } from '@/admin/components/AdminShell';
import {
  ColorField,
  ComboField,
  DateField,
  SlugField,
  StringList,
  TextArea,
  TextField,
  Toast,
} from '@/admin/components/Form';
import { isValidHex, isValidSlug } from '@/admin/lib/validate';
import { jobsStore, patchJob, useJobs } from '@/admin/store';
import type { JobDetail } from '@/data/jobs';
import { emptyJob } from './JobsAdmin';

type Tab = 'basics' | 'description' | 'lists';

export function JobEditor() {
  const { slug = '' } = useParams();
  const nav = useNavigate();
  const [jobs] = useJobs();
  const isNew = slug === 'new';
  const existing = useMemo(
    () => (isNew ? emptyJob() : jobs.find((j) => j.slug === slug)),
    [slug, jobs, isNew]
  );

  const [draft, setDraft] = useState<JobDetail | null>(existing ?? null);
  const [tab, setTab] = useState<Tab>('basics');
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (existing) setDraft(existing);
  }, [existing]);

  const departmentSuggestions = useMemo(
    () => ['Design', 'Engineering', 'Growth', 'Operations', ...jobs.map((j) => j.department)],
    [jobs]
  );
  const locationSuggestions = useMemo(
    () => ['Remote', 'Hybrid', ...jobs.map((j) => j.location)],
    [jobs]
  );
  const typeSuggestions = useMemo(
    () => ['Full-time', 'Part-time', 'Contract', 'Internship', ...jobs.map((j) => j.type)],
    [jobs]
  );

  if (!draft) {
    return (
      <AdminShell title="Opening not found" crumbs={[{ label: 'Careers', to: '/admin/jobs' }, { label: '404' }]}>
        <p style={{ color: 'var(--fg-dim)' }}>That slug does not exist.</p>
      </AdminShell>
    );
  }

  const update = <K extends keyof JobDetail>(key: K, value: JobDetail[K]) => {
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
      if (jobs.some((j) => j.slug === draft.slug)) {
        setToast(`Slug "${draft.slug}" already exists — pick another.`);
        return;
      }
      try {
        await jobsStore.set([...jobs, draft]);
        setToast('Opening created');
        nav(`/admin/jobs/${draft.slug}`, { replace: true });
      } catch (err) {
        setToast(err instanceof Error ? err.message : 'Save failed.');
      }
    } else {
      try {
        await patchJob(slug, draft);
        setToast('Saved');
        if (draft.slug !== slug) nav(`/admin/jobs/${draft.slug}`, { replace: true });
      } catch (err) {
        setToast(err instanceof Error ? err.message : 'Save failed.');
      }
    }
  };

  const TABS: Array<{ id: Tab; label: string }> = [
    { id: 'basics', label: 'Basics' },
    { id: 'description', label: `Description (${draft.description.length})` },
    { id: 'lists', label: `Responsibilities & requirements` },
  ];

  return (
    <AdminShell
      crumbs={[
        { label: 'Careers', to: '/admin/jobs' },
        { label: isNew ? 'New' : draft.title },
      ]}
      title={isNew ? 'New opening' : draft.title}
      sub={`${draft.department} · ${draft.location}`}
      actions={
        <>
          {!isNew && (
            <a
              href={`/careers/${draft.slug}`}
              target="_blank"
              rel="noreferrer"
              className="adm-btn"
            >
              ↗ Preview
            </a>
          )}
          <button onClick={() => nav('/admin/jobs')} className="adm-btn">
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
            <SlugField label="Slug" value={draft.slug} onChange={(v) => update('slug', v)} hint="Becomes /careers/<slug>." />
            <TextField label="Title" value={draft.title} onChange={(v) => update('title', v)} placeholder="Senior Product Designer" />
          </div>
          <div className="adm-row adm-row--3">
            <ComboField label="Department" value={draft.department} suggestions={departmentSuggestions} onChange={(v) => update('department', v)} placeholder="Design" />
            <ComboField label="Location" value={draft.location} suggestions={locationSuggestions} onChange={(v) => update('location', v)} placeholder="Remote" />
            <ComboField label="Employment type" value={draft.type} suggestions={typeSuggestions} onChange={(v) => update('type', v)} placeholder="Full-time" />
          </div>
          <TextArea label="Summary" hint="Shown on the /careers card." value={draft.summary} onChange={(v) => update('summary', v)} rows={2} />
          <div className="adm-row adm-row--2">
            <DateField label="Posted on" value={draft.postedAt} onChange={(v) => update('postedAt', v)} hint="Used to sort newest-first." />
            <ColorField label="Accent tone" value={draft.tone} onChange={(v) => update('tone', v)} />
          </div>
          <TextField
            label="Apply URL"
            value={draft.applyUrl}
            onChange={(v) => update('applyUrl', v)}
            placeholder="https://forms.gle/…"
            hint="External application link. Leave empty to fall back to the careers email."
          />
        </div>
      )}

      {tab === 'description' && (
        <div className="adm-card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <StringList
            label="Description paragraphs"
            hint="One entry per paragraph. Shown at the top of the job detail page."
            values={draft.description}
            onChange={(v) => update('description', v)}
            placeholder="Describe the role…"
          />
        </div>
      )}

      {tab === 'lists' && (
        <div className="adm-card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <StringList
            label="Responsibilities"
            values={draft.responsibilities}
            onChange={(v) => update('responsibilities', v)}
            placeholder="e.g. Lead design for client projects"
          />
          <StringList
            label="Requirements"
            values={draft.requirements}
            onChange={(v) => update('requirements', v)}
            placeholder="e.g. 5+ years of experience"
          />
        </div>
      )}

      <Toast message={toast} onClear={() => setToast(null)} />
    </AdminShell>
  );
}

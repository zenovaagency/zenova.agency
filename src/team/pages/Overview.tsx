import { useEffect, useMemo, useState } from 'react';
import { TeamShell } from '@/team/components/TeamShell';
import { DateField, Field, Select, TextField, Toast } from '@/admin/components/Form';
import { Dropdown } from '@/components/ui/inputs';
import { useTeamSession } from '@/team/store';
import {
  fetchProjectSnapshot,
  resetProject,
  setProject,
  useProjectSnapshot,
  type ProjectActivity,
  type ProjectSnapshot,
} from '@/lib/projectData';

type Status = ProjectSnapshot['status'];
type ActivityKind = ProjectActivity['kind'];

const STATUS_OPTIONS: Array<{ value: Status; label: string }> = [
  { value: 'active', label: 'Active — work in progress' },
  { value: 'paused', label: 'Paused — temporarily on hold' },
  { value: 'wrapped', label: 'Wrapped — delivered' },
];

const KIND_OPTIONS: Array<{ value: ActivityKind; label: string }> = [
  { value: 'design', label: 'Design' },
  { value: 'build', label: 'Build' },
  { value: 'copy', label: 'Copy' },
  { value: 'growth', label: 'Growth' },
  { value: 'other', label: 'Other update' },
];

const FALLBACK_TONE = '#e06820';

function uidActivity() {
  return 'a' + Math.random().toString(36).slice(2, 9);
}

function initialOf(name: string): string {
  const clean = name.trim();
  if (!clean) return '?';
  return clean[0].toUpperCase();
}

function formatRelative(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const diff = Date.now() - then;
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function TeamOverview() {
  const snap = useProjectSnapshot();
  const sessionUser = useTeamSession();
  const [draft, setDraft] = useState<ProjectSnapshot>(snap);
  const [toast, setToast] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Pull the latest snapshot from the server on mount; subsequent updates
  // arrive via the shared store.
  useEffect(() => {
    fetchProjectSnapshot().catch((err) => {
      setToast(err instanceof Error ? err.message : 'Could not load project.');
    });
  }, []);

  // Keep the draft in sync if the underlying snapshot changes (e.g. cross-tab).
  useEffect(() => {
    setDraft(snap);
  }, [snap]);

  const dirty = JSON.stringify(draft) !== JSON.stringify(snap);

  const update = <K extends keyof ProjectSnapshot>(key: K, value: ProjectSnapshot[K]) => {
    setDraft((d) => ({ ...d, [key]: value }));
  };

  const phaseOptions = draft.phases.map((p) => ({
    value: p.id,
    label: `${p.n} · ${p.title}`,
  }));

  const save = async () => {
    setSaving(true);
    try {
      // Auto-sync derived state: the "Phase" stat tile follows the current phase.
      const current = draft.phases.find((p) => p.id === draft.currentPhaseId);
      const stats = draft.stats.map((s) =>
        s.label.toLowerCase() === 'phase' && current
          ? { ...s, value: current.title }
          : s,
      );

      await setProject({ ...draft, stats });
      setToast('Saved — client dashboard updated.');
    } catch (err) {
      setToast(err instanceof Error ? err.message : 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  const discard = () => setDraft(snap);

  const handleReset = async () => {
    if (!window.confirm('Reset project to demo defaults? This wipes any local edits.')) return;
    try {
      await resetProject();
      setToast('Project reset to defaults.');
    } catch (err) {
      setToast(err instanceof Error ? err.message : 'Reset failed.');
    }
  };

  return (
    <TeamShell
      title="Project status"
      sub="Update the headline fields the client sees on their dashboard. Save publishes the change."
      actions={
        <>
          {dirty && (
            <button className="adm-btn" onClick={discard} disabled={saving}>
              Discard
            </button>
          )}
          <button
            className="adm-btn adm-btn--primary"
            onClick={save}
            disabled={!dirty || saving}
          >
            {saving ? 'Saving…' : dirty ? 'Save changes' : 'Saved'}
          </button>
          <button className="adm-btn" onClick={handleReset}>
            Reset demo data
          </button>
        </>
      }
    >
      <div className="adm-card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="adm-label">Project</div>
        <div className="adm-row adm-row--2">
          <TextField
            label="Client"
            value={draft.client}
            onChange={(v) => update('client', v)}
          />
          <TextField
            label="Slug"
            hint="Used in the client view header."
            value={draft.slug}
            onChange={(v) => update('slug', v)}
          />
        </div>
        <TextField
          label="Project name"
          value={draft.projectName}
          onChange={(v) => update('projectName', v)}
        />
        <Select
          label="Status"
          value={draft.status}
          options={STATUS_OPTIONS}
          onChange={(v) => update('status', v as Status)}
        />
      </div>

      <div className="adm-card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="adm-label">Timeline</div>
        <div className="adm-row adm-row--2">
          <DateField
            label="Started on"
            value={draft.startedOn}
            onChange={(v) => update('startedOn', v)}
            placeholder="Select start date"
          />
          <DateField
            label="Target end date"
            value={draft.targetOn}
            onChange={(v) => update('targetOn', v)}
            min={draft.startedOn || undefined}
            placeholder="Select target date"
          />
        </div>
      </div>

      <div className="adm-card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="adm-label">Current phase</div>
        <p className="adm-help" style={{ marginTop: -8 }}>
          The phase the client sees highlighted as active. The "Phase" stat tile updates to match on save.
        </p>
        <Select
          label="Phase"
          value={draft.currentPhaseId}
          options={phaseOptions}
          onChange={(v) => update('currentPhaseId', v)}
        />
      </div>

      <div
        className="adm-card"
        style={{
          padding: 20,
          border: '1px solid var(--line-strong)',
          background: 'var(--card)',
        }}
      >
        <div className="mono" style={{ color: 'var(--fg-faint)', fontSize: 11, marginBottom: 8 }}>
          Live preview
        </div>
        <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', alignItems: 'baseline' }}>
          <div>
            <div className="mono" style={{ color: 'var(--fg-faint)', fontSize: 10 }}>
              {draft.client} · {draft.slug}
            </div>
            <div className="display" style={{ fontSize: 22, fontWeight: 500, marginTop: 4 }}>
              {draft.projectName}
            </div>
          </div>
          <span
            className="mono"
            style={{
              padding: '4px 10px',
              borderRadius: 999,
              fontSize: 11,
              border: '1px solid var(--line)',
              background: 'rgba(255,255,255,0.04)',
              color: 'var(--fg)',
            }}
          >
            {draft.status === 'active' ? 'Live' : draft.status === 'paused' ? 'Paused' : 'Wrapped'}
          </span>
          <span style={{ fontSize: 13, color: 'var(--fg-dim)' }}>
            {draft.startedOn || '—'} → {draft.targetOn || '—'}
          </span>
          <span style={{ fontSize: 13, color: 'var(--fg)' }}>
            Currently in{' '}
            <strong>
              {draft.phases.find((p) => p.id === draft.currentPhaseId)?.title ?? '—'}
            </strong>
          </span>
        </div>
      </div>

      <ActivityComposer
        snap={snap}
        sessionUserName={sessionUser?.name}
        onPosted={() => setToast('Update posted — client dashboard refreshed.')}
        onError={(msg) => setToast(msg)}
      />

      <Toast message={toast} onClear={() => setToast(null)} />
    </TeamShell>
  );
}

interface ComposerProps {
  snap: ProjectSnapshot;
  sessionUserName?: string;
  onPosted: () => void;
  onError: (message: string) => void;
}

function ActivityComposer({ snap, sessionUserName, onPosted, onError }: ComposerProps) {
  // Authors: every roster member, plus the logged-in user if they're not on it.
  const authors = useMemo(() => {
    const list = snap.team.map((m) => ({
      key: m.id,
      name: m.name,
      initial: m.initial,
      tone: m.tone,
    }));
    if (sessionUserName && !snap.team.some((m) => m.name === sessionUserName)) {
      list.unshift({
        key: 'me',
        name: sessionUserName,
        initial: initialOf(sessionUserName),
        tone: FALLBACK_TONE,
      });
    }
    return list;
  }, [snap.team, sessionUserName]);

  const defaultAuthor = authors[0]?.key ?? '';
  const [authorKey, setAuthorKey] = useState<string>(defaultAuthor);
  const [kind, setKind] = useState<ActivityKind>('build');
  const [what, setWhat] = useState('');
  const [posting, setPosting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // If the roster changes (e.g. cross-tab sync) and the picked author disappears,
  // fall back to the first available one.
  useEffect(() => {
    if (!authors.find((a) => a.key === authorKey)) {
      setAuthorKey(defaultAuthor);
    }
  }, [authors, authorKey, defaultAuthor]);

  const author = authors.find((a) => a.key === authorKey) ?? authors[0];
  const ready = !!author && what.trim().length > 0 && !posting;

  const post = async () => {
    if (!author) return;
    const trimmed = what.trim();
    if (!trimmed) return;
    setPosting(true);
    const entry: ProjectActivity = {
      id: uidActivity(),
      when: new Date().toISOString(),
      whoName: author.name,
      whoInitial: author.initial || initialOf(author.name),
      whoTone: author.tone || FALLBACK_TONE,
      what: trimmed,
      kind,
    };
    try {
      await setProject((prev) => ({
        ...prev,
        activity: [entry, ...prev.activity],
      }));
      setWhat('');
      onPosted();
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Could not post update.');
    } finally {
      setPosting(false);
    }
  };

  const remove = async (id: string) => {
    setDeletingId(id);
    try {
      await setProject((prev) => ({
        ...prev,
        activity: prev.activity.filter((a) => a.id !== id),
      }));
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Could not delete update.');
    } finally {
      setDeletingId(null);
    }
  };

  const recent = snap.activity.slice(0, 8);

  return (
    <>
      <div className="adm-card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div className="adm-label">Post an update</div>
        <p className="adm-help" style={{ marginTop: -8 }}>
          Anything you did today that the client should see — a design pushed, a feature shipped,
          a copy draft. Posts publish immediately and appear in their Recent activity feed.
        </p>

        <div className="adm-row adm-row--2">
          <Field label="Who">
            <Dropdown
              value={authorKey}
              options={authors.map((a) => ({
                value: a.key,
                label: a.name,
                hint: a.key === 'me' ? 'You' : undefined,
                icon: (
                  <span
                    aria-hidden="true"
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: '50%',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: `linear-gradient(135deg, ${a.tone}, var(--accent-3))`,
                      color: '#fff',
                      fontFamily: 'var(--font-display)',
                      fontSize: 9,
                      fontWeight: 600,
                    }}
                  >
                    {a.initial || a.name.slice(0, 1).toUpperCase()}
                  </span>
                ),
              }))}
              onChange={setAuthorKey}
              disabled={posting || authors.length === 0}
              placeholder="Pick author"
            />
          </Field>
          <Select
            label="Type"
            value={kind}
            options={KIND_OPTIONS}
            onChange={(v) => setKind(v as ActivityKind)}
          />
        </div>

        <Field
          label="What happened?"
          hint='Write it from the team member’s point of view, e.g. "pushed v0.9 of the homepage hero".'
        >
          <textarea
            className="adm-textarea"
            rows={3}
            value={what}
            placeholder="pushed v0.9 of the homepage hero"
            onChange={(e) => setWhat(e.target.value)}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                e.preventDefault();
                if (ready) post();
              }
            }}
            disabled={posting}
          />
        </Field>

        {author && what.trim() && (
          <div
            style={{
              padding: '12px 14px',
              borderRadius: 12,
              border: '1px dashed var(--line)',
              background: 'rgba(255,255,255,0.015)',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <span
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${author.tone}, var(--accent-3))`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontFamily: 'var(--font-display)',
                fontWeight: 600,
                fontSize: 11,
              }}
            >
              {author.initial || initialOf(author.name)}
            </span>
            <div style={{ fontSize: 13, color: 'var(--fg-dim)', lineHeight: 1.5 }}>
              <span style={{ color: 'var(--fg)' }}>{author.name}</span>{' '}
              {what.trim()}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <button
            type="button"
            className="adm-btn adm-btn--primary"
            onClick={post}
            disabled={!ready}
          >
            {posting ? 'Posting…' : 'Post update'}
          </button>
          {what && !posting && (
            <button type="button" className="adm-btn" onClick={() => setWhat('')}>
              Clear
            </button>
          )}
          <span style={{ fontSize: 11, color: 'var(--fg-faint)' }}>
            Tip: ⌘ / Ctrl + Enter to post.
          </span>
        </div>
      </div>

      <div className="adm-card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="adm-label" style={{ margin: 0 }}>
            Recent updates
          </div>
          <span className="mono" style={{ color: 'var(--fg-faint)', fontSize: 11 }}>
            Showing {recent.length} of {snap.activity.length}
          </span>
        </div>
        {recent.length === 0 && (
          <div style={{ color: 'var(--fg-faint)', fontSize: 13 }}>
            No activity yet. Post the first update above.
          </div>
        )}
        {recent.map((a, i) => (
          <div
            key={a.id}
            style={{
              display: 'grid',
              gridTemplateColumns: '32px 1fr auto auto',
              alignItems: 'center',
              gap: 12,
              padding: '10px 0',
              borderTop: i === 0 ? 'none' : '1px solid var(--line)',
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${a.whoTone || FALLBACK_TONE}, var(--accent-3))`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontFamily: 'var(--font-display)',
                fontWeight: 600,
                fontSize: 12,
              }}
            >
              {a.whoInitial || initialOf(a.whoName)}
            </div>
            <div style={{ fontSize: 13, color: 'var(--fg-dim)', lineHeight: 1.5 }}>
              <span style={{ color: 'var(--fg)' }}>{a.whoName}</span> {a.what}
              <span
                className="mono"
                style={{
                  marginLeft: 8,
                  padding: '2px 6px',
                  borderRadius: 4,
                  fontSize: 9,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  border: '1px solid var(--line)',
                  color: 'var(--fg-faint)',
                }}
              >
                {a.kind}
              </span>
            </div>
            <span className="mono" style={{ fontSize: 10, color: 'var(--fg-faint)' }}>
              {formatRelative(a.when)}
            </span>
            <button
              type="button"
              className="adm-btn adm-btn--sm adm-btn--danger"
              onClick={() => remove(a.id)}
              disabled={deletingId === a.id}
              title="Delete update"
            >
              {deletingId === a.id ? '…' : '✕'}
            </button>
          </div>
        ))}
      </div>
    </>
  );
}

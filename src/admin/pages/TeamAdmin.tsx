import { useState } from 'react';
import { Button } from '@/admin/components/Button';
import { AdminShell } from '@/admin/components/AdminShell';
import { useConfirm } from '@/admin/components/confirm-context';
import { ColorField, TextArea, TextField, Toast } from '@/admin/components/Form';
import { ImageField } from '@/admin/components/ImageField';
import { teamStore, useTeam, type TeamMember } from '@/admin/store';
import { Dropdown } from '@/components/ui/inputs/Dropdown';

const s = (d: string) => (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{ __html: d }} />
);

const SOCIAL_ICONS: Record<string, JSX.Element> = {
  twitter: s('<path d="M4 4l11.733 16h4L8 4H4z"/><path d="M4 20l6.768-6.768M20 4l-6.768 6.768"/>'),
  linkedin: s('<rect x="2" y="5" width="16" height="16" rx="2"/><path d="M6 9v8M6 6v.01M10 11v6M14 9v6"/>'),
  github: s('<path d="M15 22v-4a4.8 4.8 0 00-1-3.5c3 0 6-2 6-5.5a4.3 4.3 0 00-.4-2.9 3 3 0 000-2.4s-1-.3-3.3 1.3a11.4 11.4 0 00-6 0C8 3.7 7 4 7 4a3 3 0 000 2.4 4.3 4.3 0 00-.4 2.9c0 3.5 3 5.5 6 5.5a4.8 4.8 0 00-1 3.5v4"/><path d="M9 18c-3 .7-3-2-4-2"/>'),
  dribbble: s('<circle cx="12" cy="12" r="10"/><path d="M19.13 5.09C15.22 9.14 10 10.44 2.25 10.94"/><path d="M21.75 12.84c-6.62-1.41-12.14 1-16.38 6.32"/><path d="M8.56 2.75c4.37 6 6 9.42 8 17.72"/>'),
  instagram: s('<rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r=".75"/>'),
  website: s('<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>'),
  email: s('<rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 4L12 13 2 4"/>'),
};

const SOCIAL_PLATFORMS = [
  { value: 'twitter', label: 'Twitter', icon: SOCIAL_ICONS.twitter },
  { value: 'linkedin', label: 'LinkedIn', icon: SOCIAL_ICONS.linkedin },
  { value: 'github', label: 'GitHub', icon: SOCIAL_ICONS.github },
  { value: 'dribbble', label: 'Dribbble', icon: SOCIAL_ICONS.dribbble },
  { value: 'instagram', label: 'Instagram', icon: SOCIAL_ICONS.instagram },
  { value: 'website', label: 'Website', icon: SOCIAL_ICONS.website },
  { value: 'email', label: 'Email', icon: SOCIAL_ICONS.email },
];

function uid() {
  return 't' + Math.random().toString(36).slice(2, 9);
}

export function TeamAdmin() {
  const [team] = useTeam();
  const confirm = useConfirm();
  const [draft, setDraft] = useState<TeamMember[]>(team);
  const [toast, setToast] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Re-seed the draft when the published team changes (save, reset, cross-tab).
  // Reconciled during render, not in an effect, to avoid a cascading re-render.
  const [syncedTeam, setSyncedTeam] = useState(team);
  if (syncedTeam !== team) {
    setSyncedTeam(team);
    setDraft(team);
  }

  const dirty = JSON.stringify(draft) !== JSON.stringify(team);

  const showError = (err: unknown) =>
    setToast(err instanceof Error ? err.message : 'Save failed.');

  const update = (i: number, patch: Partial<TeamMember>) => {
    setDraft((d) => d.map((m, idx) => (idx === i ? { ...m, ...patch } : m)));
  };

  const remove = async (i: number) => {
    if (
      !(await confirm({
        title: `Remove ${draft[i].name}?`,
        body: 'They will be removed from the team draft. Save to publish the change.',
        confirmLabel: 'Remove',
        danger: true,
      }))
    )
      return;
    setDraft((d) => d.filter((_, idx) => idx !== i));
  };

  const add = () => {
    setDraft((d) => [
      ...d,
      { id: uid(), name: 'New member', role: 'Role', bio: '', initials: 'NM', tone: '#ff813a' },
    ]);
  };

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= draft.length) return;
    const next = [...draft];
    [next[i], next[j]] = [next[j], next[i]];
    setDraft(next);
  };

  const save = async () => {
    setSaving(true);
    try {
      await teamStore.set(draft);
      setToast('Saved.');
    } catch (err) {
      showError(err);
    } finally {
      setSaving(false);
    }
  };

  const discard = () => setDraft(team);

  return (
    <AdminShell
      crumbs={[{ label: 'Team' }]}
      title="Team"
      sub="Renders on the About page. Click Save to publish changes."
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
                  title: 'Reset team?',
                  body: 'Restores the default team members. Local edits will be lost.',
                  confirmLabel: 'Reset',
                  danger: true,
                })
              ) {
                teamStore.reset().catch(showError);
              }
            }}
          >
            Reset
          </button>
          <button className="adm-btn" onClick={add}>
            + Add member
          </button>
        </>
      }
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 14 }}>
        {draft.map((m, i) => (
          <div key={m.id} className="adm-card" style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 20 }}>
            <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
              {m.avatar ? (
                <img
                  src={m.avatar}
                  alt={m.name}
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: '50%',
                    objectFit: 'cover',
                    boxShadow: `0 8px 24px ${m.tone}66`,
                    border: '3px solid var(--surface)',
                  }}
                />
              ) : (
                <div
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${m.tone}, var(--accent-3))`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontFamily: 'var(--font-display)',
                    fontWeight: 600,
                    fontSize: 22,
                    boxShadow: `0 8px 24px ${m.tone}55`,
                  }}
                >
                  {m.initials || m.name.slice(0, 2).toUpperCase()}
                </div>
              )}
              <div style={{ position: 'absolute', top: -4, right: 4, display: 'flex', gap: 4 }}>
                <button className="adm-btn adm-btn--sm adm-btn--ghost" onClick={() => move(i, -1)} title="Move up">↑</button>
                <button className="adm-btn adm-btn--sm adm-btn--ghost" onClick={() => move(i, 1)} title="Move down">↓</button>
                <button className="adm-btn adm-btn--sm adm-btn--danger" onClick={() => remove(i)}>✕</button>
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 600, fontSize: 15 }}>{m.name || 'Unnamed'}</div>
              <div style={{ fontSize: 12, color: 'var(--fg-faint)', marginTop: 2 }}>{m.role}</div>
            </div>
            <ImageField label="Avatar" hint="Optional profile picture" value={m.avatar ?? ''} onChange={(v) => update(i, { avatar: v || undefined })} prefix="team" />
            <TextField label="Name" value={m.name} onChange={(v) => update(i, { name: v })} />
            <TextField label="Role" value={m.role} onChange={(v) => update(i, { role: v })} />
            <TextArea label="Bio" value={m.bio} onChange={(v) => update(i, { bio: v })} rows={3} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="adm-label">Social links</span>
                <button
                  className="adm-btn adm-btn--sm"
                  onClick={() => update(i, { socials: [...(m.socials ?? []), { platform: '', url: '' }] })}
                >
                  + Add
                </button>
              </div>
              {(m.socials ?? []).map((s, si) => (
                <div key={si} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <div style={{ width: 160, flexShrink: 0 }}>
                    <Dropdown
                      value={s.platform || null}
                      options={SOCIAL_PLATFORMS}
                      onChange={(v) => {
                        const next = [...(m.socials ?? [])];
                        next[si] = { ...next[si], platform: v };
                        update(i, { socials: next });
                      }}
                      placeholder="Pick…"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder={s.platform === 'email' ? 'mailto:...' : 'https://...'}
                    value={s.url}
                    onChange={(e) => {
                      const next = [...(m.socials ?? [])];
                      next[si] = { ...next[si], url: e.target.value };
                      update(i, { socials: next });
                    }}
                    style={{
                      height: 40,
                      flex: 1,
                      padding: '6px 8px',
                      borderRadius: 6,
                      border: '1px solid var(--line)',
                      background: 'var(--surface)',
                      color: 'var(--fg)',
                      fontSize: 12,
                    }}
                  />
                  <button
                    className="adm-btn adm-btn--sm adm-btn--danger"
                    onClick={() => {
                      const next = (m.socials ?? []).filter((_, idx) => idx !== si);
                      update(i, { socials: next.length ? next : undefined });
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            <div className="adm-row adm-row--2">
              <TextField label="Initials" value={m.initials} onChange={(v) => update(i, { initials: v.slice(0, 3).toUpperCase() })} />
              <ColorField label="Tone" value={m.tone} onChange={(v) => update(i, { tone: v })} />
            </div>
          </div>
        ))}
      </div>
      <Toast message={toast} onClear={() => setToast(null)} />
    </AdminShell>
  );
}

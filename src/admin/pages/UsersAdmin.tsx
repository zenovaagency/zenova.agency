import { useEffect, useState } from 'react';
import { AdminShell } from '@/admin/components/AdminShell';
import { useConfirm } from '@/admin/components/confirm-context';
import { Button } from '@/admin/components/Button';
import { Select, TextField, Toast, ToggleField } from '@/admin/components/Form';
import {
  createUser,
  deleteUser,
  listUsers,
  patchUser,
  type UserAccount,
  type UserPatchPayload,
} from '@/admin/usersApi';
import { refreshCurrentUser, useSession, type Role } from '@/lib/session';

const ROLE_TONES: Record<Role, string> = {
  admin: '#ff813a',
  team: '#4f9cf9',
  client: '#8bc34a',
};

const ROLE_LABELS: Record<Role, string> = {
  admin: 'Admin',
  team: 'Team',
  client: 'Client',
};

const ROLE_OPTIONS: Array<{ value: Role; label: string }> = [
  { value: 'client', label: 'Client — client portal' },
  { value: 'team', label: 'Team — team portal' },
  { value: 'admin', label: 'Admin — full dashboard access' },
];

const GRID = '40px 1.1fr 1.4fr 0.7fr 0.8fr 0.7fr 200px';

type RoleTab = 'all' | Role;

function initialsOf(name: string, email: string): string {
  const source = name.trim() || email.trim();
  if (!source) return '?';
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return source.slice(0, 2).toUpperCase();
}

interface DraftUser {
  email: string;
  name: string;
  role: Role;
  password: string;
  is_active: boolean;
}

function draftOf(user?: UserAccount): DraftUser {
  return {
    email: user?.email ?? '',
    name: user?.name ?? '',
    role: user?.role ?? 'client',
    password: '',
    is_active: user?.is_active ?? true,
  };
}

function UserForm({
  mode,
  initial,
  isSelf,
  saving,
  onSave,
  onCancel,
}: {
  mode: 'create' | 'edit';
  initial: DraftUser;
  isSelf: boolean;
  saving: boolean;
  onSave: (draft: DraftUser) => void;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState<DraftUser>(initial);
  const [error, setError] = useState<string | null>(null);

  const update = (delta: Partial<DraftUser>) => setDraft((d) => ({ ...d, ...delta }));

  const submit = () => {
    if (!draft.name.trim()) return setError('Name is required.');
    if (!/^\S+@\S+\.\S+$/.test(draft.email.trim())) return setError('Enter a valid email address.');
    if (mode === 'create' && draft.password.length < 8)
      return setError('Password must be at least 8 characters.');
    if (mode === 'edit' && draft.password.length > 0 && draft.password.length < 8)
      return setError('New password must be at least 8 characters (leave blank to keep the current one).');
    setError(null);
    onSave({ ...draft, name: draft.name.trim(), email: draft.email.trim().toLowerCase() });
  };

  return (
    <div className="adm-card" style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
      <div style={{ fontSize: 14, fontWeight: 500 }}>
        {mode === 'create' ? 'New user' : `Edit — ${initial.email}`}
        {isSelf && (
          <span className="adm-badge" style={{ marginLeft: 8 }}>
            You
          </span>
        )}
      </div>
      <div className="adm-row adm-row--2">
        <TextField label="Name" value={draft.name} onChange={(v) => update({ name: v })} placeholder="Jane Doe" />
        <TextField
          label="Email"
          type="email"
          value={draft.email}
          onChange={(v) => update({ email: v })}
          placeholder="jane@example.com"
        />
      </div>
      <div className="adm-row adm-row--2">
        <Select
          label="Role"
          hint={isSelf ? 'You cannot change your own role.' : 'Decides which portal this account can access.'}
          value={draft.role}
          options={isSelf ? ROLE_OPTIONS.filter((o) => o.value === 'admin') : ROLE_OPTIONS}
          onChange={(v) => update({ role: v as Role })}
        />
        <TextField
          label={mode === 'create' ? 'Password' : 'New password'}
          type="password"
          hint={
            mode === 'create'
              ? 'At least 8 characters. Share it with the user securely.'
              : 'Leave blank to keep the current password.'
          }
          value={draft.password}
          onChange={(v) => update({ password: v })}
          placeholder={mode === 'create' ? 'Min. 8 characters' : '••••••••'}
        />
      </div>
      {mode === 'edit' && (
        <ToggleField
          label="Active"
          description={draft.is_active ? 'Account can sign in.' : 'Account is locked out.'}
          hint={isSelf ? 'You cannot deactivate your own account.' : undefined}
          value={draft.is_active}
          onChange={(v) => update({ is_active: v })}
          disabled={isSelf}
        />
      )}
      {error && (
        <p className="adm-help" style={{ color: 'var(--adm-danger-text)', margin: 0 }}>
          {error}
        </p>
      )}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button className="adm-btn" onClick={onCancel} disabled={saving}>
          Cancel
        </button>
        <Button onClick={submit} disabled={saving}>
          {saving ? 'Saving…' : mode === 'create' ? 'Create user' : 'Save changes'}
        </Button>
      </div>
    </div>
  );
}

export function UsersAdmin() {
  const me = useSession();
  const confirm = useConfirm();
  const [users, setUsers] = useState<UserAccount[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [tab, setTab] = useState<RoleTab>('all');
  // 'create' opens the blank form, a user id opens the edit form for that row.
  const [editing, setEditing] = useState<'create' | string | null>(null);
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const [reloadKey, setReloadKey] = useState(0);
  const retry = () => {
    setLoadError(null);
    setReloadKey((k) => k + 1);
  };

  useEffect(() => {
    let cancelled = false;
    listUsers()
      .then((data) => {
        if (!cancelled) setUsers(data);
      })
      .catch((err) => {
        if (!cancelled) setLoadError(err instanceof Error ? err.message : 'Failed to load users.');
      });
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const editingUser = editing && editing !== 'create' ? users?.find((u) => u.id === editing) : undefined;
  const filtered = (users ?? []).filter((u) => tab === 'all' || u.role === tab);
  const countOf = (role: Role) => (users ?? []).filter((u) => u.role === role).length;

  const tabs: Array<{ id: RoleTab; label: string }> = [
    { id: 'all', label: `All (${users?.length ?? 0})` },
    { id: 'admin', label: `Admins (${countOf('admin')})` },
    { id: 'team', label: `Team (${countOf('team')})` },
    { id: 'client', label: `Clients (${countOf('client')})` },
  ];

  const failMessage = (err: unknown, fallback: string) =>
    err instanceof Error ? err.message : fallback;

  const save = async (draft: DraftUser) => {
    setSaving(true);
    try {
      if (editing === 'create') {
        const created = await createUser({
          email: draft.email,
          name: draft.name,
          role: draft.role,
          password: draft.password,
        });
        setUsers((list) => [created, ...(list ?? [])]);
        setToast(`"${created.name}" created.`);
      } else if (editingUser) {
        const patch: UserPatchPayload = {};
        if (draft.name !== editingUser.name) patch.name = draft.name;
        if (draft.email !== editingUser.email) patch.email = draft.email;
        if (draft.role !== editingUser.role) patch.role = draft.role;
        if (draft.is_active !== editingUser.is_active) patch.is_active = draft.is_active;
        if (draft.password) patch.password = draft.password;
        if (Object.keys(patch).length === 0) {
          setToast('No changes.');
          setEditing(null);
          return;
        }
        const updated = await patchUser(editingUser.id, patch);
        setUsers((list) => (list ?? []).map((u) => (u.id === updated.id ? updated : u)));
        if (me && editingUser.id === me.id) await refreshCurrentUser();
        setToast(`"${updated.name}" saved.`);
      }
      setEditing(null);
    } catch (err) {
      setToast(failMessage(err, 'Save failed.'));
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (u: UserAccount) => {
    setBusy(u.id);
    try {
      const updated = await patchUser(u.id, { is_active: !u.is_active });
      setUsers((list) => (list ?? []).map((x) => (x.id === updated.id ? updated : x)));
      setToast(updated.is_active ? `"${updated.name}" enabled.` : `"${updated.name}" disabled.`);
    } catch (err) {
      setToast(failMessage(err, 'Update failed.'));
    } finally {
      setBusy(null);
    }
  };

  const remove = async (u: UserAccount) => {
    if (
      !(await confirm({
        title: `Delete ${u.name}?`,
        body: `${u.email} will no longer be able to sign in. This cannot be undone.`,
        confirmLabel: 'Delete user',
        danger: true,
      }))
    )
      return;
    setBusy(u.id);
    try {
      await deleteUser(u.id);
      setUsers((list) => (list ?? []).filter((x) => x.id !== u.id));
      if (editing === u.id) setEditing(null);
      setToast(`"${u.name}" deleted.`);
    } catch (err) {
      setToast(failMessage(err, 'Delete failed.'));
    } finally {
      setBusy(null);
    }
  };

  return (
    <AdminShell
      crumbs={[{ label: 'Users' }]}
      title="User accounts"
      sub="Sign-in accounts for the admin dashboard and the team and client portals. Deactivate an account to lock it out without deleting it."
      actions={
        <Button onClick={() => setEditing('create')} disabled={editing === 'create'}>
          + New user
        </Button>
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

      {editing === 'create' && (
        <UserForm
          mode="create"
          initial={draftOf()}
          isSelf={false}
          saving={saving}
          onSave={save}
          onCancel={() => setEditing(null)}
        />
      )}
      {editingUser && (
        <UserForm
          key={editingUser.id}
          mode="edit"
          initial={draftOf(editingUser)}
          isSelf={me?.id === editingUser.id}
          saving={saving}
          onSave={save}
          onCancel={() => setEditing(null)}
        />
      )}

      {loadError ? (
        <div className="adm-card" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ color: 'var(--adm-danger-text)', fontSize: 13 }}>{loadError}</span>
          <button className="adm-btn adm-btn--sm" onClick={retry}>
            Retry
          </button>
        </div>
      ) : users === null ? (
        <div className="adm-card" style={{ color: 'var(--fg-dim)', fontSize: 13 }}>Loading users…</div>
      ) : filtered.length === 0 ? (
        <div className="adm-card" style={{ color: 'var(--fg-dim)', fontSize: 13 }}>
          {tab === 'all' ? 'No user accounts yet.' : `No ${ROLE_LABELS[tab as Role].toLowerCase()} accounts yet.`}
        </div>
      ) : (
        <div className="adm-list">
          <div className="adm-list__row adm-list__row--head" style={{ gridTemplateColumns: GRID }}>
            <div></div>
            <div>Name</div>
            <div>Email</div>
            <div>Role</div>
            <div>Status</div>
            <div>Created</div>
            <div style={{ textAlign: 'right' }}>Actions</div>
          </div>
          {filtered.map((u) => {
            const isSelf = me?.id === u.id;
            const tone = ROLE_TONES[u.role];
            return (
              <div key={u.id} className="adm-list__row" style={{ gridTemplateColumns: GRID }}>
                <div className="adm-list__cell adm-list__cell--lead">
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      background: `${tone}22`,
                      border: `1px solid ${tone}55`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: tone,
                      fontFamily: 'var(--font-mono)',
                      fontSize: 10,
                    }}
                  >
                    {initialsOf(u.name, u.email)}
                  </div>
                </div>
                <div className="adm-list__cell adm-list__cell--primary">
                  <div style={{ fontSize: 14, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {u.name}
                    </span>
                    {isSelf && <span className="adm-badge">You</span>}
                  </div>
                </div>
                <div
                  className="adm-list__cell"
                  data-label="Email"
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 12,
                    color: 'var(--fg-dim)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {u.email}
                </div>
                <div className="adm-list__cell" data-label="Role">
                  <span className="adm-badge" style={{ color: tone, borderColor: `${tone}55` }}>
                    {ROLE_LABELS[u.role]}
                  </span>
                </div>
                <div className="adm-list__cell" data-label="Status">
                  <span className="adm-badge">
                    <span
                      className="adm-badge__dot"
                      style={{ background: u.is_active ? '#3fb950' : 'var(--fg-faint)' }}
                    />
                    {u.is_active ? 'Active' : 'Disabled'}
                  </span>
                </div>
                <div className="adm-list__cell" data-label="Created" style={{ color: 'var(--fg-dim)', fontSize: 13 }}>
                  {new Date(u.created_at).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </div>
                <div className="adm-list__cell adm-list__actions">
                  <button
                    className="adm-btn adm-btn--sm"
                    onClick={() => setEditing(editing === u.id ? null : u.id)}
                    disabled={busy === u.id}
                  >
                    {editing === u.id ? 'Close' : 'Edit'}
                  </button>
                  <button
                    className="adm-btn adm-btn--sm"
                    onClick={() => toggleActive(u)}
                    // Also locked while this row's edit form is open: the form's
                    // draft would go stale and saving it would undo the toggle.
                    disabled={busy === u.id || isSelf || editing === u.id}
                    title={isSelf ? 'You cannot deactivate your own account.' : undefined}
                  >
                    {busy === u.id ? '…' : u.is_active ? 'Disable' : 'Enable'}
                  </button>
                  <button
                    className="adm-btn adm-btn--sm adm-btn--danger"
                    onClick={() => remove(u)}
                    disabled={busy === u.id || isSelf}
                    title={isSelf ? 'You cannot delete your own account.' : undefined}
                  >
                    {busy === u.id ? '…' : 'Delete'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <Toast message={toast} onClear={() => setToast(null)} />
    </AdminShell>
  );
}

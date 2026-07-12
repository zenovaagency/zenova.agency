import { useEffect, useState } from 'react';
import { AdminShell } from '@/admin/components/AdminShell';
import { useConfirm } from '@/admin/components/confirm-context';
import { Toast } from '@/admin/components/Form';
import { deleteLead, listLeads, markLeadRead, type Lead } from '@/admin/leadsApi';

const GRID = '26px 1.2fr 1.3fr 150px 190px';

type Tab = 'all' | 'unread';

function initialsOf(name: string, email: string): string {
  const source = name.trim() || email.trim();
  if (!source) return '?';
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return source.slice(0, 2).toUpperCase();
}

function formatWhen(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

export function Inbox() {
  const [leads, setLeads] = useState<Lead[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>('all');
  const [busy, setBusy] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const confirm = useConfirm();

  const [reloadKey, setReloadKey] = useState(0);
  const retry = () => {
    setLoadError(null);
    setReloadKey((k) => k + 1);
  };

  useEffect(() => {
    let cancelled = false;
    listLeads()
      .then((data) => {
        if (!cancelled) setLeads(data);
      })
      .catch((err) => {
        if (!cancelled) setLoadError(err instanceof Error ? err.message : 'Failed to load messages.');
      });
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const failMessage = (err: unknown, fallback: string) =>
    err instanceof Error ? err.message : fallback;

  const unreadCount = (leads ?? []).filter((l) => !l.is_read).length;
  const filtered = (leads ?? []).filter((l) => tab === 'all' || !l.is_read);

  const tabs: Array<{ id: Tab; label: string }> = [
    { id: 'all', label: `All (${leads?.length ?? 0})` },
    { id: 'unread', label: `Unread (${unreadCount})` },
  ];

  const setRead = async (lead: Lead, is_read: boolean) => {
    setBusy(lead.id);
    try {
      const updated = await markLeadRead(lead.id, is_read);
      setLeads((list) => (list ?? []).map((l) => (l.id === updated.id ? updated : l)));
    } catch (err) {
      setToast(failMessage(err, 'Update failed.'));
    } finally {
      setBusy(null);
    }
  };

  const toggleExpand = (lead: Lead) => {
    const opening = expanded !== lead.id;
    setExpanded(opening ? lead.id : null);
    // Opening an unread message marks it read.
    if (opening && !lead.is_read) void setRead(lead, true);
  };

  const remove = async (lead: Lead) => {
    if (
      !(await confirm({
        title: 'Delete message?',
        body: `This permanently deletes the message from ${lead.name}.`,
        confirmLabel: 'Delete',
        danger: true,
      }))
    )
      return;
    setBusy(lead.id);
    try {
      await deleteLead(lead.id);
      setLeads((list) => (list ?? []).filter((l) => l.id !== lead.id));
      if (expanded === lead.id) setExpanded(null);
      setToast('Message deleted.');
    } catch (err) {
      setToast(failMessage(err, 'Delete failed.'));
    } finally {
      setBusy(null);
    }
  };

  return (
    <AdminShell
      crumbs={[{ label: 'Inbox' }]}
      title="Inbox"
      sub="Messages submitted through the public contact form. Open a message to read it in full and reply by email."
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

      {loadError ? (
        <div className="adm-card" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ color: 'var(--adm-danger-text)', fontSize: 13 }}>{loadError}</span>
          <button className="adm-btn adm-btn--sm" onClick={retry}>
            Retry
          </button>
        </div>
      ) : leads === null ? (
        <div className="adm-card" style={{ color: 'var(--fg-dim)', fontSize: 13 }}>Loading messages…</div>
      ) : filtered.length === 0 ? (
        <div className="adm-card" style={{ color: 'var(--fg-dim)', fontSize: 13 }}>
          {tab === 'unread' ? 'No unread messages.' : 'No messages yet.'}
        </div>
      ) : (
        <div className="adm-list">
          <div className="adm-list__row adm-list__row--head" style={{ gridTemplateColumns: GRID }}>
            <div></div>
            <div>From</div>
            <div>Email</div>
            <div>Received</div>
            <div style={{ textAlign: 'right' }}>Actions</div>
          </div>
          {filtered.map((lead) => {
            const isOpen = expanded === lead.id;
            return (
              <div key={lead.id}>
                <div
                  className="adm-list__row"
                  style={{
                    gridTemplateColumns: GRID,
                    cursor: 'pointer',
                    fontWeight: lead.is_read ? 400 : 600,
                  }}
                  onClick={() => toggleExpand(lead)}
                >
                  <div className="adm-list__cell adm-list__cell--lead">
                    <span
                      title={lead.is_read ? 'Read' : 'Unread'}
                      style={{
                        display: 'inline-block',
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: lead.is_read ? 'transparent' : 'var(--accent-1, #ff813a)',
                        border: lead.is_read ? '1px solid var(--fg-faint)' : 'none',
                      }}
                    />
                  </div>
                  <div className="adm-list__cell adm-list__cell--primary">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                      <span
                        aria-hidden
                        style={{
                          width: 26,
                          height: 26,
                          flex: '0 0 auto',
                          borderRadius: '50%',
                          background: 'var(--accent-1-soft, rgba(255,129,58,0.13))',
                          border: '1px solid var(--line-strong)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--accent-1, #ff813a)',
                          fontFamily: 'var(--font-mono)',
                          fontSize: 10,
                        }}
                      >
                        {initialsOf(lead.name, lead.email)}
                      </span>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {lead.name}
                      </span>
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
                    {lead.email}
                  </div>
                  <div
                    className="adm-list__cell"
                    data-label="Received"
                    style={{ color: 'var(--fg-dim)', fontSize: 12 }}
                  >
                    {formatWhen(lead.created_at)}
                  </div>
                  <div
                    className="adm-list__cell adm-list__actions"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      className="adm-btn adm-btn--sm"
                      onClick={() => setRead(lead, !lead.is_read)}
                      disabled={busy === lead.id}
                    >
                      {busy === lead.id ? '…' : lead.is_read ? 'Mark unread' : 'Mark read'}
                    </button>
                    <button
                      className="adm-btn adm-btn--sm adm-btn--danger"
                      onClick={() => remove(lead)}
                      disabled={busy === lead.id}
                    >
                      {busy === lead.id ? '…' : 'Delete'}
                    </button>
                  </div>
                </div>
                {isOpen && (
                  <div
                    className="adm-card"
                    style={{
                      margin: '2px 0 10px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 14,
                    }}
                  >
                    <p
                      style={{
                        margin: 0,
                        fontSize: 14,
                        lineHeight: 1.65,
                        color: 'var(--fg)',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                      }}
                    >
                      {lead.message}
                    </p>
                    <div>
                      <a
                        className="adm-btn adm-btn--sm"
                        href={`mailto:${lead.email}?subject=${encodeURIComponent(
                          'Re: your message to Zenova',
                        )}`}
                      >
                        Reply by email
                      </a>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      <Toast message={toast} onClear={() => setToast(null)} />
    </AdminShell>
  );
}

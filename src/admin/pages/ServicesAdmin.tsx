import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/admin/components/Button';
import { AdminShell } from '@/admin/components/AdminShell';
import { useConfirm } from '@/admin/components/confirm-context';
import { Toast } from '@/admin/components/Form';
import { Icon, type IconName } from '@/components/icons/Icon';
import { createService, deleteService, servicesStore, useServices } from '@/admin/store';
import type { ServiceDetail } from '@/data/services';

const ICON_OPTIONS = ['Code', 'Spark', 'Rocket', 'Layers', 'Pen', 'Compass', 'Grid', 'AppDev', 'Bot', 'Automation'];
const VISUAL_OPTIONS = ['browser', 'curve', 'rocket', 'kanban', 'editor'];

function emptyService(): ServiceDetail {
  return {
    slug: 'new-service-' + Math.random().toString(36).slice(2, 6),
    icon: 'Code',
    tag: 'Build',
    title: 'Untitled service',
    short: '',
    lede: '',
    hero: '',
    bullets: [],
    stat: ['', ''],
    hue: '#ff813a',
    visual: 'browser',
    image: undefined,
    video: undefined,
    meta: [
      ['', ''],
      ['', ''],
      ['', ''],
      ['', ''],
    ],
    deliverables: [],
    phases: [],
    stack: [],
    packages: [],
    faqs: [],
    related: [],
  };
}

// eslint-disable-next-line react-refresh/only-export-components -- option constants + factory colocated with the admin page
export { ICON_OPTIONS, VISUAL_OPTIONS, emptyService };

export function ServicesAdmin() {
  const [services] = useServices();
  const confirm = useConfirm();
  const [busy, setBusy] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const duplicate = async (s: ServiceDetail) => {
    const base = s.slug.replace(/-copy\d*$/g, '');
    let copySlug = `${base}-copy`;
    let n = 2;
    while (services.some((x) => x.slug === copySlug)) {
      copySlug = `${base}-copy-${n}`;
      n += 1;
    }
    const copy: ServiceDetail = {
      ...s,
      slug: copySlug,
      title: s.title + ' (copy)',
    };
    setBusy(copySlug);
    try {
      await createService(copy);
      setToast(`"${copy.title}" created.`);
    } catch (err) {
      setToast(err instanceof Error ? err.message : 'Duplicate failed.');
    } finally {
      setBusy(null);
    }
  };

  const remove = async (s: ServiceDetail) => {
    if (
      !(await confirm({
        title: `Delete "${s.title}"?`,
        body: 'This cannot be undone.',
        confirmLabel: 'Delete',
        danger: true,
      }))
    )
      return;
    setBusy(s.slug);
    try {
      await deleteService(s.slug);
      setToast(`"${s.title}" deleted.`);
    } catch (err) {
      setToast(err instanceof Error ? err.message : 'Delete failed.');
    } finally {
      setBusy(null);
    }
  };

  return (
    <AdminShell
      crumbs={[{ label: 'Services' }]}
      title="Services"
      sub="The five (or more) practices that show up on /services and inside the hover-list on the homepage."
      actions={
        <>
          <button
            className="adm-btn"
            onClick={async () => {
              if (
                await confirm({
                  title: 'Reset services?',
                  body: 'Restores the factory defaults. Local edits will be lost.',
                  confirmLabel: 'Reset',
                  danger: true,
                })
              ) {
                servicesStore.reset();
              }
            }}
          >
            Reset
          </button>
          <Button asChild>
            <Link to="/admin/services/new">+ New service</Link>
          </Button>
        </>
      }
    >
      <div className="adm-list">
        <div
          className="adm-list__row adm-list__row--head"
          style={{ gridTemplateColumns: '40px 1.4fr 0.8fr 0.6fr 0.6fr 220px' }}
        >
          <div></div>
          <div>Title</div>
          <div>Slug</div>
          <div>Tag</div>
          <div>Packages</div>
          <div style={{ textAlign: 'right' }}>Actions</div>
        </div>
        {services.map((s) => (
          <div
            key={s.slug}
            className="adm-list__row"
            style={{ gridTemplateColumns: '40px 1.4fr 0.8fr 0.6fr 0.6fr 220px' }}
          >
            <div className="adm-list__cell adm-list__cell--lead">
              {(() => {
                const IconC = Icon[s.icon as IconName];
                return (
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 8,
                      background: `${s.hue}22`,
                      border: `1px solid ${s.hue}55`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: s.hue,
                    }}
                  >
                    {IconC ? <IconC size={14} /> : <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10 }}>{s.icon.slice(0, 2)}</span>}
                  </div>
                );
              })()}
            </div>
            <div className="adm-list__cell adm-list__cell--primary">
              <div style={{ fontSize: 14, fontWeight: 500 }}>{s.title}</div>
              <div style={{ fontSize: 12, color: 'var(--fg-faint)' }}>{s.short}</div>
            </div>
            <div className="adm-list__cell" data-label="Slug">
              <span
                className="adm-badge"
                style={{ color: s.hue, borderColor: `${s.hue}55` }}
              >
                {s.slug}
              </span>
            </div>
            <div className="adm-list__cell" data-label="Tag" style={{ color: 'var(--fg-dim)', fontSize: 13 }}>
              {s.tag}
            </div>
            <div className="adm-list__cell" data-label="Packages" style={{ color: 'var(--fg-dim)', fontSize: 13 }}>
              {s.packages.length}
            </div>
            <div className="adm-list__cell adm-list__actions">
              <Link
                to={`/services/${s.slug}`}
                target="_blank"
                rel="noreferrer"
                className="adm-btn adm-btn--sm"
              >
                Preview
              </Link>
              <Link to={`/admin/services/${s.slug}`} className="adm-btn adm-btn--sm">
                Edit
              </Link>
              <button
                className="adm-btn adm-btn--sm"
                onClick={() => duplicate(s)}
                disabled={busy === s.slug}
              >
                {busy === s.slug ? '…' : 'Duplicate'}
              </button>
              <button
                className="adm-btn adm-btn--sm adm-btn--danger"
                onClick={() => remove(s)}
                disabled={busy === s.slug}
              >
                {busy === s.slug ? '…' : 'Delete'}
              </button>
            </div>
          </div>
        ))}
      </div>
      <Toast message={toast} onClear={() => setToast(null)} />
    </AdminShell>
  );
}

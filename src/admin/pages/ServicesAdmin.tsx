import { Link } from 'react-router-dom';
import { AdminShell } from '@/admin/components/AdminShell';
import { servicesStore, useServices } from '@/admin/store';
import type { ServiceDetail } from '@/data/services';

const ICON_OPTIONS = ['Code', 'Spark', 'Rocket', 'Layers', 'Pen', 'Compass', 'Grid'];
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

export { ICON_OPTIONS, VISUAL_OPTIONS, emptyService };

export function ServicesAdmin() {
  const [services] = useServices();

  const duplicate = (s: ServiceDetail) => {
    const copy: ServiceDetail = {
      ...s,
      slug: s.slug + '-copy',
      title: s.title + ' (copy)',
    };
    servicesStore.set([...services, copy]);
  };

  const remove = (s: ServiceDetail) => {
    if (!window.confirm(`Delete "${s.title}"? This cannot be undone.`)) return;
    servicesStore.set(services.filter((x) => x.slug !== s.slug));
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
            onClick={() => {
              if (window.confirm('Reset services to factory defaults? Local edits will be lost.')) {
                servicesStore.reset();
              }
            }}
          >
            Reset
          </button>
          <Link to="/admin/services/new" className="adm-btn adm-btn--primary">
            + New service
          </Link>
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
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                }}
              >
                {s.icon.slice(0, 2)}
              </div>
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
              <button className="adm-btn adm-btn--sm" onClick={() => duplicate(s)}>
                Duplicate
              </button>
              <button className="adm-btn adm-btn--sm adm-btn--danger" onClick={() => remove(s)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </AdminShell>
  );
}

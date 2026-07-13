import { Link } from 'react-router-dom';
import { Button } from '@/admin/components/Button';
import { AdminShell } from '@/admin/components/AdminShell';
import { Icon } from '@/components/icons/Icon';
import { useServices, useProjects, useTeam, useContent } from '@/admin/store';

export function Overview() {
  const [services] = useServices();
  const [projects] = useProjects();
  const [team] = useTeam();
  const [content] = useContent();

  const stats = [
    { label: 'Services', num: String(services.length), to: '/admin/services', delta: 'Visible on /services' },
    { label: 'Case studies', num: String(projects.length), to: '/admin/projects', delta: 'Visible on /work' },
    { label: 'Team members', num: String(team.length), to: '/admin/team', delta: 'About page' },
    { label: 'FAQ entries', num: String(content.faqs.length), to: '/admin/content', delta: 'Homepage FAQ' },
    { label: 'Testimonials', num: String(content.testimonials.length), to: '/admin/content', delta: 'Marquee rows' },
    { label: 'Marquee logos', num: String(content.marquee.length), to: '/admin/content', delta: 'Below the hero' },
  ];

  const quickActions = [
    { label: 'New service', to: '/admin/services/new', icon: '✦' },
    { label: 'New case study', to: '/admin/projects/new', icon: '◆' },
    { label: 'Add team member', to: '/admin/team', icon: '◉' },
    { label: 'Edit pricing', to: '/admin/pricing', icon: '❖' },
    { label: 'Edit homepage hero', to: '/admin/content', icon: '◐' },
  ];

  return (
    <AdminShell
      title="Welcome back"
      sub="A working snapshot of every editable surface across the marketing site."
      actions={
        <>
          <Link to="/" className="adm-btn" target="_blank" rel="noreferrer">
            <Icon.ArrowUpRight size={16} /> View site
          </Link>
          <Button asChild>
            <Link to="/admin/content">Edit content</Link>
          </Button>
        </>
      }
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 14,
        }}
      >
        {stats.map((s) => (
          <Link
            key={s.label}
            to={s.to}
            className="adm-stat"
            style={{ textDecoration: 'none', color: 'var(--fg)' }}
          >
            <div className="adm-stat__label">{s.label}</div>
            <div className="adm-stat__num">{s.num}</div>
            <div className="adm-stat__delta">{s.delta}</div>
          </Link>
        ))}
      </div>

      <div className="adm-card">
        <div
          className="adm-label"
          style={{ marginBottom: 16 }}
        >
          Quick actions
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {quickActions.map((a) => (
            <Link
              key={a.label}
              to={a.to}
              className="adm-btn"
              style={{ textDecoration: 'none' }}
            >
              <span style={{ color: 'var(--accent-3)', fontSize: 14 }}>{a.icon}</span> {a.label}
            </Link>
          ))}
        </div>
      </div>

      <div
        style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 14 }}
        className="adm-overview-grid"
      >
        <div className="adm-card">
          <div className="adm-label" style={{ marginBottom: 14 }}>
            Recent services
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {services.slice(0, 5).map((s) => (
              <Link
                key={s.slug}
                to={`/admin/services/${s.slug}`}
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'auto 1fr auto',
                  gap: 14,
                  alignItems: 'center',
                  padding: '12px 14px',
                  borderRadius: 10,
                  border: '1px solid var(--line)',
                  background: 'var(--card)',
                  textDecoration: 'none',
                  color: 'var(--fg)',
                }}
              >
                <span
                  className="adm-badge__dot"
                  style={{ background: s.hue, boxShadow: `0 0 8px ${s.hue}` }}
                />
                <div>
                  <div style={{ fontWeight: 500, fontSize: 14 }}>{s.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--fg-faint)' }}>
                    {s.tag} · {s.bullets.length} bullets · {s.packages.length} packages
                  </div>
                </div>
                <span className="adm-badge" style={{ color: s.hue, borderColor: `${s.hue}55` }}>
                  {s.slug}
                </span>
              </Link>
            ))}
          </div>
        </div>

        <div className="adm-card">
          <div className="adm-label" style={{ marginBottom: 14 }}>
            Recent case studies
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {projects.slice(0, 5).map((p) => {
              const live = p.liveUrl?.trim();
              return (
                <Link
                  key={p.slug}
                  to={`/admin/projects/${p.slug}`}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'auto 1fr auto auto',
                    gap: 14,
                    alignItems: 'center',
                    padding: '12px 14px',
                    borderRadius: 10,
                    border: '1px solid var(--line)',
                    background: 'var(--card)',
                    textDecoration: 'none',
                    color: 'var(--fg)',
                  }}
                >
                  <span
                    className="adm-badge__dot"
                    style={{ background: p.tone, boxShadow: `0 0 8px ${p.tone}` }}
                  />
                  <div>
                    <div style={{ fontWeight: 500, fontSize: 14 }}>{p.client}</div>
                    <div style={{ fontSize: 12, color: 'var(--fg-faint)' }}>
                      {p.year} · {p.metric[0]}
                    </div>
                  </div>
                  {live ? (
                    <a
                      href={live}
                      target="_blank"
                      rel="noreferrer noopener"
                      onClick={(e) => e.stopPropagation()}
                      title={`Open live site: ${live}`}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        padding: '4px 9px',
                        borderRadius: 999,
                        background: 'var(--card)',
                        border: '1px solid rgba(61, 220, 151, 0.35)',
                        color: 'var(--fg)',
                        fontSize: 11,
                        textDecoration: 'none',
                        fontFamily: 'var(--font-mono)',
                      }}
                    >
                      <span
                        aria-hidden="true"
                        style={{
                          width: 5,
                          height: 5,
                          borderRadius: '50%',
                          background: '#3ddc97',
                          boxShadow: '0 0 5px #3ddc97',
                        }}
                      />
                      Live ↗
                    </a>
                  ) : (
                    <span />
                  )}
                  <span className="adm-badge">{p.duration}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </AdminShell>
  );
}

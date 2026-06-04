import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHero } from '@/components/layout/PageHero';
import { CTA } from '@/components/sections/CTA';
import { ProjectPreview } from '@/components/sections/ProjectPreview';
import { Icon } from '@/components/icons/Icon';
import { useProjects } from '@/admin/store';

const FILTERS = ['All', 'Brand', 'Web', 'Marketing', 'Product', 'Content', 'Ops'];

export function WorkPage() {
  const [ALL] = useProjects();
  const [filter, setFilter] = useState('All');
  const [hovered, setHovered] = useState<string | null>(null);

  useEffect(() => {
    window.__lenis?.scrollTo(0, { immediate: true }) ?? window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  const filtered = filter === 'All' ? ALL : ALL.filter((p) => p.tags.includes(filter));

  return (
    <>
      <PageHero
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Work' }]}
        eyebrow="Our work"
        title={
          <>
            Real projects.
            <br />
            <span style={{ color: 'var(--fg-dim)' }}>Real results.</span>
          </>
        }
        sub="A few of the businesses we’ve helped. Each story leads with the numbers."
        meta={[
          ['20+', 'Projects shipped'],
          ['8', 'Active clients'],
          ['4.9 / 5', 'Client rating'],
          ['100%', 'On time'],
        ]}
        secondary={{ label: 'About us', to: '/about' }}
      />

      <section className="sec" style={{ paddingTop: 80 }}>
        <div className="container">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 20,
              marginBottom: 36,
              flexWrap: 'wrap',
            }}
          >
            <div className="mono" style={{ color: 'var(--fg-faint)' }}>
              {filtered.length} {filtered.length === 1 ? 'project' : 'projects'}
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {FILTERS.map((f) => {
                const on = filter === f;
                return (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    style={{
                      padding: '8px 14px',
                      borderRadius: 999,
                      border: '1px solid transparent',
                      borderColor: on ? 'transparent' : 'var(--line)',
                      background: on ? 'var(--grad)' : 'rgba(255,255,255,0.02)',
                      color: on ? '#fff' : 'var(--fg-dim)',
                      fontSize: 13,
                      cursor: 'pointer',
                      transition: 'all .25s',
                    }}
                  >
                    {f}
                  </button>
                );
              })}
            </div>
          </div>

          <div
            className="work-grid"
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: 20 }}
          >
            {filtered.map((p) => (
              <Link
                key={p.slug}
                to={`/work/${p.slug}`}
                onMouseEnter={() => setHovered(p.slug)}
                onMouseLeave={() => setHovered(null)}
                className="card work-card"
                style={{
                  padding: 28,
                  borderRadius: 24,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 22,
                  position: 'relative',
                  overflow: 'hidden',
                  textDecoration: 'none',
                  color: 'var(--fg)',
                }}
              >
                <div
                  style={{
                    aspectRatio: '5 / 3',
                    borderRadius: 16,
                    position: 'relative',
                    overflow: 'hidden',
                    background: `
                      linear-gradient(135deg, ${p.tone}40, ${p.tone}10),
                      repeating-linear-gradient(45deg, rgba(255,255,255,0.025) 0 1px, transparent 1px 12px),
                      #0a0b13
                    `,
                    border: '1px solid var(--line)',
                  }}
                >
                  <ProjectPreview
                    images={p.images}
                    visualIdx={p.visualIdx}
                    tone={p.tone}
                    animate={hovered === p.slug}
                  />
                  <div
                    className="mono"
                    style={{
                      position: 'absolute',
                      top: 14,
                      left: 14,
                      padding: '4px 8px',
                      borderRadius: 6,
                      background: 'rgba(0,0,0,0.4)',
                      backdropFilter: 'blur(6px)',
                      color: 'rgba(236, 236, 242, 0.62)',
                    }}
                  >
                    {p.category} · {p.year}
                  </div>
                  <div
                    style={{
                      position: 'absolute',
                      top: 14,
                      right: 14,
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      background: 'rgba(0,0,0,0.5)',
                      backdropFilter: 'blur(6px)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'rgba(236, 236, 242, 0.62)',
                      border: '1px solid var(--line)',
                      transform: hovered === p.slug ? 'rotate(0)' : 'rotate(-45deg)',
                      transition: 'transform .4s cubic-bezier(.2,.7,.2,1)',

                    }}
                  >
                    <Icon.ArrowUpRight size={16} />
                  </div>
                  {p.liveUrl?.trim() && (
                    <button
                      type="button"
                      className="work-card__live"
                      style={{ left: 14, bottom: 14 }}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        window.open(p.liveUrl, '_blank', 'noopener,noreferrer');
                      }}
                      title={`Open live site: ${p.liveUrl}`}
                      aria-label={`Open live site for ${p.client} in a new tab`}
                    >
                      <span className="work-card__live-dot" aria-hidden="true" />
                      Live <Icon.ArrowUpRight size={11} />
                    </button>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: p.tone,
                        boxShadow: `0 0 10px ${p.tone}`,
                      }}
                    />
                    <span className="mono" style={{ color: 'var(--fg-dim)' }}>
                      {p.client}
                    </span>
                  </div>
                  <div className="display" style={{ fontSize: 22, fontWeight: 500, lineHeight: 1.25 }}>
                    {p.title}
                  </div>
                  <p style={{ margin: 0, color: 'var(--fg-dim)', fontSize: 14, lineHeight: 1.55 }}>
                    {p.summary}
                  </p>
                  <div
                    style={{
                      marginTop: 8,
                      paddingTop: 14,
                      borderTop: '1px solid var(--line)',
                      display: 'flex',
                      alignItems: 'baseline',
                      gap: 12,
                    }}
                  >
                    <div
                      className="display"
                      style={{
                        fontSize: 24,
                        fontWeight: 500,
                        lineHeight: 1,
                        background: `linear-gradient(90deg, ${p.tone}, var(--accent-3))`,
                        WebkitBackgroundClip: 'text',
                        backgroundClip: 'text',
                        color: 'transparent',
                      }}
                    >
                      {p.metric[0]}
                    </div>
                    <div className="mono" style={{ color: 'var(--fg-faint)', fontSize: 12 }}>
                      {p.metric[1]}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
                    {p.tags.map((t) => (
                      <span
                        key={t}
                        style={{
                          padding: '4px 10px',
                          borderRadius: 999,
                          fontSize: 12,
                          border: '1px solid var(--line)',
                          color: 'var(--fg-dim)',
                          background: 'rgba(255,255,255,0.02)',
                        }}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {filtered.length === 0 && (
            <div
              style={{
                padding: 64,
                textAlign: 'center',
                color: 'var(--fg-dim)',
                border: '1px dashed var(--line)',
                borderRadius: 20,
              }}
            >
              Nothing in this category yet. Get in touch and we'll send more examples.
            </div>
          )}
        </div>
      </section>

      <CTA />
    </>
  );
}

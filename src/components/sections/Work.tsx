import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '@/components/icons/Icon';
import { GhostButton } from '@/components/ui/GhostButton';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { ProjectPreview } from './ProjectPreview';
import { useProjects } from '@/admin/store';

export function Work() {
  const [allProjects] = useProjects();
  const PROJECTS = allProjects.slice(0, 4);
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <section id="work" className="sec">
      <div className="container">
        <SectionHeader
          eyebrow="Our work"
          title={<>Recent projects.</>}
          sub="A few examples of what we’ve built and grown."
        />

        <div className="work-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {PROJECTS.map((p) => (
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
                aspectRatio: '5 / 4',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  flex: 1,
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
                  {p.category}
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

              <div style={{ paddingTop: 22, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: p.tone,
                    }}
                  />
                  <span className="mono" style={{ color: 'var(--fg-dim)' }}>
                    {p.client}
                  </span>
                </div>
                <div className="display" style={{ fontSize: 22, fontWeight: 500, lineHeight: 1.2 }}>
                  {p.title}
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
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

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 48 }}>
          <GhostButton text="See all projects" onClick={() => { window.location.href = '/work'; }} />
        </div>
      </div>
    </section>
  );
}

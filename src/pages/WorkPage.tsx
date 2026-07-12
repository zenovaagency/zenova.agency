import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ProjectPreview } from '@/components/sections/ProjectPreview';
import { Icon } from '@/components/icons/Icon';
import { NeonButton } from '@/components/ui/NeonButton';
import { useProjects } from '@/admin/store';
import { useImageRatio, clampRatio, RATIO_BOUNDS } from '@/hooks/useImageRatio';
import type { ProjectDetail } from '@/data/projects';
import { scrollToTop } from '@/lib/scroll';
import './WorkPage.css';

const FILTERS = ['All', 'Brand', 'Web', 'Marketing', 'Product', 'Content', 'Ops'];

function LivePill({ project }: { project: ProjectDetail }) {
  if (!project.liveUrl?.trim()) return null;
  return (
    <button
      type="button"
      className="work-card__live wrk-live"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        window.open(project.liveUrl, '_blank', 'noopener,noreferrer');
      }}
      title={`Open live site: ${project.liveUrl}`}
      aria-label={`Open live site for ${project.client} in a new tab`}
    >
      <span className="work-card__live-dot" aria-hidden="true" />
      Live <Icon.ArrowUpRight size={11} />
    </button>
  );
}

function WorkRow({
  project: p,
  index: i,
  hovered,
  setHovered,
}: {
  project: ProjectDetail;
  index: number;
  hovered: string | null;
  setHovered: (slug: string | null) => void;
}) {
  const ar = clampRatio(useImageRatio(p.images?.[0]?.src), RATIO_BOUNDS.card);
  return (
    <Link
      to={`/work/${p.slug}`}
      className={`wrk-row reveal${i % 2 === 1 ? ' wrk-row--flip' : ''}`}
      style={{ '--tone': p.tone } as React.CSSProperties}
      onMouseEnter={() => setHovered(p.slug)}
      onMouseLeave={() => setHovered(null)}
    >
      <div
        className="wrk-row__visual wrk-visual"
        style={ar ? ({ '--img-ar': ar } as React.CSSProperties) : undefined}
      >
        <ProjectPreview images={p.images} visualIdx={p.visualIdx} tone={p.tone} animate={hovered === p.slug} />
        <span className="wrk-visual__chip mono">
          {p.category} · {p.year}
        </span>
        <LivePill project={p} />
      </div>
      <div className="wrk-row__body">
        <div className="wrk-row__client mono">
          <span className="wrk-dot" />
          {p.client}
        </div>
        <h3 className="wrk-row__title display">{p.title}</h3>
        <p className="wrk-row__summary">{p.summary}</p>
        <div className="wrk-row__foot">
          <span className="wrk-metric wrk-metric--sm display">{p.metric[0]}</span>
          <span className="wrk-metric__label mono">{p.metric[1]}</span>
        </div>
        <span className="wrk-row__tags mono">{p.tags.join(' / ')}</span>
      </div>
    </Link>
  );
}

export function WorkPage() {
  const [ALL] = useProjects();
  const [filter, setFilter] = useState('All');
  const [hovered, setHovered] = useState<string | null>(null);

  useEffect(() => {
    scrollToTop();
  }, []);

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    FILTERS.forEach((f) => {
      map.set(f, f === 'All' ? ALL.length : ALL.filter((p) => p.tags.includes(f)).length);
    });
    return map;
  }, [ALL]);

  const filtered = filter === 'All' ? ALL : ALL.filter((p) => p.tags.includes(filter));
  const featured = filtered[0];
  const rest = filtered.slice(1);
  const featuredAr = clampRatio(useImageRatio(featured?.images?.[0]?.src), RATIO_BOUNDS.banner);

  return (
    <div className="wrk">
      <header className="wrk-masthead">
        <div className="container">
          <div className="wrk-masthead__kicker mono reveal">
            <span className="wrk-masthead__tick" />
            Selected work
          </div>
          <h1 className="wrk-masthead__title display reveal reveal-blur reveal-d1">
            Proof,
            <br />
            <em>not promises.</em>
          </h1>
          <nav className="wrk-filters mono reveal reveal-d2" aria-label="Filter projects">
            {FILTERS.map((f) => {
              const n = counts.get(f) ?? 0;
              const on = filter === f;
              return (
                <button
                  key={f}
                  type="button"
                  className={`wrk-filter${on ? ' is-active' : ''}`}
                  disabled={n === 0}
                  onClick={() => setFilter(f)}
                >
                  {f} <sup>{n}</sup>
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {featured && (
        <section className="wrk-featured">
          <div className="container">
            <Link
              to={`/work/${featured.slug}`}
              className="wrk-featured__card reveal"
              style={{ '--tone': featured.tone } as React.CSSProperties}
              onMouseEnter={() => setHovered(featured.slug)}
              onMouseLeave={() => setHovered(null)}
            >
              <div
                className="wrk-featured__visual wrk-visual"
                style={featuredAr ? ({ '--img-ar': featuredAr } as React.CSSProperties) : undefined}
              >
                <ProjectPreview
                  images={featured.images}
                  visualIdx={featured.visualIdx}
                  tone={featured.tone}
                  animate={hovered === featured.slug}
                />
                <span className="wrk-visual__chip mono">
                  {featured.category} · {featured.year}
                </span>
                <LivePill project={featured} />
              </div>
              <div className="wrk-featured__body">
                <div className="wrk-featured__client mono">
                  <span className="wrk-dot" />
                  {featured.client}
                </div>
                <h2 className="wrk-featured__title display">{featured.title}</h2>
                <p className="wrk-featured__summary">{featured.summary}</p>
                <div className="wrk-featured__foot">
                  <span className="wrk-metric display">{featured.metric[0]}</span>
                  <span className="wrk-metric__label mono">{featured.metric[1]}</span>
                  <span className="wrk-featured__tags mono">{featured.tags.join(' / ')}</span>
                  <span className="wrk-featured__arrow">
                    <Icon.ArrowUpRight size={20} />
                  </span>
                </div>
              </div>
            </Link>
          </div>
        </section>
      )}

      {rest.length > 0 && (
        <section className="wrk-rows">
          <div className="container">
            {rest.map((p, i) => (
              <WorkRow key={p.slug} project={p} index={i} hovered={hovered} setHovered={setHovered} />
            ))}
          </div>
        </section>
      )}

      {filtered.length === 0 && (
        <section className="wrk-rows">
          <div className="container">
            <div className="wrk-empty">
              Nothing in this category yet. Get in touch and we&rsquo;ll send more examples.
            </div>
          </div>
        </section>
      )}

      <section className="wrk-cta">
        <div className="container wrk-cta__inner reveal">
          <h2 className="wrk-cta__title display">
            Your project
            <br />
            could be next.
          </h2>
          <NeonButton text="Start a project" onClick={() => { window.location.href = '/contact'; }} />
        </div>
      </section>
    </div>
  );
}

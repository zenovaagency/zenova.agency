import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, Navigate, useParams } from 'react-router-dom';
import { ProjectPreview } from '@/components/sections/ProjectPreview';
import { ImageLightbox } from '@/components/ui/ImageLightbox';
import { NeonButton } from '@/components/ui/NeonButton';
import { Icon } from '@/components/icons/Icon';
import { type ProjectDetail, type ProjectImage } from '@/data/projects';
import { useProjects } from '@/admin/store';
import { useImageRatio, clampRatio, RATIO_BOUNDS } from '@/hooks/useImageRatio';
import { scrollToTop } from '@/lib/scroll';
import './ProjectDetailPage.css';

interface PlacedImage {
  img: ProjectImage;
  fullIndex: number;
}

export function ProjectDetailPage() {
  const { slug = '' } = useParams();
  const [PROJECTS] = useProjects();
  const project = PROJECTS.find((p) => p.slug === slug);
  const [lbIndex, setLbIndex] = useState<number | null>(null);

  // Reset the lightbox when navigating to a different project. Reconciled
  // during render, not in an effect, to avoid a cascading re-render.
  const [syncedSlug, setSyncedSlug] = useState(slug);
  if (syncedSlug !== slug) {
    setSyncedSlug(slug);
    setLbIndex(null);
  }

  useEffect(() => {
    scrollToTop();
  }, [slug]);

  // Called before the early return so the hook count stays stable across renders.
  const heroSrc = project?.images?.find((img) => Boolean(img?.src))?.src;
  const bannerAr = clampRatio(useImageRatio(heroSrc), RATIO_BOUNDS.banner);

  if (!project) {
    return <Navigate to="/work" replace />;
  }

  const idx = PROJECTS.findIndex((p) => p.slug === project.slug);
  const n = PROJECTS.length;
  const prev = PROJECTS[(idx - 1 + n) % n];
  const next = PROJECTS[(idx + 1) % n];
  const images: ProjectImage[] = (project.images ?? []).filter((img) => Boolean(img?.src));
  const hasImages = images.length > 0;
  const galleryRest = images.slice(1);
  const liveUrl = project.liveUrl?.trim() || '';
  const hasLiveUrl = Boolean(liveUrl);
  const liveLabel = (() => {
    if (!hasLiveUrl) return '';
    try {
      return new URL(liveUrl).hostname.replace(/^www\./, '');
    } catch {
      return liveUrl.replace(/^https?:\/\//, '').replace(/\/+$/, '');
    }
  })();

  // Interleave the remaining gallery images between narrative sections.
  const perSection: PlacedImage[][] = project.sections.map(() => []);
  if (perSection.length > 0) {
    galleryRest.forEach((img, j) => {
      perSection[j % perSection.length].push({ img, fullIndex: j + 1 });
    });
  }

  return (
    <div className="pd" style={{ '--tone': project.tone } as React.CSSProperties}>
      <header className="pd-hero">
        <div className="container">
          <nav className="pd-crumbs mono">
            <Link to="/">Home</Link>
            <span>/</span>
            <Link to="/work">Work</Link>
            <span>/</span>
            <span className="pd-crumbs__here">{project.client}</span>
          </nav>
          <div className="pd-hero__kicker mono reveal">
            {project.category} · {project.year} · {project.industry}
          </div>
          <h1 className="pd-hero__client display reveal reveal-blur reveal-d1">{project.client}</h1>
          <p className="pd-hero__lede reveal reveal-d2">{project.hero}</p>

          <div className="pd-hero__metrics reveal reveal-d3">
            <div className="pd-hero__headline-metric">
              <span className="pd-metric display">{project.metric[0]}</span>
              <span className="pd-metric__label mono">{project.metric[1]}</span>
            </div>
            {project.metrics.map((m) => (
              <div key={m.label} className="pd-hero__stat">
                <span className="pd-hero__stat-num display">{m.num}</span>
                <span className="pd-hero__stat-label mono">{m.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="container">
          <div
            className="pd-banner"
            style={bannerAr ? ({ '--img-ar': bannerAr } as React.CSSProperties) : undefined}
          >
            {hasImages ? (
              <button
                type="button"
                className="pd-banner__open"
                onClick={() => setLbIndex(0)}
                aria-label={`Open image viewer (${images.length} ${images.length === 1 ? 'image' : 'images'})`}
              >
                <ProjectPreview images={images} visualIdx={project.visualIdx} tone={project.tone} animate />
                <span className="pd-banner__pill mono" aria-hidden="true">
                  <ExpandGlyph /> View {images.length > 1 ? `all ${images.length} images` : 'image'}
                </span>
              </button>
            ) : (
              <ProjectPreview images={images} visualIdx={project.visualIdx} tone={project.tone} animate />
            )}
            <div className="pd-banner__tags" aria-hidden="true">
              {project.tags.map((t) => (
                <span key={t} className="pd-banner__tag mono">
                  {t}
                </span>
              ))}
            </div>
            {hasLiveUrl && (
              <a className="pd-banner__live mono" href={liveUrl} target="_blank" rel="noreferrer noopener" title={liveUrl}>
                <span className="pd-banner__live-dot" aria-hidden="true" />
                Visit live site <span className="pd-banner__live-host">· {liveLabel}</span>
                <Icon.ArrowUpRight size={13} />
              </a>
            )}
          </div>
        </div>
      </header>

      <div className="container pd-article">
        <aside className="pd-facts">
          <div className="pd-facts__group">
            <div className="pd-label mono">Services</div>
            <ul className="pd-facts__list">
              {project.services.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
          <div className="pd-facts__group">
            <div className="pd-label mono">Project</div>
            <div className="pd-facts__text">
              {project.duration}
              <br />
              <span>{project.team}</span>
            </div>
          </div>
          {project.stack.length > 0 && (
            <div className="pd-facts__group">
              <div className="pd-label mono">Stack</div>
              <div className="pd-facts__chips">
                {project.stack.map((s) => (
                  <span key={s} className="pd-chip mono">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
          {project.deliverables.length > 0 && (
            <div className="pd-facts__group">
              <div className="pd-label mono">Deliverables</div>
              <ul className="pd-facts__checks">
                {project.deliverables.map((d) => (
                  <li key={d}>
                    <span className="pd-check">
                      <Icon.Check size={11} />
                    </span>
                    {d}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {hasLiveUrl && (
            <a className="pd-facts__live mono" href={liveUrl} target="_blank" rel="noreferrer noopener">
              {liveLabel} <Icon.ArrowUpRight size={12} />
            </a>
          )}
        </aside>

        <main className="pd-story">
          <h2 className="pd-story__title display">{project.title}</h2>
          {project.sections.map((s, si) => (
            <section key={s.title} className="pd-section">
              <div className="pd-section__kicker mono">{s.title}</div>
              {s.body.map((p, i) => (
                <p key={i} className="pd-section__para">
                  {p}
                </p>
              ))}
              {perSection[si]?.map(({ img, fullIndex }) => (
                <figure key={img.src + fullIndex} className="pd-figure">
                  <button
                    type="button"
                    className="pd-figure__open"
                    onClick={() => setLbIndex(fullIndex)}
                    aria-label={`Open image ${fullIndex + 1} of ${images.length}`}
                  >
                    <img src={img.src} alt={img.alt ?? ''} loading="lazy" />
                    <span className="pd-figure__index mono" aria-hidden="true">
                      {fullIndex + 1} / {images.length}
                    </span>
                  </button>
                  {img.caption && <figcaption className="pd-figure__caption mono">{img.caption}</figcaption>}
                </figure>
              ))}
            </section>
          ))}
        </main>
      </div>

      <section className="pd-quote">
        <div className="container pd-quote__inner">
          <span className="pd-quote__mark">
            <Icon.Quote size={32} />
          </span>
          <blockquote className="pd-quote__text display">“{project.testimonial.quote}”</blockquote>
          <div className="pd-quote__author">
            <span className="pd-quote__avatar display">
              {project.testimonial.author
                .split(' ')
                .map((w) => w[0])
                .join('')
                .slice(0, 2)}
            </span>
            <span className="pd-quote__who">
              <span>{project.testimonial.author}</span>
              <span className="mono">{project.testimonial.role}</span>
            </span>
          </div>
        </div>
      </section>

      {(prev.slug !== project.slug || next.slug !== project.slug) && (
        <nav className="pd-nav" aria-label="More projects">
          <div className="container pd-nav__grid">
            {prev.slug !== project.slug && <PdNavCard project={prev} dir="prev" />}
            {next.slug !== project.slug && next.slug !== prev.slug && <PdNavCard project={next} dir="next" />}
          </div>
        </nav>
      )}

      <section className="pd-cta">
        <div className="container pd-cta__inner">
          <h2 className="pd-cta__title display">
            Want results
            <br />
            like these?
          </h2>
          <NeonButton text="Start a project" onClick={() => { window.location.href = '/contact'; }} />
        </div>
      </section>

      {hasImages && <ImageLightbox images={images} index={lbIndex} onIndex={setLbIndex} />}

      {hasLiveUrl &&
        createPortal(
          <a
            href={liveUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="proj-fab"
            title={`Visit live site: ${liveUrl}`}
            aria-label={`Visit live site for ${project.client} — opens in a new tab`}
          >
            <span className="proj-fab__dot" aria-hidden="true" />
            Live site
            <Icon.ArrowUpRight size={14} />
          </a>,
          document.body,
        )}
    </div>
  );
}

function PdNavCard({ project, dir }: { project: ProjectDetail; dir: 'prev' | 'next' }) {
  return (
    <Link
      to={`/work/${project.slug}`}
      className={`pd-nav__card${dir === 'next' ? ' pd-nav__card--next' : ''}`}
      style={{ '--tone': project.tone } as React.CSSProperties}
    >
      <span className="pd-nav__dir mono">{dir === 'prev' ? '← Previous' : 'Next →'}</span>
      <span className="pd-nav__client display">{project.client}</span>
      <span className="pd-nav__meta">
        <span className="pd-nav__metric display">{project.metric[0]}</span>
        <span className="pd-nav__metric-label mono">{project.metric[1]}</span>
      </span>
    </Link>
  );
}

function ExpandGlyph() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M15 3h6v6" />
      <path d="M9 21H3v-6" />
      <path d="M21 3l-7 7" />
      <path d="M3 21l7-7" />
    </svg>
  );
}

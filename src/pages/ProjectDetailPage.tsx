import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, Navigate, useParams } from 'react-router-dom';
import { PageHero } from '@/components/layout/PageHero';
import { CTA } from '@/components/sections/CTA';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { ProjectPreview } from '@/components/sections/ProjectPreview';
import { ImageLightbox } from '@/components/ui/ImageLightbox';
import { Icon } from '@/components/icons/Icon';
import { type ProjectDetail, type ProjectImage } from '@/data/projects';
import { useProjects } from '@/admin/store';

export function ProjectDetailPage() {
  const { slug = '' } = useParams();
  const [PROJECTS] = useProjects();
  const project = PROJECTS.find((p) => p.slug === slug);
  const [lbIndex, setLbIndex] = useState<number | null>(null);

  useEffect(() => {
    window.__lenis?.scrollTo(0, { immediate: true }) ?? window.scrollTo({ top: 0, behavior: 'auto' });
    setLbIndex(null);
  }, [slug]);

  if (!project) {
    return <Navigate to="/work" replace />;
  }

  const idx = PROJECTS.findIndex((p) => p.slug === project.slug);
  const next = PROJECTS[(idx + 1) % PROJECTS.length];
  const images: ProjectImage[] = (project.images ?? []).filter((img) => Boolean(img?.src));
  const hasImages = images.length > 0;
  const hasGallery = images.length > 1;
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

  return (
    <>
      <PageHero
        crumbs={[
          { label: 'Home', to: '/' },
          { label: 'Work', to: '/work' },
          { label: project.client },
        ]}
        eyebrow={`${project.category} · ${project.year}`}
        title={
          <>
            {project.client}
            <br />
            <span style={{ color: 'var(--fg-dim)' }}>{project.industry}</span>
          </>
        }
        sub={project.hero}
        meta={[
          [project.metric[0], project.metric[1]],
          [project.duration, 'Duration'],
          [project.team, 'Team'],
          [project.year, 'Launched'],
        ]}
        secondary={{ label: 'Back to work', to: '/work' }}
      />

      <section className="sec" style={{ paddingTop: 56 }}>
        <div className="container">
          <div
            className="proj-detail-hero"
            style={{
              background: `
                linear-gradient(135deg, ${project.tone}40, ${project.tone}10),
                repeating-linear-gradient(45deg, rgba(255,255,255,0.025) 0 1px, transparent 1px 12px),
                #0a0b13
              `,
            }}
          >
            {hasImages ? (
              <button
                type="button"
                className="proj-hero"
                onClick={() => setLbIndex(0)}
                aria-label={`Open image viewer (${images.length} ${images.length === 1 ? 'image' : 'images'})`}
              >
                <ProjectPreview
                  images={images}
                  visualIdx={project.visualIdx}
                  tone={project.tone}
                  animate
                />
                <span className="proj-hero__expand" aria-hidden="true">
                  <span className="proj-hero__expand-pill">
                    <ExpandGlyph /> View image
                  </span>
                </span>
              </button>
            ) : (
              <ProjectPreview
                images={images}
                visualIdx={project.visualIdx}
                tone={project.tone}
                animate
              />
            )}
            <div
              style={{
                position: 'absolute',
                left: 24,
                bottom: 24,
                display: 'flex',
                gap: 8,
                flexWrap: 'wrap',
                pointerEvents: 'none',
              }}
            >
              {project.tags.map((t) => (
                <span
                  key={t}
                  className="mono"
                  style={{
                    padding: '6px 12px',
                    borderRadius: 999,
                    background: 'rgba(0,0,0,0.45)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid var(--line)',
                    color: 'var(--fg)',
                    fontSize: 11,
                  }}
                >
                  {t}
                </span>
              ))}
            </div>
            <div
              style={{
                position: 'absolute',
                right: 24,
                top: 24,
                padding: '8px 14px',
                borderRadius: 999,
                background: 'rgba(0,0,0,0.45)',
                backdropFilter: 'blur(8px)',
                border: '1px solid var(--line)',
                color: 'var(--fg-dim)',
                fontSize: 13,
                pointerEvents: 'none',
              }}
            >
              {project.industry}
            </div>
            {hasGallery && (
              <button
                type="button"
                className="proj-gallery__view-all"
                onClick={() => setLbIndex(0)}
                style={{
                  position: 'absolute',
                  right: 24,
                  bottom: 24,
                  background: 'rgba(0,0,0,0.55)',
                  color: '#fff',
                  borderColor: 'rgba(255,255,255,0.18)',
                  backdropFilter: 'blur(8px)',
                }}
              >
                <ExpandGlyph /> View all {images.length} images
              </button>
            )}
            {hasLiveUrl && (
              <a
                href={liveUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="proj-live"
                style={{
                  position: 'absolute',
                  left: 24,
                  top: 24,
                }}
                title={liveUrl}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: '#3ddc97',
                    boxShadow: '0 0 8px #3ddc97',
                  }}
                  aria-hidden="true"
                />
                Visit live site
                <span style={{ color: 'rgba(255,255,255,0.55)' }}>· {liveLabel}</span>
                <Icon.ArrowUpRight size={13} />
              </a>
            )}
          </div>
        </div>
      </section>

      {hasGallery && (
        <section className="sec" style={{ paddingTop: 56 }}>
          <div className="container">
            <div
              style={{
                display: 'flex',
                alignItems: 'baseline',
                justifyContent: 'space-between',
                gap: 16,
                marginBottom: 18,
                flexWrap: 'wrap',
              }}
            >
              <div>
                <div
                  className="mono"
                  style={{
                    color: project.tone,
                    fontSize: 12,
                    letterSpacing: '0.12em',
                    marginBottom: 6,
                  }}
                >
                  Gallery
                </div>
                <h3
                  className="display"
                  style={{
                    margin: 0,
                    fontSize: 'clamp(22px, 2.4vw, 28px)',
                    fontWeight: 500,
                    lineHeight: 1.2,
                  }}
                >
                  {images.length} images
                </h3>
              </div>
              <button
                type="button"
                className="proj-gallery__view-all"
                onClick={() => setLbIndex(0)}
              >
                <ExpandGlyph /> View all
              </button>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: 16,
              }}
            >
              {galleryRest.map((img, i) => {
                const fullIndex = i + 1;
                return (
                  <figure
                    key={img.src + i}
                    style={{
                      margin: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                    }}
                  >
                    <button
                      type="button"
                      className="proj-thumb"
                      onClick={() => setLbIndex(fullIndex)}
                      aria-label={`Open image ${fullIndex + 1}`}
                    >
                      <span className="proj-thumb__frame">
                        <img src={img.src} alt={img.alt ?? ''} loading="lazy" />
                        <span className="proj-thumb__index">
                          {fullIndex + 1} / {images.length}
                        </span>
                      </span>
                    </button>
                    {img.caption && (
                      <figcaption
                        className="mono"
                        style={{ color: 'var(--fg-faint)', fontSize: 12 }}
                      >
                        {img.caption}
                      </figcaption>
                    )}
                  </figure>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <section className="sec" style={{ paddingTop: 56 }}>
        <div
          className="container"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}
        >
          {project.metrics.map((m) => (
            <div
              key={m.label}
              className="card"
              style={{
                padding: 26,
                borderRadius: 20,
                border: '1px solid var(--line)',
                background: `linear-gradient(160deg, ${project.tone}1a, rgba(255,255,255,0.005))`,
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}
            >
              <div
                className="display"
                style={{
                  fontSize: 'clamp(28px, 3vw, 38px)',
                  fontWeight: 500,
                  background: `linear-gradient(90deg, ${project.tone}, var(--accent-3))`,
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  color: 'transparent',
                }}
              >
                {m.num}
              </div>
              <div style={{ color: 'var(--fg-dim)', fontSize: 13, lineHeight: 1.45 }}>{m.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="sec" style={{ paddingTop: 56 }}>
        <div className="container proj-narrative">
          <aside
            className="proj-narrative__aside"
            style={{
              position: 'sticky',
              top: 110,
              display: 'flex',
              flexDirection: 'column',
              gap: 22,
            }}
          >
            <div>
              <div className="mono" style={{ color: 'var(--fg-faint)', marginBottom: 8 }}>
                Services
              </div>
              <ul
                style={{
                  margin: 0,
                  padding: 0,
                  listStyle: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                }}
              >
                {project.services.map((s) => (
                  <li key={s} style={{ color: 'var(--fg)', fontSize: 14 }}>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="mono" style={{ color: 'var(--fg-faint)', marginBottom: 8 }}>
                Project
              </div>
              <div style={{ color: 'var(--fg)', fontSize: 14, lineHeight: 1.6 }}>
                {project.duration}
                <br />
                <span style={{ color: 'var(--fg-dim)' }}>{project.team}</span>
              </div>
            </div>
            <div>
              <div className="mono" style={{ color: 'var(--fg-faint)', marginBottom: 8 }}>
                Stack
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {project.stack.map((s) => (
                  <span
                    key={s}
                    className="mono"
                    style={{
                      padding: '5px 10px',
                      borderRadius: 999,
                      border: '1px solid var(--line)',
                      background: 'rgba(255,255,255,0.025)',
                      color: 'var(--fg-dim)',
                      fontSize: 10,
                    }}
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </aside>

          <article style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
            <h2
              className="display"
              style={{ margin: 0, fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 500, lineHeight: 1.05 }}
            >
              {project.title}
            </h2>
            {project.sections.map((s) => (
              <div key={s.title} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div
                  className="mono"
                  style={{ color: project.tone, fontSize: 12, letterSpacing: '0.12em' }}
                >
                  {s.title}
                </div>
                {s.body.map((p, i) => (
                  <p
                    key={i}
                    style={{ margin: 0, color: 'var(--fg-dim)', fontSize: 17, lineHeight: 1.7 }}
                  >
                    {p}
                  </p>
                ))}
              </div>
            ))}

            <div
              className="card"
              style={{
                padding: 28,
                borderRadius: 20,
                border: '1px solid var(--line)',
                background: 'linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.005))',
              }}
            >
              <div
                className="mono"
                style={{ color: project.tone, fontSize: 12, letterSpacing: '0.12em', marginBottom: 14 }}
              >
                Deliverables
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '10px 18px',
                }}
              >
                {project.deliverables.map((d) => (
                  <div
                    key={d}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      color: 'var(--fg)',
                      fontSize: 14,
                    }}
                  >
                    <span
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: 6,
                        border: `1px solid ${project.tone}40`,
                        background: `${project.tone}1a`,
                        color: project.tone,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Icon.Check size={11} />
                    </span>
                    {d}
                  </div>
                ))}
              </div>
            </div>
          </article>
        </div>
      </section>

      <section className="sec" style={{ paddingTop: 56 }}>
        <div className="container" style={{ maxWidth: 920 }}>
          <div
            className={`card proj-testimonial`}
            style={{
              background: `linear-gradient(135deg, ${project.tone}22, rgba(255,255,255,0.01))`,
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: -100,
                right: -100,
                width: 360,
                height: 360,
                borderRadius: '50%',
                background: `radial-gradient(circle, ${project.tone}55, transparent 60%)`,
                filter: 'blur(60px)',
              }}
            />
            <div style={{ position: 'relative' }}>
              <Icon.Quote size={36} />
              <p
                className="display"
                style={{
                  margin: '20px 0 28px',
                  fontSize: 'clamp(22px, 2.6vw, 32px)',
                  fontWeight: 500,
                  lineHeight: 1.35,
                }}
              >
                “{project.testimonial.quote}”
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${project.tone}, var(--accent-3))`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontFamily: 'var(--font-display)',
                    fontWeight: 600,
                  }}
                >
                  {project.testimonial.author
                    .split(' ')
                    .map((w) => w[0])
                    .join('')
                    .slice(0, 2)}
                </div>
                <div>
                  <div style={{ color: 'var(--fg)', fontSize: 15 }}>{project.testimonial.author}</div>
                  <div className="mono" style={{ color: 'var(--fg-faint)' }}>
                    {project.testimonial.role}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="sec" style={{ paddingTop: 56 }}>
        <div className="container">
          <SectionHeader
            eyebrow="Next project"
            title={<>{next.client}</>}
            sub={next.summary}
          />
          <NextProjectCard project={next} />
        </div>
      </section>

      <CTA />

      {hasImages && (
        <ImageLightbox images={images} index={lbIndex} onIndex={setLbIndex} />
      )}

      {hasLiveUrl && createPortal(
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
    </>
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

function NextProjectCard({ project }: { project: ProjectDetail }) {
  return (
    <Link
      to={`/work/${project.slug}`}
      className="card proj-next-card"
    >
      <div
        style={{
          aspectRatio: '5 / 3',
          borderRadius: 18,
          position: 'relative',
          overflow: 'hidden',
          background: `
            linear-gradient(135deg, ${project.tone}40, ${project.tone}10),
            repeating-linear-gradient(45deg, rgba(255,255,255,0.025) 0 1px, transparent 1px 12px),
            #0a0b13
          `,
          border: '1px solid var(--line)',
        }}
      >
        <ProjectPreview
          images={project.images}
          visualIdx={project.visualIdx}
          tone={project.tone}
          animate
        />
        {project.liveUrl?.trim() && (
          <button
            type="button"
            className="work-card__live"
            style={{ left: 14, bottom: 14 }}
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
        )}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 14 }}>
        <div className="mono" style={{ color: 'var(--fg-faint)' }}>
          {project.category} · {project.year}
        </div>
        <div className="display" style={{ fontSize: 28, fontWeight: 500, lineHeight: 1.2 }}>
          {project.title}
        </div>
        <div
          className="display"
          style={{
            fontSize: 36,
            fontWeight: 500,
            background: `linear-gradient(90deg, ${project.tone}, var(--accent-3))`,
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
          }}
        >
          {project.metric[0]}
        </div>
        <div style={{ color: 'var(--fg-dim)', fontSize: 14 }}>{project.metric[1]}</div>
        <div
          className="mono"
          style={{
            marginTop: 6,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            color: 'var(--accent-3)',
          }}
        >
          See the project <Icon.Arrow size={12} />
        </div>
      </div>
    </Link>
  );
}

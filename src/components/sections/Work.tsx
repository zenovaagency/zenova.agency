import { useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { GhostButton } from '@/components/ui/GhostButton';
import { useProjects } from '@/admin/store';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import type { ProjectDetail } from '@/data/projects';
import './Work.css';

function initialsOf(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function EmberRow({
  project,
  index,
  reduced,
}: {
  project: ProjectDetail;
  index: number;
  reduced: boolean;
}) {
  const ref = useRef<HTMLElement>(null);
  // Sweep direction alternates per row: even → left-to-right, odd → right-to-left.
  const dir = index % 2 === 0 ? 1 : -1;

  // Burn-line progress: scrubbed while the row travels from 92% to 45% of the
  // viewport, so scrolling back re-covers the row in reverse.
  const { scrollYProgress: sweep } = useScroll({
    target: ref,
    offset: ['start 0.92', 'start 0.45'],
  });
  // Full traversal of the viewport, for the slow parallax drifts.
  const { scrollYProgress: drift } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const coverX = useTransform(sweep, [0, 1], ['0%', `${dir * 118}%`]);
  const settleX = useTransform(sweep, [0, 0.85], [dir * -28, 0]);
  const ghostY = useTransform(drift, [0, 1], [70, -40]);
  const ghostOpacity = useTransform(sweep, [0, 0.35], [0, 1]);
  const mediaY = useTransform(drift, [0, 1], [26, -26]);

  const [metricNum, metricLabel] = project.metric;
  const images = project.images ?? [];

  return (
    <article
      ref={ref}
      className="ember-row"
      data-dir={dir === 1 ? 'ltr' : 'rtl'}
      style={{ '--tone': project.tone } as React.CSSProperties}
    >
      <motion.span
        className="ember-row__rule"
        aria-hidden
        style={reduced ? undefined : { scaleX: sweep }}
      />

      <div className="ember-row__mask">
        <motion.span
          className="display ember-row__index"
          aria-hidden
          style={reduced ? undefined : { y: ghostY, opacity: ghostOpacity }}
        >
          {String(index + 1).padStart(2, '0')}
        </motion.span>

        <div className="ember-row__grid">
          <motion.div className="ember-row__text" style={reduced ? undefined : { x: settleX }}>
            <span className="mono ember-row__kicker">
              <span className="ember-row__client">{project.client}</span>
              <span aria-hidden>—</span>
              {project.category} · {project.year}
            </span>

            <h3 className="display ember-row__title">
              <Link to={`/work/${project.slug}`}>{project.title}</Link>
            </h3>

            <p className="ember-row__summary">{project.summary}</p>

            <div className="ember-row__stat">
              <span className="ember-row__stat-num">{metricNum}</span>
              <span className="mono ember-row__stat-label">{metricLabel}</span>
            </div>

            {project.tags.length > 0 && (
              <div className="ember-row__tags">
                {project.tags.map((tag) => (
                  <span key={tag} className="mono ember-row__tag">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <Link to={`/work/${project.slug}`} className="mono ember-row__cta">
              View case study <span aria-hidden>→</span>
            </Link>
          </motion.div>

          <motion.div
            className="ember-row__media-wrap"
            style={reduced ? undefined : { y: mediaY }}
          >
            <Link
              to={`/work/${project.slug}`}
              className="ember-row__media"
              aria-label={`View ${project.client} case study`}
            >
              {images.length > 0 ? (
                <img src={images[0].src} alt={images[0].alt ?? project.client} loading="lazy" />
              ) : (
                <div
                  className="ember-row__media-fallback"
                  style={{
                    background: `linear-gradient(135deg, ${project.tone}35, ${project.tone}08)`,
                  }}
                >
                  <span className="ember-row__media-initials">{initialsOf(project.client)}</span>
                </div>
              )}
            </Link>
          </motion.div>
        </div>

        {!reduced && (
          <motion.div
            className="ember-row__cover"
            aria-hidden
            style={{ x: coverX, skewX: dir * -10 }}
          />
        )}
      </div>
    </article>
  );
}

export function Work() {
  const [allProjects] = useProjects();
  const navigate = useNavigate();
  const reduced = useMediaQuery('(prefers-reduced-motion: reduce)');
  const projects = allProjects.slice(0, 4);

  return (
    <section id="work" className="sec" style={{ padding: '120px 0' }}>
      <div className="container">
        <SectionHeader
          eyebrow="Our work"
          title={<>Recent projects.</>}
          sub="A few examples of what we’ve built and grown."
        />

        <div className="ember-ledger">
          {projects.map((p, i) => (
            <EmberRow key={p.slug} project={p} index={i} reduced={reduced} />
          ))}
        </div>

        <div className="ember-ledger__footer">
          <GhostButton text="See all projects" onClick={() => navigate('/work')} />
        </div>
      </div>
    </section>
  );
}

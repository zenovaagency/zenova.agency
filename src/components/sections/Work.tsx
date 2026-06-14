import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { GhostButton } from '@/components/ui/GhostButton';
import { useProjects } from '@/admin/store';
import type { ProjectDetail, ProjectImage } from '@/data/projects';

function HoverSlideshow({
  images,
  fallback,
}: {
  images: ProjectImage[];
  fallback: { tone: string; client: string };
}) {
  const [active, setActive] = useState(0);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    if (!hovered || images.length <= 1) return;
    const interval = setInterval(() => {
      setActive((prev) => (prev + 1) % images.length);
    }, 1500);
    return () => clearInterval(interval);
  }, [hovered, images.length]);

  if (images.length === 0) {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: `linear-gradient(135deg, ${fallback.tone}35, ${fallback.tone}08)`,
        }}
      />
    );
  }

  return (
    <div
      style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {images.map((img, i) => (
        <motion.div
          key={img.src}
          initial={false}
          animate={{
            opacity: i === active ? 1 : 0,
            x: i === active ? '0%' : i < active ? '-100%' : '100%',
          }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
          }}
        >
          <img
            src={img.src}
            alt={img.alt ?? fallback.client}
            loading="lazy"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        </motion.div>
      ))}
    </div>
  );
}

function CaseStudyCard({ project, reversed, index }: { project: ProjectDetail; reversed: boolean; index: number }) {
  const images = project.images ?? [];

  return (
    <motion.div
      className="card work-case-card"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{
        duration: 0.7,
        delay: index * 0.1,
        ease: [0.16, 1, 0.3, 1],
      }}
      whileHover={{ y: -6 }}
      style={{
        display: 'grid',
        gridTemplateColumns: reversed ? '1fr 1.15fr' : '1.15fr 1fr',
        gap: 48,
        alignItems: 'center',
        padding: 40,
        borderRadius: 28,
        border: '1px solid var(--line)',
        background: 'var(--card)',
        boxShadow: 'var(--card-shadow)',
        cursor: 'default',
      }}
    >
      <motion.div
        style={{
          order: reversed ? 2 : 1,
          borderRadius: 20,
          overflow: 'hidden',
          border: '1px solid var(--line)',
        }}
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <Link
          to={`/work/${project.slug}`}
          style={{
            display: 'block',
            width: '100%',
            aspectRatio: '4 / 3',
          }}
        >
          <HoverSlideshow images={images} fallback={{ tone: project.tone, client: project.client }} />
        </Link>
      </motion.div>

      <motion.div
        style={{ order: reversed ? 1 : 2, display: 'flex', flexDirection: 'column', gap: 20 }}
        initial={{ opacity: 0, x: reversed ? -30 : 30 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6, delay: index * 0.1 + 0.2, ease: [0.16, 1, 0.3, 1] }}
      >
        <Link to={`/work/${project.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
          <h3
            className="display"
            style={{
              fontSize: 'clamp(22px, 2.8vw, 32px)',
              fontWeight: 500,
              lineHeight: 1.15,
              margin: 0,
            }}
          >
            {project.title}
          </h3>
        </Link>

        <p style={{ margin: 0, color: 'var(--fg-dim)', fontSize: 15, lineHeight: 1.65 }}>
          {project.summary}
        </p>

        {project.testimonial?.quote && (
          <p
            style={{
              margin: 0,
              color: 'var(--fg-dim)',
              fontSize: 14,
              lineHeight: 1.6,
              borderLeft: `2px solid ${project.tone}`,
              paddingLeft: 16,
            }}
          >
            “{project.testimonial.quote}”
          </p>
        )}

        {project.testimonial?.author && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: `${project.tone}20`,
                border: `1px solid ${project.tone}50`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: project.tone,
                fontFamily: 'var(--font-mono)',
                fontSize: 12,
              }}
            >
              {project.testimonial.author
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--fg)' }}>
                {project.testimonial.author}
              </span>
              <span style={{ fontSize: 13, color: 'var(--fg-dim)' }}>{project.testimonial.role}</span>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

export function Work() {
  const [allProjects] = useProjects();
  const PROJECTS = allProjects.slice(0, 4);

  return (
    <section id="work" className="sec" style={{ padding: '120px 0' }}>
      <div className="container">
        <SectionHeader
          eyebrow="Our work"
          title={<>Recent projects.</>}
          sub="A few examples of what we’ve built and grown."
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 40, marginTop: 72 }}>
          {PROJECTS.map((p, idx) => (
            <CaseStudyCard key={p.slug} project={p} reversed={idx % 2 === 1} index={idx} />
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 64 }}>
          <GhostButton text="See all projects" onClick={() => { window.location.href = '/work'; }} />
        </div>
      </div>
    </section>
  );
}

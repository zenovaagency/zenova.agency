'use client';
import { useEffect, useRef, useState } from 'react';
import { Link } from '@/lib/router';
import { Icon } from '@/components/icons/Icon';
import { ServiceMedia } from '@/components/sections/ServiceMedia';
import { NeonButton } from '@/components/ui/NeonButton';
import { GhostButton } from '@/components/ui/GhostButton';
import { useServices } from '@/admin/store';
import { scrollToElement } from '@/lib/scroll';
import './ServicesPage.css';

interface Pillar {
  tag: string;
  title: string;
  blurb: string;
  hue: string;
}

const PILLARS: Pillar[] = [
  {
    tag: 'Build',
    title: 'Design + Development',
    blurb: 'Websites, web apps, and brands — built to last and easy to maintain.',
    hue: '#ff813a',
  },
  {
    tag: 'Grow',
    title: 'Marketing + Content',
    blurb: 'Get more customers with SEO, ads, and content that actually works.',
    hue: '#e06820',
  },
  {
    tag: 'Run',
    title: 'Operations + Support',
    blurb: 'Better tools and processes so your team can scale faster.',
    hue: '#ff9a5c',
  },
];

interface Phase {
  n: string;
  title: string;
  weeks: string;
  blurb: string[];
  out: string;
  hue: string;
}

interface FAQ {
  q: string;
  a: string;
}

const PHASES: Phase[] = [
  {
    n: '01',
    title: 'Discover',
    weeks: 'Week 1',
    blurb: [
      'A working session to map what exists, what’s broken, and what “done” looks like — ending with a project plan and real success metrics.',
    ],
    out: 'Project plan + success metrics',
    hue: '#ff813a',
  },
  {
    n: '02',
    title: 'Design',
    weeks: 'Week 2 – 4',
    blurb: [
      'Brand, layout, and flows take shape in the open, landing in a clickable prototype you can test with real users before we write production code.',
    ],
    out: 'Clickable prototype',
    hue: '#e06820',
  },
  {
    n: '03',
    title: 'Build',
    weeks: 'Week 5 – 7',
    blurb: [
      'We code the real thing — fast, accessible, easy to update — with weekly demos on a staging link and daily updates in Slack.',
    ],
    out: 'Staging site + weekly demos',
    hue: '#cc6622',
  },
  {
    n: '04',
    title: 'Launch + Grow',
    weeks: 'Week 8 +',
    blurb: [
      'A clean go-live checklist and handoff, then we shift to growth — or hand you the keys entirely. Your call.',
    ],
    out: 'Live site + growth plan',
    hue: '#ff9a5c',
  },
];

const PROCESS_FAQS: FAQ[] = [
  { q: 'How soon can we start?', a: 'Usually 1 to 2 weeks after our intro call.' },
  { q: 'How do you keep things on track?', a: 'Weekly demos, daily updates in Slack. You always know where we are.' },
  { q: 'What if scope changes?', a: 'It happens. We log it, give you a new timeline, and you approve before we move.' },
  { q: 'Can you work with our team?', a: 'Yes. We often plug into existing teams and follow your conventions.' },
];

export function ServicesPage() {
  const [SERVICES] = useServices();
  const [hovered, setHovered] = useState<string | null>(null);
  const [active, setActive] = useState(0);
  const blockRefs = useRef<Array<HTMLElement | null>>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActive(Number((entry.target as HTMLElement).dataset.idx));
          }
        });
      },
      { rootMargin: '-40% 0px -50% 0px' },
    );
    blockRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const jumpTo = (idx: number) => {
    const el = blockRefs.current[idx];
    if (!el) return;
    scrollToElement(el, -140);
  };

  const count = String(SERVICES.length).padStart(2, '0');

  return (
    <div className="svx">
      <header className="svx-hero">
        <div className="container">
          <div className="svx-hero__kicker mono reveal">
            <span className="svx-hero__tick" />
            Services — index of {count}
          </div>
          <h1 className="svx-hero__title display reveal reveal-blur reveal-d1">
            Every discipline
            <br />
            <em>under one roof.</em>
          </h1>
          <p className="svx-hero__sub reveal reveal-d2">
            Design, build, and grow your business without juggling agencies. Pick a service below — most
            projects combine two or three.
          </p>
        </div>
      </header>

      <div className="svx-pillars">
        <div className="container svx-pillars__row">
          {PILLARS.map((p, i) => (
            <div
              key={p.tag}
              className="svx-pillar reveal"
              style={{ '--hue': p.hue, '--reveal-delay': `${i * 0.08}s` } as React.CSSProperties}
            >
              <span className="svx-pillar__tag mono">{p.tag}</span>
              <span className="svx-pillar__title display">{p.title}</span>
              <span className="svx-pillar__blurb">{p.blurb}</span>
            </div>
          ))}
        </div>
      </div>

      <section className="svx-index">
        <div className="container">
          {SERVICES.map((s, i) => (
            <Link
              key={s.slug}
              to={`/services/${s.slug}`}
              className="svx-row reveal"
              style={{ '--hue': s.hue } as React.CSSProperties}
              onMouseEnter={() => setHovered(s.slug)}
              onMouseLeave={() => setHovered(null)}
            >
              <span className="svx-row__num mono">{String(i + 1).padStart(2, '0')}</span>
              <span className="svx-row__main">
                <span className="svx-row__title display">{s.title}</span>
                <span className="svx-row__short">{s.short}</span>
              </span>
              <span className="svx-row__meta mono">
                <span className="svx-row__tag">{s.tag}</span>
                <span className="svx-row__stat">
                  {s.stat[0]} {s.stat[1]}
                </span>
              </span>
              <span className="svx-row__arrow">
                <Icon.ArrowUpRight size={22} />
              </span>
              <span className="svx-row__preview" aria-hidden="true">
                <ServiceMedia
                  image={s.image}
                  video={s.video}
                  visual={s.visual}
                  hue={s.hue}
                  active={hovered === s.slug}
                  alt=""
                  loading="lazy"
                  objectFit="cover"
                />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="prc-intro" id="process">
        <div className="container">
          <div className="prc-intro__kicker mono reveal">
            <span className="prc-intro__tick" />
            Our process — 4 phases · 8 weeks
          </div>
          <h2 className="prc-intro__title display reveal reveal-blur reveal-d1">
            A simple process,
            <br />
            <em>documented.</em>
          </h2>
          <p className="prc-intro__sub reveal reveal-d2">
            Four phases. Clear deliverables. Weekly demos. This is the exact playbook every project runs
            on — no surprises, no mystery sprints.
          </p>
        </div>
      </section>

      <section className="prc-phases">
        <div className="container prc-phases__grid">
          <aside className="prc-rail">
            <div className="prc-rail__label mono">Phases</div>
            {PHASES.map((p, i) => (
              <button
                key={p.n}
                type="button"
                className={`prc-rail__item${active === i ? ' is-active' : ''}`}
                style={{ '--hue': p.hue } as React.CSSProperties}
                onClick={() => jumpTo(i)}
              >
                <span className="prc-rail__num mono">{p.n}</span>
                <span className="prc-rail__title">{p.title}</span>
                <span className="prc-rail__weeks mono">{p.weeks}</span>
              </button>
            ))}
          </aside>

          <div className="prc-steps">
            {PHASES.map((p, i) => (
              <article
                key={p.n}
                data-idx={i}
                ref={(el) => {
                  blockRefs.current[i] = el;
                }}
                className="prc-step reveal"
                style={{ '--hue': p.hue } as React.CSSProperties}
              >
                <div className="prc-step__head">
                  <span className="prc-step__num display">{p.n}</span>
                  <div>
                    <h3 className="prc-step__title display">{p.title}</h3>
                    <div className="prc-step__weeks mono">{p.weeks}</div>
                  </div>
                </div>
                {p.blurb.map((para) => (
                  <p key={para.slice(0, 24)} className="prc-step__body">
                    {para}
                  </p>
                ))}
                <div className="prc-step__out">
                  <span className="prc-step__out-label mono">Output →</span>
                  <span className="prc-step__out-value">{p.out}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="prc-faq">
        <div className="container">
          <div className="prc-faq__label mono reveal">Common questions</div>
          {PROCESS_FAQS.map((f, i) => (
            <div
              key={f.q}
              className="prc-faq__row reveal"
              style={{ '--reveal-delay': `${(i % 2) * 0.08}s` } as React.CSSProperties}
            >
              <h3 className="prc-faq__q display">{f.q}</h3>
              <p className="prc-faq__a">{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="svx-cta">
        <div className="container svx-cta__inner reveal">
          <h2 className="svx-cta__title display">
            Let&rsquo;s build
            <br />
            it.
          </h2>
          <p className="svx-cta__sub">
            Tell us what you&rsquo;re trying to do — we&rsquo;ll tell you what we&rsquo;d build.
          </p>
          <div className="svx-cta__actions">
            <NeonButton text="Get in touch" to="/contact" />
            <GhostButton text="See pricing" to="/pricing" />
          </div>
        </div>
      </section>
    </div>
  );
}

import { useEffect } from 'react';
import { PageHero } from '@/components/layout/PageHero';
import { Services } from '@/components/sections/Services';
import { CTA } from '@/components/sections/CTA';
import { Icon } from '@/components/icons/Icon';
import { SectionHeader } from '@/components/ui/SectionHeader';

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
    hue: '#3a5bff',
  },
  {
    tag: 'Grow',
    title: 'Marketing + Content',
    blurb: 'Get more customers with SEO, ads, and content that actually works.',
    hue: '#6d4cff',
  },
  {
    tag: 'Run',
    title: 'Operations + Support',
    blurb: 'Better tools and processes so your team can scale faster.',
    hue: '#a855f7',
  },
];

export function ServicesPage() {
  useEffect(() => {
    window.__lenis?.scrollTo(0, { immediate: true }) ?? window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  return (
    <>
      <PageHero
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Services' }]}
        eyebrow="Services"
        title={
          <>
            Five services.
            <br />
            <span style={{ color: 'var(--fg-dim)' }}>One team.</span>
          </>
        }
        sub="Everything you need to design, build, and grow your business — without juggling agencies."
        meta={[
          ['5', 'Services'],
          ['20+', 'Projects shipped'],
          ['4.9 / 5', 'Client rating'],
          ['6 – 10 wks', 'Typical build'],
        ]}
        secondary={{ label: 'See our process', to: '/process' }}
      />

      <section className="sec" style={{ paddingTop: 80 }}>
        <div className="container">
          <SectionHeader
            align="center"
            eyebrow="What we do"
            title={<>Three areas, one team.</>}
            sub="Most projects combine two or three. Scroll down to see all five services in detail."
          />
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 20,
            }}
          >
            {PILLARS.map((p) => (
              <div
                key={p.tag}
                className="card"
                style={{
                  padding: 32,
                  borderRadius: 20,
                  border: '1px solid var(--line)',
                  background: `linear-gradient(160deg, ${p.hue}18, rgba(255,255,255,0.02))`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16,
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: -40,
                    right: -40,
                    width: 160,
                    height: 160,
                    borderRadius: '50%',
                    background: `radial-gradient(circle, ${p.hue}33, transparent 60%)`,
                    filter: 'blur(20px)',
                    pointerEvents: 'none',
                  }}
                />
                <span
                  className="mono"
                  style={{
                    alignSelf: 'flex-start',
                    padding: '6px 12px',
                    borderRadius: 999,
                    border: `1px solid ${p.hue}55`,
                    background: `${p.hue}15`,
                    color: p.hue,
                    fontSize: 11,
                    letterSpacing: '0.1em',
                    position: 'relative',
                  }}
                >
                  {p.tag}
                </span>
                <h3
                  className="display"
                  style={{ fontSize: 24, fontWeight: 500, margin: 0, position: 'relative' }}
                >
                  {p.title}
                </h3>
                <p
                  style={{
                    margin: 0,
                    color: 'var(--fg-dim)',
                    fontSize: 15,
                    lineHeight: 1.6,
                    position: 'relative',
                  }}
                >
                  {p.blurb}
                </p>
                <div
                  className="mono"
                  style={{
                    marginTop: 'auto',
                    paddingTop: 18,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    color: 'var(--fg-dim)',
                    fontSize: 12,
                    position: 'relative',
                  }}
                >
                  See all services <Icon.Chevron size={12} dir="down" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Services />
      <CTA />
    </>
  );
}

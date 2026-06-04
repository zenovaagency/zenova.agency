import { useEffect } from 'react';
import { PageHero } from '@/components/layout/PageHero';
import { CTA } from '@/components/sections/CTA';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Icon, type IconName, type IconComponent } from '@/components/icons/Icon';
import { useTeam, useBrand, useContent } from '@/admin/store';

export function AboutPage() {
  const [TEAM] = useTeam();
  const [brand] = useBrand();
  const [content] = useContent();
  const LOCATIONS = brand.locations;
  const VALUES = content.about?.values ?? [];
  const ROLES = content.about?.roles ?? [];
  const TIMELINE = content.about?.timeline ?? [];

  useEffect(() => {
    window.__lenis?.scrollTo(0, { immediate: true }) ?? window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  return (
    <>
      <PageHero
        crumbs={[{ label: 'Home', to: '/' }, { label: 'About' }]}
        eyebrow="About"
        title={
          <>
            A small team
            <br />
            <span style={{ color: 'var(--fg-dim)' }}>doing big work.</span>
          </>
        }
        sub="We're a small studio that handles design, development, and growth — all under one roof."
        meta={[
          ['2019', 'Founded'],
          ['18', 'Team'],
          ['2', 'Cities'],
          ['8', 'Active clients'],
        ]}
        secondary={{ label: 'See our work', to: '/work' }}
      />

      <section className="sec" style={{ paddingTop: 80 }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 64 }}>
          <div>
            <div
              className="mono"
              style={{
                color: 'var(--fg-faint)',
                marginBottom: 18,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <span style={{ width: 24, height: 1, background: 'var(--accent-2)' }} />
              Our story
            </div>
            <h2 className="display" style={{ fontSize: 'clamp(32px,4vw,52px)', margin: 0, fontWeight: 500 }}>
              We built the studio
              <br />
              <span style={{ color: 'var(--fg-dim)' }}>we wanted to hire.</span>
            </h2>
          </div>
          <div style={{ color: 'var(--fg-dim)', fontSize: 16, lineHeight: 1.7 }}>
            <p style={{ margin: '0 0 18px' }}>
              Most of our early clients told us the same story: their brand agency made a great deck, their dev shop built half a product, and their marketing vendor was promoting old messaging.
            </p>
            <p style={{ margin: 0 }}>
              So we started Zenova to do all of it — design, build, and growth — with one team that stays involved from start to finish.
            </p>
          </div>
        </div>
      </section>

      <section className="sec" style={{ paddingTop: 40 }}>
        <div className="container">
          <SectionHeader
            align="center"
            eyebrow="What we believe"
            title={<>Three things we don&apos;t change.</>}
            sub="These show up in every project, big or small."
          />
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: 16,
            }}
          >
            {VALUES.map((v) => {
              const IconC = (Icon[v.icon as IconName] ?? Icon.Layers) as IconComponent;
              return (
                <div
                  key={v.id}
                  className="card"
                  style={{
                    padding: 28,
                    borderRadius: 20,
                    border: '1px solid var(--line)',
                    background: 'linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.005))',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 14,
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      border: `1px solid ${v.hue}40`,
                      background: `${v.hue}1a`,
                      color: v.hue,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <IconC size={20} />
                  </div>
                  <h3 className="display" style={{ fontSize: 20, fontWeight: 500, margin: 0 }}>
                    {v.title}
                  </h3>
                  <p style={{ margin: 0, color: 'var(--fg-dim)', fontSize: 15, lineHeight: 1.6 }}>
                    {v.blurb}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="sec" style={{ paddingTop: 40 }}>
        <div className="container">
          <SectionHeader
            align="center"
            eyebrow="The team"
            title={<>Meet the team.</>}
            sub="The people you meet on day one are the same people who do the work."
          />
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: 16,
            }}
          >
            {TEAM.map((m) => (
              <div
                key={m.id}
                className="card"
                style={{
                  padding: 28,
                  borderRadius: 20,
                  border: '1px solid var(--line)',
                  background: 'linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.005))',
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
                    top: -50,
                    right: -50,
                    width: 180,
                    height: 180,
                    borderRadius: '50%',
                    background: `radial-gradient(circle, ${m.tone}33, transparent 65%)`,
                    pointerEvents: 'none',
                  }}
                />
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${m.tone}, var(--accent-3))`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'var(--font-display)',
                    fontWeight: 600,
                    fontSize: 18,
                    color: '#fff',
                    boxShadow: `0 8px 20px ${m.tone}55`,
                    position: 'relative',
                  }}
                >
                  {m.initials}
                </div>
                <div style={{ position: 'relative' }}>
                  <div className="display" style={{ fontSize: 20, fontWeight: 500 }}>
                    {m.name}
                  </div>
                  <div className="mono" style={{ color: 'var(--fg-faint)', marginTop: 4, fontSize: 12 }}>
                    {m.role}
                  </div>
                </div>
                <p
                  style={{
                    margin: 0,
                    color: 'var(--fg-dim)',
                    fontSize: 14,
                    lineHeight: 1.6,
                    position: 'relative',
                  }}
                >
                  {m.bio}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="sec" style={{ paddingTop: 40 }}>
        <div className="container" style={{ maxWidth: 920 }}>
          <SectionHeader
            align="center"
            eyebrow="Milestones"
            title={<>A short history.</>}
          />
          <div
            style={{
              border: '1px solid var(--line)',
              borderRadius: 20,
              overflow: 'hidden',
              background: 'linear-gradient(180deg, rgba(255,255,255,0.025), rgba(255,255,255,0.005))',
            }}
          >
            {TIMELINE.map((m, i) => (
              <div
                key={m.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '120px 1fr',
                  gap: 24,
                  padding: '24px 28px',
                  borderTop: i === 0 ? 'none' : '1px solid var(--line)',
                  alignItems: 'baseline',
                }}
              >
                <div
                  className="display"
                  style={{
                    fontSize: 28,
                    fontWeight: 500,
                    background: 'var(--grad)',
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    color: 'transparent',
                  }}
                >
                  {m.year}
                </div>
                <div style={{ color: 'var(--fg-dim)', fontSize: 15, lineHeight: 1.6 }}>{m.what}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="sec" style={{ paddingTop: 40 }}>
        <div
          className="container"
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40 }}
        >
          <div
            className="card"
            style={{
              padding: 36,
              borderRadius: 24,
              border: '1px solid var(--line-strong)',
              background:
                'linear-gradient(135deg, rgba(58,91,255,0.18), rgba(168,85,247,0.10) 60%, rgba(255,255,255,0.02))',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: -60,
                right: -60,
                width: 280,
                height: 280,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(168,85,247,0.4), transparent 60%)',
                filter: 'blur(60px)',
                pointerEvents: 'none',
              }}
            />
            <div style={{ position: 'relative' }}>
              <div className="mono" style={{ color: 'var(--fg-faint)', marginBottom: 12 }}>
                Careers
              </div>
              <h2
                className="display"
                style={{ margin: 0, fontSize: 'clamp(28px, 3vw, 38px)', fontWeight: 500 }}
              >
                Want to work with us?
              </h2>
              <p
                style={{
                  margin: '18px 0 24px',
                  color: 'var(--fg-dim)',
                  fontSize: 15,
                  lineHeight: 1.6,
                  maxWidth: 380,
                }}
              >
                We hire when we have the right work. Open roles below — or send us a note any time.
              </p>
              <div
                style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}
              >
                {ROLES.map((r) => (
                  <a
                    key={r.id}
                    href={r.href || '#'}
                    onClick={(e) => {
                      if (!r.href) e.preventDefault();
                    }}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr auto auto',
                      gap: 18,
                      alignItems: 'center',
                      padding: '14px 18px',
                      borderRadius: 14,
                      border: '1px solid var(--line)',
                      background: 'rgba(0,0,0,0.18)',
                      textDecoration: 'none',
                      color: 'var(--fg)',
                      fontSize: 14,
                    }}
                  >
                    <span>{r.title}</span>
                    <span
                      className="mono"
                      style={{
                        color: 'var(--fg-faint)',
                        fontSize: 11,
                        letterSpacing: '0.1em',
                      }}
                    >
                      {r.location}
                    </span>
                    <Icon.Arrow size={14} />
                  </a>
                ))}
              </div>
              <a
                href={`mailto:${brand.careersEmail}`}
                className="mono"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  color: 'var(--accent-3)',
                }}
              >
                Email us: {brand.careersEmail} <Icon.Arrow size={12} />
              </a>
            </div>
          </div>

          <div>
            <div className="mono" style={{ color: 'var(--fg-faint)', marginBottom: 12 }}>
              Where we are
            </div>
            <h2
              className="display"
              style={{ margin: 0, fontSize: 'clamp(28px, 3vw, 38px)', fontWeight: 500 }}
            >
              Two cities,
              <br />
              <span style={{ color: 'var(--fg-dim)' }}>one team.</span>
            </h2>
            <p
              style={{
                margin: '18px 0 24px',
                color: 'var(--fg-dim)',
                fontSize: 15,
                lineHeight: 1.6,
                maxWidth: 420,
              }}
            >
              We work across two main cities and overlap a few hours each day.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {LOCATIONS.map((l) => (
                <div
                  key={l.id}
                  className="card"
                  style={{
                    padding: '18px 22px',
                    borderRadius: 16,
                    border: '1px solid var(--line)',
                    background:
                      'linear-gradient(180deg, rgba(255,255,255,0.025), rgba(255,255,255,0.005))',
                    display: 'grid',
                    gridTemplateColumns: '1fr auto',
                    gap: 14,
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div className="display" style={{ fontSize: 18, fontWeight: 500 }}>
                      {l.city}
                    </div>
                    <div
                      style={{ color: 'var(--fg-dim)', fontSize: 13, marginTop: 4 }}
                    >
                      {l.detail}
                    </div>
                  </div>
                  <div
                    className="mono"
                    style={{
                      padding: '6px 12px',
                      borderRadius: 999,
                      border: '1px solid var(--line)',
                      background: 'rgba(255,255,255,0.025)',
                      color: 'var(--fg)',
                      fontSize: 11,
                    }}
                  >
                    {l.tz}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <CTA />
    </>
  );
}

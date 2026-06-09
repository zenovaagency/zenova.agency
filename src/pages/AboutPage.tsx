import { useEffect } from 'react';
import { PageHero } from '@/components/layout/PageHero';
import { CTA } from '@/components/sections/CTA';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Icon, type IconName, type IconComponent } from '@/components/icons/Icon';
import { useTeam, useBrand, useContent } from '@/admin/store';

const SOCIAL_ICON: Record<string, (s: number) => JSX.Element> = {
  twitter: (s) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4l11.733 16h4L8 4H4z" /><path d="M4 20l6.768-6.768M20 4l-6.768 6.768" />
    </svg>
  ),
  linkedin: (s) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="16" height="16" rx="2" /><path d="M6 9v8M6 6v.01M10 11v6M14 9v6" />
    </svg>
  ),
  github: (s) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 22v-4a4.8 4.8 0 00-1-3.5c3 0 6-2 6-5.5a4.3 4.3 0 00-.4-2.9 3 3 0 000-2.4s-1-.3-3.3 1.3a11.4 11.4 0 00-6 0C8 3.7 7 4 7 4a3 3 0 000 2.4 4.3 4.3 0 00-.4 2.9c0 3.5 3 5.5 6 5.5a4.8 4.8 0 00-1 3.5v4" /><path d="M9 18c-3 .7-3-2-4-2" />
    </svg>
  ),
  dribbble: (s) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><path d="M19.13 5.09C15.22 9.14 10 10.44 2.25 10.94" /><path d="M21.75 12.84c-6.62-1.41-12.14 1-16.38 6.32" /><path d="M8.56 2.75c4.37 6 6 9.42 8 17.72" />
    </svg>
  ),
  instagram: (s) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="5" /><circle cx="17.5" cy="6.5" r=".75" />
    </svg>
  ),
  website: (s) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
    </svg>
  ),
  email: (s) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" /><path d="M22 4L12 13 2 4" />
    </svg>
  ),
};

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
                  padding: '32px 24px 28px',
                  borderRadius: 20,
                  border: '1px solid var(--line)',
                  background: 'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 14,
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'border-color 0.25s, box-shadow 0.25s, transform 0.25s',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = `${m.tone}44`;
                  (e.currentTarget as HTMLElement).style.boxShadow = `0 12px 32px ${m.tone}14`;
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--line)';
                  (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                  (e.currentTarget as HTMLElement).style.transform = 'none';
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: -60,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 200,
                    height: 200,
                    borderRadius: '50%',
                    background: `radial-gradient(circle, ${m.tone}20, transparent 60%)`,
                    pointerEvents: 'none',
                  }}
                />
                <div style={{ position: 'relative', zIndex: 1 }}>
                  {m.avatar ? (
                    <img
                      src={m.avatar}
                      alt={m.name}
                      style={{
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: `3px solid ${m.tone}44`,
                        boxShadow: `0 0 0 6px ${m.tone}14, 0 8px 28px ${m.tone}33`,
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        background: `linear-gradient(135deg, ${m.tone}, var(--accent-3))`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontFamily: 'var(--font-display)',
                        fontWeight: 600,
                        fontSize: 24,
                        color: '#fff',
                        boxShadow: `0 8px 28px ${m.tone}55`,
                      }}
                    >
                      {m.initials}
                    </div>
                  )}
                </div>
                <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
                  <div className="display" style={{ fontSize: 18, fontWeight: 600 }}>
                    {m.name}
                  </div>
                  <div style={{ color: m.tone, fontSize: 13, fontWeight: 500, marginTop: 4 }}>
                    {m.role}
                  </div>
                </div>
                <p
                  style={{
                    margin: 0,
                    color: 'var(--fg-dim)',
                    fontSize: 14,
                    lineHeight: 1.6,
                    textAlign: 'center',
                    position: 'relative',
                    zIndex: 1,
                    maxWidth: 280,
                  }}
                >
                  {m.bio}
                </p>
                {m.socials && m.socials.length > 0 && (
                  <div style={{ position: 'relative', zIndex: 1, display: 'flex', gap: 8, justifyContent: 'center', marginTop: 4 }}>
                    {m.socials.map((s, si) => {
                      const icon = SOCIAL_ICON[s.platform];
                      if (!icon) return null;
                      return (
                        <a
                          key={si}
                          href={s.platform === 'email' ? `mailto:${s.url}` : s.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={s.platform}
                          style={{
                            width: 34,
                            height: 34,
                            borderRadius: 8,
                            border: '1px solid var(--line)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--fg-dim)',
                            transition: 'color 0.2s, border-color 0.2s, background 0.2s',
                          }}
                          onMouseEnter={(e) => {
                            (e.currentTarget as HTMLElement).style.color = m.tone;
                            (e.currentTarget as HTMLElement).style.borderColor = `${m.tone}44`;
                            (e.currentTarget as HTMLElement).style.background = `${m.tone}10`;
                          }}
                          onMouseLeave={(e) => {
                            (e.currentTarget as HTMLElement).style.color = 'var(--fg-dim)';
                            (e.currentTarget as HTMLElement).style.borderColor = 'var(--line)';
                            (e.currentTarget as HTMLElement).style.background = 'transparent';
                          }}
                        >
                          {icon(16)}
                        </a>
                      );
                    })}
                  </div>
                )}
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
              background: 'var(--card)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
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

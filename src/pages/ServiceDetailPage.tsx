import { useEffect } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { PageHero } from '@/components/layout/PageHero';
import { CTA } from '@/components/sections/CTA';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { ServiceVisual } from '@/components/sections/ServiceVisual';
import { Icon, type IconComponent } from '@/components/icons/Icon';
import { type ServiceDetail } from '@/data/services';
import { useServices } from '@/admin/store';

export function ServiceDetailPage() {
  const { slug = '' } = useParams();
  const [SERVICES] = useServices();
  const service = SERVICES.find((s) => s.slug === slug);

  useEffect(() => {
    window.__lenis?.scrollTo(0, { immediate: true }) ?? window.scrollTo({ top: 0, behavior: 'auto' });
  }, [slug]);

  if (!service) {
    return <Navigate to="/services" replace />;
  }

  const IconC = Icon[service.icon] as IconComponent;

  return (
    <>
      <PageHero
        crumbs={[
          { label: 'Home', to: '/' },
          { label: 'Services', to: '/services' },
          { label: service.title },
        ]}
        eyebrow={`Service · ${service.tag}`}
        title={
          <>
            {service.title.split(' ').slice(0, -1).join(' ')}{' '}
            <span style={{ color: 'var(--fg-dim)' }}>
              {service.title.split(' ').slice(-1)}
            </span>
          </>
        }
        sub={service.hero}
        meta={service.meta}
        secondary={{ label: 'See the process', to: '/process' }}
      />

      <section className="sec" style={{ paddingTop: 80 }}>
        <div
          className="container svc-detail-overview"
          style={{
            display: 'grid',
            gridTemplateColumns: '1.05fr 1fr',
            gap: 56,
            alignItems: 'center',
          }}
        >
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
              <span style={{ width: 24, height: 1, background: service.hue }} />
              Overview
            </div>
            <h2
              className="display"
              style={{ fontSize: 'clamp(28px,3.4vw,42px)', margin: 0, fontWeight: 500 }}
            >
              {service.lede}
            </h2>
            <div
              className="svc-detail-overview-bullets"
              style={{
                marginTop: 32,
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '14px 22px',
                maxWidth: 520,
              }}
            >
              {service.bullets.map((b) => (
                <div
                  key={b}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--fg)', fontSize: 15 }}
                >
                  <span
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 7,
                      border: `1px solid ${service.hue}40`,
                      background: `${service.hue}1a`,
                      color: service.hue,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Icon.Check size={12} />
                  </span>
                  {b}
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              aspectRatio: '5 / 3',
              borderRadius: 22,
              background: `linear-gradient(135deg, ${service.hue}33, ${service.hue}08)`,
              border: '1px solid var(--line-strong)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <ServiceVisual kind={service.visual} hue={service.hue} active />
            <div
              style={{
                position: 'absolute',
                left: 18,
                top: 18,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                padding: '8px 12px',
                borderRadius: 999,
                background: 'rgba(0,0,0,0.4)',
                border: '1px solid var(--line)',
                backdropFilter: 'blur(8px)',
                color: service.hue,
              }}
            >
              <IconC size={16} />
              <span className="mono" style={{ color: 'var(--fg)' }}>
                {service.tag}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="sec" style={{ paddingTop: 40 }}>
        <div className="container">
          <SectionHeader
            align="center"
            eyebrow="What you get"
            title={<>What you get.</>}
            sub="Every project ships with these — yours to keep and use."
          />
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: 16,
            }}
          >
            {service.deliverables.map((d, i) => (
              <div
                key={d.title}
                className="card"
                style={{
                  padding: 26,
                  borderRadius: 18,
                  border: '1px solid var(--line)',
                  background:
                    'linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.005))',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                }}
              >
                <div
                  className="mono"
                  style={{ color: service.hue, fontSize: 12, letterSpacing: '0.1em' }}
                >
                  {String(i + 1).padStart(2, '0')}
                </div>
                <h3 className="display" style={{ margin: 0, fontSize: 20, fontWeight: 500 }}>
                  {d.title}
                </h3>
                <p style={{ margin: 0, color: 'var(--fg-dim)', fontSize: 14, lineHeight: 1.6 }}>
                  {d.blurb}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="sec" style={{ paddingTop: 40 }}>
        <div className="container">
          <SectionHeader
            align="center"
            eyebrow="How we run it"
            title={<>How it works.</>}
            sub="Four simple phases. Each one ends with something you can see and review."
          />
          <div
            style={{
              border: '1px solid var(--line)',
              borderRadius: 22,
              overflow: 'hidden',
              background:
                'linear-gradient(180deg, rgba(255,255,255,0.025), rgba(255,255,255,0.005))',
            }}
          >
            {service.phases.map((p, i) => (
              <div
                key={p.n}
                className="svc-detail-phase"
                style={{
                  display: 'grid',
                  gridTemplateColumns: '80px 1.2fr 1fr',
                  gap: 28,
                  padding: '28px 32px',
                  borderTop: i === 0 ? 'none' : '1px solid var(--line)',
                  alignItems: 'baseline',
                }}
              >
                <div
                  className="display"
                  style={{
                    fontSize: 28,
                    fontWeight: 500,
                    background: `linear-gradient(135deg, ${service.hue}, var(--accent-3))`,
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    color: 'transparent',
                  }}
                >
                  {p.n}
                </div>
                <div>
                  <h3 className="display" style={{ margin: 0, fontSize: 22, fontWeight: 500 }}>
                    {p.title}
                  </h3>
                  <p
                    style={{
                      margin: '10px 0 0',
                      color: 'var(--fg-dim)',
                      fontSize: 15,
                      lineHeight: 1.6,
                      maxWidth: 540,
                    }}
                  >
                    {p.blurb}
                  </p>
                </div>
                <div
                  className="svc-detail-phase__output"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '10px 14px',
                    borderRadius: 12,
                    border: '1px solid var(--line)',
                    background: 'rgba(255,255,255,0.025)',
                    color: 'var(--fg-dim)',
                    fontSize: 13,
                    alignSelf: 'center',
                    justifySelf: 'start',
                  }}
                >
                  <span
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: '50%',
                      background: service.hue,
                      boxShadow: `0 0 10px ${service.hue}`,
                    }}
                  />
                  {p.out}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="sec" style={{ paddingTop: 40 }}>
        <div className="container svc-stack-stats" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40 }}>
          <div>
            <SectionHeader
              eyebrow="Stack"
              title={<>Tools we use.</>}
              sub="Reliable, well-known tools. Nothing fancy for the sake of it."
            />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {service.stack.map((s) => (
                <span
                  key={s}
                  className="mono"
                  style={{
                    padding: '8px 14px',
                    borderRadius: 999,
                    border: '1px solid var(--line)',
                    background: 'rgba(255,255,255,0.025)',
                    color: 'var(--fg)',
                    fontSize: 11,
                    letterSpacing: '0.1em',
                  }}
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
          <div
            className="card"
            style={{
              padding: 32,
              borderRadius: 22,
              border: '1px solid var(--line-strong)',
              background: `linear-gradient(135deg, ${service.hue}1a, rgba(255,255,255,0.01))`,
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
            }}
          >
            <div className="mono" style={{ color: 'var(--fg-faint)' }}>
              By the numbers
            </div>
            <div
              className="display"
              style={{
                fontSize: 'clamp(40px, 5vw, 72px)',
                fontWeight: 500,
                lineHeight: 1,
                background: `linear-gradient(90deg, ${service.hue}, var(--accent-3))`,
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
              }}
            >
              {service.stat[0]}
            </div>
            <div style={{ color: 'var(--fg-dim)', fontSize: 15, lineHeight: 1.5 }}>
              {service.stat[1]}
            </div>
          </div>
        </div>
      </section>

      <section className="sec" style={{ paddingTop: 40 }}>
        <div className="container">
          <SectionHeader
            align="center"
            eyebrow="Packages"
            title={<>Pricing.</>}
            sub="Starting prices. We’ll quote the exact scope in our intro call."
          />
          <div
            className="svc-pricing-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 18,
            }}
          >
            {service.packages.map((p) => (
              <div
                key={p.name}
                className="card"
                style={{
                  padding: 32,
                  borderRadius: 22,
                  border: p.featured
                    ? `1px solid ${service.hue}55`
                    : '1px solid var(--line)',
                  background: p.featured
                    ? `linear-gradient(160deg, ${service.hue}18, rgba(255,255,255,0.01))`
                    : 'linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.005))',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 14,
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {p.featured && (
                  <span
                    className="mono"
                    style={{
                      position: 'absolute',
                      top: 18,
                      right: 18,
                      padding: '4px 10px',
                      borderRadius: 999,
                      background: service.hue,
                      color: '#fff',
                      fontSize: 10,
                    }}
                  >
                    Popular
                  </span>
                )}
                <div className="mono" style={{ color: 'var(--fg-faint)' }}>
                  {p.cadence}
                </div>
                <h3 className="display" style={{ margin: 0, fontSize: 24, fontWeight: 500 }}>
                  {p.name}
                </h3>
                <div
                  className="display"
                  style={{
                    fontSize: 32,
                    fontWeight: 500,
                    background: `linear-gradient(90deg, ${service.hue}, var(--accent-3))`,
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    color: 'transparent',
                  }}
                >
                  {p.price}
                </div>
                <p style={{ margin: 0, color: 'var(--fg-dim)', fontSize: 14, lineHeight: 1.55 }}>
                  {p.fits}
                </p>
                <div
                  style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}
                >
                  {p.includes.map((it) => (
                    <div
                      key={it}
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
                          width: 16,
                          height: 16,
                          borderRadius: 5,
                          background: `${service.hue}22`,
                          border: `1px solid ${service.hue}40`,
                          color: service.hue,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <Icon.Check size={10} />
                      </span>
                      {it}
                    </div>
                  ))}
                </div>
                <Link
                  to="/#contact"
                  className="btn-ghost"
                  style={{ marginTop: 'auto', textDecoration: 'none', justifyContent: 'center' }}
                >
                  Get in touch
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="sec svc-faq" style={{ paddingTop: 40 }}>
        <div className="container" style={{ maxWidth: 920 }}>
          <SectionHeader
            align="center"
            eyebrow="FAQs"
            title={<>Common questions.</>}
          />
          <div
            style={{
              border: '1px solid var(--line)',
              borderRadius: 22,
              overflow: 'hidden',
              background:
                'linear-gradient(180deg, rgba(255,255,255,0.025), rgba(255,255,255,0.005))',
            }}
          >
            {service.faqs.map((f, i) => (
              <details
                key={f.q}
                style={{
                  borderTop: i === 0 ? 'none' : '1px solid var(--line)',
                  padding: '22px 28px',
                }}
              >
                <summary
                  style={{
                    cursor: 'pointer',
                    listStyle: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 16,
                    color: 'var(--fg)',
                    fontSize: 16,
                    fontFamily: 'var(--font-display)',
                  }}
                >
                  {f.q}
                  <span style={{ color: service.hue }}>
                    <Icon.Plus size={14} />
                  </span>
                </summary>
                <p style={{ margin: '14px 0 0', color: 'var(--fg-dim)', fontSize: 15, lineHeight: 1.6 }}>
                  {f.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <RelatedServices current={service} />

      <CTA />
    </>
  );
}

function RelatedServices({ current }: { current: ServiceDetail }) {
  const [SERVICES] = useServices();
  const items = SERVICES.filter((s) => current.related.includes(s.slug));
  if (!items.length) return null;

  return (
    <section className="sec" style={{ paddingTop: 40 }}>
      <div className="container">
        <SectionHeader
          eyebrow="Other services"
          title={<>Often paired with this.</>}
          sub="These services work well together. Most projects combine two or three."
        />
        <div
          className="svc-related-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 18,
          }}
        >
          {items.map((s) => {
            const IconC = Icon[s.icon] as IconComponent;
            return (
              <Link
                key={s.slug}
                to={`/services/${s.slug}`}
                className="card"
                style={{
                  padding: 28,
                  borderRadius: 20,
                  border: '1px solid var(--line)',
                  background:
                    'linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.005))',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 14,
                  textDecoration: 'none',
                  color: 'var(--fg)',
                  transition: 'transform .3s, border-color .3s',
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    border: `1px solid ${s.hue}40`,
                    background: `${s.hue}1a`,
                    color: s.hue,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <IconC size={20} />
                </div>
                <div className="display" style={{ fontSize: 22, fontWeight: 500 }}>
                  {s.title}
                </div>
                <p style={{ margin: 0, color: 'var(--fg-dim)', fontSize: 14, lineHeight: 1.55 }}>
                  {s.short}
                </p>
                <div
                  className="mono"
                  style={{
                    marginTop: 'auto',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    color: 'var(--fg-dim)',
                  }}
                >
                  Explore <Icon.Arrow size={12} />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

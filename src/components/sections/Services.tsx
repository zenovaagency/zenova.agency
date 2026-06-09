import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon, type IconComponent } from '@/components/icons/Icon';
import { ServiceVisual } from './ServiceVisual';
import { useServices } from '@/admin/store';

export function Services() {
  const [SERVICES] = useServices();
  const [open, setOpen] = useState<string>(SERVICES[0]?.slug ?? '');

  return (
    <section id="services" className="sec" style={{ position: 'relative' }}>
      <div className="container">
        <div
          className="svc-header-row"
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            gap: 48,
            marginBottom: 56,
            flexWrap: 'wrap',
          }}
        >
          <div style={{ maxWidth: 720 }}>
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
              <span style={{ width: 24, height: 1, background: 'var(--accent-1)' }} />
              What we do
            </div>
            <h2 className="display" style={{ fontSize: 'clamp(36px,5vw,68px)', margin: 0, fontWeight: 500 }}>
              What we do.
              <br />
              <span style={{ color: 'var(--fg-dim)' }}>All under one roof.</span>
            </h2>
          </div>
          <div style={{ maxWidth: 360, color: 'var(--fg-dim)', fontSize: 15, lineHeight: 1.55 }}>
            One team. Five services. Pick what you need, or get the whole package.
            <div style={{ display: 'flex', gap: 6, marginTop: 18, alignItems: 'center' }}>
              <span className="mono" style={{ color: 'var(--fg-faint)' }}>
                HOVER TO OPEN
              </span>
              <span style={{ flex: 1, height: 1, background: 'var(--line)' }} />
              <Icon.Arrow size={14} />
            </div>
          </div>
        </div>

        <div
          className="svc-list"
          style={{
            border: '1px solid var(--line)',
            borderRadius: 24,
            overflow: 'hidden',
            background: 'var(--card)',
          }}
        >
          {SERVICES.map((s, i) => {
            const isOpen = open === s.slug;
            const IconC = Icon[s.icon] as IconComponent;
            return (
              <div
                key={s.slug}
                onMouseEnter={() => setOpen(s.slug)}
                onClick={() => setOpen(s.slug)}
                className="svc-row"
                style={{
                  position: 'relative',
                  borderTop: i === 0 ? 'none' : '1px solid var(--line)',
                  cursor: 'pointer',
                  background: isOpen ? `linear-gradient(90deg, ${s.hue}10, transparent 70%)` : 'transparent',
                  transition: 'background .5s cubic-bezier(.2,.7,.2,1)',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: 3,
                    background: s.hue,
                    transform: isOpen ? 'scaleY(1)' : 'scaleY(0)',
                    transformOrigin: 'center',
                    transition: 'transform .55s cubic-bezier(.2,.7,.2,1)',
                  }}
                />

                <div
                  className="svc-head"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '56px 60px 1fr auto auto',
                    alignItems: 'center',
                    gap: 28,
                    padding: '28px 32px',
                  }}
                >
                  <div
                    className="mono"
                    style={{
                      color: isOpen ? s.hue : 'var(--fg-faint)',
                      fontSize: 13,
                      fontWeight: 500,
                      transition: 'color .3s',
                    }}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </div>

                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      border: '1px solid var(--line)',
                      background: isOpen ? `${s.hue}22` : 'rgba(255,255,255,0.03)',
                      color: isOpen ? s.hue : 'var(--fg-dim)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all .35s',
                    }}
                  >
                    <IconC size={20} />
                  </div>

                  <div
                    className="display svc-title"
                    style={{
                      fontSize: 'clamp(24px, 3vw, 38px)',
                      fontWeight: 500,
                      color: isOpen ? 'var(--fg)' : 'var(--fg-dim)',
                      transition: 'color .35s, transform .35s',
                      transform: isOpen ? 'translateX(6px)' : 'translateX(0)',
                    }}
                  >
                    {s.title}
                  </div>

                  <div
                    className="mono svc-tag"
                    style={{
                      padding: '6px 12px',
                      borderRadius: 999,
                      border: '1px solid var(--line)',
                      background: 'rgba(255,255,255,0.02)',
                      color: isOpen ? 'var(--fg)' : 'var(--fg-faint)',
                      fontSize: 11,
                      letterSpacing: '0.1em',
                      transition: 'all .35s',
                    }}
                  >
                    {s.tag}
                  </div>

                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: '50%',
                      border: isOpen ? '0px solid transparent' : '1px solid transparent',
                      borderColor: isOpen ? 'transparent' : 'var(--line)',
                      color: isOpen ? '#0a0a0a' : 'var(--fg-faint)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'transform .4s cubic-bezier(.2,.7,.2,1), color .3s, background .3s',
                      transform: isOpen ? 'rotate(45deg)' : 'rotate(0)',
                      background: isOpen ? 'var(--accent-1)' : 'transparent',
                    }}
                  >
                    <Icon.Plus size={16} />
                  </div>
                </div>

                <div
                  style={{
                    maxHeight: isOpen ? 360 : 0,
                    opacity: isOpen ? 1 : 0,
                    overflow: 'hidden',
                    transition: 'max-height .7s cubic-bezier(.2,.7,.2,1), opacity .5s',
                  }}
                >
                  <div
                    className="svc-body"
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1.1fr 1fr',
                      gap: 48,
                      padding: '8px 32px 36px 144px',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <p
                        className="svc-body__lede"
                        style={{ fontSize: 18, lineHeight: 1.55, color: 'var(--fg-dim)', margin: '0 0 24px' }}
                      >
                        {s.lede}
                      </p>
                      <div
                        className="svc-body__bullets"
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr',
                          gap: '10px 18px',
                          marginBottom: 28,
                        }}
                      >
                        {s.bullets.map((b) => (
                          <div
                            key={b}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 10,
                              fontSize: 14,
                              color: 'var(--fg)',
                            }}
                          >
                            <span
                              style={{
                                width: 18,
                                height: 18,
                                borderRadius: 6,
                                background: `${s.hue}22`,
                                border: `1px solid ${s.hue}40`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: s.hue,
                              }}
                            >
                              <Icon.Check size={11} />
                            </span>
                            {b}
                          </div>
                        ))}
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 14,
                          flexWrap: 'wrap',
                          justifyContent: 'space-between',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                          <div
                            className="display svc-body__stat"
                            style={{
                              fontSize: 36,
                              fontWeight: 500,
                              lineHeight: 1,
                              background: `linear-gradient(90deg, ${s.hue}, var(--accent-1))`,
                              WebkitBackgroundClip: 'text',
                              backgroundClip: 'text',
                              color: 'transparent',
                            }}
                          >
                            {s.stat[0]}
                          </div>
                          <div style={{ fontSize: 12, color: 'var(--fg-faint)', lineHeight: 1.4, maxWidth: 160 }}>
                            {s.stat[1]}
                          </div>
                        </div>
                        <Link
                          to={`/services/${s.slug}`}
                          className="mono"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 8,
                            padding: '10px 16px',
                            borderRadius: 999,
                            border: `1px solid ${s.hue}55`,
                            background: `${s.hue}15`,
                            color: s.hue,
                            fontSize: 11,
                            letterSpacing: '0.1em',
                            textDecoration: 'none',
                            transition: 'all .25s',
                          }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          See full service <Icon.Arrow size={12} />
                        </Link>
                      </div>
                    </div>

                    <div
                      className="svc-body__visual"
                      style={{
                        aspectRatio: '5/3',
                        borderRadius: 18,
                        background: `linear-gradient(135deg, ${s.hue}22, ${s.hue}05)`,
                        border: '1px solid var(--line)',
                        position: 'relative',
                        overflow: 'hidden',
                      }}
                    >
                      <ServiceVisual kind={s.visual} hue={s.hue} active={isOpen} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

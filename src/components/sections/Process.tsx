'use client';
import { useEffect, useRef, useState, type MouseEvent, type ReactElement } from 'react';
import { Icon } from '@/components/icons/Icon';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { useElementWidth } from '@/hooks/useElementWidth';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { DEFAULT_CONTENT, useContent } from '@/admin/store';
import './Process.css';

const ICONS = Icon as unknown as Record<string, (props: { size?: number }) => ReactElement>;

/** Angle (deg) an opened phase glides to — top of the ring, so its card hangs into the circle. */
const FOCUS_ANGLE = 270;

export function Process() {
  const [content] = useContent();
  // Older cached/API payloads may not carry `process` yet — fall back to defaults.
  const data =
    content.process && content.process.steps.length > 0
      ? content.process
      : DEFAULT_CONTENT.process;
  const steps = data.steps;

  const [openId, setOpenId] = useState<string | null>(null);
  const [rotation, setRotation] = useState(0);
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  // The orbit is sized from the space the stage actually has, not from a
  // breakpoint: a hard mobile/desktop switch left the 210px radius in place
  // from 641px up, where the ring plus its nowrap labels overflowed the
  // stage's `overflow: hidden` and got clipped.
  const stageRef = useRef<HTMLDivElement>(null);
  const stageWidth = useElementWidth(stageRef);
  // 104px reserve on each side for the node and its label.
  const radius = stageWidth === 0 ? 210 : Math.round(Math.min(210, Math.max(104, stageWidth / 2 - 104)));
  const spinning = openId === null && !reducedMotion;

  useEffect(() => {
    if (!spinning) return;
    const t = setInterval(() => setRotation((r) => (r + 0.25) % 360), 50);
    return () => clearInterval(t);
  }, [spinning]);

  useEffect(() => {
    if (!openId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenId(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [openId]);

  const focus = (id: string) => {
    const i = steps.findIndex((s) => s.id === id);
    if (i < 0) return;
    setOpenId(id);
    setRotation(FOCUS_ANGLE - (i / steps.length) * 360);
  };

  const stop = (e: MouseEvent) => e.stopPropagation();

  return (
    <section id="process" className="sec">
      <div className="container">
        <SectionHeader
          align="center"
          eyebrow={data.eyebrow}
          title={
            <>
              {data.title}
              {data.titleAccent && (
                <>
                  <br />
                  <span style={{ color: 'var(--fg-dim)' }}>{data.titleAccent}</span>
                </>
              )}
            </>
          }
          sub={data.sub}
        />
      </div>

      <div ref={stageRef} className="orbital-stage reveal reveal-d1" onClick={() => setOpenId(null)}>
        <div className="orbital-ambient" />
        <div
          className="orbital-ring orbital-ring--outer"
          style={{ width: radius * 2 + 96, height: radius * 2 + 96 }}
        />
        <div className="orbital-ring" style={{ width: radius * 2, height: radius * 2 }} />

        <div className="orbital-core">
          <span className="orbital-core__dot" />
        </div>

        {steps.map((s, i) => {
          const angle = ((i / steps.length) * 360 + rotation) % 360;
          const rad = (angle * Math.PI) / 180;
          const x = radius * Math.cos(rad);
          // Flat 2D orbit: no vertical foreshortening, so nodes trace a true circle
          // and keep a constant size all the way round.
          const y = radius * Math.sin(rad);
          const isOpen = openId === s.id;
          const StepIcon = ICONS[s.icon] ?? Icon.Compass;
          const next = steps[(i + 1) % steps.length];

          return (
            <div
              key={s.id}
              className={`orbital-item ${isOpen ? 'is-open' : ''}`}
              style={{
                transform: `translate(${x}px, ${y}px)`,
                zIndex: isOpen ? 200 : 100,
                opacity: isOpen ? 1 : openId ? 0.35 : 1,
              }}
            >
              <div className="orbital-halo" />
              <button
                type="button"
                className={`orbital-node ${isOpen ? 'is-open' : ''}`}
                aria-expanded={isOpen}
                aria-label={`Phase ${i + 1}: ${s.title}`}
                onClick={(e) => {
                  e.stopPropagation();
                  if (isOpen) setOpenId(null);
                  else focus(s.id);
                }}
              >
                <StepIcon size={20} />
              </button>
              <div className="orbital-label mono">
                {String(i + 1).padStart(2, '0')} · {s.title}
              </div>

              {isOpen && (
                <article className="orbital-card" onClick={stop}>
                  <span className="orbital-card__stem" />
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                      <span className="orbital-card__icon">
                        <StepIcon size={18} />
                      </span>
                      <span className="mono" style={{ color: 'var(--accent-1)' }}>
                        Phase {String(i + 1).padStart(2, '0')}
                      </span>
                    </span>
                    <span className="mono" style={{ color: 'var(--fg-faint)' }}>
                      {s.timeline}
                    </span>
                  </div>
                  <h3
                    className="display gradient-text"
                    style={{ fontSize: 30, fontWeight: 500, margin: '12px 0 0' }}
                  >
                    {s.title}
                  </h3>
                  <p
                    style={{
                      fontSize: 14,
                      lineHeight: 1.6,
                      color: 'var(--fg-dim)',
                      margin: '10px 0 0',
                    }}
                  >
                    {s.blurb}
                  </p>

                  {s.deliverables.length > 0 && (
                    <>
                      <div className="mono" style={{ color: 'var(--fg-faint)', margin: '18px 0 10px' }}>
                        Deliverables
                      </div>
                      <div className="orbital-card__grid">
                        {s.deliverables.map((d) => (
                          <div
                            key={d}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 8,
                              fontSize: 13,
                              color: 'var(--fg)',
                            }}
                          >
                            <span
                              style={{
                                width: 5,
                                height: 5,
                                borderRadius: '50%',
                                background: 'var(--accent-1)',
                                flexShrink: 0,
                              }}
                            />
                            {d}
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  <div className="orbital-card__bar">
                    <span style={{ width: `${((i + 1) / steps.length) * 100}%` }} />
                  </div>
                  <button
                    type="button"
                    className="orbital-next"
                    onClick={(e) => {
                      e.stopPropagation();
                      focus(next.id);
                    }}
                  >
                    Next · {next.title}
                    <Icon.Arrow size={12} />
                  </button>
                </article>
              )}
            </div>
          );
        })}

        <div className="orbital-hint mono">
          {openId ? 'Click anywhere to resume the orbit' : 'Select a phase to pause the orbit'}
        </div>
      </div>
    </section>
  );
}

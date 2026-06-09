import { useEffect } from 'react';
import { PageHero } from '@/components/layout/PageHero';
import { Process } from '@/components/sections/Process';
import { CTA } from '@/components/sections/CTA';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Icon } from '@/components/icons/Icon';

interface Week {
  range: string;
  phase: string;
  focus: string;
  hue: string;
}

interface FAQ {
  q: string;
  a: string;
}

const WEEKS: Week[] = [
  { range: 'Week 1', phase: 'Discover', focus: 'Workshop, project plan, success metrics', hue: '#ff813a' },
  { range: 'Week 2 – 4', phase: 'Design', focus: 'Brand, layout, and a clickable prototype', hue: '#c06028' },
  { range: 'Week 5 – 7', phase: 'Build', focus: 'Code the site with weekly demos', hue: '#e06820' },
  { range: 'Week 8', phase: 'Launch', focus: 'Go live, train your team, hand off', hue: '#cc6622' },
  { range: 'Month 2+', phase: 'Grow', focus: 'Marketing, SEO, and ongoing support', hue: '#ff9a5c' },
];

const PROCESS_FAQS: FAQ[] = [
  { q: 'How soon can we start?', a: 'Usually 1 to 2 weeks after our intro call.' },
  { q: 'How do you keep things on track?', a: 'Weekly demos, daily updates in Slack. You always know where we are.' },
  { q: 'What if scope changes?', a: 'It happens. We log it, give you a new timeline, and you approve before we move.' },
  { q: 'Can you work with our team?', a: 'Yes. We often plug into existing teams and follow your conventions.' },
];

export function ProcessPage() {
  useEffect(() => {
    window.__lenis?.scrollTo(0, { immediate: true }) ?? window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  return (
    <>
      <PageHero
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Process' }]}
        eyebrow="How we work"
        title={
          <>
            A simple process,
            <br />
            <span style={{ color: 'var(--fg-dim)' }}>start to finish.</span>
          </>
        }
        sub="Four phases. Clear deliverables. No surprises."
        meta={[
          ['4', 'Phases'],
          ['6 – 10 wks', 'Typical build'],
          ['1', 'Team'],
          ['Weekly', 'Updates'],
        ]}
        secondary={{ label: 'See services', to: '/services' }}
      />

      <Process />

      <section className="sec" style={{ paddingTop: 40 }}>
        <div className="container">
          <SectionHeader
            align="center"
            eyebrow="Timeline"
            title={<>Eight weeks to launch.</>}
            sub="A typical project, week by week."
          />
          <div
            style={{
              position: 'relative',
              padding: '32px 28px',
              borderRadius: 24,
              border: '1px solid var(--line)',
              background:
                'linear-gradient(180deg, rgba(255,255,255,0.025), rgba(255,255,255,0.005))',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: 3,
                background: 'var(--grad)',
              }}
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {WEEKS.map((w, i) => (
                <div
                  key={w.range}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '140px 120px 1fr',
                    gap: 24,
                    padding: '18px 12px 18px 20px',
                    borderTop: i === 0 ? 'none' : '1px solid var(--line)',
                    alignItems: 'center',
                  }}
                >
                  <div
                    className="mono"
                    style={{ color: w.hue, fontSize: 12, letterSpacing: '0.1em' }}
                  >
                    {w.range}
                  </div>
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '6px 12px',
                      borderRadius: 999,
                      border: `1px solid ${w.hue}55`,
                      background: `${w.hue}15`,
                      color: w.hue,
                      fontSize: 12,
                      justifySelf: 'start',
                    }}
                  >
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        background: w.hue,
                        boxShadow: `0 0 8px ${w.hue}`,
                      }}
                    />
                    {w.phase}
                  </div>
                  <div style={{ color: 'var(--fg)', fontSize: 15, lineHeight: 1.5 }}>{w.focus}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="sec" style={{ paddingTop: 40 }}>
        <div className="container" style={{ maxWidth: 920 }}>
          <SectionHeader
            align="center"
            eyebrow="Questions"
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
            {PROCESS_FAQS.map((f, i) => (
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
                  <span style={{ color: 'var(--accent-3)' }}>
                    <Icon.Plus size={14} />
                  </span>
                </summary>
                <p
                  style={{
                    margin: '14px 0 0',
                    color: 'var(--fg-dim)',
                    fontSize: 15,
                    lineHeight: 1.65,
                  }}
                >
                  {f.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <CTA />
    </>
  );
}

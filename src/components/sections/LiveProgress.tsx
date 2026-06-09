import { Link } from 'react-router-dom';
import { Icon } from '@/components/icons/Icon';
import { SectionHeader } from '@/components/ui/SectionHeader';

interface Phase {
  n: string;
  title: string;
  status: 'done' | 'active' | 'next';
  pct: number;
}

const PHASES: Phase[] = [
  { n: '01', title: 'Discover', status: 'done', pct: 100 },
  { n: '02', title: 'Design', status: 'done', pct: 100 },
  { n: '03', title: 'Build', status: 'active', pct: 62 },
  { n: '04', title: 'Grow', status: 'next', pct: 0 },
];

interface Activity {
  when: string;
  who: string;
  what: string;
  tone: string;
}

const ACTIVITY: Activity[] = [
  { when: '14m ago', who: 'Mira', what: 'pushed v0.9 of the homepage hero', tone: '#ff813a' },
  { when: '1h ago', who: 'Tobias', what: 'shipped the CMS schema for case studies', tone: '#ff6b1a' },
  { when: '3h ago', who: 'Suri', what: 'queued 4 emails in the launch sequence', tone: '#ff9a5c' },
  { when: 'Yesterday', who: 'Jordan', what: 'wrote the about-page copy (draft 2)', tone: '#ff813a' },
];

interface Perk {
  icon: 'Spark' | 'Compass' | 'Layers' | 'Check';
  title: string;
  blurb: string;
}

const PERKS: Perk[] = [
  {
    icon: 'Spark',
    title: 'Real-time progress',
    blurb: 'Phase, percent, and what changed since you last checked. No status meetings required.',
  },
  {
    icon: 'Check',
    title: 'Everything in one place',
    blurb: 'Designs, builds, copy, and metrics — one URL, one team, one single source of truth.',
  },
  {
    icon: 'Compass',
    title: 'Surprise-free delivery',
    blurb: 'When something slips, you see it the same day we do. No quarter-end shockers.',
  },
];

export function LiveProgress() {
  return (
    <section
      id="live-progress"
      className="sec"
      style={{ position: 'relative', overflow: 'hidden' }}
    >
      <div className="container" style={{ position: 'relative' }}>
        <SectionHeader
          eyebrow="Client portal"
          title={
            <>
              See your project,
              <br />
              <span style={{ color: 'var(--fg-dim)' }}>as it happens.</span>
            </>
          }
          sub="Every client gets a live dashboard — current phase, percent complete, what shipped today. No more 'what's the status?' emails."
        />

        <div
          className="live-progress-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: '1.15fr 1fr',
            gap: 40,
            alignItems: 'start',
          }}
        >
          <div
            className="card"
            style={{
              borderRadius: 24,
              border: '1px solid var(--line-strong)',
              background: 'var(--card)',
              padding: 28,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 24,
              }}
            >
              <div>
                <div className="mono" style={{ color: 'var(--fg-faint)', fontSize: 11 }}>
                  northwind.zenova.bd
                </div>
                <div
                  className="display"
                  style={{ fontSize: 22, fontWeight: 500, marginTop: 4 }}
                >
                  Northwind · Brand refresh
                </div>
              </div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '6px 12px',
                  borderRadius: 999,
                  border: '1px solid rgba(61,220,151,0.4)',
                  background: 'rgba(61,220,151,0.08)',
                  fontSize: 12,
                  fontFamily: 'var(--font-mono)',
                  color: '#3ddc97',
                }}
              >
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    background: '#3ddc97',
                  }}
                />
                Live
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 12,
                marginBottom: 24,
              }}
            >
              {[
                ['62%', 'Build phase'],
                ['Week 6 / 8', 'On track'],
                ['12', 'Items shipped'],
              ].map(([num, label]) => (
                <div
                  key={label}
                  style={{
                    padding: '14px 16px',
                    borderRadius: 14,
                    border: '1px solid var(--line)',
                    background: 'rgba(255,255,255,0.02)',
                  }}
                >
                  <div
                    className="display"
                    style={{
                      fontSize: 22,
                      fontWeight: 500,
                      background: 'var(--grad)',
                      WebkitBackgroundClip: 'text',
                      backgroundClip: 'text',
                      color: 'transparent',
                    }}
                  >
                    {num}
                  </div>
                  <div
                    className="mono"
                    style={{ color: 'var(--fg-faint)', fontSize: 11, marginTop: 6 }}
                  >
                    {label}
                  </div>
                </div>
              ))}
            </div>

            <div className="mono" style={{ color: 'var(--fg-faint)', fontSize: 11, marginBottom: 12 }}>
              Phases
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
              {PHASES.map((p) => {
                const isDone = p.status === 'done';
                const isActive = p.status === 'active';
                return (
                  <div
                    key={p.n}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '40px 1fr 80px',
                      alignItems: 'center',
                      gap: 14,
                    }}
                  >
                    <div
                      className="mono"
                      style={{
                        color: isActive
                          ? 'var(--fg)'
                          : isDone
                            ? 'var(--fg-dim)'
                            : 'var(--fg-faint)',
                        fontSize: 12,
                      }}
                    >
                      {p.n}
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 500,
                          color: isActive ? 'var(--fg)' : 'var(--fg-dim)',
                          marginBottom: 6,
                        }}
                      >
                        {p.title}
                      </div>
                      <div
                        style={{
                          height: 6,
                          borderRadius: 999,
                          background: 'rgba(255,255,255,0.06)',
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            height: '100%',
                            width: `${p.pct}%`,
                            background: isActive
                              ? 'var(--grad)'
                              : isDone
                                ? 'rgba(61,220,151,0.55)'
                                : 'transparent',
                            transition: 'width .6s cubic-bezier(.2,.7,.2,1)',
                          }}
                        />
                      </div>
                    </div>
                    <div
                      className="mono"
                      style={{
                        textAlign: 'right',
                        fontSize: 11,
                        color: isActive ? 'var(--accent-1)' : 'var(--fg-faint)',
                      }}
                    >
                      {isDone ? 'Done' : isActive ? `${p.pct}%` : 'Up next'}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mono" style={{ color: 'var(--fg-faint)', fontSize: 11, marginBottom: 12 }}>
              Recent activity
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {ACTIVITY.map((a, i) => (
                <div
                  key={i}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '28px 1fr 80px',
                    alignItems: 'center',
                    gap: 12,
                    padding: '10px 0',
                    borderTop: i === 0 ? 'none' : '1px solid var(--line)',
                  }}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      background: a.tone,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 11,
                      fontFamily: 'var(--font-display)',
                      fontWeight: 600,
                      color: '#fff',
                    }}
                  >
                    {a.who[0]}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--fg-dim)', lineHeight: 1.45 }}>
                    <span style={{ color: 'var(--fg)' }}>{a.who}</span> {a.what}
                  </div>
                  <div
                    className="mono"
                    style={{ textAlign: 'right', fontSize: 11, color: 'var(--fg-faint)' }}
                  >
                    {a.when}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {PERKS.map((p) => {
              const IconC = Icon[p.icon];
              return (
                <div
                  key={p.title}
                  className="card"
                  style={{
                    padding: 24,
                    borderRadius: 18,
                    border: '1px solid var(--line)',
                    background: 'var(--card)',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 16,
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      border: '1px solid rgba(255,129,58,0.3)',
                      background: 'rgba(255,129,58,0.08)',
                      color: 'var(--accent-1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <IconC size={18} />
                  </div>
                  <div>
                    <h3
                      className="display"
                      style={{ fontSize: 18, fontWeight: 500, margin: 0 }}
                    >
                      {p.title}
                    </h3>
                    <p
                      style={{
                        margin: '8px 0 0',
                        color: 'var(--fg-dim)',
                        fontSize: 14,
                        lineHeight: 1.55,
                      }}
                    >
                      {p.blurb}
                    </p>
                  </div>
                </div>
              );
            })}

            <div
              className="card"
              style={{
                padding: '20px 24px',
                borderRadius: 18,
                border: '1px solid var(--line-strong)',
                background: 'var(--card-hover)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 14,
                flexWrap: 'wrap',
              }}
            >
              <div>
                <div
                  className="mono"
                  style={{ color: 'var(--fg-faint)', fontSize: 11, marginBottom: 4 }}
                >
                  Client satisfaction
                </div>
                <div
                  className="display"
                  style={{
                    fontSize: 26,
                    fontWeight: 500,
                    background: 'var(--grad)',
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    color: 'transparent',
                  }}
                >
                  4.9 / 5 across 24 projects
                </div>
              </div>
              <Icon.Spark size={28} />
            </div>

            <Link
              to="/client/login"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '14px 18px',
                borderRadius: 14,
                background: 'var(--grad)',
                color: '#fff',
                fontSize: 14,
                fontWeight: 500,
                textDecoration: 'none',
              }}
            >
              Open the client portal <Icon.Arrow size={14} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

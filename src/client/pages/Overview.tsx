import { useEffect, useMemo, useState } from 'react';
import { ClientShell } from '@/client/components/ClientShell';
import {
  fetchProjectSnapshot,
  useClientSession,
  useProjectSnapshot,
  type ProjectActivity,
  type ProjectSnapshot,
} from '@/client/store';

function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatRelative(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const diff = Date.now() - then;
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function activityKindBadge(kind: ProjectActivity['kind']): { label: string; tone: string } {
  switch (kind) {
    case 'design':
      return { label: 'Design', tone: '#ff813a' };
    case 'build':
      return { label: 'Build', tone: '#e06820' };
    case 'copy':
      return { label: 'Copy', tone: '#cc6622' };
    case 'growth':
      return { label: 'Growth', tone: '#ff9a5c' };
    default:
      return { label: 'Update', tone: '#ff6b1a' };
  }
}

export function ClientOverview() {
  const user = useClientSession();
  const snap: ProjectSnapshot = useProjectSnapshot();
  const [now, setNow] = useState(() => Date.now());
  const [error, setError] = useState<string | null>(null);

  // Pull the latest snapshot from the server on mount. Cross-tab updates from
  // a team save still flow in via the shared store's storage listener.
  useEffect(() => {
    fetchProjectSnapshot().catch((err) => {
      setError(err instanceof Error ? err.message : 'Could not load project.');
    });
  }, []);

  // Keep relative timestamps fresh.
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(t);
  }, []);

  const currentPhase = useMemo(
    () => snap.phases.find((p) => p.id === snap.currentPhaseId) ?? null,
    [snap],
  );

  return (
    <ClientShell
      title={
        <>
          Welcome back,{' '}
          <span style={{ background: 'var(--grad)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>
            {user?.name?.split(' ')[0] ?? 'there'}
          </span>
        </>
      }
      sub={`Here's where ${snap.projectName} stands today.`}
    >
      {error && (
        <div className="adm-card adm-callout" style={{ marginBottom: 18 }}>
          <div style={{ fontWeight: 500, marginBottom: 4 }}>Couldn't load your project.</div>
          <div style={{ fontSize: 13, color: 'var(--fg-dim)' }}>{error}</div>
        </div>
      )}
      <OverviewBody snap={snap} now={now} currentPhase={currentPhase} />
    </ClientShell>
  );
}

function OverviewBody({
  snap,
  now,
  currentPhase,
}: {
  snap: ProjectSnapshot;
  now: number;
  currentPhase: ProjectSnapshot['phases'][number] | null;
}) {
  // `now` triggers the relative-timestamp recompute below; reference it once
  // so the linter doesn't think we're ignoring the prop.
  void now;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* Headline card */}
      <div
        className="adm-card"
        style={{
          padding: 28,
          position: 'relative',
          overflow: 'hidden',
          border: '1px solid var(--line-strong)',
          background: 'var(--card)',
        }}
      >
        <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <div className="mono" style={{ color: 'var(--fg-faint)', fontSize: 11, marginBottom: 8 }}>
              {snap.client} · {snap.slug}
            </div>
            <h2 className="display" style={{ fontSize: 28, fontWeight: 500, margin: 0 }}>
              {snap.projectName}
            </h2>
            <div style={{ marginTop: 10, display: 'flex', gap: 18, flexWrap: 'wrap', fontSize: 13, color: 'var(--fg-dim)' }}>
              <span>Started {formatDate(snap.startedOn)}</span>
              <span>Target {formatDate(snap.targetOn)}</span>
              <span style={{ color: 'var(--fg)' }}>
                Currently in <strong>{currentPhase?.title ?? '—'}</strong>
              </span>
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
                boxShadow: '0 0 10px #3ddc97',
                animation: 'pulse-dot 2s ease-in-out infinite',
              }}
            />
            {snap.status === 'active' ? 'Live' : snap.status === 'paused' ? 'Paused' : 'Wrapped'}
          </div>
        </div>

        <div style={{ position: 'relative', marginTop: 24 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: 12,
              color: 'var(--fg-faint)',
              marginBottom: 8,
            }}
          >
            <span className="mono">Overall progress</span>
            <span className="mono" style={{ color: 'var(--fg)' }}>{snap.overallPct}%</span>
          </div>
          <div
            style={{
              height: 8,
              borderRadius: 999,
              background: 'rgba(255,255,255,0.08)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${snap.overallPct}%`,
                background: 'var(--grad)',
                transition: 'width .6s cubic-bezier(.2,.7,.2,1)',
              }}
            />
          </div>
        </div>
      </div>

      {/* Stat tiles */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 14,
        }}
      >
        {snap.stats.map((s) => (
          <div
            key={s.id}
            className="adm-card"
            style={{ padding: 18 }}
          >
            <div className="mono" style={{ color: 'var(--fg-faint)', fontSize: 11 }}>
              {s.label}
            </div>
            <div
              className="display"
              style={{
                fontSize: 24,
                fontWeight: 500,
                marginTop: 6,
                background: 'var(--grad)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
              }}
            >
              {s.value}
            </div>
          </div>
        ))}
      </div>

      <div
        className="client-overview-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: '1.3fr 1fr',
          gap: 18,
          alignItems: 'start',
        }}
      >
        {/* Phases */}
        <div
          className="adm-card"
          style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}
        >
          <div className="adm-label">Phases</div>
          {snap.phases.map((p) => {
            const isActive = p.status === 'active';
            const isDone = p.status === 'done';
            return (
              <div
                key={p.id}
                style={{
                  padding: 16,
                  borderRadius: 14,
                  border: `1px solid ${isActive ? 'var(--accent-1)' : 'var(--line)'}`,
                  background: isActive ? 'var(--card-hover)' : 'rgba(255,255,255,0.015)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
                    <span className="mono" style={{ color: 'var(--fg-faint)' }}>{p.n}</span>
                    <span
                      className="display"
                      style={{ fontSize: 18, fontWeight: 500, color: isDone || isActive ? 'var(--fg)' : 'var(--fg-dim)' }}
                    >
                      {p.title}
                    </span>
                  </div>
                  <span
                    className="mono"
                    style={{
                      fontSize: 11,
                      color: isActive ? 'var(--accent-3)' : 'var(--fg-faint)',
                    }}
                  >
                    {isDone
                      ? `Done · ${formatDate(p.endedOn)}`
                      : isActive
                        ? `${p.pct}% · in progress`
                        : 'Up next'}
                  </span>
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
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                    gap: '6px 14px',
                  }}
                >
                  {p.deliverables.map((d) => (
                    <div
                      key={d.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        fontSize: 13,
                        color: d.done ? 'var(--fg)' : 'var(--fg-faint)',
                      }}
                    >
                      <span
                        aria-hidden="true"
                        style={{
                          width: 14,
                          height: 14,
                          borderRadius: 4,
                          border: '1px solid var(--line-strong)',
                          background: d.done ? 'var(--grad)' : 'transparent',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff',
                          fontSize: 10,
                          flexShrink: 0,
                        }}
                      >
                        {d.done ? '✓' : ''}
                      </span>
                      <span style={{ textDecoration: d.done ? 'line-through' : 'none' }}>{d.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Side column: next milestone + team + activity */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div
            className="adm-card"
            style={{
              padding: 20,
              border: '1px solid var(--line-strong)',
              background: 'var(--card-hover)',
            }}
          >
            <div className="mono" style={{ color: 'var(--fg-faint)', fontSize: 11, marginBottom: 6 }}>
              Next milestone · {formatDate(snap.nextMilestone.date)}
            </div>
            <div className="display" style={{ fontSize: 18, fontWeight: 500, marginBottom: 6 }}>
              {snap.nextMilestone.title}
            </div>
            <p style={{ margin: 0, color: 'var(--fg-dim)', fontSize: 13, lineHeight: 1.55 }}>
              {snap.nextMilestone.note}
            </p>
          </div>

          <div className="adm-card" style={{ padding: 20 }}>
            <div className="adm-label" style={{ marginBottom: 12 }}>
              Your team
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {snap.team.map((m) => (
                <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      background: `linear-gradient(135deg, ${m.tone}, var(--accent-3))`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontFamily: 'var(--font-display)',
                      fontSize: 12,
                      fontWeight: 600,
                      flexShrink: 0,
                    }}
                  >
                    {m.initial}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{m.name}</div>
                    <div className="mono" style={{ fontSize: 11, color: 'var(--fg-faint)' }}>
                      {m.role}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="adm-card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div className="adm-label" style={{ margin: 0 }}>Recent activity</div>
              <span className="mono" style={{ color: 'var(--fg-faint)', fontSize: 10 }}>
                Last {snap.activity.length}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {snap.activity.map((a, i) => {
                const badge = activityKindBadge(a.kind);
                return (
                  <div
                    key={a.id}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '28px 1fr auto',
                      gap: 12,
                      alignItems: 'center',
                      padding: '10px 0',
                      borderTop: i === 0 ? 'none' : '1px solid var(--line)',
                    }}
                  >
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        background: `linear-gradient(135deg, ${a.whoTone}, var(--accent-3))`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontFamily: 'var(--font-display)',
                        fontWeight: 600,
                        fontSize: 11,
                      }}
                    >
                      {a.whoInitial}
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--fg-dim)', lineHeight: 1.5 }}>
                      <span style={{ color: 'var(--fg)' }}>{a.whoName}</span> {a.what}
                      <span
                        className="mono"
                        style={{
                          marginLeft: 8,
                          padding: '2px 6px',
                          borderRadius: 4,
                          fontSize: 9,
                          color: badge.tone,
                          border: `1px solid ${badge.tone}55`,
                          background: `${badge.tone}15`,
                          letterSpacing: '0.06em',
                          textTransform: 'uppercase',
                        }}
                      >
                        {badge.label}
                      </span>
                    </div>
                    <div className="mono" style={{ fontSize: 10, color: 'var(--fg-faint)', textAlign: 'right' }}>
                      {formatRelative(a.when)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

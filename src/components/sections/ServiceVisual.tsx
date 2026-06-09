export type ServiceVisualKind = 'browser' | 'curve' | 'rocket' | 'kanban' | 'editor';

interface ServiceVisualProps {
  kind: ServiceVisualKind;
  hue: string;
  active: boolean;
}

export function ServiceVisual({ kind, hue, active }: ServiceVisualProps) {
  if (kind === 'browser') {
    return (
      <div style={{ position: 'absolute', inset: '14% 12%' }}>
        <div
          style={{
            background: 'rgba(0,0,0,0.35)',
            border: '1px solid var(--line)',
            borderRadius: 10,
            overflow: 'hidden',
            backdropFilter: 'blur(6px)',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              padding: '8px 10px',
              borderBottom: '1px solid var(--line)',
            }}
          >
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'rgba(255,255,255,0.18)' }} />
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'rgba(255,255,255,0.18)' }} />
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'rgba(255,255,255,0.18)' }} />
            <div
              style={{
                marginLeft: 8,
                height: 14,
                borderRadius: 4,
                background: 'rgba(255,255,255,0.07)',
                flex: 1,
                maxWidth: 120,
              }}
            />
          </div>
          <div style={{ flex: 1, padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ height: 10, borderRadius: 3, background: `${hue}66`, width: '40%' }} />
            <div style={{ height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.12)', width: '78%' }} />
            <div style={{ height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.1)', width: '62%' }} />
            <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
              <div
                style={{
                  height: 22,
                  borderRadius: 6,
                  background: hue,
                  width: 64,
                  boxShadow: `0 6px 18px ${hue}50`,
                  animation: active ? 'pulse-dot 2.4s ease-in-out infinite' : 'none',
                }}
              />
              <div style={{ height: 22, borderRadius: 6, background: 'rgba(255,255,255,0.08)', width: 54 }} />
            </div>
            <div
              style={{
                marginTop: 'auto',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontFamily: 'var(--font-mono)',
                fontSize: 9,
                color: 'rgba(255,255,255,0.5)',
                letterSpacing: '0.1em',
              }}
            >
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }} />
              LCP 1.1s · CLS 0.02 · INP 80ms
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (kind === 'curve') {
    const pts = [10, 35, 28, 55, 50, 70, 78, 88, 95];
    return (
      <svg
        viewBox="0 0 300 180"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id={`g-${kind}`} x1="0" x2="1">
            <stop offset="0" stopColor={hue} stopOpacity="0.5" />
            <stop offset="1" stopColor={hue} stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 1, 2, 3].map((i) => (
          <line key={i} x1="0" x2="300" y1={45 * (i + 1)} y2={45 * (i + 1)} stroke="rgba(255,255,255,0.06)" />
        ))}
        <path
          d={`M 0 ${180 - pts[0] * 1.5} ${pts.map((p, i) => `L ${(i + 1) * (300 / pts.length)} ${180 - p * 1.6}`).join(' ')} L 300 180 L 0 180 Z`}
          fill={`url(#g-${kind})`}
        />
        <path
          d={`M 0 ${180 - pts[0] * 1.5} ${pts.map((p, i) => `L ${(i + 1) * (300 / pts.length)} ${180 - p * 1.6}`).join(' ')}`}
          stroke={hue}
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
          strokeDasharray="600"
          strokeDashoffset={active ? '0' : '600'}
          style={{ transition: 'stroke-dashoffset 1.6s cubic-bezier(.2,.7,.2,1)' }}
        />
        {pts.map((p, i) => (
          <circle
            key={i}
            cx={(i + 1) * (300 / pts.length)}
            cy={180 - p * 1.6}
            r="3.5"
            fill={hue}
            opacity={active ? 1 : 0}
            style={{ transition: `opacity .3s ${i * 0.08}s` }}
          />
        ))}
      </svg>
    );
  }

  if (kind === 'rocket') {
    return (
      <svg viewBox="0 0 300 180" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <defs>
          <linearGradient id="rk" x1="0" x2="1">
            <stop offset="0" stopColor={hue} stopOpacity="0" />
            <stop offset="1" stopColor={hue} stopOpacity="0.7" />
          </linearGradient>
        </defs>
        <path d="M 10 160 Q 130 160 200 60" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" fill="none" strokeDasharray="3 5" />
        <path
          d="M 10 160 Q 130 160 200 60"
          stroke="url(#rk)"
          strokeWidth="2"
          fill="none"
          strokeDasharray="220"
          strokeDashoffset={active ? 0 : 220}
          style={{ transition: 'stroke-dashoffset 1.4s cubic-bezier(.2,.7,.2,1)' }}
        />
        {[
          [40, 40],
          [70, 90],
          [230, 30],
          [260, 100],
          [180, 20],
          [120, 50],
        ].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="1.4" fill="white" opacity={0.5} />
        ))}
        <g
          transform={`translate(${active ? 200 : 10}, ${active ? 60 : 160}) rotate(${active ? -50 : -10})`}
          style={{ transition: 'transform 1.4s cubic-bezier(.2,.7,.2,1)' }}
        >
          <path d="M 0 0 L -6 14 L 6 14 Z" fill={hue} />
          <circle cx="0" cy="4" r="2.6" fill="white" />
          <path d="M -8 14 L -10 22 L -4 17 Z M 8 14 L 10 22 L 4 17 Z" fill={hue} opacity="0.7" />
          <path d="M -3 16 Q 0 28 3 16 Z" fill="#f59e0b" opacity={active ? 1 : 0} />
        </g>
        <circle cx="200" cy="60" r="10" stroke={hue} strokeWidth="1.5" fill="none" />
        <circle cx="200" cy="60" r="4" fill={hue} />
      </svg>
    );
  }

  if (kind === 'kanban') {
    const cols: Array<[string, number[]]> = [
      ['#ff813a', [1, 1]],
      [hue, [1, 1, 1]],
      ['#ff9a5c', [1]],
    ];
    return (
      <div style={{ position: 'absolute', inset: '14% 12%', display: 'flex', gap: 8 }}>
        {cols.map(([c, items], i) => (
          <div
            key={i}
            style={{
              flex: 1,
              padding: 8,
              borderRadius: 8,
              background: 'rgba(0,0,0,0.25)',
              border: '1px solid var(--line)',
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: c }} />
              <div style={{ height: 5, borderRadius: 2, background: 'rgba(255,255,255,0.18)', flex: 1 }} />
            </div>
            {items.map((_, k) => (
              <div
                key={k}
                style={{
                  borderRadius: 6,
                  padding: 6,
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid var(--line)',
                  animation: active
                    ? `fade-up .5s cubic-bezier(.2,.7,.2,1) both ${k * 0.12 + i * 0.08}s`
                    : 'none',
                }}
              >
                <div
                  style={{
                    height: 4,
                    borderRadius: 2,
                    background: 'rgba(255,255,255,0.25)',
                    width: '75%',
                    marginBottom: 5,
                  }}
                />
                <div style={{ height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.12)', width: '50%' }} />
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }

  if (kind === 'editor') {
    return (
      <div
        style={{
          position: 'absolute',
          inset: '14% 12%',
          background: 'rgba(0,0,0,0.25)',
          border: '1px solid var(--line)',
          borderRadius: 10,
          padding: 14,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          overflow: 'hidden',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
          <div style={{ width: 14, height: 14, borderRadius: 4, background: `${hue}66` }} />
          <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.22)', width: 80 }} />
          <div style={{ flex: 1 }} />
          <div className="mono" style={{ fontSize: 8, color: 'rgba(255,255,255,0.45)' }}>
            EDITING
          </div>
        </div>
        <div
          style={{
            height: 14,
            borderRadius: 4,
            background: `${hue}55`,
            width: active ? '92%' : '50%',
            transition: 'width 1.2s cubic-bezier(.2,.7,.2,1)',
          }}
        />
        {[0.9, 0.75, 0.85, 0.6, 0.7].map((w, i) => (
          <div
            key={i}
            style={{
              height: 5,
              borderRadius: 3,
              background: 'rgba(255,255,255,0.14)',
              width: active ? `${w * 100}%` : `${w * 60}%`,
              transition: `width 1s cubic-bezier(.2,.7,.2,1) ${i * 0.08}s`,
            }}
          />
        ))}
        <div
          style={{
            width: 2,
            height: 14,
            background: hue,
            marginTop: 4,
            opacity: active ? 1 : 0,
            animation: active ? 'pulse-dot 1s ease-in-out infinite' : 'none',
          }}
        />
      </div>
    );
  }

  return null;
}

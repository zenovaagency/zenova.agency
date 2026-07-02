interface ProjectVisualProps {
  idx: number;
  tone: string;
  animate: boolean;
}

export function ProjectVisual({ idx, tone, animate }: ProjectVisualProps) {
  if (idx === 0) {
    const bars = [40, 70, 35, 90, 55, 75, 50];
    return (
      <div
        style={{
          position: 'absolute',
          inset: '24% 14% 14%',
          display: 'flex',
          alignItems: 'flex-end',
          gap: 10,
        }}
      >
        {bars.map((h, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: `${animate ? h + 10 : h}%`,
              background: `linear-gradient(180deg, ${tone}, ${tone}40)`,
              borderRadius: 6,
              transition: 'height .6s cubic-bezier(.2,.7,.2,1)',
              transitionDelay: `${i * 40}ms`,
              boxShadow: `inset 0 1px 0 rgba(255,255,255,0.15)`,
            }}
          />
        ))}
      </div>
    );
  }

  if (idx === 1) {
    const r = 64;
    const c = 2 * Math.PI * r;
    return (
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg width={200} height={200} viewBox="0 0 200 200">
          <circle cx="100" cy="100" r={r} stroke="rgba(255,255,255,0.08)" strokeWidth="14" fill="none" />
          <circle
            cx="100"
            cy="100"
            r={r}
            stroke={tone}
            strokeWidth="14"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={animate ? c * 0.18 : c * 0.35}
            transform="rotate(-90 100 100)"
            style={{ transition: 'stroke-dashoffset .8s cubic-bezier(.2,.7,.2,1)' }}
          />
          <text x="100" y="105" textAnchor="middle" fontFamily="Clash Display" fontSize="34" fill="white" fontWeight="500">
            {animate ? '82%' : '65%'}
          </text>
          <text
            x="100"
            y="128"
            textAnchor="middle"
            fontFamily="Satoshi"
            fontSize="11"
            fill="rgba(255,255,255,0.5)"
            letterSpacing="0.1em"
          >
            ACTIVE USERS
          </text>
        </svg>
      </div>
    );
  }

  if (idx === 2) {
    const yA = [170, 120, 150, 90, 80, 60];
    return (
      <div style={{ position: 'absolute', inset: '20% 12% 14%' }}>
        <svg width="100%" height="100%" viewBox="0 0 300 200" preserveAspectRatio="none">
          <defs>
            <linearGradient id="lg" x1="0" x2="1">
              <stop offset="0" stopColor={tone} stopOpacity="0.4" />
              <stop offset="1" stopColor={tone} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d={`M0 ${animate ? 160 : 170} C 60 ${animate ? 100 : 120}, 120 ${animate ? 140 : 150}, 180 ${
              animate ? 60 : 90
            }, 240 ${animate ? 40 : 80}, 300 ${animate ? 20 : 60}`}
            stroke={tone}
            strokeWidth="2.5"
            fill="none"
          />
          <path
            d={`M0 ${animate ? 160 : 170} C 60 ${animate ? 100 : 120}, 120 ${animate ? 140 : 150}, 180 ${
              animate ? 60 : 90
            }, 240 ${animate ? 40 : 80}, 300 ${animate ? 20 : 60} L 300 200 L 0 200 Z`}
            fill="url(#lg)"
          />
          {[0, 60, 120, 180, 240, 300].map((x, i) => (
            <circle key={i} cx={x} cy={yA[i] + (animate ? -15 : 0)} r="4" fill={tone} />
          ))}
        </svg>
      </div>
    );
  }

  return (
    <div style={{ position: 'absolute', inset: '14%', display: 'flex', flexDirection: 'column', gap: 8 }}>
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          style={{
            flex: 1,
            background: `linear-gradient(90deg, ${tone}30, ${tone}05)`,
            border: '1px solid var(--line)',
            borderRadius: 10,
            padding: '8px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            transform: animate ? `translateX(${i % 2 ? 6 : -6}px)` : 'translateX(0)',
            transition: 'transform .5s',
            transitionDelay: `${i * 40}ms`,
          }}
        >
          <div style={{ width: 18, height: 18, borderRadius: 5, background: tone, opacity: 0.7 }} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.15)', width: '70%' }} />
            <div style={{ height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.08)', width: '40%' }} />
          </div>
        </div>
      ))}
    </div>
  );
}

import { GhostButton } from '@/components/ui/GhostButton';
import { NeonButton } from '@/components/ui/NeonButton';
import { RotatingWords } from '@/components/ui/RotatingWords';
import { useContent } from '@/admin/store';

interface HeroProps {
  rotateMs: number;
}

export function Hero({ rotateMs }: HeroProps) {
  const [content] = useContent();
  const SERVICES = content.hero.rotatingWords;
  const STATS = content.hero.stats;
  return (
    <section
      id="top"
      className="hero-section"
      style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '120px 24px 80px',
        overflow: 'hidden',
      }}
    >
      {/* <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', zIndex: -1 }}>
        <div
          style={{
            position: 'absolute',
            top: '8%',
            left: '18%',
            width: 560,
            height: 560,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(58,91,255,0.45), transparent 60%)',
            filter: 'blur(80px)',
            animation: 'blob1 22s linear infinite',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '2%',
            right: '8%',
            width: 520,
            height: 520,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(168,85,247,0.4), transparent 60%)',
            filter: 'blur(80px)',
            animation: 'blob2 26s linear infinite',
          }}
        />
      </div> */}

      <div style={{ maxWidth: 1100, width: '100%', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            padding: '8px 16px',
            borderRadius: 999,
            border: '1px solid var(--line)',
            background: 'rgba(255,255,255,0.02)',
            backdropFilter: 'blur(16px)',
            fontSize: 13,
            color: 'var(--fg-dim)',
            marginBottom: 32,
            boxShadow: '0 0 24px rgba(109,76,255,0.1), 0 0 60px rgba(109,76,255,0.04)',
            animation: 'fade-up .9s cubic-bezier(.2,.7,.2,1) both',
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: 'var(--accent-1)',
              boxShadow: '0 0 12px var(--accent-1)',
              animation: 'pulse-dot 2s ease-in-out infinite',
            }}
          />
          {content.hero.badge}
        </div>

        <h1
          className="display hero-headline"
          style={{ margin: 0, animation: 'fade-up 1s cubic-bezier(.2,.7,.2,1) both' }}
        >
          {content.hero.headline}
        </h1>
        <div
          className="hero-rotating-row"
          style={{ animation: 'fade-up 1s cubic-bezier(.2,.7,.2,1) both .05s' }}
        >
          <RotatingWords words={SERVICES} intervalMs={rotateMs} />
        </div>

        <p
          style={{
            marginTop: 36,
            fontSize: 'clamp(16px, 1.4vw, 20px)',
            color: 'var(--fg-dim)',
            maxWidth: 640,
            marginLeft: 'auto',
            marginRight: 'auto',
            lineHeight: 1.55,
            animation: 'fade-up 1.1s cubic-bezier(.2,.7,.2,1) both .15s',
          }}
        >
          {content.hero.sub}
        </p>

        <div
          className="hero-cta-row"
          style={{
            marginTop: 44,
            display: 'flex',
            gap: 12,
            flexWrap: 'wrap',
            justifyContent: 'center',
            animation: 'fade-up 1.2s cubic-bezier(.2,.7,.2,1) both .3s',
          }}
        >
          <NeonButton
            text={content.hero.primaryCta}
            onClick={() => {
              const href = content.hero.primaryCtaHref || '/contact';
              window.location.href = href;
            }}
          />
          <GhostButton
            text={content.hero.secondaryCta}
            onClick={() => {
              const href = content.hero.secondaryCtaHref || '#services';
              window.location.href = href;
            }}
          />
        </div>

        <div
          className="hero-stats"
          style={{
            marginTop: 80,
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 24,
            maxWidth: 820,
            marginLeft: 'auto',
            marginRight: 'auto',
            padding: '24px 0',
            borderTop: '1px solid var(--line)',
            borderBottom: '1px solid var(--line)',
            animation: 'fade-up 1.3s cubic-bezier(.2,.7,.2,1) both .45s',
          }}
        >
          {STATS.map((stat) => (
            <div key={stat.id} style={{ textAlign: 'center' }}>
              <div className="display" style={{ fontSize: 'clamp(20px,2.2vw,28px)', fontWeight: 500 }}>
                {stat.num}
              </div>
              <div className="mono" style={{ color: 'var(--fg-faint)', marginTop: 6 }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: 160,
          background: 'linear-gradient(to top, var(--bg), transparent)',
        }}
      />
    </section>
  );
}

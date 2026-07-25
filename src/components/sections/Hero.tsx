import { GhostButton } from '@/components/ui/GhostButton';
import { NeonButton } from '@/components/ui/NeonButton';
import { RotatingWords } from '@/components/ui/RotatingWords';
import { AvailabilityPill } from '@/components/ui/AvailabilityPill';
import { useContent } from '@/admin/store';

interface HeroProps {
  rotateMs: number;
}

export function Hero({ rotateMs }: HeroProps) {
  const [content] = useContent();
  const SERVICES = content.hero.rotatingWords;
  return (
    <section id="top" className="hero-section">
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

      <div className="hero-ambient" aria-hidden="true" />

      <div style={{ maxWidth: 1100, width: '100%', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <div
          style={{
            marginBottom: 32,
            animation: 'fade-up 1.2s cubic-bezier(.2,.7,.2,1) both .2s',
          }}
        >
          <AvailabilityPill text={content.hero.badge} />
        </div>

        <h1
          className="display hero-headline"
          style={{ margin: 0, animation: 'fade-up 1.4s cubic-bezier(.2,.7,.2,1) both .35s' }}
        >
          {content.hero.headline}
        </h1>
        <div
          className="hero-rotating-row"
          style={{ animation: 'fade-up 1.4s cubic-bezier(.2,.7,.2,1) both .5s' }}
        >
          <RotatingWords words={SERVICES} intervalMs={rotateMs} />
        </div>

        <p
          className="hero-sub"
          style={{ animation: 'fade-up 1.4s cubic-bezier(.2,.7,.2,1) both .7s' }}
        >
          {content.hero.sub}
        </p>

        <div
          className="hero-cta-row"
          style={{ animation: 'fade-up 1.4s cubic-bezier(.2,.7,.2,1) both .9s' }}
        >
          <NeonButton
            text={content.hero.primaryCta}
            to={content.hero.primaryCtaHref || '/contact'}
          />
          <GhostButton
            text={content.hero.secondaryCta}
            to={content.hero.secondaryCtaHref || '#services'}
          />
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

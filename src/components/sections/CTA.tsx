import { GhostButton } from '@/components/ui/GhostButton';
import { NeonButton } from '@/components/ui/NeonButton';
import { useContent } from '@/admin/store';

export function CTA() {
  const [content] = useContent();
  const cta = content.cta;
  return (
    <section id="contact" className="sec" style={{ paddingBottom: 80 }}>
      <div className="container">
        <div
          className="cta-card"
          style={{
            position: 'relative',
            overflow: 'hidden',
            borderRadius: 32,
            padding: '80px 48px',
            background: 'var(--card)',
            border: '1px solid var(--line-strong)',
            textAlign: 'center',
          }}
        >
          <div style={{ position: 'relative' }}>
            <div className="mono" style={{ color: 'var(--fg-dim)', marginBottom: 20 }}>
              {cta.eyebrow}
            </div>
            <h2 className="display" style={{ fontSize: 'clamp(40px, 6vw, 80px)', margin: 0, fontWeight: 500 }}>
              {cta.title}
              <br />
              <span className="gradient-text">{cta.accentTitle}</span>
            </h2>
            <p
              className="cta-sub"
              style={{
                marginTop: 24,
                fontSize: 18,
                color: 'var(--fg-dim)',
                maxWidth: 540,
                marginLeft: 'auto',
                marginRight: 'auto',
                lineHeight: 1.55,
              }}
            >
              {cta.sub}
            </p>
            <div style={{ marginTop: 40, display: 'flex', justifyContent: 'center', gap: 14, flexWrap: 'wrap' }}>
              <NeonButton
                text={cta.primary}
                onClick={() => {
                  if (cta.primaryHref) window.location.href = cta.primaryHref;
                }}
              />
              <GhostButton
                text={cta.secondary}
                onClick={() => {
                  if (cta.secondaryHref) window.location.href = cta.secondaryHref;
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

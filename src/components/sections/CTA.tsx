'use client';
import { GhostButton } from '@/components/ui/GhostButton';
import { NeonButton } from '@/components/ui/NeonButton';
import { useContent } from '@/admin/store';

export function CTA() {
  const [content] = useContent();
  const cta = content.cta;
  return (
    <section id="contact" className="sec sec--cta">
      <div className="container">
        <div className="cta-card reveal">
          <div style={{ position: 'relative' }}>
            <div className="mono" style={{ color: 'var(--fg-dim)', marginBottom: 20 }}>
              {cta.eyebrow}
            </div>
            <h2 className="display" style={{ fontSize: 'clamp(40px, 6vw, 80px)', margin: 0, fontWeight: 500 }}>
              {cta.title}
              <br />
              <span className="gradient-text accent-italic">{cta.accentTitle}</span>
            </h2>
            <p className="cta-sub">{cta.sub}</p>
            <div className="cta-actions">
              <NeonButton text={cta.primary} to={cta.primaryHref || '/contact'} />
              <GhostButton text={cta.secondary} to={cta.secondaryHref || '/services'} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

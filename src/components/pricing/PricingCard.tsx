'use client';
import { Link } from '@/lib/router';
import { motion } from 'framer-motion';
import { Icon } from '@/components/icons/Icon';
import type { PricingPlan } from '@/data/pricing';
import './pricing-card.css';

interface PricingCardProps {
  plan: PricingPlan;
  hue: string;
  reduceMotion: boolean;
  /** When true (admin preview) the CTA is inert and cards don't navigate. */
  preview?: boolean;
}

/**
 * Presentational rate card. Styled to match the service detail package card
 * (`.sd-package`) with a CTA button at the bottom. Rendered identically on the
 * public /pricing page and inside the admin Pricing manager's live preview.
 */
export function PricingCard({ plan, hue, reduceMotion, preview = false }: PricingCardProps) {
  const ctaClass = `${plan.highlighted ? 'btn-primary' : 'btn-ghost'} pcx-card__cta`;
  return (
    <motion.article
      className={`pcx-card${plan.highlighted ? ' is-hot' : ''}`}
      style={{ '--hue': hue } as React.CSSProperties}
      variants={{
        hidden: reduceMotion ? { opacity: 0 } : { opacity: 0, y: 18 },
        show: {
          opacity: 1,
          y: 0,
          transition: reduceMotion ? { duration: 0 } : { duration: 0.35, ease: [0.2, 0.7, 0.2, 1] },
        },
      }}
    >
      {plan.highlighted && <span className="pcx-card__flag mono">Most popular</span>}
      <h3 className="pcx-card__name display">{plan.name || 'Untitled plan'}</h3>
      <div className="pcx-card__price display">{plan.price || '—'}</div>
      <div className="pcx-card__terms mono">
        One-time{plan.timeline ? ` · ${plan.timeline}` : ''}
      </div>
      {plan.info && <p className="pcx-card__info">{plan.info}</p>}
      <ul className="pcx-card__features">
        {plan.features.map((f, i) => (
          <li key={`${f}-${i}`}>
            <span className="pcx-card__check">
              <Icon.Check size={11} />
            </span>
            {f}
          </li>
        ))}
      </ul>
      <div className="pcx-card__foot">
        {preview ? (
          <span className={`${ctaClass} pcx-card__cta--static`} aria-hidden="true">
            {plan.cta || 'Start this project'}
          </span>
        ) : (
          <Link to="/contact" className={ctaClass}>
            {plan.cta || 'Start this project'}
          </Link>
        )}
      </div>
    </motion.article>
  );
}

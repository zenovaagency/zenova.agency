import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Icon } from '@/components/icons/Icon';
import { NeonButton } from '@/components/ui/NeonButton';
import { GhostButton } from '@/components/ui/GhostButton';
import { PricingCard } from '@/components/pricing/PricingCard';
import { useContent, useServices } from '@/admin/store';
import { PRICING } from '@/data/pricing';
import { scrollToTop } from '@/lib/scroll';
import './PricingPage.css';

/** Assurances that apply to every engagement — reinforces the flat-rate promise. */
const TRUST: Array<{ icon: keyof typeof Icon; title: string; body: string }> = [
  { icon: 'Check', title: 'Fixed quote', body: 'One number, agreed after scoping. It only moves if the scope does.' },
  { icon: 'Clock', title: 'No retainers', body: 'Project-based, not open-ended. No hourly surprises on the invoice.' },
  { icon: 'Spark', title: 'Senior team', body: 'The people who scope your project are the ones who build it.' },
  { icon: 'Rocket', title: 'Support included', body: 'Every tier ships with a post-launch support window baked in.' },
];

/** Pricing-specific FAQ. Hardcoded on purpose — kept simple, no CMS field. */
const PRICING_FAQ: Array<{ q: string; a: string }> = [
  {
    q: 'What does the price actually include?',
    a: 'Everything needed to ship the scope we agree on — strategy, design, build, and launch. If it is in the scope, it is in the price. No line-item surprises.',
  },
  {
    q: 'Why one-time pricing instead of monthly retainers?',
    a: 'We scope, price, and ship each engagement as a project. You own the outcome and are never locked into an open-ended monthly bill.',
  },
  {
    q: 'What if my project does not fit a listed tier?',
    a: 'Most do not fit exactly — the rate cards are honest starting points. Book a scoping call and we will shape a fixed quote around your actual needs.',
  },
  {
    q: 'Can the price change mid-project?',
    a: 'Only if the scope does. The number we agree on after scoping is fixed; any new request gets its own small, clearly-quoted add-on.',
  },
  {
    q: 'How do payments work?',
    a: 'Typically split across milestones — a deposit to start, then staged payments as we ship. The full schedule is laid out in your proposal.',
  },
];

export function PricingPage() {
  const [content] = useContent();
  const [services] = useServices();
  // Rate cards come from the admin content store (Admin → Pricing);
  // fall back to the bundled defaults until it's hydrated/populated.
  const pricing = content.pricing?.length ? content.pricing : PRICING;

  // Drive tabs from the services list so slugs/labels/hues always match.
  // Plans are looked up from pricing by slug; services without a pricing
  // entry still get a tab (with no plans shown).
  const pricingBySlug = new Map(pricing.map((p) => [p.slug, p]));
  const tabs = services.map((s) => ({
    slug: s.slug,
    label: s.title,
    hue: s.hue,
    plans: pricingBySlug.get(s.slug)?.plans ?? [],
  }));

  const [active, setActive] = useState(() => tabs[0]?.slug ?? '');
  const reduceMotion = useReducedMotion() ?? false;
  const tabsScrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    scrollToTop();
  }, []);

  // When the tab row overflows, translate wheel input into horizontal scroll;
  // otherwise let the event through so the page keeps scrolling (Lenis).
  useEffect(() => {
    const el = tabsScrollRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (el.scrollWidth <= el.clientWidth) return;
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      el.scrollLeft += delta;
      e.preventDefault();
      e.stopPropagation();
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  // Fall back to the first tab if the active slug disappears (e.g. after
  // hydration replaces the list or a tab is removed in the admin).
  const current = tabs.find((t) => t.slug === active) ?? tabs[0];

  return (
    <div className="pcx">
      <header className="pcx-hero">
        <div className="container">
          <div className="pcx-hero__kicker mono reveal">
            <span className="pcx-hero__tick" />
            Pricing — project-based · one-time
          </div>
          <h1 className="pcx-hero__title display reveal reveal-blur reveal-d1">
            One project.
            <br />
            <em>One price.</em>
          </h1>
          <p className="pcx-hero__sub reveal reveal-d2">
            No retainers, no hourly surprises. Every engagement is scoped once, priced once, and
            shipped as a project. Pick a service to see its rate card.
          </p>
        </div>
      </header>

      <div className="pcx-tabs">
        <div className="container">
          <div className="pcx-tabs__scroll" ref={tabsScrollRef}>
            <div className="pcx-tabs__row" role="tablist" aria-label="Service pricing">
              {tabs.map((s) => (
                <button
                  key={s.slug}
                  type="button"
                  role="tab"
                  aria-selected={current.slug === s.slug}
                  className={`pcx-tab${current.slug === s.slug ? ' is-active' : ''}`}
                  style={{ '--hue': s.hue } as React.CSSProperties}
                  onClick={() => setActive(s.slug)}
                >
                  {current.slug === s.slug && (
                    <motion.span
                      className="pcx-tab__pill"
                      layoutId="pricing-tab"
                      transition={
                        reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 400, damping: 32 }
                      }
                    />
                  )}
                  <span className="pcx-tab__label">{s.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <section className="pcx-panel">
        <div className="container">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.slug}
              role="tabpanel"
              style={{ '--hue': current.hue } as React.CSSProperties}
              initial="hidden"
              animate="show"
              exit={
                reduceMotion
                  ? { opacity: 0, transition: { duration: 0 } }
                  : { opacity: 0, y: -12, transition: { duration: 0.18, ease: 'easeIn' } }
              }
              variants={{
                hidden: {},
                show: { transition: { staggerChildren: 0.07, delayChildren: 0.04 } },
              }}
            >
              <div className="pcx-panel__meta mono">
                <span>{current.label} — rate card</span>
                <span>{current.plans.length} tiers · fixed quote after scoping</span>
              </div>
              <div className="pcx-grid">
                {current.plans.map((plan) => (
                  <PricingCard key={plan.id} plan={plan} hue={current.hue} reduceMotion={reduceMotion} />
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      <section className="pcx-trust">
        <div className="container">
          <div className="pcx-trust__grid">
            {TRUST.map((t) => {
              const Ico = Icon[t.icon];
              return (
                <div key={t.title} className="pcx-trust__item reveal reveal-blur">
                  <span className="pcx-trust__icon">
                    <Ico size={18} />
                  </span>
                  <div>
                    <div className="pcx-trust__title">{t.title}</div>
                    <p className="pcx-trust__body">{t.body}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="pcx-faq">
        <div className="container pcx-faq__inner">
          <div className="pcx-faq__head">
            <div className="pcx-faq__label mono">FAQ</div>
            <h2 className="pcx-faq__title display">Pricing, answered.</h2>
            <p className="pcx-faq__sub">
              The questions we get before every scoping call. If yours isn&rsquo;t here, just ask.
            </p>
          </div>
          <div className="pcx-faq__list">
            {PRICING_FAQ.map((item) => (
              <details key={item.q} className="pcx-faq__item">
                <summary className="pcx-faq__q">
                  <span>{item.q}</span>
                  <span className="pcx-faq__chevron" aria-hidden="true">
                    <Icon.Chevron size={16} />
                  </span>
                </summary>
                <p className="pcx-faq__a">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="pcx-note">
        <div className="container pcx-note__inner">
          <div className="pcx-note__label mono">Good to know</div>
          <h2 className="pcx-note__title display">
            Every quote is fixed
            <br />
            before we start.
          </h2>
          <p className="pcx-note__sub">
            These prices are honest starting points. After one scoping call you get a fixed quote and
            a real timeline — and that number doesn&rsquo;t move unless the scope does.
          </p>
          <div className="pcx-note__actions">
            <NeonButton text="Book a scoping call" onClick={() => { window.location.href = '/contact'; }} />
            <GhostButton text="See our process" onClick={() => { window.location.href = '/services'; }} />
          </div>
        </div>
      </section>
    </div>
  );
}

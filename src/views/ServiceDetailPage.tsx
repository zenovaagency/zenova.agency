'use client';

import { Link, Navigate, useParams } from '@/lib/router';
import { NeonButton } from '@/components/ui/NeonButton';
import { GhostButton } from '@/components/ui/GhostButton';
import { ServiceVisual } from '@/components/sections/ServiceVisual';
import { ServiceMedia } from '@/components/sections/ServiceMedia';
import { Icon, type IconComponent } from '@/components/icons/Icon';
import { useServices } from '@/admin/store';
import './ServiceDetailPage.css';

export function ServiceDetailPage() {
  const { slug = '' } = useParams();
  const [SERVICES] = useServices();
  const service = SERVICES.find((s) => s.slug === slug);

  // The head tags for this route are produced by generateMetadata() in the
  // matching app/ route, from the same seo-data table that feeds the sitemap.
  // A client-side setDynamicSeo() effect used to do it instead, which meant
  // the tags only existed after hydration — invisible to crawlers and to every
  // social scraper.

  if (!service) {
    return <Navigate to="/services" replace />;
  }

  const IconC = Icon[service.icon] as IconComponent;
  const related = service.related
    .map((r) => SERVICES.find((s) => s.slug === r))
    .filter((s): s is NonNullable<typeof s> => Boolean(s));

  return (
    <div className="sd" style={{ '--hue': service.hue } as React.CSSProperties}>
      <header className="sd-header">
        <div className="container">
          <nav className="sd-crumbs mono" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <span>/</span>
            <Link to="/services">Services</Link>
            <span>/</span>
            <span className="sd-crumbs__here">{service.title}</span>
          </nav>

          <div className="sd-header__tag reveal">
            <span className="sd-header__tag-icon">
              <IconC size={16} />
            </span>
            <span className="mono">{service.tag}</span>
          </div>

          <h1 className="sd-header__title display reveal reveal-blur reveal-d1">{service.title}</h1>
          <p className="sd-header__sub reveal reveal-d2">{service.hero}</p>

          {service.meta.length > 0 && (
            <dl className="sd-spec reveal reveal-d3">
              {service.meta.map(([value, label]) => (
                <div key={label} className="sd-spec__cell">
                  <dt className="mono">{label}</dt>
                  <dd className="display">{value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </header>

      <div className="container sd-body">
        <aside className="sd-rail reveal">
          <div className="sd-rail__visual">
            {service.image || service.video ? (
              <ServiceMedia image={service.image} video={service.video} alt={service.title} loading="lazy" objectFit="cover" />
            ) : (
              <ServiceVisual kind={service.visual} hue={service.hue} active />
            )}
          </div>

          {(service.short || service.hero) && (
            <div className="sd-rail__note">
              <h2 className="sd-label mono">Overview</h2>
              <p>{service.short || service.hero}</p>
            </div>
          )}

          <ul className="sd-rail__bullets">
            {service.bullets.map((b) => (
              <li key={b}>
                <span className="sd-check">
                  <Icon.Check size={11} />
                </span>
                {b}
              </li>
            ))}
          </ul>

          {service.stack.length > 0 && (
            <div className="sd-rail__stack">
              <h2 className="sd-label mono">Stack</h2>
              <div className="sd-rail__chips">
                {service.stack.map((t) => (
                  <span key={t} className="sd-chip mono">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="sd-rail__cta">
            <NeonButton text="Start this project" to="/contact" />
          </div>
        </aside>

        {/* A plain div, not <main>: the route layout owns the single
            <main id="main-content"> landmark. This element used to be a second
            <main> nested inside it, which is invalid HTML and puts two "main"
            entries in a screen reader's landmark list. */}
        <div className="sd-content">
          <p className="sd-lede display reveal reveal-d1">{service.lede}</p>

          {service.deliverables.length > 0 && (
            <section className="sd-section reveal">
              <h2 className="sd-label mono">What you get</h2>
              <div className="sd-deliverables">
                {service.deliverables.map((d, i) => (
                  <div key={d.title} className="sd-deliverable">
                    <span className="sd-deliverable__num mono">{String(i + 1).padStart(2, '0')}</span>
                    <h3 className="sd-deliverable__title display">{d.title}</h3>
                    <p className="sd-deliverable__blurb">{d.blurb}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {service.phases.length > 0 && (
            <section className="sd-section reveal">
              <h2 className="sd-label mono">How it runs</h2>
              <div className="sd-phases">
                {service.phases.map((p) => (
                  <div key={p.n} className="sd-phase">
                    <span className="sd-phase__num mono">{p.n}</span>
                    <div className="sd-phase__main">
                      <h3 className="sd-phase__title display">{p.title}</h3>
                      <p className="sd-phase__blurb">{p.blurb}</p>
                    </div>
                    <div className="sd-phase__out">
                      <span className="mono">Out →</span> {p.out}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {service.packages.length > 0 && (
            <section className="sd-section reveal">
              <h2 className="sd-label mono">Packages</h2>
              <div className="sd-packages">
                {service.packages.map((pkg) => (
                  <div key={pkg.name} className={`sd-package${pkg.featured ? ' is-featured' : ''}`}>
                    {pkg.featured && <span className="sd-package__flag mono">Popular</span>}
                    <h3 className="sd-package__name display">{pkg.name}</h3>
                    <div className="sd-package__price display">{pkg.price}</div>
                    <div className="sd-package__cadence mono">{pkg.cadence}</div>
                    <p className="sd-package__fits">{pkg.fits}</p>
                    <ul className="sd-package__includes">
                      {pkg.includes.map((inc) => (
                        <li key={inc}>
                          <span className="sd-check">
                            <Icon.Check size={11} />
                          </span>
                          {inc}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          )}

          {service.faqs.length > 0 && (
            <section className="sd-section reveal">
              <h2 className="sd-label mono">Questions</h2>
              <div className="sd-faqs">
                {service.faqs.map((f) => (
                  <div key={f.q} className="sd-faq">
                    <h3 className="sd-faq__q display">{f.q}</h3>
                    <p className="sd-faq__a">{f.a}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <section className="sd-related">
          <div className="container">
            <h2 className="sd-label mono reveal">Pairs well with</h2>
            <div className="sd-related__list reveal reveal-d1">
              {related.map((r) => {
                const RIcon = Icon[r.icon] as IconComponent;
                return (
                  <Link
                    key={r.slug}
                    to={`/services/${r.slug}`}
                    className="sd-related__row"
                    style={{ '--hue': r.hue } as React.CSSProperties}
                  >
                    <span className="sd-related__icon">
                      <RIcon size={18} />
                    </span>
                    <span className="sd-related__text">
                      <span className="sd-related__title display">{r.title}</span>
                      <span className="sd-related__short">{r.short}</span>
                    </span>
                    <span className="sd-related__arrow">
                      <Icon.ArrowUpRight size={18} />
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <section className="sd-cta">
        <div className="container sd-cta__inner reveal">
          <h2 className="sd-cta__title display">
            Ready when
            <br />
            you are.
          </h2>
          <div className="sd-cta__actions">
            <NeonButton text="Get in touch" to="/contact" />
            <GhostButton text="See the process" to="/services" />
          </div>
        </div>
      </section>
    </div>
  );
}

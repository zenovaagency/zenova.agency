import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '@/components/icons/Icon';
import { NeonButton } from '@/components/ui/NeonButton';
import { GhostButton } from '@/components/ui/GhostButton';
import { useJobs, useBrand } from '@/admin/store';
import { scrollToTop } from '@/lib/scroll';
import { formatPosted } from '@/lib/jobDate';
import './CareersPage.css';

export function CareersPage() {
  const [JOBS] = useJobs();
  const [brand] = useBrand();
  const [filter, setFilter] = useState('All');
  useEffect(() => {
    scrollToTop();
  }, []);

  // Newest-first by posted date.
  const sorted = useMemo(
    () => [...JOBS].sort((a, b) => b.postedAt.localeCompare(a.postedAt)),
    [JOBS]
  );

  // Department filters, derived from the live data (keeps admin-created
  // departments in sync automatically).
  const filters = useMemo(() => {
    const departments = Array.from(new Set(sorted.map((j) => j.department))).sort();
    return ['All', ...departments];
  }, [sorted]);

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    filters.forEach((f) => {
      map.set(f, f === 'All' ? sorted.length : sorted.filter((j) => j.department === f).length);
    });
    return map;
  }, [filters, sorted]);

  const jobs = filter === 'All' ? sorted : sorted.filter((j) => j.department === filter);
  const count = String(sorted.length).padStart(2, '0');

  return (
    <div className="car">
      <header className="car-hero">
        <div className="container">
          <div className="car-hero__kicker mono">
            <span className="car-hero__tick" />
            Careers — {count} open {sorted.length === 1 ? 'role' : 'roles'}
          </div>
          <h1 className="car-hero__title display">
            Build the work
            <br />
            <em>you&rsquo;re proud of.</em>
          </h1>
          <p className="car-hero__sub">
            One team, design to launch. If you like owning your work end-to-end and shipping fast,
            we&rsquo;d love to talk. Open roles below.
          </p>

          {sorted.length > 0 && (
            <nav className="car-filters mono" aria-label="Filter roles by department">
              {filters.map((f) => {
                const n = counts.get(f) ?? 0;
                const on = filter === f;
                return (
                  <button
                    key={f}
                    type="button"
                    className={`car-filter${on ? ' is-active' : ''}`}
                    disabled={n === 0}
                    onClick={() => setFilter(f)}
                  >
                    {f} <sup>{n}</sup>
                  </button>
                );
              })}
            </nav>
          )}
        </div>
      </header>

      <section className="car-grid-wrap">
        <div className="container">
          {jobs.length > 0 ? (
            <div className="car-grid">
              {jobs.map((j) => (
                <Link
                  key={j.slug}
                  to={`/careers/${j.slug}`}
                  className="car-card"
                  style={{ '--tone': j.tone } as React.CSSProperties}
                >
                  <div className="car-card__top mono">
                    <span className="car-card__dept">{j.department}</span>
                    <span className="car-card__type">{j.type}</span>
                  </div>
                  <h2 className="car-card__title display">{j.title}</h2>
                  <p className="car-card__summary">{j.summary}</p>
                  <div className="car-card__meta mono">
                    <span className="car-card__loc">
                      <Icon.MapPin size={12} /> {j.location}
                    </span>
                    <span className="car-card__posted">{formatPosted(j.postedAt)}</span>
                  </div>
                  <div className="car-card__foot">
                    <span className="car-card__apply mono">View role</span>
                    <span className="car-card__arrow" aria-hidden="true">
                      <Icon.ArrowUpRight size={16} />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="car-empty">
              <h2 className="car-empty__title display">
                {sorted.length === 0 ? 'No open roles right now.' : 'Nothing in this team yet.'}
              </h2>
              <p className="car-empty__sub">
                We hire when we have the right work. Send us a note and we&rsquo;ll keep you in mind.
              </p>
              <a className="car-empty__mail mono" href={`mailto:${brand.careersEmail}`}>
                {brand.careersEmail} <Icon.Arrow size={12} />
              </a>
            </div>
          )}
        </div>
      </section>

      <section className="car-cta">
        <div className="container car-cta__inner">
          <h2 className="car-cta__title display">
            Don&rsquo;t see
            <br />
            your role?
          </h2>
          <p className="car-cta__sub">
            We&rsquo;re always glad to meet good people. Tell us what you do and how you&rsquo;d
            want to work with us.
          </p>
          <div className="car-cta__actions">
            <NeonButton
              text="Email us"
              onClick={() => {
                window.location.href = `mailto:${brand.careersEmail}`;
              }}
            />
            <GhostButton text="See our work" onClick={() => { window.location.href = '/work'; }} />
          </div>
        </div>
      </section>
    </div>
  );
}

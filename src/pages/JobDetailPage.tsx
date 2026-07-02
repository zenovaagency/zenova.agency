import { useEffect } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { ApplyButton } from '@/components/ui/ApplyButton';
import { GhostButton } from '@/components/ui/GhostButton';
import { Icon } from '@/components/icons/Icon';
import { useJobs, useBrand } from '@/admin/store';
import { scrollToTop } from '@/lib/scroll';
import { formatPosted } from '@/lib/jobDate';
import './JobDetailPage.css';

export function JobDetailPage() {
  const { slug = '' } = useParams();
  const [JOBS] = useJobs();
  const [brand] = useBrand();
  const job = JOBS.find((j) => j.slug === slug);

  useEffect(() => {
    scrollToTop();
  }, [slug]);

  if (!job) {
    return <Navigate to="/careers" replace />;
  }

  const mailto = `mailto:${brand.careersEmail}?subject=${encodeURIComponent(
    `Application: ${job.title}`
  )}`;

  const apply = () => {
    if (job.applyUrl.trim()) {
      window.open(job.applyUrl, '_blank', 'noopener,noreferrer');
    } else {
      window.location.href = mailto;
    }
  };

  const specs: Array<[string, string]> = [
    ['Department', job.department],
    ['Location', job.location],
    ['Type', job.type],
    ['Posted', formatPosted(job.postedAt)],
  ];

  return (
    <div className="jd" style={{ '--tone': job.tone } as React.CSSProperties}>
      <header className="jd-header">
        <div className="container">
          <nav className="jd-crumbs mono">
            <Link to="/">Home</Link>
            <span>/</span>
            <Link to="/careers">Careers</Link>
            <span>/</span>
            <span className="jd-crumbs__here">{job.title}</span>
          </nav>

          <div className="jd-header__tag">
            <span className="mono">{job.department}</span>
          </div>

          <h1 className="jd-header__title display">{job.title}</h1>
          <p className="jd-header__sub">{job.summary}</p>

          <dl className="jd-spec">
            {specs.map(([label, value]) => (
              <div key={label} className="jd-spec__cell">
                <dt className="mono">{label}</dt>
                <dd className="display">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </header>

      <div className="container jd-body">
        <aside className="jd-rail">
          <div className="jd-rail__card">
            <div className="jd-label mono">Ready to apply?</div>
            <p className="jd-rail__blurb">
              {job.applyUrl.trim()
                ? 'Apply through our hiring page — it only takes a few minutes.'
                : `Send your CV and a short note to ${brand.careersEmail}.`}
            </p>
            <ApplyButton text="Apply now" size="md" onClick={apply} />
          </div>
          <a className="jd-rail__mail mono" href={mailto}>
            Questions? {brand.careersEmail} <Icon.Arrow size={12} />
          </a>
        </aside>

        <main className="jd-content">
          {job.description.length > 0 && (
            <section className="jd-section">
              {job.description.map((p, i) => (
                <p key={i} className="jd-lede">
                  {p}
                </p>
              ))}
            </section>
          )}

          {job.responsibilities.length > 0 && (
            <section className="jd-section">
              <div className="jd-label mono">What you&rsquo;ll do</div>
              <ul className="jd-list">
                {job.responsibilities.map((r) => (
                  <li key={r}>
                    <span className="jd-check">
                      <Icon.Check size={11} />
                    </span>
                    {r}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {job.requirements.length > 0 && (
            <section className="jd-section">
              <div className="jd-label mono">What we&rsquo;re looking for</div>
              <ul className="jd-list">
                {job.requirements.map((r) => (
                  <li key={r}>
                    <span className="jd-check">
                      <Icon.Check size={11} />
                    </span>
                    {r}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </main>
      </div>

      <section className="jd-cta">
        <div className="container jd-cta__inner">
          <h2 className="jd-cta__title display">
            Sound like
            <br />
            your kind of work?
          </h2>
          <div className="jd-cta__actions">
            <ApplyButton text="Apply now" size="md" onClick={apply} />
            <GhostButton text="See all roles" onClick={() => { window.location.href = '/careers'; }} />
          </div>
        </div>
      </section>
    </div>
  );
}

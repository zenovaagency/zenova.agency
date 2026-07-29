'use client';

import { Link, Navigate, useParams } from '@/lib/router';
import { ApplyButton } from '@/components/ui/ApplyButton';
import { GhostButton } from '@/components/ui/GhostButton';
import { Icon } from '@/components/icons/Icon';
import { useJobs, useBrand } from '@/admin/store';
import { SITE, canonicalUrl } from '@/seo/seo-data';
import { JsonLd } from '@/seo/JsonLd';
import { formatPosted } from '@/lib/jobDate';
import type { JobDetail } from '@/data/jobs';
import './JobDetailPage.css';

/** schema.org employmentType uses fixed codes, not the display label. */
function employmentTypeCode(type: string): string {
  const t = type.trim().toLowerCase();
  if (t.startsWith('part')) return 'PART_TIME';
  if (t.startsWith('contract')) return 'CONTRACTOR';
  if (t.startsWith('intern')) return 'INTERN';
  if (t.startsWith('temp')) return 'TEMPORARY';
  return 'FULL_TIME';
}

function isRemote(location: string): boolean {
  return /remote|anywhere|distributed/i.test(location);
}

/**
 * JobPosting.description must be HTML, and Google explicitly wants the *full*
 * posting rather than the one-line summary — so this rebuilds the same three
 * blocks the page renders visually.
 */
function jobDescriptionHtml(job: JobDetail): string {
  const list = (title: string, items: string[]) =>
    items.length ? `<h3>${title}</h3><ul>${items.map((i) => `<li>${i}</li>`).join('')}</ul>` : '';

  return [
    job.description.map((p) => `<p>${p}</p>`).join(''),
    list('Responsibilities', job.responsibilities),
    list('Requirements', job.requirements),
  ].join('');
}

export function JobDetailPage() {
  const { slug = '' } = useParams();
  const [JOBS] = useJobs();
  const [brand] = useBrand();
  const job = JOBS.find((j) => j.slug === slug);

  // The head tags for this route are produced by generateMetadata() in the
  // matching app/ route, from the same seo-data table that feeds the sitemap.
  // A client-side setDynamicSeo() effect used to do it instead, which meant
  // the tags only existed after hydration — invisible to crawlers and to every
  // social scraper.

  if (!job) {
    return <Navigate to="/careers" replace />;
  }

  const mailto = `mailto:${brand.careersEmail}?subject=${encodeURIComponent(
    `Application: ${job.title}`
  )}`;

  const applyHref = job.applyUrl.trim() ? job.applyUrl : mailto;
  const applyExternal = job.applyUrl.trim() ? true : false;

  const specs: Array<[string, string]> = [
    ['Department', job.department],
    ['Location', job.location],
    ['Type', job.type],
    ['Posted', formatPosted(job.postedAt)],
  ];

  return (
    <div className="jd" style={{ '--tone': job.tone } as React.CSSProperties}>
      {/*
        JobPosting is the one schema type on this site with a first-class
        distribution channel: Google Jobs reads it directly and surfaces the
        role in the jobs carousel. All values come from the job record, so a
        posting edited in the dashboard stays accurate here.
      */}
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'JobPosting',
          '@id': `${canonicalUrl(`/careers/${job.slug}`)}#jobposting`,
          title: job.title,
          description: jobDescriptionHtml(job),
          datePosted: job.postedAt,
          employmentType: employmentTypeCode(job.type),
          industry: job.department,
          hiringOrganization: { '@id': `${SITE.url}/#organization` },
          directApply: !job.applyUrl.trim(),
          url: canonicalUrl(`/careers/${job.slug}`),
          // Google requires a jobLocation OR the TELECOMMUTE pairing below;
          // every role here is remote, so the remote form is the correct one.
          ...(isRemote(job.location)
            ? {
                jobLocationType: 'TELECOMMUTE',
                applicantLocationRequirements: {
                  '@type': 'Country',
                  name: 'Worldwide',
                },
              }
            : {
                jobLocation: {
                  '@type': 'Place',
                  address: { '@type': 'PostalAddress', addressLocality: job.location },
                },
              }),
        }}
      />
      <header className="jd-header">
        <div className="container">
          <nav className="jd-crumbs mono" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <span>/</span>
            <Link to="/careers">Careers</Link>
            <span>/</span>
            <span className="jd-crumbs__here">{job.title}</span>
          </nav>

          <div className="jd-header__tag reveal">
            <span className="mono">{job.department}</span>
          </div>

          <h1 className="jd-header__title display reveal reveal-blur reveal-d1">{job.title}</h1>
          <p className="jd-header__sub reveal reveal-d2">{job.summary}</p>

          <dl className="jd-spec reveal reveal-d3">
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
        <aside className="jd-rail reveal">
          <div className="jd-rail__card">
            <div className="jd-label mono">Ready to apply?</div>
            <p className="jd-rail__blurb">
              {job.applyUrl.trim()
                ? 'Apply through our hiring page — it only takes a few minutes.'
                : `Send your CV and a short note to ${brand.careersEmail}.`}
            </p>
            <ApplyButton
              text="Apply now"
              size="md"
              href={applyHref}
              {...(applyExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            />
          </div>
          <a className="jd-rail__mail mono" href={mailto}>
            Questions? {brand.careersEmail} <Icon.Arrow size={12} />
          </a>
        </aside>

        {/* Plain div — the route layout owns the single <main> landmark. */}
        <div className="jd-content">
          {job.description.length > 0 && (
            <section className="jd-section reveal reveal-d1">
              {job.description.map((p, i) => (
                <p key={i} className="jd-lede">
                  {p}
                </p>
              ))}
            </section>
          )}

          {job.responsibilities.length > 0 && (
            <section className="jd-section reveal">
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
            <section className="jd-section reveal">
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
        </div>
      </div>

      <section className="jd-cta">
        <div className="container jd-cta__inner reveal">
          <h2 className="jd-cta__title display">
            Sound like
            <br />
            your kind of work?
          </h2>
          <div className="jd-cta__actions">
            <ApplyButton
              text="Apply now"
              size="md"
              href={applyHref}
              {...(applyExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            />
            <GhostButton text="See all roles" to="/careers" />
          </div>
        </div>
      </section>
    </div>
  );
}

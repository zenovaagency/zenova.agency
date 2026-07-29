'use client';
import { Link } from '@/lib/router';
import { Icon, type IconName, type IconComponent } from '@/components/icons/Icon';
import { useContent } from '@/admin/store';
import { type PublicBlogListItem } from '@/lib/publicContentApi';
import { formatDate } from '@/lib/date';
import { JsonLd } from '@/seo/JsonLd';
import { SITE, canonicalUrl } from '@/seo/seo-data';
import './AboutPage.css';

/** Initials fallback for a founder with no avatar set. */
function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
}

export interface AboutPageProps {
  /**
   * Latest posts for the closing section, fetched on the server. These used to
   * be loaded in an effect, so the whole section — and the three internal links
   * it contributes — was absent from the HTML every crawler saw.
   */
  posts?: PublicBlogListItem[];
}

export function AboutPage({ posts = [] }: AboutPageProps) {
  const [content] = useContent();
  const VALUES = content.about?.values ?? [];
  const FOUNDERS = content.about?.founders ?? [];
  const ROLES = content.about?.roles ?? [];
  const TIMELINE = content.about?.timeline ?? [];

  const founded = TIMELINE[0]?.year ?? '2019';

  return (
    <div className="abt">
      <header className="abt-statement">
        <div className="container">
          <h1 className="abt-statement__title display reveal reveal-blur">
            <span>A small team</span>
            <span className="abt-statement__dim">doing big work,</span>
            <span>under one roof.</span>
          </h1>
          <div className="abt-statement__meta mono reveal reveal-d1">
            <span>Founded {founded}</span>
            <span>Design · Build · Growth</span>
          </div>
        </div>
      </header>

      <section className="abt-story">
        <div className="container abt-story__grid">
          <div className="abt-story__aside reveal reveal-blur">
            <div className="abt-kicker mono">
              <span className="abt-kicker__tick" />
              Our story
            </div>
            <h2 className="abt-story__pull display">
              We built the studio
              <br />
              <em>we wanted to hire.</em>
            </h2>
          </div>
          <div className="abt-story__body reveal reveal-d1">
            <p>
              Most of our early clients told us the same story: their brand agency made a great deck, their
              dev shop built half a product, and their marketing vendor was promoting old messaging.
            </p>
            <p>
              So we started Zenova to do all of it — design, build, and growth — with one team that stays
              involved from start to finish.
            </p>
          </div>
        </div>
      </section>

      {FOUNDERS.length > 0 && (
        <section className="abt-founders">
          {/*
            Person nodes for the founders, each linked back to the org by
            @id. This is the EEAT signal for an about page: it tells a search
            engine (and an answer engine asked "who runs Zenova?") that named,
            titled humans stand behind the work, rather than an anonymous
            brand. `founder` on the Organization side closes the loop.
          */}
          <JsonLd
            data={[
              ...FOUNDERS.map((f) => ({
                '@context': 'https://schema.org',
                '@type': 'Person',
                '@id': `${canonicalUrl('/about')}#${f.id}`,
                name: f.name,
                jobTitle: f.role,
                worksFor: { '@id': `${SITE.url}/#organization` },
                ...(f.avatar ? { image: f.avatar } : {}),
              })),
              {
                '@context': 'https://schema.org',
                '@id': `${SITE.url}/#organization`,
                founder: FOUNDERS.map((f) => ({
                  '@id': `${canonicalUrl('/about')}#${f.id}`,
                })),
              },
            ]}
          />
          <div className="container">
            <h2 className="abt-kicker mono reveal">
              <span className="abt-kicker__tick" />
              The founders
            </h2>
            <div className="abt-founders__grid reveal reveal-d1">
              {FOUNDERS.map((f) => (
                <figure
                  key={f.id}
                  className="abt-founder"
                  style={{ '--tone': f.tone } as React.CSSProperties}
                >
                  <blockquote className="abt-founder__quote display">{f.quote}</blockquote>
                  <figcaption className="abt-founder__by">
                    {f.avatar ? (
                      <img
                        className="abt-founder__avatar"
                        src={f.avatar}
                        alt={f.name}
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <span className="abt-founder__initials display">{initialsOf(f.name)}</span>
                    )}
                    <span className="abt-founder__id">
                      <span className="abt-founder__name">{f.name}</span>
                      <span className="abt-founder__role mono">{f.role}</span>
                    </span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      {VALUES.length > 0 && (
        <section className="abt-values">
          <div className="container">
            <h2 className="abt-kicker mono reveal">
              <span className="abt-kicker__tick" />
              Why we're different
            </h2>
            <div className="abt-values__list reveal reveal-d1">
              {VALUES.map((v, i) => {
                const IconC = (Icon[v.icon as IconName] ?? Icon.Layers) as IconComponent;
                return (
                  <div key={v.id} className="abt-value" style={{ '--hue': v.hue } as React.CSSProperties}>
                    <span className="abt-value__num mono">{String(i + 1).padStart(2, '0')}</span>
                    <span className="abt-value__icon">
                      <IconC size={20} />
                    </span>
                    <div className="abt-value__text">
                      <h3 className="abt-value__title display">{v.title}</h3>
                      <p className="abt-value__blurb">{v.blurb}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <section className="abt-careers">
        <div className="container">
          <div className="abt-careers__jobs reveal">
            <div className="abt-kicker mono">
              <span className="abt-kicker__tick" />
              Careers
            </div>
            <h2 className="abt-careers__title display">Want to work with us?</h2>
            <p className="abt-careers__sub">
              We hire when we have the right work. Open roles below — or send us a note any time.
            </p>
            <div className="abt-roles">
              {ROLES.map((r) =>
                r.href ? (
                  <a key={r.id} className="abt-role" href={r.href} target="_blank" rel="noreferrer">
                    <span className="abt-role__title">{r.title}</span>
                    <span className="abt-role__location mono">{r.location}</span>
                    <span className="abt-role__arrow">
                      <Icon.Arrow size={14} />
                    </span>
                  </a>
                ) : (
                  <Link key={r.id} className="abt-role" to="/careers">
                    <span className="abt-role__title">{r.title}</span>
                    <span className="abt-role__location mono">{r.location}</span>
                    <span className="abt-role__arrow">
                      <Icon.Arrow size={14} />
                    </span>
                  </Link>
                )
              )}
            </div>
            <Link className="abt-careers__mail mono" to="/careers">
              View all openings <Icon.Arrow size={12} />
            </Link>
          </div>
        </div>
      </section>

      {posts.length > 0 && (
        <section className="abt-blog">
          <div className="container">
            <h2 className="abt-kicker mono reveal">
              <span className="abt-kicker__tick" />
              From the blog
            </h2>
            <div className="abt-blog__grid reveal reveal-d1">
              {posts.map((p) => {
                const date = formatDate(p.published_at);
                return (
                  <Link key={p.slug} to={`/blog/${p.slug}`} className="abt-post">
                    <div className="abt-post__media">
                      {p.cover_image_url ? (
                        <img src={p.cover_image_url} alt="" loading="lazy" decoding="async" />
                      ) : (
                        <span className="abt-post__placeholder" aria-hidden="true" />
                      )}
                    </div>
                    <h3 className="abt-post__title display">{p.title}</h3>
                    {p.excerpt && <p className="abt-post__excerpt">{p.excerpt}</p>}
                    {date && (
                      <time className="abt-post__date mono" dateTime={p.published_at ?? undefined}>
                        {date}
                      </time>
                    )}
                  </Link>
                );
              })}
            </div>
            <Link className="abt-blog__all mono" to="/blog">
              View all posts <Icon.Arrow size={12} />
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}

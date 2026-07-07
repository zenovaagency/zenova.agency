import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Icon, type IconName, type IconComponent } from '@/components/icons/Icon';
import { NeonButton } from '@/components/ui/NeonButton';
import { GhostButton } from '@/components/ui/GhostButton';
import { useTeam, useBrand, useContent } from '@/admin/store';
import { scrollToTop } from '@/lib/scroll';
import './AboutPage.css';

const SOCIAL_ICON: Record<string, (s: number) => JSX.Element> = {
  twitter: (s) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4l11.733 16h4L8 4H4z" /><path d="M4 20l6.768-6.768M20 4l-6.768 6.768" />
    </svg>
  ),
  linkedin: (s) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="16" height="16" rx="2" /><path d="M6 9v8M6 6v.01M10 11v6M14 9v6" />
    </svg>
  ),
  github: (s) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 22v-4a4.8 4.8 0 00-1-3.5c3 0 6-2 6-5.5a4.3 4.3 0 00-.4-2.9 3 3 0 000-2.4s-1-.3-3.3 1.3a11.4 11.4 0 00-6 0C8 3.7 7 4 7 4a3 3 0 000 2.4 4.3 4.3 0 00-.4 2.9c0 3.5 3 5.5 6 5.5a4.8 4.8 0 00-1 3.5v4" /><path d="M9 18c-3 .7-3-2-4-2" />
    </svg>
  ),
  dribbble: (s) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><path d="M19.13 5.09C15.22 9.14 10 10.44 2.25 10.94" /><path d="M21.75 12.84c-6.62-1.41-12.14 1-16.38 6.32" /><path d="M8.56 2.75c4.37 6 6 9.42 8 17.72" />
    </svg>
  ),
  instagram: (s) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="5" /><circle cx="17.5" cy="6.5" r=".75" />
    </svg>
  ),
  facebook: (s) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
    </svg>
  ),
  website: (s) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
    </svg>
  ),
  email: (s) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" /><path d="M22 4L12 13 2 4" />
    </svg>
  ),
};

export function AboutPage() {
  const [TEAM] = useTeam();
  const [brand] = useBrand();
  const [content] = useContent();
  const LOCATIONS = brand.locations ?? [];
  const VALUES = content.about?.values ?? [];
  const ROLES = content.about?.roles ?? [];
  const TIMELINE = content.about?.timeline ?? [];

  useEffect(() => {
    scrollToTop();
  }, []);

  const founded = TIMELINE[0]?.year ?? '2019';

  return (
    <div className="abt">
      <header className="abt-statement">
        <div className="container">
          <h1 className="abt-statement__title display">
            <span>A small team</span>
            <span className="abt-statement__dim">doing big work,</span>
            <span>under one roof.</span>
          </h1>
          <div className="abt-statement__meta mono">
            <span>Founded {founded}</span>
            <span>{TEAM.length} people</span>
            <span>{LOCATIONS.length} locations</span>
            <span>Design · Build · Growth</span>
          </div>
        </div>
      </header>

      <section className="abt-story">
        <div className="container abt-story__grid">
          <div className="abt-story__aside">
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
          <div className="abt-story__body">
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

      {VALUES.length > 0 && (
        <section className="abt-values">
          <div className="container">
            <div className="abt-kicker mono">
              <span className="abt-kicker__tick" />
              What we believe
            </div>
            <div className="abt-values__list">
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

      {TEAM.length > 0 && (
        <section className="abt-team">
          <div className="container">
            <div className="abt-kicker mono">
              <span className="abt-kicker__tick" />
              The team — {TEAM.length} people
            </div>
            <div className="abt-team__grid">
              {TEAM.map((m) => (
                <div key={m.id} className="abt-member" style={{ '--tone': m.tone } as React.CSSProperties}>
                  {m.avatar ? (
                    <img className="abt-member__avatar" src={m.avatar} alt={m.name} loading="lazy" />
                  ) : (
                    <div className="abt-member__initials display">{m.initials}</div>
                  )}
                  <div className="abt-member__name display">{m.name}</div>
                  <div className="abt-member__role">{m.role}</div>
                  <p className="abt-member__bio">{m.bio}</p>
                  {m.socials && m.socials.length > 0 && (
                    <div className="abt-member__socials">
                      {m.socials.map((s, si) => {
                        const icon = SOCIAL_ICON[s.platform];
                        if (!icon) return null;
                        return (
                          <a
                            key={si}
                            className="abt-member__social"
                            href={s.platform === 'email' ? `mailto:${s.url}` : s.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={s.platform}
                          >
                            {icon(15)}
                          </a>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {TIMELINE.length > 0 && (
        <section className="abt-milestones">
          <div className="container">
            <div className="abt-kicker mono">
              <span className="abt-kicker__tick" />
              Milestones
            </div>
          </div>
          <div className="abt-milestones__scroller" data-lenis-prevent>
            <div className="abt-milestones__track">
              {TIMELINE.map((m) => (
                <div key={m.id} className="abt-milestone">
                  <span className="abt-milestone__year display">{m.year}</span>
                  <span className="abt-milestone__what">{m.what}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="abt-careers">
        <div className="container abt-careers__grid">
          <div className="abt-careers__jobs">
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

          <div className="abt-locations">
            <div className="abt-kicker mono">
              <span className="abt-kicker__tick" />
              Where we are
            </div>
            <div className="abt-locations__list">
              {LOCATIONS.map((l) => (
                <div key={l.id} className="abt-location">
                  <span className="abt-location__city display">{l.city}</span>
                  <span className="abt-location__detail">{l.detail}</span>
                  <span className="abt-location__tz mono">{l.tz}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="abt-cta">
        <div className="container abt-cta__inner">
          <h2 className="abt-cta__title display">
            Like how
            <br />
            we think?
          </h2>
          <div className="abt-cta__actions">
            <NeonButton text="Get in touch" onClick={() => { window.location.href = '/contact'; }} />
            <GhostButton text="See our work" onClick={() => { window.location.href = '/work'; }} />
          </div>
        </div>
      </section>
    </div>
  );
}

import { Icon } from '@/components/icons/Icon';
import { useContent } from '@/admin/store';

interface Testimonial {
  quote: string;
  name: string;
  role: string;
  tone: string;
}

function MarqueeRow({
  items,
  direction = 'left',
  speed = 40,
}: {
  items: Testimonial[];
  direction?: 'left' | 'right';
  speed?: number;
}) {
  const seq = [...items, ...items, ...items, ...items];
  return (
    <div style={{ overflow: 'visible' }}>
      <div
        className="tm-track"
        style={{
          display: 'flex',
          gap: 20,
          width: 'max-content',
          animation: `${direction === 'left' ? 'scroll-left' : 'scroll-right'} ${speed}s linear infinite`,
          willChange: 'transform',
        }}
      >
        {seq.map((t, i) => (
          <TestimonialCard key={i} t={t} />
        ))}
      </div>
    </div>
  );
}

function TestimonialCard({ t }: { t: Testimonial }) {
  const initials = t.name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('');
  return (
    <article
      style={{
        width: 'min(440px, 80vw)',
        flexShrink: 0,
        padding: 28,
        borderRadius: 20,
        background: 'var(--card)',
        border: '1px solid var(--line)',
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative' }}>
        <span style={{ color: 'var(--accent-1)', opacity: 0.7, lineHeight: 1 }}>
          <Icon.Quote size={28} />
        </span>
        <span style={{ display: 'flex', gap: 1, color: '#fbbf24' }}>
          {[0, 1, 2, 3, 4].map((i) => (
            <svg key={i} width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z" />
            </svg>
          ))}
        </span>
      </div>
      <p style={{ fontSize: 16, lineHeight: 1.55, color: 'var(--fg)', margin: 0, position: 'relative' }}>
        {t.quote}
      </p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 'auto', position: 'relative' }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: 'var(--accent-1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'var(--font-display)',
            fontSize: 13,
            fontWeight: 600,
            color: '#0a0a0a',
          }}
        >
          {initials}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: 'var(--fg)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {t.name}
          </div>
          <div className="mono" style={{ color: 'var(--fg-faint)', marginTop: 2 }}>
            {t.role}
          </div>
        </div>
      </div>
    </article>
  );
}

export function Testimonials() {
  const [content] = useContent();
  const ITEMS = content.testimonials;
  const row1 = ITEMS.slice(0, Math.ceil(ITEMS.length / 2));
  const row2 = ITEMS.slice(Math.ceil(ITEMS.length / 2));

  return (
    <section
      id="testimonials"
      className="sec"
      style={{
        borderTop: '1px solid var(--line)',
        borderBottom: '1px solid var(--line)',
        paddingTop: 100,
        paddingBottom: 100,
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <div className="container" style={{ textAlign: 'center', marginBottom: 64 }}>
        <div
          className="mono"
          style={{
            color: 'var(--fg-faint)',
            marginBottom: 18,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <span style={{ width: 24, height: 1, background: 'var(--accent-1)' }} />
          What clients say
          <span style={{ width: 24, height: 1, background: 'var(--accent-1)' }} />
        </div>
        <h2 className="display" style={{ fontSize: 'clamp(36px,5vw,68px)', margin: 0, fontWeight: 500 }}>
          Kind words.
        </h2>
        <div
          style={{
            marginTop: 22,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 18,
            padding: '10px 18px',
            borderRadius: 999,
            border: '1px solid var(--line)',
            background: 'var(--card)',
          }}
        >
          <span style={{ display: 'flex', gap: 2, color: '#fbbf24' }}>
            {[0, 1, 2, 3, 4].map((i) => (
              <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z" />
              </svg>
            ))}
          </span>
          <span style={{ fontSize: 13, color: 'var(--fg-dim)' }}>
            <strong style={{ color: 'var(--fg)' }}>4.9</strong> client rating
          </span>
          <span style={{ width: 1, height: 14, background: 'var(--line)' }} />
          <span style={{ fontSize: 13, color: 'var(--fg-dim)' }}>
            <strong style={{ color: 'var(--fg)' }}>20+</strong> projects shipped
          </span>
        </div>
      </div>

      <div
        className="testimonial-marquee"
        style={{
          position: 'relative',
          maskImage: 'linear-gradient(90deg, transparent, black 6%, black 94%, transparent)',
          WebkitMaskImage: 'linear-gradient(90deg, transparent, black 6%, black 94%, transparent)',
        }}
      >
        <MarqueeRow items={row1} direction="left" speed={42} />
        <div style={{ height: 18 }} />
        <MarqueeRow items={row2} direction="right" speed={50} />
        <div style={{ height: 18 }} />
      </div>
    </section>
  );
}

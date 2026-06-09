import { useState } from 'react';
import { Icon } from '@/components/icons/Icon';
import { GhostButton } from '@/components/ui/GhostButton';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { useContent } from '@/admin/store';

interface QA {
  q: string;
  a: string;
}

function FAQItem({ item, isOpen, onToggle }: { item: QA; isOpen: boolean; onToggle: () => void }) {
  return (
    <div
      style={{
        borderBottom: '1px solid var(--line)',
        background: isOpen ? 'rgba(109,76,255,0.04)' : 'transparent',
        transition: 'background .35s cubic-bezier(.2,.7,.2,1)',
      }}
    >
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        style={{
          width: '100%',
          background: 'transparent',
          border: 'none',
          padding: '28px 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 24,
          cursor: 'pointer',
          textAlign: 'left',
          color: 'var(--fg)',
        }}
      >
        <span
          className="display"
          style={{
            fontSize: 'clamp(18px, 1.7vw, 22px)',
            fontWeight: 500,
            color: isOpen ? 'var(--fg)' : 'var(--fg-dim)',
            transition: 'color .25s',
          }}
        >
          {item.q}
        </span>
        <span
          style={{
            width: 38,
            height: 38,
            flexShrink: 0,
            borderRadius: '50%',
            border: isOpen ? '0px solid transparent' : '1px solid var(--line)',
            borderColor: isOpen ? 'transparent' : 'var(--line)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: isOpen ? '#fff' : 'var(--fg-faint)',
            background: isOpen ? 'var(--card-hover)' : 'transparent',
            transform: isOpen ? 'rotate(45deg)' : 'rotate(0)',
            transition: 'background .4s cubic-bezier(.2,.7,.2,1), color .4s cubic-bezier(.2,.7,.2,1), transform .4s cubic-bezier(.2,.7,.2,1)',
          }}
        >
          <Icon.Plus size={16} />
        </span>
      </button>
      <div
        style={{
          maxHeight: isOpen ? 320 : 0,
          opacity: isOpen ? 1 : 0,
          overflow: 'hidden',
          transition: 'max-height .55s cubic-bezier(.2,.7,.2,1), opacity .45s',
        }}
      >
        <p
          style={{
            padding: '0 32px 28px',
            margin: 0,
            fontSize: 16,
            lineHeight: 1.6,
            color: 'var(--fg-dim)',
            maxWidth: 760,
          }}
        >
          {item.a}
        </p>
      </div>
    </div>
  );
}

export function FAQ() {
  const [content] = useContent();
  const FAQS = content.faqs;
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <section
      id="faq"
      className="sec"
    >
      <div className="container">
        <SectionHeader
          align="center"
          eyebrow="FAQ"
          title={
            <>
              Common
              <br />
              <span style={{ color: 'var(--fg-dim)' }}>questions.</span>
            </>
          }
          sub="If you don’t see your question here, just ask."
        />

        <div
          style={{
            maxWidth: 920,
            margin: '0 auto',
            borderTop: '1px solid var(--line)',
            borderRadius: 24,
            overflow: 'hidden',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.015), rgba(255,255,255,0.005))',
            border: '1px solid var(--line)',
          }}
        >
          {FAQS.map((item, i) => (
            <FAQItem
              key={item.q}
              item={item}
              isOpen={openIdx === i}
              onToggle={() => setOpenIdx(openIdx === i ? null : i)}
            />
          ))}
        </div>

        <div
          style={{
            marginTop: 48,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 14,
            flexWrap: 'wrap',
            color: 'var(--fg-dim)',
            fontSize: 14,
          }}
        >
          <GhostButton text="More questions?" size="xs" onClick={() => { window.location.href = '/contact'; }} />
        </div>
      </div>
    </section>
  );
}

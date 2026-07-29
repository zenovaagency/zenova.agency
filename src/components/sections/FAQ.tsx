'use client';
import { useId, useState } from 'react';
import { Icon } from '@/components/icons/Icon';
import { GhostButton } from '@/components/ui/GhostButton';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { DEFAULT_CONTENT, useContent } from '@/admin/store';
import { JsonLd } from '@/seo/JsonLd';

interface QA {
  q: string;
  a: string;
}

function FAQItem({ item, isOpen, onToggle }: { item: QA; isOpen: boolean; onToggle: () => void }) {
  // useId keeps the button/panel wiring stable across the server render and
  // hydration; a counter or Math.random would mismatch and blow the boundary.
  const uid = useId();
  const panelId = `faq-panel-${uid}`;
  const buttonId = `faq-btn-${uid}`;

  return (
    <div
      style={{
        borderBottom: '1px solid var(--line)',
        background: isOpen ? 'var(--card-hover)' : 'transparent',
        transition: 'background .35s cubic-bezier(.2,.7,.2,1)',
      }}
    >
      <button
        onClick={onToggle}
        id={buttonId}
        type="button"
        aria-expanded={isOpen}
        aria-controls={panelId}
        className="faq-btn"
        style={{
          width: '100%',
          background: 'transparent',
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
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
            color: isOpen ? '#0a0a0a' : 'var(--fg-faint)',
            background: isOpen ? 'var(--accent-1)' : 'transparent',
            transform: isOpen ? 'rotate(45deg)' : 'rotate(0)',
            transition: 'background .4s cubic-bezier(.2,.7,.2,1), color .4s cubic-bezier(.2,.7,.2,1), transform .4s cubic-bezier(.2,.7,.2,1)',
          }}
        >
          <Icon.Plus size={16} />
        </span>
      </button>
      {/*
        The answer stays in the DOM in both states rather than being unmounted
        or `hidden`: it is the text that makes this page answer a question for
        a crawler that never clicks anything. `role="region"` + aria-labelledby
        gives assistive tech a named landmark to jump to, and the matching
        aria-controls above completes the standard disclosure pattern.
      */}
      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        className="faq-panel"
        style={{
          maxHeight: isOpen ? 320 : 0,
          opacity: isOpen ? 1 : 0,
          overflow: 'hidden',
          transition: 'max-height .55s cubic-bezier(.2,.7,.2,1), opacity .45s',
        }}
      >
        <p
          className="faq-answer"
          style={{ margin: 0, fontSize: 16, lineHeight: 1.6, color: 'var(--fg-dim)', maxWidth: 760 }}
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
  const raw = content.faqSection;
  const header = raw?.eyebrow || raw?.title || raw?.titleAccent || raw?.sub
    ? raw!
    : DEFAULT_CONTENT.faqSection!;
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <section
      id="faq"
      className="sec"
      aria-label="Frequently asked questions"
    >
      {/*
        FAQPage markup is the highest-value structured data on this site for AI
        answer engines: it hands ChatGPT, Perplexity, Gemini and Copilot a
        question→answer pair they can quote directly, without inferring
        anything from the accordion markup. Built from the same `FAQS` array
        the accordion renders, so an admin edit updates both at once.
      */}
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: FAQS.map((item) => ({
            '@type': 'Question',
            name: item.q,
            acceptedAnswer: { '@type': 'Answer', text: item.a },
          })),
        }}
      />
      <div className="container">
        <SectionHeader
          align="center"
          eyebrow={header.eyebrow}
          title={
            <>
              {header.title}
              {header.titleAccent && (
                <>
                  <br />
                  <span style={{ color: 'var(--fg-dim)' }}>{header.titleAccent}</span>
                </>
              )}
            </>
          }
          sub={header.sub}
        />

        <div
          className="reveal reveal-d1"
          style={{
            maxWidth: 920,
            margin: '0 auto',
            borderTop: '1px solid var(--line)',
            borderRadius: 24,
            overflow: 'hidden',
            background: 'var(--card)',
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
          className="reveal reveal-d2"
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
          <GhostButton text="More questions?" size="xs" to="/contact" />
        </div>
      </div>
    </section>
  );
}

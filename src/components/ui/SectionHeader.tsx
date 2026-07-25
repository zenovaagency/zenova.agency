import type { ReactNode } from 'react';

interface SectionHeaderProps {
  eyebrow: ReactNode;
  title: ReactNode;
  sub?: ReactNode;
  align?: 'left' | 'center';
}

export function SectionHeader({ eyebrow, title, sub, align = 'left' }: SectionHeaderProps) {
  return (
    <div
      className={`reveal reveal-blur section-header section-header--${align}`}
      style={{ textAlign: align }}
    >
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
        <span style={{ width: 24, height: 1, background: 'var(--accent-2)' }} />
        {eyebrow}
      </div>
      <h2
        className="display"
        style={{ fontSize: 'clamp(36px,5vw,68px)', margin: 0, fontWeight: 500 }}
      >
        {title}
      </h2>
      {sub && (
        <p className="section-header__sub">
          {sub}
        </p>
      )}
    </div>
  );
}

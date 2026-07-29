'use client';
import { useRef, useEffect } from 'react';
import { Link } from '@/lib/router';
import './NeonButton.css';

export type NeonButtonSize = 'xs' | 'sm' | 'md' | 'lg';

export interface NeonButtonProps {
  text?: string;
  onClick?: () => void;
  /** If provided, renders as a React Router <Link> instead of <button>. */
  to?: string;
  /** If provided, renders as a plain <a> tag (use for external/mailto links). */
  href?: string;
  className?: string;
  size?: NeonButtonSize;
  /** Omit to keep the native default (submit inside a <form>). */
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
}

const SIZE_ICON: Record<NeonButtonSize, number> = {
  xs: 14,
  sm: 16,
  md: 20,
  lg: 24,
};

export function NeonButton({
  text = 'Apply as Model',
  onClick,
  to,
  href,
  className = '',
  size = 'sm',
  type,
  disabled = false,
}: NeonButtonProps) {
  const wrapperRef = useRef<HTMLButtonElement | HTMLAnchorElement>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = wrapper.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      wrapper.style.setProperty('--x', `${x}px`);
      wrapper.style.setProperty('--y', `${y}px`);
    };

    wrapper.addEventListener('mousemove', handleMouseMove as EventListener);
    return () => {
      wrapper.removeEventListener('mousemove', handleMouseMove as EventListener);
    };
  }, []);

  const iconSize = SIZE_ICON[size];
  const classes = `neon-button neon-button--${size} ${className}`;
  const content = (
    <>
      <div className="neon-button-glow" />
      <div className="neon-button-content">
        <span className="neon-button__text">{text}</span>

        <div className="neon-button__icon-wrapper">
          <svg
            className="neon-button__arrow neon-button__arrow--primary"
            width={iconSize}
            height={iconSize}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>

          <svg
            className="neon-button__arrow neon-button__arrow--secondary"
            width={iconSize}
            height={iconSize}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </>
  );

  if (href) {
    return (
      <a
        ref={wrapperRef as React.RefObject<HTMLAnchorElement>}
        href={href}
        className={classes}
        aria-disabled={disabled || undefined}
        onClick={disabled ? (e) => e.preventDefault() : undefined}
      >
        {content}
      </a>
    );
  }

  if (to) {
    return (
      <Link
        ref={wrapperRef as React.RefObject<HTMLAnchorElement>}
        to={to}
        className={classes}
        aria-disabled={disabled || undefined}
        onClick={disabled ? (e) => e.preventDefault() : undefined}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      ref={wrapperRef as React.RefObject<HTMLButtonElement>}
      className={classes}
      onClick={onClick}
      type={type}
      disabled={disabled}
    >
      {content}
    </button>
  );
}

import { useRef, useEffect } from 'react';
import './NeonButton.css';

export type NeonButtonSize = 'xs' | 'sm' | 'md' | 'lg';

export interface NeonButtonProps {
  text?: string;
  onClick?: () => void;
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
  className = '',
  size = 'sm',
  type,
  disabled = false,
}: NeonButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const button = buttonRef.current;
    if (!button) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = button.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      button.style.setProperty('--x', `${x}px`);
      button.style.setProperty('--y', `${y}px`);
    };

    button.addEventListener('mousemove', handleMouseMove);
    return () => {
      button.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const iconSize = SIZE_ICON[size];

  return (
    <button
      className={`neon-button neon-button--${size} ${className}`}
      ref={buttonRef}
      onClick={onClick}
      type={type}
      disabled={disabled}
    >
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
    </button>
  );
}

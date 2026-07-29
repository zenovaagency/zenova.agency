'use client';
import { Link } from '@/lib/router';
import './GhostButton.css';

export type GhostButtonSize = 'xs' | 'sm' | 'md' | 'lg';

export interface GhostButtonProps {
  text?: string;
  onClick?: () => void;
  /** If provided, renders as a React Router <Link> instead of <button>. */
  to?: string;
  /** If provided, renders as a plain <a> tag (use for external/mailto links). */
  href?: string;
  className?: string;
  size?: GhostButtonSize;
}

export function GhostButton({
  text = 'Learn more',
  onClick,
  to,
  href,
  className = '',
  size = 'sm',
}: GhostButtonProps) {
  const classes = `ghost-button ghost-button--${size} ${className}`;
  const content = (
    <span className="ghost-button__content">
      <span className="ghost-button__text">{text}</span>
    </span>
  );

  if (href) {
    return (
      <a href={href} className={classes}>
        {content}
      </a>
    );
  }

  if (to) {
    return (
      <Link to={to} className={classes}>
        {content}
      </Link>
    );
  }

  return (
    <button className={classes} onClick={onClick}>
      {content}
    </button>
  );
}
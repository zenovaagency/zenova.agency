/* eslint-disable react-refresh/only-export-components */
import type { CSSProperties, ReactElement } from 'react';

type IconProps = { size?: number };
type ChevronProps = IconProps & { dir?: 'down' | 'up' | 'left' | 'right' };

const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

const Arrow = ({ size = 18 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...stroke} strokeWidth="2">
    <path d="M5 12h14" />
    <path d="m13 6 6 6-6 6" />
  </svg>
);

const ArrowUpRight = ({ size = 18 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...stroke} strokeWidth="2">
    <path d="M7 17 17 7" />
    <path d="M7 7h10v10" />
  </svg>
);

const Code = ({ size = 22 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...stroke} strokeWidth="1.5">
    <path d="m8 6-6 6 6 6" />
    <path d="m16 6 6 6-6 6" />
    <path d="m14 4-4 16" />
  </svg>
);

const Spark = ({ size = 22 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...stroke} strokeWidth="1.5">
    <path d="M12 3v4" />
    <path d="M12 17v4" />
    <path d="M3 12h4" />
    <path d="M17 12h4" />
    <path d="M5.6 5.6 8.5 8.5" />
    <path d="M15.5 15.5l2.9 2.9" />
    <path d="M18.4 5.6 15.5 8.5" />
    <path d="m8.5 15.5-2.9 2.9" />
  </svg>
);

const Rocket = ({ size = 22 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...stroke} strokeWidth="1.5">
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
    <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
    <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
    <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
  </svg>
);

const Grid = ({ size = 22 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...stroke} strokeWidth="1.5">
    <rect x="3" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" />
  </svg>
);

const Pen = ({ size = 22 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...stroke} strokeWidth="1.5">
    <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />
    <path d="m15 5 4 4" />
  </svg>
);

const Compass = ({ size = 22 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...stroke} strokeWidth="1.5">
    <circle cx="12" cy="12" r="9" />
    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
  </svg>
);

const Layers = ({ size = 22 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...stroke} strokeWidth="1.5">
    <path d="m12.83 2.18 8.94 4.79a1 1 0 0 1 0 1.76L12.83 13.5a2 2 0 0 1-1.66 0L2.23 8.73a1 1 0 0 1 0-1.76L11.17 2.18a2 2 0 0 1 1.66 0Z" />
    <path d="m2.23 12.69 8.94 4.78a2 2 0 0 0 1.66 0l8.94-4.78" />
    <path d="m2.23 17.27 8.94 4.78a2 2 0 0 0 1.66 0l8.94-4.78" />
  </svg>
);

const Check = ({ size = 16 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...stroke} strokeWidth="2.5">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const Plus = ({ size = 16 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M12 5v14" />
    <path d="M5 12h14" />
  </svg>
);

const Quote = ({ size = 32 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M9.5 5C5.36 5 2 8.36 2 12.5V19h6.5v-6H5.5c0-2.21 1.79-4 4-4V5zm12 0c-4.14 0-7.5 3.36-7.5 7.5V19H20v-6h-3c0-2.21 1.79-4 4-4V5z" />
  </svg>
);

const Chevron = ({ size = 14, dir = 'down' }: ChevronProps) => {
  const rot: Record<NonNullable<ChevronProps['dir']>, number> = {
    down: 0,
    up: 180,
    left: 90,
    right: -90,
  };
  const style: CSSProperties = { transform: `rotate(${rot[dir]}deg)` };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...stroke} strokeWidth="2" style={style}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
};

const Menu = ({ size = 22 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <path d="M4 8h16" />
    <path d="M4 16h16" />
  </svg>
);

const X = ({ size = 22 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <path d="M6 6 18 18" />
    <path d="M18 6 6 18" />
  </svg>
);

const Mail = ({ size = 20 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...stroke} strokeWidth="1.6">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 4-10 7.5L2 4" />
  </svg>
);

const Phone = ({ size = 20 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...stroke} strokeWidth="1.6">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

const MapPin = ({ size = 20 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...stroke} strokeWidth="1.6">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const Clock = ({ size = 20 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...stroke} strokeWidth="1.6">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

export const Icon = {
  Arrow,
  ArrowUpRight,
  Code,
  Spark,
  Rocket,
  Grid,
  Pen,
  Compass,
  Layers,
  Check,
  Plus,
  Quote,
  Chevron,
  Menu,
  X,
  Mail,
  Phone,
  MapPin,
  Clock,
};

export type IconName = keyof typeof Icon;
export type IconComponent = (props: { size?: number }) => ReactElement;

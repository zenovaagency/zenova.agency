import type { CSSProperties } from 'react';

interface LogoProps {
  size?: number;
  /** Play the kinetic entrance: Z pops in, then e-n-o-v-a slide out from behind it. */
  animate?: boolean;
}

const LETTERS = ['e', 'n', 'o', 'v', 'a'];

/**
 * The Zenova "Z" mark, inline so its fill tracks the live accent variable
 * (`--accent-1`). Follows the same currentColor/CSS-var pattern as Icon.tsx;
 * keeping the `.zlogo-mark*` class names preserves the CSS sizing and the
 * kinetic entrance animation defined in global.css.
 */
function ZenovaMark({ className }: { className: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 899 921"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      preserveAspectRatio="xMidYMid meet"
    >
      <path
        fill="var(--accent-1)"
        d="M17.3531 131.973C3.60657 137.836 0.169922 149.075 0.169922 153.961L0.16994 461.788C0.16994 477.913 13.2619 477.057 19.8079 474.614L407.658 307.874C446.934 293.216 455.116 311.539 454.298 322.533V359.179C456.262 385.564 440.388 400.711 432.205 404.987L59.0838 566.23C8.02511 585.286 -1.46658 619.367 0.169922 634.025V813.591C8.02511 894.213 91.8138 889.937 132.726 877.722C230.098 836.19 427.787 751.659 439.57 745.796C451.352 739.932 454.298 747.017 454.298 751.293L456.753 868.56C480.318 933.058 556.579 924.751 591.764 912.536L874.06 791.603C897.625 782.808 900.244 771.488 898.607 766.927V454.459C898.607 441.266 883.879 444.076 876.514 447.13C761.96 496.602 524.504 598.845 491.119 612.037C457.735 625.23 446.116 613.87 444.479 606.54V542.41C444.479 529.217 467.39 514.925 478.845 509.428L839.693 353.682C890.752 336.092 900.244 297.491 898.607 280.39V98.9915C888.788 28.6309 802.872 33.0284 761.141 44.0223L461.662 172.284C445.952 179.613 443.661 174.116 444.479 170.451L442.024 67.8423C430.242 -15.7109 342.198 -4.83924 299.649 11.0408C211.278 48.9084 31.0997 126.11 17.3531 131.973Z"
      />
    </svg>
  );
}

/** Renders as: [Z-mark][enova]. Scales with font-size of the wrapper. */
export function Logo({ size, animate = false }: LogoProps) {
  const style: CSSProperties = size != null ? { fontSize: size } : {};
  return (
    <span
      className={`zlogo${animate ? ' zlogo--animate' : ''}`}
      style={style}
      role="img"
      aria-label="Zenova"
    >
      <ZenovaMark className="zlogo-mark" />
      <span className="zlogo-word" aria-hidden="true">
        {animate
          ? LETTERS.map((ch, i) => (
              <span key={i} className="zlogo-letter" style={{ '--i': i } as CSSProperties}>
                {ch}
              </span>
            ))
          : 'enova'}
      </span>
    </span>
  );
}

/**
 * Navbar badge logo — the Zenova mark on its own (no tile). The fill is driven
 * by the theme variable `--logo-mark` so it inverts with light/dark mode.
 * `size` is the square edge length in px.
 *
 * With `word`, the same mark is paired with the "enova" wordmark — the footer
 * lockup. The word is sized to the glyph rather than to the box: this viewBox
 * carries roughly a quarter of empty margin on each side of the Z, so the
 * visible mark is about two thirds of `size`.
 */
export function LogoBadge({ size = 36, word = false }: { size?: number; word?: boolean }) {
  const mark = (
    <span
      className="logo-badge"
      role={word ? undefined : 'img'}
      aria-label={word ? undefined : 'Zenova'}
      aria-hidden={word || undefined}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 1527 1527"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        focusable="false"
      >
        <path
          fill="var(--logo-mark)"
          d="M406.361 396.449C394.985 403 392.141 415.556 392.141 421.015L392.141 764.939C392.141 782.954 402.975 781.999 408.393 779.269L729.372 592.977C761.876 576.6 768.648 597.071 767.971 609.354V650.298C769.596 679.777 756.459 696.7 749.687 701.477L440.897 881.628C398.641 902.919 390.786 940.996 392.141 957.373V1158C398.641 1248.07 467.984 1243.29 501.842 1229.65C582.426 1183.24 746.03 1088.8 755.782 1082.25C765.533 1075.7 767.971 1083.62 767.971 1088.39L770.002 1219.41C789.505 1291.47 852.617 1282.19 881.736 1268.54L1115.36 1133.43C1134.86 1123.6 1137.03 1110.96 1135.67 1105.86V756.751C1135.67 742.011 1123.49 745.15 1117.39 748.562C1022.59 803.836 826.072 918.068 798.443 932.807C770.815 947.547 761.199 934.854 759.845 926.666V855.015C759.845 840.275 778.806 824.307 788.286 818.166L1086.92 644.156C1129.17 624.503 1137.03 581.376 1135.67 562.269V359.6C1127.55 280.988 1056.45 285.901 1021.91 298.185L774.065 441.486C761.064 449.675 759.168 443.534 759.845 439.439L757.813 324.798C748.062 231.447 675.198 243.593 639.985 261.335C566.851 303.644 417.738 389.898 406.361 396.449Z"
        />
      </svg>
    </span>
  );

  if (!word) return mark;

  return (
    <span
      className="zlogo zlogo--badge"
      style={{ fontSize: Math.round(size * 0.66) }}
      role="img"
      aria-label="Zenova"
    >
      {mark}
      <span className="zlogo-word" aria-hidden="true">
        enova
      </span>
    </span>
  );
}

/** Z-only mark — used in the admin, client and team shell headers. */
export function LogoMark({ size }: LogoProps) {
  const style: CSSProperties = size != null ? { fontSize: size } : {};
  return (
    <span style={{ display: 'inline-flex', ...style }} role="img" aria-label="Zenova">
      <ZenovaMark className="zlogo-mark-only" />
    </span>
  );
}

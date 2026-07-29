/**
 * Formats an ISO timestamp for display.
 *
 * The locale and time zone are pinned rather than taken from the environment.
 * This text is now server-rendered, and the server and the visitor disagree on
 * both: Node runs in UTC with `en-US`, while the browser resolves whatever the
 * visitor has configured. A post published near midnight would render as two
 * different dates on the two sides, which React reports as a hydration mismatch
 * and patches at runtime — a visible flicker, and console noise on every
 * article and card that carries a date.
 *
 * en-US matches SITE.locale, so this is the site's declared language rather
 * than an arbitrary choice. Machine-readable dates are unaffected: callers emit
 * the raw ISO string in `<time dateTime>`, which is what crawlers actually read.
 *
 * Returns an empty string for null / unparseable input so callers can render
 * conditionally without null checks of their own.
 */
const DISPLAY_LOCALE = 'en-US';
const DISPLAY_TIME_ZONE = 'UTC';

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString(DISPLAY_LOCALE, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: DISPLAY_TIME_ZONE,
  });
}

/** Long form ("January 5, 2026"), used for article bylines. */
export function formatDateLong(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString(DISPLAY_LOCALE, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: DISPLAY_TIME_ZONE,
  });
}

/**
 * Formats an ISO timestamp for display, using the visitor's locale.
 * Returns an empty string for null / unparseable input so callers can render
 * conditionally without null checks of their own.
 */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

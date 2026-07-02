/** Format an ISO date (YYYY-MM-DD) as e.g. "Jun 15, 2026" for job listings. */
export function formatPosted(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso.length <= 10 ? `${iso}T00:00:00` : iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

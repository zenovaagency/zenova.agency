/**
 * Shared full-screen loading spinner for the admin portal.
 *
 * Kept in its own file so the Next.js dynamic import that loads the whole
 * AdminRoutes chunk can display it without pulling that chunk into the main
 * bundle.
 */
export function AdminSpinner({ label = 'Loading…' }: { label?: string }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        background: 'var(--bg)',
        color: 'var(--fg)',
      }}
      role="status"
      aria-live="polite"
    >
      <span className="visually-hidden">{label}</span>
      <span
        aria-hidden="true"
        style={{
          width: 12,
          height: 12,
          borderRadius: '50%',
          background: 'var(--accent-1, #ff813a)',
          animation: 'pulse-dot 1.4s ease-in-out infinite',
        }}
      />
    </div>
  );
}

'use client';
export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="skip-link"
      style={{
        position: 'fixed',
        top: '12px',
        left: '12px',
        zIndex: 9999,
        transform: 'translateY(-150%)',
        transition: 'transform 0.2s ease',
        padding: '0.75rem 1rem',
        background: '#ff813a',
        color: '#fff',
        borderRadius: '8px',
        fontWeight: 600,
        textDecoration: 'none',
      }}
      onFocus={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
      }}
      onBlur={(e) => {
        e.currentTarget.style.transform = 'translateY(-150%)';
      }}
    >
      Skip to main content
    </a>
  );
}

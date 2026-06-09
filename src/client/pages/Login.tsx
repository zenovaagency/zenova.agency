import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { clientLogin, isClientAuthed } from '@/client/store';

export function ClientLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const nav = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await clientLogin(email.trim().toLowerCase(), password);
      nav('/client', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign-in failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="adm-login">
      <form onSubmit={submit} className="adm-login__card">
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: 'var(--grad)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontFamily: 'var(--font-display)',
            fontWeight: 600,
            fontSize: 18,
            boxShadow: '0 4px 16px rgba(0,0,0,0.35)',
          }}
        >
          Z
        </div>
        <h1 className="adm-login__title">Sign in to your project</h1>
        <p className="adm-login__sub">
          See live progress, milestones, and what shipped today. Use the credentials your project lead sent you.
        </p>
        <div className="adm-field">
          <label className="adm-label">Email</label>
          <input
            type="email"
            className="adm-input"
            value={email}
            placeholder="you@yourcompany.com"
            autoComplete="username"
            autoFocus
            required
            onChange={(e) => {
              setEmail(e.target.value);
              setError(null);
            }}
          />
        </div>
        <div className="adm-field">
          <label className="adm-label">Password</label>
          <input
            type="password"
            className="adm-input"
            value={password}
            placeholder="••••••••"
            autoComplete="current-password"
            required
            minLength={6}
            onChange={(e) => {
              setPassword(e.target.value);
              setError(null);
            }}
          />
          {error && <p style={{ color: '#ff6b6b', fontSize: 13, margin: 0 }}>{error}</p>}
        </div>
        <button
          type="submit"
          className="adm-btn adm-btn--primary"
          style={{ justifyContent: 'center' }}
          disabled={busy || !email || !password}
        >
          {busy ? 'Signing in…' : 'Continue'}
        </button>
        <p
          style={{
            fontSize: 11,
            color: 'var(--fg-faint)',
            textAlign: 'center',
            marginTop: 6,
            lineHeight: 1.5,
          }}
        >
          Preview build · any email + 6+ char password gets you in to the demo dashboard.
        </p>
        <a
          href="/"
          style={{
            textAlign: 'center',
            fontSize: 12,
            color: 'var(--fg-faint)',
            textDecoration: 'none',
            marginTop: 4,
          }}
        >
          ← Back to website
        </a>
      </form>
    </div>
  );
}

export function ClientAuthGate({ children }: { children: React.ReactNode }) {
  if (!isClientAuthed()) {
    return <Navigate to="/client/login" replace />;
  }
  return <>{children}</>;
}

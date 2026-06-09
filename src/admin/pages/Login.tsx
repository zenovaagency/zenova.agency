import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { login } from '@/admin/store';
import { ApiError } from '@/lib/api';
import { hasRole, isAuthed, logout } from '@/lib/session';

export function AdminLogin() {
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
      const { user } = await login(email.trim().toLowerCase(), password);
      if (user.role !== 'admin') {
        // Right credentials, wrong portal. Don't keep them signed in here.
        logout();
        if (user.role === 'team') {
          setError('This account is a team account — sign in at /team/login.');
        } else if (user.role === 'client') {
          setError('This account is a client account — sign in at /client/login.');
        } else {
          setError('This account does not have admin access.');
        }
        return;
      }
      nav('/admin', { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.code === 'rate_limited' ? 'Too many attempts. Try again shortly.' : err.message);
      } else {
        setError('Could not reach the server. Check your connection.');
      }
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
        <h1 className="adm-login__title">Sign in to admin</h1>
        <p className="adm-login__sub">
          Use the email and password set up via <code>python -m scripts.create_admin</code>.
        </p>
        <div className="adm-field">
          <label className="adm-label">Email</label>
          <input
            type="email"
            className="adm-input"
            value={email}
            placeholder="you@zenova.bd"
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
            minLength={8}
            onChange={(e) => {
              setPassword(e.target.value);
              setError(null);
            }}
          />
          {error && (
            <p style={{ color: '#ff6b6b', fontSize: 13, margin: 0 }}>{error}</p>
          )}
        </div>
        <button
          type="submit"
          className="adm-btn adm-btn--primary"
          style={{ justifyContent: 'center' }}
          disabled={busy || !email || !password}
        >
          {busy ? 'Signing in…' : 'Continue'}
        </button>
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

export function AuthGate({ children }: { children: React.ReactNode }) {
  if (!isAuthed() || !hasRole('admin')) {
    return <Navigate to="/admin/login" replace />;
  }
  return <>{children}</>;
}

'use client';
import { useState } from 'react';
import { useNavigate, useSearchParams } from '@/lib/router';
import { login } from '@/lib/session';
import { ApiError } from '@/lib/api';
import { Logo } from '@/components/layout/Logo';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const nav = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirect');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const user = await login(email.trim().toLowerCase(), password);
      
      // Route based on role
      const destination =
        user.role === 'admin'
          ? '/admin'
          : user.role === 'team'
            ? '/team'
            : user.role === 'client'
              ? '/client'
              : '/';
      
      nav(redirectTo || destination, { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        setError(
          err.code === 'rate_limited'
            ? 'Too many attempts. Please wait a moment.'
            : err.message,
        );
      } else {
        setError('Unable to connect. Check your connection and try again.');
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-card__top">
          <div className="auth-card__logo">
            <Logo />
          </div>
          <a href="/" className="auth-card__back">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M7.5 9L4.5 6L7.5 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            HOME
          </a>
        </div>

        <div className="auth-card__header">
          <h1 className="auth-card__title">Sign in</h1>
          <p className="auth-card__sub">Enter your email and password to continue.</p>
        </div>

        <form onSubmit={submit}>
          <div className="auth-field">
            <label className="auth-label" htmlFor="auth-email">Email</label>
            <input
              id="auth-email"
              type="email"
              className="auth-input"
              value={email}
              placeholder="you@example.com"
              autoComplete="username"
              autoFocus
              required
              onChange={(e) => {
                setEmail(e.target.value);
                setError(null);
              }}
            />
          </div>

          <div className="auth-field">
            <label className="auth-label" htmlFor="auth-password">Password</label>
            <div className="auth-input-wrap">
              <input
                id="auth-password"
                type={showPw ? 'text' : 'password'}
                className="auth-input auth-input--password"
                value={password}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
                minLength={6}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(null);
                }}
              />
              <button
                type="button"
                className="auth-pw-toggle"
                onClick={() => setShowPw((v) => !v)}
                aria-label="Toggle password visibility"
              >
                {showPw ? (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M8 3C4.5 3 1.5 5 0.5 8c1 3 4 5 7.5 5s6.5-2 7.5-5c-1-3-4-5-7.5-5z" stroke="currentColor" strokeWidth="1.2"/>
                    <circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.2"/>
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M2 2l12 12M3 8c0-2.5 2-4.5 5-4.5s5 2 5 4.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          {error && <p className="auth-error">{error}</p>}

          <button
            type="submit"
            className="auth-submit"
            disabled={busy || !email || !password}
          >
            {busy ? 'Signing in…' : 'Continue'}
          </button>
        </form>
      </div>
    </div>
  );
}

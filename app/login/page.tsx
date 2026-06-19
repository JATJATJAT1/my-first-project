'use client';

import { useState } from 'react';

type View = 'login' | 'reset' | 'reset-sent';

export default function LoginPage() {
  const [view, setView]         = useState<View>('login');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  function switchView(next: View) {
    setError('');
    setView(next);
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const body = await res.json();
        setError(body.error ?? 'Login failed. Please try again.');
        return;
      }

      window.location.href = '/dashboard';
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/reset-password', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email }),
      });

      if (!res.ok) {
        const body = await res.json();
        setError(body.error ?? 'Could not send reset email. Try again.');
        return;
      }

      setView('reset-sent');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="shift-bg min-h-screen flex items-center justify-center px-4">
      <div className="shift-card w-full max-w-md">

        {/* Logo / wordmark — always visible */}
        <div className="flex flex-col items-center mb-8">
          <div className="shift-logo mb-3">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden>
              <rect width="40" height="40" rx="10" fill="#0ea5e9" />
              <path
                d="M10 28 L20 12 L30 28"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              <circle cx="20" cy="12" r="2.5" fill="white" />
            </svg>
          </div>
          <h1 className="shift-wordmark">ShiftAI</h1>
          <p className="shift-subtitle">
            {view === 'login'
              ? 'Sign in to your dealership portal'
              : view === 'reset'
              ? 'Reset your password'
              : 'Check your inbox'}
          </p>
        </div>

        {/* ── LOGIN VIEW ── */}
        {view === 'login' && (
          <form onSubmit={handleLogin} noValidate>
            <div className="mb-4">
              <label htmlFor="email" className="shift-label">Email</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                className="shift-input"
                placeholder="you@dealership.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>

            <div className="mb-2">
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="shift-label" style={{ margin: 0 }}>
                  Password
                </label>
                <button
                  type="button"
                  className="shift-link shift-forgot"
                  onClick={() => switchView('reset')}
                >
                  Forgot password?
                </button>
              </div>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                className="shift-input"
                placeholder="••••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>

            {error && (
              <p className="shift-error mt-4 mb-2" role="alert">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="shift-btn-primary w-full mt-5"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        )}

        {/* ── RESET REQUEST VIEW ── */}
        {view === 'reset' && (
          <form onSubmit={handleReset} noValidate>
            <p className="shift-hint mb-5">
              Enter your account email and we'll send you a link to reset your password.
            </p>

            <div className="mb-5">
              <label htmlFor="reset-email" className="shift-label">Email</label>
              <input
                id="reset-email"
                type="email"
                autoComplete="email"
                required
                className="shift-input"
                placeholder="you@dealership.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>

            {error && (
              <p className="shift-error mb-4" role="alert">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="shift-btn-primary w-full"
            >
              {loading ? 'Sending…' : 'Send reset link'}
            </button>

            <button
              type="button"
              className="shift-btn-ghost w-full mt-3"
              onClick={() => switchView('login')}
            >
              ← Back to sign in
            </button>
          </form>
        )}

        {/* ── RESET SENT VIEW ── */}
        {view === 'reset-sent' && (
          <div>
            <div className="shift-success-icon mx-auto mb-5">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M5 13l4 4L19 7"
                  stroke="#34d399"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <p className="shift-hint text-center mb-2">
              A password reset link has been sent to
            </p>
            <p className="shift-email-display text-center mb-6">{email}</p>
            <p className="shift-hint text-center mb-6">
              Check your spam folder if you don't see it within a minute.
            </p>
            <button
              type="button"
              className="shift-btn-ghost w-full"
              onClick={() => switchView('login')}
            >
              ← Back to sign in
            </button>
          </div>
        )}

        <p className="shift-footer mt-6 text-center">
          Need access?{' '}
          <a href="mailto:admin@shiftai.space" className="shift-link">
            Contact ShiftAI
          </a>
        </p>
      </div>

      <style jsx>{`
        .shift-bg {
          background: #0a0f1a;
          font-family: 'Inter', system-ui, sans-serif;
        }

        .shift-card {
          background: #111827;
          border: 1px solid #1e293b;
          border-radius: 16px;
          padding: 40px;
          box-shadow:
            0 0 0 1px rgba(14, 165, 233, 0.06),
            0 20px 60px rgba(0, 0, 0, 0.6);
        }

        .shift-wordmark {
          font-size: 1.75rem;
          font-weight: 700;
          letter-spacing: -0.03em;
          color: #f1f5f9;
          margin: 0;
        }

        .shift-subtitle {
          font-size: 0.875rem;
          color: #64748b;
          margin-top: 4px;
        }

        .shift-label {
          display: block;
          font-size: 0.8125rem;
          font-weight: 500;
          color: #94a3b8;
          margin-bottom: 6px;
          letter-spacing: 0.01em;
        }

        .shift-hint {
          font-size: 0.875rem;
          color: #64748b;
          line-height: 1.5;
          margin: 0;
        }

        .shift-email-display {
          font-size: 0.9375rem;
          font-weight: 600;
          color: #f1f5f9;
          margin: 0;
        }

        .shift-input {
          width: 100%;
          background: #0d1520;
          border: 1px solid #1e293b;
          border-radius: 8px;
          padding: 10px 14px;
          font-size: 0.9375rem;
          color: #f1f5f9;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
          box-sizing: border-box;
        }

        .shift-input::placeholder {
          color: #334155;
        }

        .shift-input:focus {
          border-color: #0ea5e9;
          box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.15);
        }

        .shift-forgot {
          font-size: 0.8125rem;
          background: none;
          border: none;
          padding: 0;
          cursor: pointer;
        }

        .shift-btn-primary {
          display: block;
          padding: 11px 20px;
          font-size: 0.9375rem;
          font-weight: 600;
          color: #fff;
          background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: opacity 0.15s, transform 0.1s;
          letter-spacing: 0.01em;
        }

        .shift-btn-primary:hover:not(:disabled) {
          opacity: 0.92;
          transform: translateY(-1px);
        }

        .shift-btn-primary:active:not(:disabled) {
          transform: translateY(0);
        }

        .shift-btn-primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .shift-btn-ghost {
          display: block;
          padding: 10px 20px;
          font-size: 0.875rem;
          font-weight: 500;
          color: #64748b;
          background: transparent;
          border: 1px solid #1e293b;
          border-radius: 8px;
          cursor: pointer;
          transition: color 0.15s, border-color 0.15s;
          letter-spacing: 0.01em;
        }

        .shift-btn-ghost:hover {
          color: #94a3b8;
          border-color: #334155;
        }

        .shift-error {
          font-size: 0.8125rem;
          color: #f87171;
          background: rgba(248, 113, 113, 0.08);
          border: 1px solid rgba(248, 113, 113, 0.2);
          border-radius: 6px;
          padding: 8px 12px;
          margin: 0;
        }

        .shift-success-icon {
          width: 48px;
          height: 48px;
          background: rgba(52, 211, 153, 0.1);
          border: 1px solid rgba(52, 211, 153, 0.25);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .shift-footer {
          font-size: 0.8125rem;
          color: #475569;
          margin: 0;
        }

        .shift-link {
          color: #0ea5e9;
          text-decoration: none;
        }

        .shift-link:hover {
          text-decoration: underline;
        }

        .w-full { width: 100%; }
        .mt-3   { margin-top: 0.75rem; }
        .mt-4   { margin-top: 1rem; }
        .mt-5   { margin-top: 1.25rem; }
        .mb-1\\.5 { margin-bottom: 0.375rem; }
        .mb-2   { margin-bottom: 0.5rem; }
        .mb-4   { margin-bottom: 1rem; }
        .mb-5   { margin-bottom: 1.25rem; }
        .mb-6   { margin-bottom: 1.5rem; }
        .mb-8   { margin-bottom: 2rem; }
        .mt-6   { margin-top: 1.5rem; }
        .mx-auto { margin-left: auto; margin-right: auto; }
        .flex   { display: flex; }
        .items-center { align-items: center; }
        .justify-between { justify-content: space-between; }
        .flex-col { flex-direction: column; }
        .text-center { text-align: center; }
      `}</style>
    </main>
  );
}

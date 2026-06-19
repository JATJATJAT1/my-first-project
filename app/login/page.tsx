'use client';

import { useState } from 'react';

export default function LoginPage() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Replace with your actual auth call, e.g. supabase.auth.signInWithPassword
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

  return (
    <main className="shift-bg min-h-screen flex items-center justify-center px-4">
      <div className="shift-card w-full max-w-md">
        {/* Logo / wordmark */}
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
          <p className="shift-subtitle">Sign in to your dealership portal</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-4">
            <label htmlFor="email" className="shift-label">
              Email
            </label>
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

          <div className="mb-6">
            <label htmlFor="password" className="shift-label">
              Password
            </label>
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
            <p className="shift-error mb-4" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="shift-btn-primary w-full"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

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

        .shift-error {
          font-size: 0.8125rem;
          color: #f87171;
          background: rgba(248, 113, 113, 0.08);
          border: 1px solid rgba(248, 113, 113, 0.2);
          border-radius: 6px;
          padding: 8px 12px;
          margin: 0;
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
      `}</style>
    </main>
  );
}

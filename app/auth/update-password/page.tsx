'use client';

import { useState, useEffect } from 'react';
import { supabaseBrowser } from '@/lib/supabase/client';

export default function UpdatePasswordPage() {
  const [password, setPassword]   = useState('');
  const [confirm, setConfirm]     = useState('');
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [done, setDone]           = useState(false);
  const [sessionReady, setSessionReady] = useState(false);

  // Supabase embeds the recovery token in the URL hash — exchange it for a session.
  useEffect(() => {
    supabaseBrowser.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setSessionReady(true);
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    if (password.length < 8)  { setError('Password must be at least 8 characters.'); return; }
    setLoading(true);
    setError('');

    const { error: updateError } = await supabaseBrowser.auth.updateUser({ password });
    setLoading(false);

    if (updateError) { setError(updateError.message); return; }
    setDone(true);
    setTimeout(() => { window.location.href = '/dashboard'; }, 2000);
  }

  return (
    <main className="shift-bg min-h-screen flex items-center justify-center px-4">
      <div className="shift-card w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden className="mb-3">
            <rect width="40" height="40" rx="10" fill="#0ea5e9" />
            <path d="M10 28 L20 12 L30 28" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <circle cx="20" cy="12" r="2.5" fill="white" />
          </svg>
          <h1 className="shift-wordmark">ShiftAI</h1>
          <p className="shift-subtitle">{done ? 'Password updated!' : 'Set a new password'}</p>
        </div>

        {done ? (
          <div className="success-box">
            <div className="success-icon mx-auto mb-4">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M5 13l4 4L19 7" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p className="hint text-center">Your password has been updated. Redirecting you to the dashboard…</p>
          </div>
        ) : !sessionReady ? (
          <p className="hint text-center">Verifying your reset link…</p>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-4">
              <label htmlFor="pw" className="shift-label">New Password</label>
              <input id="pw" type="password" autoComplete="new-password" required
                className="shift-input" placeholder="At least 8 characters"
                value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            <div className="mb-5">
              <label htmlFor="pw2" className="shift-label">Confirm Password</label>
              <input id="pw2" type="password" autoComplete="new-password" required
                className="shift-input" placeholder="Repeat your new password"
                value={confirm} onChange={e => setConfirm(e.target.value)} />
            </div>
            {error && <p className="shift-error mb-4" role="alert">{error}</p>}
            <button type="submit" disabled={loading} className="shift-btn-primary w-full">
              {loading ? 'Updating…' : 'Update password'}
            </button>
          </form>
        )}
      </div>

      <style jsx>{`
        .shift-bg { background:#0a0f1a; font-family:'Inter',system-ui,sans-serif; }
        .shift-card { background:#111827; border:1px solid #1e293b; border-radius:16px; padding:40px;
          box-shadow:0 0 0 1px rgba(14,165,233,0.06),0 20px 60px rgba(0,0,0,0.6); }
        .shift-wordmark { font-size:1.75rem; font-weight:700; letter-spacing:-0.03em; color:#f1f5f9; margin:0; }
        .shift-subtitle { font-size:0.875rem; color:#64748b; margin-top:4px; }
        .shift-label { display:block; font-size:0.8125rem; font-weight:500; color:#94a3b8; margin-bottom:6px; }
        .shift-input { width:100%; background:#0d1520; border:1px solid #1e293b; border-radius:8px;
          padding:10px 14px; font-size:0.9375rem; color:#f1f5f9; outline:none;
          transition:border-color 0.15s,box-shadow 0.15s; box-sizing:border-box; }
        .shift-input:focus { border-color:#0ea5e9; box-shadow:0 0 0 3px rgba(14,165,233,0.15); }
        .shift-btn-primary { display:block; padding:11px 20px; font-size:0.9375rem; font-weight:600;
          color:#fff; background:linear-gradient(135deg,#0ea5e9 0%,#0284c7 100%); border:none;
          border-radius:8px; cursor:pointer; transition:opacity 0.15s; }
        .shift-btn-primary:hover:not(:disabled) { opacity:0.9; }
        .shift-btn-primary:disabled { opacity:0.5; cursor:not-allowed; }
        .shift-error { font-size:0.8125rem; color:#f87171; background:rgba(248,113,113,0.08);
          border:1px solid rgba(248,113,113,0.2); border-radius:6px; padding:8px 12px; margin:0; }
        .success-box { text-align:center; }
        .success-icon { width:48px; height:48px; background:rgba(52,211,153,0.1);
          border:1px solid rgba(52,211,153,0.25); border-radius:50%; display:flex;
          align-items:center; justify-content:center; }
        .hint { font-size:0.875rem; color:#64748b; line-height:1.5; }
        .w-full { width:100%; } .mb-4 { margin-bottom:1rem; } .mb-5 { margin-bottom:1.25rem; }
        .mb-3 { margin-bottom:0.75rem; } .mb-8 { margin-bottom:2rem; } .mx-auto { margin:0 auto; }
        .text-center { text-align:center; } .flex { display:flex; } .flex-col { flex-direction:column; }
        .items-center { align-items:center; } .min-h-screen { min-height:100vh; }
        .justify-center { justify-content:center; } .px-4 { padding:0 1rem; }
      `}</style>
    </main>
  );
}

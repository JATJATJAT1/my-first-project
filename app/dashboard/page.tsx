'use client';

import { useEffect, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase/client';

interface ScanRow {
  id: string;
  url: string;
  dealership_name: string | null;
  score: number;
  created_at: string;
}

export default function OverviewPage() {
  const [email, setEmail] = useState('');
  const [scans, setScans] = useState<ScanRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabaseBrowser.auth.getSession();
      if (!session) return;
      setEmail(session.user.email ?? '');
      try {
        const res = await fetch('/api/scan', {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        const data = await res.json();
        if (res.ok) setScans(data.scans ?? []);
      } catch { /* ignore */ }
      setLoading(false);
    })();
  }, []);

  const name    = email.split('@')[0] || 'there';
  const avg     = scans.length ? Math.round(scans.reduce((s, r) => s + r.score, 0) / scans.length) : null;

  return (
    <div className="ov">
      <h1 className="ov-title">Welcome back, {name} 👋</h1>
      <p className="ov-sub">Here’s your dealership lead-response command center.</p>

      <div className="ov-stats">
        <div className="stat">
          <div className="stat-num">{loading ? '—' : scans.length}</div>
          <div className="stat-lbl">Sites analyzed</div>
        </div>
        <div className="stat">
          <div className="stat-num">{avg === null ? '—' : avg}</div>
          <div className="stat-lbl">Avg. lead-capture score</div>
        </div>
        <div className="stat">
          <div className="stat-num">16+</div>
          <div className="stat-lbl">Lead sources supported</div>
        </div>
      </div>

      <div className="ov-cards">
        <a href="/dashboard/analyzer" className="ov-card ov-card-primary">
          <h3>Analyze a dealership website →</h3>
          <p>Run a Firecrawl-powered audit of any dealer site and see exactly where leads leak.</p>
        </a>
        <a href="/dashboard/integrations" className="ov-card">
          <h3>Connect your lead sources →</h3>
          <p>Wire up AutoTrader, Cars.com, Facebook, missed calls and 12 more.</p>
        </a>
      </div>

      <h2 className="ov-h2">Recent analyses</h2>
      {loading ? (
        <p className="ov-empty">Loading…</p>
      ) : scans.length === 0 ? (
        <p className="ov-empty">No analyses yet. <a href="/dashboard/analyzer">Run your first one →</a></p>
      ) : (
        <div className="ov-list">
          {scans.slice(0, 6).map(s => (
            <a key={s.id} href="/dashboard/analyzer" className="row">
              <span className="row-name">{s.dealership_name || new URL(s.url).hostname}</span>
              <span className="row-url">{new URL(s.url).hostname}</span>
              <span className="row-score" style={{ color: s.score >= 70 ? '#059669' : s.score >= 40 ? '#d97706' : '#dc2626' }}>
                {s.score}/100
              </span>
            </a>
          ))}
        </div>
      )}

      <style jsx>{`
        .ov { max-width: 900px; margin: 0 auto; padding: 40px 28px; font-family: 'Inter', system-ui, sans-serif; }
        .ov-title { font-size: 1.6rem; font-weight: 800; letter-spacing: -0.02em; color: #0f172a; margin: 0 0 4px; }
        .ov-sub { color: #64748b; font-size: 0.95rem; margin: 0 0 28px; }
        .ov-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 14px; margin-bottom: 28px; }
        .stat { background: #fff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 20px; }
        .stat-num { font-size: 2rem; font-weight: 800; color: #0ea5e9; line-height: 1; }
        .stat-lbl { font-size: 0.8125rem; color: #64748b; margin-top: 6px; }
        .ov-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 14px; margin-bottom: 36px; }
        .ov-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 22px; transition: border-color 0.15s, transform 0.1s; }
        .ov-card:hover { border-color: #0ea5e9; transform: translateY(-1px); }
        .ov-card h3 { font-size: 1rem; font-weight: 700; color: #0f172a; margin: 0 0 6px; }
        .ov-card p { font-size: 0.875rem; color: #64748b; margin: 0; line-height: 1.5; }
        .ov-card-primary { background: linear-gradient(135deg, #f0f9ff, #fff); border-color: #bae6fd; }
        .ov-h2 { font-size: 1.05rem; font-weight: 700; color: #0f172a; margin: 0 0 14px; }
        .ov-empty { color: #64748b; font-size: 0.9rem; }
        .ov-empty a { color: #0ea5e9; text-decoration: none; }
        .ov-list { display: flex; flex-direction: column; gap: 8px; }
        .row { display: flex; align-items: center; gap: 14px; background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px 16px; text-decoration: none; transition: border-color 0.15s; }
        .row:hover { border-color: #cbd5e1; }
        .row-name { font-weight: 600; color: #0f172a; font-size: 0.9rem; flex: 1; }
        .row-url { color: #94a3b8; font-size: 0.8125rem; }
        .row-score { font-weight: 700; font-size: 0.9rem; min-width: 60px; text-align: right; }
      `}</style>
    </div>
  );
}

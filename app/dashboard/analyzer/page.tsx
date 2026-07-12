'use client';

import { useCallback, useEffect, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase/client';
import type { ScanResult } from '@/lib/firecrawl';

interface ScanRow {
  id: string;
  url: string;
  dealership_name: string | null;
  brands: string[];
  city: string | null;
  state: string | null;
  phone: string | null;
  features: Record<string, boolean>;
  score: number;
  gaps: string[];
  favicon_url: string | null;
  created_at: string;
}

async function authHeaders(): Promise<HeadersInit> {
  const { data: { session } } = await supabaseBrowser.auth.getSession();
  return {
    'Content-Type': 'application/json',
    ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
  };
}

export default function AnalyzerPage() {
  const [url, setUrl]         = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [result, setResult]   = useState<ScanResult | null>(null);
  const [history, setHistory] = useState<ScanRow[]>([]);

  const loadHistory = useCallback(async () => {
    try {
      const res  = await fetch('/api/scan', { headers: await authHeaders() });
      const data = await res.json();
      if (res.ok) setHistory(data.scans ?? []);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { loadHistory(); }, [loadHistory]);

  async function runScan(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;
    setLoading(true); setError(''); setResult(null);
    try {
      const res  = await fetch('/api/scan', {
        method: 'POST', headers: await authHeaders(),
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Analysis failed.'); return; }
      setResult(data as ScanResult);
      loadHistory();
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="an">
      <h1 className="an-title">Website Analyzer</h1>
      <p className="an-sub">
        Enter any dealership website. We use <strong>Firecrawl</strong> to crawl the site, extract its
        details, and score how well it captures leads — then show what ShiftAI closes.
      </p>

      <form className="an-form" onSubmit={runScan}>
        <input
          className="an-input"
          type="text"
          inputMode="url"
          placeholder="yourdealership.com"
          value={url}
          onChange={e => setUrl(e.target.value)}
          aria-label="Dealership website URL"
        />
        <button className="an-btn" type="submit" disabled={loading}>
          {loading ? 'Analyzing…' : 'Analyze'}
        </button>
      </form>

      {error && <p className="an-error" role="alert">{error}</p>}
      {loading && <div className="an-loading"><span className="an-spin" /> Crawling &amp; scoring…</div>}

      {result && (
        <Report
          name={result.analysis.dealershipName ?? new URL(result.url).hostname}
          sub={[result.analysis.city, result.analysis.state].filter(Boolean).join(', ') || new URL(result.url).hostname}
          brands={result.analysis.brands}
          favicon={result.faviconUrl}
          score={result.score}
          signals={signalsFrom(result.analysis)}
          gaps={result.gaps}
          fresh
        />
      )}

      {history.length > 0 && (
        <>
          <h2 className="an-h2">Saved analyses</h2>
          <div className="an-history">
            {history.map(h => (
              <Report
                key={h.id}
                name={h.dealership_name ?? safeHost(h.url)}
                sub={[h.city, h.state].filter(Boolean).join(', ') || safeHost(h.url)}
                brands={h.brands ?? []}
                favicon={h.favicon_url}
                score={h.score}
                signals={[
                  { k: 'Inventory search', ok: !!h.features?.hasInventorySearch },
                  { k: 'Lead / contact form', ok: !!h.features?.hasContactForm },
                  { k: 'Live chat', ok: !!h.features?.hasChatWidget },
                  { k: 'Financing page', ok: !!h.features?.hasFinancingPage },
                  { k: 'Phone listed', ok: !!h.phone },
                  { k: 'Used inventory', ok: !!h.features?.sellsUsedCars },
                ]}
                gaps={h.gaps ?? []}
                date={new Date(h.created_at).toLocaleDateString()}
              />
            ))}
          </div>
        </>
      )}

      <style jsx>{`
        .an { max-width: 820px; margin: 0 auto; padding: 40px 28px; font-family: 'Inter', system-ui, sans-serif; }
        .an-title { font-size: 1.5rem; font-weight: 800; letter-spacing: -0.02em; color: #0f172a; margin: 0 0 6px; }
        .an-sub { color: #64748b; font-size: 0.95rem; line-height: 1.55; margin: 0 0 24px; }
        .an-sub strong { color: #0284c7; }
        .an-form { display: flex; gap: 10px; margin-bottom: 8px; }
        .an-input {
          flex: 1; background: #fff; border: 1px solid #cbd5e1; border-radius: 9px;
          padding: 12px 15px; font-size: 15px; color: #0f172a; outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .an-input:focus { border-color: #0ea5e9; box-shadow: 0 0 0 3px rgba(14,165,233,0.15); }
        .an-btn {
          background: linear-gradient(135deg,#0ea5e9,#0284c7); color: #fff; font-weight: 700;
          font-size: 14.5px; border: none; border-radius: 9px; padding: 0 26px; cursor: pointer;
          transition: opacity 0.15s;
        }
        .an-btn:hover:not(:disabled) { opacity: 0.9; }
        .an-btn:disabled { opacity: 0.55; cursor: not-allowed; }
        .an-error { font-size: 14px; color: #dc2626; background: #fef2f2; border: 1px solid #fecaca; border-radius: 9px; padding: 11px 15px; margin: 12px 0 0; }
        .an-loading { display: flex; align-items: center; gap: 10px; color: #64748b; font-size: 14.5px; margin-top: 18px; }
        .an-spin { width: 17px; height: 17px; border: 2.5px solid #e2e8f0; border-top-color: #0ea5e9; border-radius: 50%; display: inline-block; animation: spin 0.7s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .an-h2 { font-size: 1.05rem; font-weight: 700; color: #0f172a; margin: 36px 0 14px; }
        .an-history { display: flex; flex-direction: column; gap: 14px; }
      `}</style>
    </div>
  );
}

function signalsFrom(a: ScanResult['analysis']) {
  return [
    { k: 'Inventory search', ok: a.hasInventorySearch },
    { k: 'Lead / contact form', ok: a.hasContactForm },
    { k: 'Live chat', ok: a.hasChatWidget },
    { k: 'Financing page', ok: a.hasFinancingPage },
    { k: 'Phone listed', ok: Boolean(a.phone) },
    { k: 'Used inventory', ok: a.sellsUsedCars },
  ];
}

function safeHost(u: string): string {
  try { return new URL(u).hostname; } catch { return u; }
}

function Report({
  name, sub, brands, favicon, score, signals, gaps, fresh, date,
}: {
  name: string; sub: string; brands: string[]; favicon: string | null;
  score: number; signals: Array<{ k: string; ok: boolean }>; gaps: string[];
  fresh?: boolean; date?: string;
}) {
  const tone  = score >= 70 ? '#059669' : score >= 40 ? '#d97706' : '#dc2626';
  const label = score >= 70 ? 'Strong lead capture' : score >= 40 ? 'Room to grow' : 'Losing leads';

  return (
    <div className={`rp ${fresh ? 'rp-fresh' : ''}`}>
      <div className="rp-head">
        <div className="rp-id">
          {favicon && <img className="rp-fav" src={favicon} alt="" width={26} height={26} />}
          <div>
            <div className="rp-name">{name}</div>
            <div className="rp-meta">
              {sub}{brands.length > 0 && <> · {brands.slice(0, 4).join(', ')}</>}
              {date && <> · {date}</>}
            </div>
          </div>
        </div>
        <div className="rp-score" style={{ color: tone }}>{score}<span>/100</span></div>
      </div>

      <div className="rp-bar"><span style={{ width: `${score}%`, background: tone }} /></div>
      <div className="rp-badge" style={{ color: tone, borderColor: tone }}>{label}</div>

      <div className="rp-sigs">
        {signals.map(s => (
          <div key={s.k} className={`sg ${s.ok ? 'sg-on' : 'sg-off'}`}>
            <span>{s.ok ? '✓' : '×'}</span> {s.k}
          </div>
        ))}
      </div>

      {gaps.length > 0 && (
        <div className="rp-gaps">
          <div className="rp-gaps-t">What ShiftAI closes:</div>
          <ul>{gaps.map((g, i) => <li key={i}>{g}</li>)}</ul>
        </div>
      )}

      <style jsx>{`
        .rp { background: #fff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 22px; }
        .rp-fresh { border-color: #0ea5e9; box-shadow: 0 0 0 3px rgba(14,165,233,0.1); margin-top: 20px; animation: rise 0.25s ease; }
        @keyframes rise { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .rp-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 14px; }
        .rp-id { display: flex; gap: 11px; align-items: center; min-width: 0; }
        .rp-fav { border-radius: 6px; flex-shrink: 0; }
        .rp-name { font-size: 1rem; font-weight: 700; color: #0f172a; }
        .rp-meta { font-size: 0.8125rem; color: #94a3b8; margin-top: 2px; }
        .rp-score { font-size: 1.9rem; font-weight: 800; line-height: 1; flex-shrink: 0; }
        .rp-score span { font-size: 0.8rem; color: #94a3b8; font-weight: 600; }
        .rp-bar { height: 6px; background: #f1f5f9; border-radius: 20px; margin: 16px 0 10px; overflow: hidden; }
        .rp-bar span { display: block; height: 100%; border-radius: 20px; transition: width 0.5s ease; }
        .rp-badge { display: inline-block; font-size: 11.5px; font-weight: 700; padding: 3px 10px; border: 1px solid; border-radius: 20px; margin-bottom: 16px; }
        .rp-sigs { display: grid; grid-template-columns: repeat(auto-fit, minmax(155px, 1fr)); gap: 7px; margin-bottom: 14px; }
        .sg { font-size: 12.5px; display: flex; align-items: center; gap: 7px; padding: 7px 10px; border-radius: 7px; }
        .sg span { font-weight: 800; }
        .sg-on { background: #f0fdf4; color: #334155; }
        .sg-on span { color: #059669; }
        .sg-off { background: #fef2f2; color: #64748b; }
        .sg-off span { color: #dc2626; }
        .rp-gaps { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px 16px; }
        .rp-gaps-t { font-size: 12.5px; font-weight: 700; color: #334155; margin-bottom: 8px; }
        .rp-gaps ul { margin: 0; padding-left: 17px; }
        .rp-gaps li { font-size: 12.5px; line-height: 1.55; color: #64748b; margin-bottom: 5px; }
      `}</style>
    </div>
  );
}

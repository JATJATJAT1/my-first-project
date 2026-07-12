'use client';

import { useState } from 'react';
import type { ScanResult } from '@/lib/firecrawl';

export default function LandingPage() {
  const [url, setUrl]         = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [result, setResult]   = useState<ScanResult | null>(null);

  async function runScan(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res  = await fetch('/api/scan', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Analysis failed. Please try again.'); return; }
      setResult(data as ScanResult);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="lp">
      {/* ── Header ─────────────────────────────────────────── */}
      <header className="nav">
        <div className="brand">
          <span className="brand-mark">S</span>
          <span className="brand-name">ShiftAI</span>
        </div>
        <nav className="nav-links">
          <a href="#how">How it works</a>
          <a href="#features">Features</a>
          <a href="/login" className="nav-signin">Sign in</a>
        </nav>
      </header>

      {/* ── Hero + live analyzer ───────────────────────────── */}
      <section className="hero">
        <span className="eyebrow">AI lead response · built for car dealerships</span>
        <h1 className="hero-title">
          Every lead answered in seconds.<br />Even the ones you’re missing.
        </h1>
        <p className="hero-sub">
          ShiftAI is the AI sales assistant for franchise &amp; independent dealerships — it replies to
          every web lead, missed call, and marketplace inquiry instantly, 24/7, so no shopper ever goes cold.
        </p>

        <form className="analyzer" onSubmit={runScan}>
          <label className="analyzer-label">See it on your own site — free instant audit</label>
          <div className="analyzer-row">
            <input
              className="analyzer-input"
              type="text"
              inputMode="url"
              placeholder="yourdealership.com"
              value={url}
              onChange={e => setUrl(e.target.value)}
              aria-label="Your dealership website"
            />
            <button className="analyzer-btn" type="submit" disabled={loading}>
              {loading ? 'Analyzing…' : 'Analyze my site'}
            </button>
          </div>
          <p className="analyzer-hint">
            Powered by Firecrawl — we scan your homepage for lead-capture gaps. No signup required.
          </p>
        </form>

        {error && <p className="scan-error" role="alert">{error}</p>}

        {loading && (
          <div className="scan-loading">
            <span className="spinner" /> Crawling your site &amp; scoring lead capture…
          </div>
        )}

        {result && <ScanReport result={result} />}
      </section>

      {/* ── How it works ───────────────────────────────────── */}
      <section id="how" className="section">
        <h2 className="section-title">From missed lead to booked appointment — automatically</h2>
        <div className="steps">
          {[
            { n: '1', t: 'Connect your sources', d: 'Website forms, missed calls, AutoTrader, Cars.com, Facebook — all in one inbox.' },
            { n: '2', t: 'AI responds instantly', d: 'ShiftAI answers in seconds with pricing, availability, and a booking link — day or night.' },
            { n: '3', t: 'You close more cars', d: 'Qualified, appointment-ready buyers land on your sales desk. No lead left waiting.' },
          ].map(s => (
            <div key={s.n} className="step">
              <span className="step-n">{s.n}</span>
              <h3 className="step-t">{s.t}</h3>
              <p className="step-d">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────── */}
      <section id="features" className="section">
        <h2 className="section-title">Built for how dealerships actually sell</h2>
        <div className="feature-grid">
          {[
            { t: 'Instant lead response', d: 'Sub-10-second replies to every inbound lead. Speed-to-lead wins the sale.' },
            { t: 'Missed-call text-back', d: 'Every unanswered call gets an instant text so the customer never calls the dealer down the street.' },
            { t: '16+ lead sources', d: 'AutoTrader, CarGurus, Cars.com, Facebook, Marketplace, TrueCar, Edmunds, KBB and more.' },
            { t: 'Firecrawl site intelligence', d: 'We read your website to tailor responses to your real inventory and brands.' },
            { t: 'Appointment booking', d: 'AI qualifies buyers and drops booked test drives straight onto your calendar.' },
            { t: 'Works while you sleep', d: '62% of leads arrive after hours. ShiftAI covers every one of them.' },
          ].map(f => (
            <div key={f.t} className="feature">
              <h3 className="feature-t">{f.t}</h3>
              <p className="feature-d">{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────── */}
      <section className="cta">
        <h2 className="cta-title">Stop losing leads to slow follow-up.</h2>
        <p className="cta-sub">Get your dealership portal and turn on instant AI response today.</p>
        <a href="/login" className="cta-btn">Get started</a>
      </section>

      <footer className="footer">
        <span>© {new Date().getFullYear()} ShiftAI</span>
        <span className="footer-dot">·</span>
        <a href="/login">Sign in</a>
        <span className="footer-dot">·</span>
        <span className="footer-muted">AI lead response for car dealerships</span>
      </footer>

      <style jsx>{`
        .lp {
          background: #0a0f1a;
          color: #e2e8f0;
          font-family: 'Inter', system-ui, sans-serif;
          min-height: 100vh;
          overflow-x: hidden;
        }
        a { color: inherit; text-decoration: none; }

        /* Nav */
        .nav {
          max-width: 1080px; margin: 0 auto;
          display: flex; align-items: center; justify-content: space-between;
          padding: 20px 24px;
        }
        .brand { display: flex; align-items: center; gap: 10px; }
        .brand-mark {
          width: 32px; height: 32px; border-radius: 8px; background: #0ea5e9;
          display: flex; align-items: center; justify-content: center;
          color: #fff; font-weight: 800; font-size: 15px;
        }
        .brand-name { font-weight: 700; font-size: 17px; letter-spacing: -0.02em; color: #f1f5f9; }
        .nav-links { display: flex; align-items: center; gap: 24px; font-size: 14px; color: #94a3b8; }
        .nav-links a:hover { color: #e2e8f0; }
        .nav-signin {
          background: #1e293b; color: #f1f5f9 !important; padding: 7px 16px;
          border-radius: 8px; font-weight: 600;
        }
        .nav-signin:hover { background: #334155; }

        /* Hero */
        .hero { max-width: 780px; margin: 0 auto; padding: 56px 24px 32px; text-align: center; }
        .eyebrow {
          display: inline-block; font-size: 12.5px; font-weight: 600; letter-spacing: 0.04em;
          text-transform: uppercase; color: #0ea5e9;
          background: rgba(14,165,233,0.1); border: 1px solid rgba(14,165,233,0.2);
          padding: 5px 12px; border-radius: 20px; margin-bottom: 22px;
        }
        .hero-title {
          font-size: clamp(2rem, 5vw, 3.1rem); font-weight: 800; line-height: 1.1;
          letter-spacing: -0.03em; color: #f8fafc; margin: 0 0 18px;
        }
        .hero-sub { font-size: 1.0625rem; line-height: 1.6; color: #94a3b8; margin: 0 auto 36px; max-width: 640px; }

        /* Analyzer */
        .analyzer {
          background: #111827; border: 1px solid #1e293b; border-radius: 16px;
          padding: 22px; max-width: 620px; margin: 0 auto; text-align: left;
          box-shadow: 0 20px 60px rgba(0,0,0,0.4);
        }
        .analyzer-label { display: block; font-size: 13px; font-weight: 600; color: #cbd5e1; margin-bottom: 12px; }
        .analyzer-row { display: flex; gap: 10px; }
        .analyzer-input {
          flex: 1; background: #0d1520; border: 1px solid #1e293b; border-radius: 9px;
          padding: 12px 15px; font-size: 15px; color: #f1f5f9; outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .analyzer-input::placeholder { color: #475569; }
        .analyzer-input:focus { border-color: #0ea5e9; box-shadow: 0 0 0 3px rgba(14,165,233,0.15); }
        .analyzer-btn {
          background: linear-gradient(135deg,#0ea5e9,#0284c7); color: #fff; font-weight: 700;
          font-size: 14.5px; border: none; border-radius: 9px; padding: 0 22px; cursor: pointer;
          white-space: nowrap; transition: opacity 0.15s;
        }
        .analyzer-btn:hover:not(:disabled) { opacity: 0.9; }
        .analyzer-btn:disabled { opacity: 0.55; cursor: not-allowed; }
        .analyzer-hint { font-size: 12px; color: #64748b; margin: 12px 0 0; }

        /* Scan states */
        .scan-error {
          max-width: 620px; margin: 18px auto 0; font-size: 14px; color: #f87171;
          background: rgba(248,113,113,0.08); border: 1px solid rgba(248,113,113,0.2);
          border-radius: 9px; padding: 11px 15px; text-align: left;
        }
        .scan-loading {
          max-width: 620px; margin: 22px auto 0; display: flex; align-items: center; gap: 12px;
          color: #94a3b8; font-size: 14.5px; justify-content: center;
        }
        .spinner {
          width: 18px; height: 18px; border: 2.5px solid #1e293b; border-top-color: #0ea5e9;
          border-radius: 50%; display: inline-block; animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Sections */
        .section { max-width: 1000px; margin: 0 auto; padding: 56px 24px; }
        .section-title {
          font-size: clamp(1.4rem, 3vw, 1.9rem); font-weight: 700; letter-spacing: -0.02em;
          color: #f1f5f9; text-align: center; margin: 0 0 40px;
        }
        .steps { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; }
        .step { background: #0f1623; border: 1px solid #1e293b; border-radius: 14px; padding: 26px 22px; }
        .step-n {
          display: inline-flex; align-items: center; justify-content: center;
          width: 34px; height: 34px; border-radius: 9px; background: rgba(14,165,233,0.12);
          color: #0ea5e9; font-weight: 800; font-size: 16px; margin-bottom: 14px;
        }
        .step-t { font-size: 1.0625rem; font-weight: 700; color: #f1f5f9; margin: 0 0 8px; }
        .step-d { font-size: 0.9375rem; line-height: 1.55; color: #94a3b8; margin: 0; }

        .feature-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; }
        .feature { background: #0f1623; border: 1px solid #1e293b; border-radius: 14px; padding: 22px; }
        .feature-t { font-size: 1rem; font-weight: 700; color: #f1f5f9; margin: 0 0 7px; }
        .feature-d { font-size: 0.9rem; line-height: 1.55; color: #94a3b8; margin: 0; }

        /* CTA */
        .cta {
          max-width: 820px; margin: 32px auto 0; text-align: center; padding: 56px 24px;
          background: linear-gradient(135deg, rgba(14,165,233,0.1), rgba(2,132,199,0.04));
          border-top: 1px solid #1e293b; border-bottom: 1px solid #1e293b;
        }
        .cta-title { font-size: clamp(1.5rem,3.5vw,2.1rem); font-weight: 800; letter-spacing: -0.02em; color: #f8fafc; margin: 0 0 12px; }
        .cta-sub { font-size: 1rem; color: #94a3b8; margin: 0 0 28px; }
        .cta-btn {
          display: inline-block; background: linear-gradient(135deg,#0ea5e9,#0284c7); color: #fff !important;
          font-weight: 700; font-size: 15px; padding: 13px 32px; border-radius: 10px; transition: opacity 0.15s;
        }
        .cta-btn:hover { opacity: 0.9; }

        /* Footer */
        .footer {
          max-width: 1000px; margin: 0 auto; padding: 32px 24px; display: flex; flex-wrap: wrap;
          align-items: center; gap: 10px; font-size: 13px; color: #64748b; justify-content: center;
        }
        .footer a:hover { color: #94a3b8; }
        .footer-dot { color: #334155; }
        .footer-muted { color: #475569; }
      `}</style>
    </main>
  );
}

/* ── Scan report card ─────────────────────────────────────── */
function ScanReport({ result }: { result: ScanResult }) {
  const { analysis, score, gaps, faviconUrl, url } = result;
  const tone = score >= 70 ? '#34d399' : score >= 40 ? '#fbbf24' : '#f87171';
  const label = score >= 70 ? 'Strong lead capture' : score >= 40 ? 'Room to grow' : 'Losing leads';

  const signals: Array<{ k: string; ok: boolean }> = [
    { k: 'Inventory search', ok: analysis.hasInventorySearch },
    { k: 'Lead / contact form', ok: analysis.hasContactForm },
    { k: 'Live chat', ok: analysis.hasChatWidget },
    { k: 'Financing page', ok: analysis.hasFinancingPage },
    { k: 'Phone listed', ok: Boolean(analysis.phone) },
    { k: 'Used inventory', ok: analysis.sellsUsedCars },
  ];

  return (
    <div className="report">
      <div className="report-head">
        <div className="report-id">
          {faviconUrl && <img className="report-fav" src={faviconUrl} alt="" width={28} height={28} />}
          <div>
            <div className="report-name">{analysis.dealershipName ?? new URL(url).hostname}</div>
            <div className="report-meta">
              {[analysis.city, analysis.state].filter(Boolean).join(', ') || new URL(url).hostname}
              {analysis.brands.length > 0 && <> · {analysis.brands.slice(0, 4).join(', ')}</>}
            </div>
          </div>
        </div>
        <div className="report-score" style={{ color: tone }}>
          <div className="report-score-num">{score}</div>
          <div className="report-score-lbl">/ 100</div>
        </div>
      </div>

      <div className="report-bar"><span style={{ width: `${score}%`, background: tone }} /></div>
      <div className="report-badge" style={{ color: tone, borderColor: tone }}>{label}</div>

      <div className="report-signals">
        {signals.map(s => (
          <div key={s.k} className={`sig ${s.ok ? 'sig-on' : 'sig-off'}`}>
            <span className="sig-icon">{s.ok ? '✓' : '×'}</span> {s.k}
          </div>
        ))}
      </div>

      {gaps.length > 0 && (
        <div className="report-gaps">
          <div className="report-gaps-title">What ShiftAI closes for you:</div>
          <ul>{gaps.map((g, i) => <li key={i}>{g}</li>)}</ul>
        </div>
      )}

      <a href="/login" className="report-cta">Turn on ShiftAI for this site →</a>

      <style jsx>{`
        .report {
          max-width: 620px; margin: 26px auto 0; text-align: left;
          background: #111827; border: 1px solid #1e293b; border-radius: 16px; padding: 24px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.4); animation: rise 0.25s ease;
        }
        @keyframes rise { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .report-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; }
        .report-id { display: flex; gap: 12px; align-items: center; min-width: 0; }
        .report-fav { border-radius: 6px; flex-shrink: 0; }
        .report-name { font-size: 1.05rem; font-weight: 700; color: #f1f5f9; }
        .report-meta { font-size: 0.8125rem; color: #64748b; margin-top: 2px; }
        .report-score { display: flex; align-items: baseline; gap: 3px; flex-shrink: 0; }
        .report-score-num { font-size: 2.2rem; font-weight: 800; line-height: 1; }
        .report-score-lbl { font-size: 0.8rem; color: #64748b; }
        .report-bar { height: 7px; background: #0d1520; border-radius: 20px; margin: 18px 0 10px; overflow: hidden; }
        .report-bar span { display: block; height: 100%; border-radius: 20px; transition: width 0.5s ease; }
        .report-badge {
          display: inline-block; font-size: 12px; font-weight: 700; padding: 3px 10px;
          border: 1px solid; border-radius: 20px; margin-bottom: 18px;
        }
        .report-signals { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 8px; margin-bottom: 18px; }
        .sig { font-size: 13px; display: flex; align-items: center; gap: 8px; padding: 8px 11px; border-radius: 8px; }
        .sig-on  { background: rgba(52,211,153,0.08); color: #cbd5e1; }
        .sig-off { background: rgba(248,113,113,0.06); color: #94a3b8; }
        .sig-icon { font-weight: 800; }
        .sig-on .sig-icon  { color: #34d399; }
        .sig-off .sig-icon { color: #f87171; }
        .report-gaps { background: #0d1520; border: 1px solid #1e293b; border-radius: 11px; padding: 16px 18px; margin-bottom: 18px; }
        .report-gaps-title { font-size: 13px; font-weight: 700; color: #cbd5e1; margin-bottom: 10px; }
        .report-gaps ul { margin: 0; padding-left: 18px; }
        .report-gaps li { font-size: 13px; line-height: 1.6; color: #94a3b8; margin-bottom: 6px; }
        .report-cta {
          display: block; text-align: center; background: linear-gradient(135deg,#0ea5e9,#0284c7);
          color: #fff !important; font-weight: 700; font-size: 14.5px; padding: 12px; border-radius: 10px;
          transition: opacity 0.15s;
        }
        .report-cta:hover { opacity: 0.9; }
      `}</style>
    </div>
  );
}

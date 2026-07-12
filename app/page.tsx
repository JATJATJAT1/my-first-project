'use client';

import { useEffect, useRef, useState } from 'react';
import { PartnerLogo } from '@/lib/integrations/logos';
import type { ScanResult } from '@/lib/firecrawl';

/* A baked-in real-world example so the demo always looks alive,
   even before the live Firecrawl key is configured. */
const SAMPLE: ScanResult = {
  url: 'https://www.galpinford.com',
  analysis: {
    dealershipName: 'Galpin Ford',
    brands: ['Ford', 'Lincoln'],
    city: 'North Hills',
    state: 'CA',
    phone: '(818) 787-3800',
    hasInventorySearch: true,
    hasContactForm: true,
    hasChatWidget: false,
    hasFinancingPage: true,
    sellsUsedCars: true,
  },
  score: 70,
  gaps: [
    'No live chat — ShiftAI adds 24/7 AI chat that books test drives while you sleep.',
  ],
  faviconUrl: 'https://www.google.com/s2/favicons?domain=galpinford.com&sz=64',
  scrapedAt: '',
};

const LOGO_IDS = [
  'autotrader', 'cargurus', 'cars-com', 'facebook-ads', 'instagram',
  'google-business', 'truecar', 'edmunds', 'kbb-ico', 'fb-marketplace',
  'craigslist', 'tiktok-lead-gen',
];

export default function LandingPage() {
  const [url, setUrl]         = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [result, setResult]   = useState<ScanResult>(SAMPLE);
  const [isSample, setSample] = useState(true);

  // Lightweight scroll-reveal. Elements are visible by default; this only
  // enhances with an entrance, so nothing is ever hidden if JS is off.
  const rootRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const els = Array.from(root.querySelectorAll('[data-reveal]'));
    // Failsafe: guarantee everything becomes visible even if the observer
    // never fires (unsupported, error, off-screen at load, etc.).
    const revealAll = () => els.forEach(el => el.classList.add('in'));
    if (!('IntersectionObserver' in window)) { revealAll(); return; }
    const io = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }),
      { threshold: 0.12 },
    );
    els.forEach(el => io.observe(el));
    const t = setTimeout(revealAll, 2500);
    return () => { io.disconnect(); clearTimeout(t); };
  }, []);

  async function runScan(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;
    setLoading(true); setError('');
    try {
      const res  = await fetch('/api/scan', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Analysis failed. Please try again.'); return; }
      setResult(data as ScanResult); setSample(false);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="lp" ref={rootRef}>
      {/* animated background */}
      <div className="bg" aria-hidden>
        <span className="glow glow-a" />
        <span className="glow glow-b" />
        <span className="glow glow-c" />
        <span className="grid" />
      </div>

      {/* ── Nav ─────────────────────────────────────────────── */}
      <header className="nav">
        <div className="nav-in">
          <div className="brand">
            <span className="brand-mark">
              <svg width="20" height="20" viewBox="0 0 40 40" fill="none">
                <path d="M10 28 L20 12 L30 28" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="20" cy="12" r="2.6" fill="#fff"/>
              </svg>
            </span>
            <span className="brand-name">ShiftAI</span>
          </div>
          <nav className="nav-links">
            <a href="#how">How it works</a>
            <a href="#features">Features</a>
            <a href="#sources">Integrations</a>
            <a href="/login" className="nav-ghost">Sign in</a>
            <a href="/login" className="nav-cta">Get started</a>
          </nav>
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────────────── */}
      <section className="hero">
        <span className="eyebrow" data-reveal>
          <span className="live-dot" /> AI lead response · built for car dealerships
        </span>
        <h1 className="hero-title" data-reveal>
          Every lead answered in seconds.<br />
          <span className="grad">Even the ones you’re missing.</span>
        </h1>
        <p className="hero-sub" data-reveal>
          ShiftAI is the AI sales assistant for franchise &amp; independent dealerships. It replies to every
          web lead, missed call, and marketplace inquiry <strong>instantly, 24/7</strong> — so no shopper
          ever goes cold and no deal walks to the dealer down the street.
        </p>
        <div className="hero-cta" data-reveal>
          <a href="/login" className="btn-primary">Start free</a>
          <a href="#demo" className="btn-secondary">Try the live demo ↓</a>
        </div>
        <div className="hero-trust" data-reveal>
          <span>⚡ Sub-10-second replies</span>
          <span className="sep">·</span>
          <span>🌙 62% of leads arrive after hours</span>
          <span className="sep">·</span>
          <span>🔌 16+ lead sources</span>
        </div>
      </section>

      {/* ── Live demo ───────────────────────────────────────── */}
      <section id="demo" className="demo">
        <div className="demo-card glass" data-reveal>
          <div className="demo-head">
            <div>
              <h2 className="demo-title">See it on your own site — free instant audit</h2>
              <p className="demo-desc">
                Powered by <strong>Firecrawl</strong>. We crawl a dealership homepage, extract its details,
                and score how well it captures leads. No signup required.
              </p>
            </div>
          </div>

          <form className="demo-form" onSubmit={runScan}>
            <div className="demo-inputwrap">
              <span className="demo-globe">🌐</span>
              <input
                className="demo-input"
                type="text"
                inputMode="url"
                placeholder="yourdealership.com"
                value={url}
                onChange={e => setUrl(e.target.value)}
                aria-label="Your dealership website"
              />
            </div>
            <button className="btn-primary demo-btn" type="submit" disabled={loading}>
              {loading ? 'Analyzing…' : 'Analyze my site'}
            </button>
          </form>

          {error && <p className="demo-error" role="alert">{error}</p>}
          {loading && <div className="demo-loading"><span className="spinner" /> Crawling &amp; scoring lead capture…</div>}

          <ScanReport result={result} isSample={isSample} />
        </div>
      </section>

      {/* ── Logo marquee ────────────────────────────────────── */}
      <section id="sources" className="sources">
        <p className="sources-label" data-reveal>One inbox for every lead source your dealership uses</p>
        <div className="marquee" data-reveal>
          <div className="marquee-track">
            {[...LOGO_IDS, ...LOGO_IDS].map((id, i) => (
              <div className="logo-chip" key={`${id}-${i}`}>
                <PartnerLogo id={id} size={30} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats ───────────────────────────────────────────── */}
      <section className="stats" data-reveal>
        {[
          { n: '10s', l: 'Average lead response time' },
          { n: '24/7', l: 'Always-on AI coverage' },
          { n: '16+', l: 'Lead sources connected' },
          { n: '5×', l: 'More leads worked, zero extra staff' },
        ].map(s => (
          <div className="stat" key={s.l}>
            <div className="stat-n grad">{s.n}</div>
            <div className="stat-l">{s.l}</div>
          </div>
        ))}
      </section>

      {/* ── How it works ────────────────────────────────────── */}
      <section id="how" className="section">
        <h2 className="section-title" data-reveal>From missed lead to booked appointment — automatically</h2>
        <div className="steps">
          {[
            { n: '1', t: 'Connect your sources', d: 'Website forms, missed calls, AutoTrader, Cars.com, Facebook, Marketplace — all flow into one inbox.' },
            { n: '2', t: 'AI responds instantly', d: 'ShiftAI answers in seconds with pricing, availability and a booking link — day or night.' },
            { n: '3', t: 'You close more cars', d: 'Qualified, appointment-ready buyers land on your sales desk. No lead left waiting.' },
          ].map(s => (
            <div className="step glass" key={s.n} data-reveal>
              <span className="step-n grad-bg">{s.n}</span>
              <h3 className="step-t">{s.t}</h3>
              <p className="step-d">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────── */}
      <section id="features" className="section">
        <h2 className="section-title" data-reveal>Built for how dealerships actually sell</h2>
        <div className="feat-grid">
          {[
            { icon: '⚡', t: 'Instant lead response', d: 'Sub-10-second replies to every inbound lead. Speed-to-lead wins the sale.' },
            { icon: '📞', t: 'Missed-call text-back', d: 'Every unanswered call gets an instant text so the customer never calls a competitor.' },
            { icon: '🔌', t: '16+ lead sources', d: 'AutoTrader, CarGurus, Cars.com, Facebook, Marketplace, TrueCar, Edmunds, KBB & more.' },
            { icon: '🔥', t: 'Firecrawl site intelligence', d: 'We read your website to tailor responses to your real inventory and brands.' },
            { icon: '📅', t: 'Appointment booking', d: 'AI qualifies buyers and drops booked test drives straight onto your calendar.' },
            { icon: '🌙', t: 'Works while you sleep', d: '62% of leads arrive after hours. ShiftAI covers every single one.' },
          ].map(f => (
            <div className="feat glass" key={f.t} data-reveal>
              <span className="feat-icon">{f.icon}</span>
              <h3 className="feat-t">{f.t}</h3>
              <p className="feat-d">{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Product preview ─────────────────────────────────── */}
      <section className="preview" data-reveal>
        <div className="preview-copy">
          <span className="eyebrow"><span className="live-dot" /> Your command center</span>
          <h2 className="section-title left">One dashboard. Every lead. Total control.</h2>
          <p className="preview-p">
            Watch conversations happen in real time, see which sources drive the most appointments, and run a
            Firecrawl audit on any competitor’s site — all from your ShiftAI dealership portal.
          </p>
          <a href="/login" className="btn-primary">Open your dashboard</a>
        </div>
        <div className="preview-window glass">
          <div className="pw-bar"><span/><span/><span/></div>
          <div className="pw-body">
            <div className="pw-row"><span className="pw-avatar grad-bg">JD</span><div className="pw-line"><b>New lead · AutoTrader</b><i>2004 F-150 — “Is this still available?”</i></div><span className="pw-badge">Replied 8s</span></div>
            <div className="pw-row"><span className="pw-avatar grad-bg">SM</span><div className="pw-line"><b>Missed call · text-back sent</b><i>“Yes! Want to schedule a test drive?”</i></div><span className="pw-badge">Booked</span></div>
            <div className="pw-row"><span className="pw-avatar grad-bg">RK</span><div className="pw-line"><b>Facebook lead</b><i>Financing pre-qual started</i></div><span className="pw-badge pw-badge-live">Live</span></div>
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────── */}
      <section className="cta glass" data-reveal>
        <h2 className="cta-title">Stop losing leads to slow follow-up.</h2>
        <p className="cta-sub">Turn on instant AI response for your dealership today.</p>
        <a href="/login" className="btn-primary btn-lg">Get started free</a>
      </section>

      <footer className="footer">
        <div className="brand">
          <span className="brand-mark small">
            <svg width="16" height="16" viewBox="0 0 40 40" fill="none">
              <path d="M10 28 L20 12 L30 28" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="20" cy="12" r="2.6" fill="#fff"/>
            </svg>
          </span>
          <span className="brand-name">ShiftAI</span>
        </div>
        <span className="foot-muted">AI lead response for car dealerships · © {new Date().getFullYear()}</span>
        <a href="/login" className="foot-link">Sign in</a>
      </footer>

      <style jsx>{`
        .lp { position: relative; background: #070b13; color: #e2e8f0; font-family: 'Inter', system-ui, sans-serif; overflow-x: hidden; min-height: 100vh; }
        a { color: inherit; text-decoration: none; }
        .grad { background: linear-gradient(100deg,#38bdf8,#0ea5e9 40%,#8b5cf6); -webkit-background-clip: text; background-clip: text; color: transparent; }
        .grad-bg { background: linear-gradient(135deg,#0ea5e9,#8b5cf6); }

        /* Background */
        .bg { position: fixed; inset: 0; z-index: 0; pointer-events: none; }
        .glow { position: absolute; border-radius: 50%; filter: blur(90px); opacity: 0.5; }
        .glow-a { width: 520px; height: 520px; background: #0ea5e9; top: -140px; left: -80px; animation: float1 14s ease-in-out infinite; }
        .glow-b { width: 460px; height: 460px; background: #8b5cf6; top: 260px; right: -120px; animation: float2 17s ease-in-out infinite; }
        .glow-c { width: 400px; height: 400px; background: #06b6d4; top: 900px; left: 30%; opacity: 0.3; animation: float1 20s ease-in-out infinite; }
        .grid { position: absolute; inset: 0; background-image: linear-gradient(rgba(148,163,184,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.06) 1px, transparent 1px); background-size: 46px 46px; mask-image: radial-gradient(ellipse 80% 60% at 50% 0%, #000 40%, transparent 100%); }
        @keyframes float1 { 0%,100% { transform: translate(0,0); } 50% { transform: translate(40px,30px); } }
        @keyframes float2 { 0%,100% { transform: translate(0,0); } 50% { transform: translate(-40px,40px); } }

        .glass { background: rgba(255,255,255,0.035); border: 1px solid rgba(255,255,255,0.08); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); }

        /* reveal */
        [data-reveal] { opacity: 1; }
        @media (prefers-reduced-motion: no-preference) {
          [data-reveal] { opacity: 0; transform: translateY(16px); transition: opacity 0.6s ease, transform 0.6s ease; }
          [data-reveal].in { opacity: 1; transform: none; }
        }

        /* Nav */
        .nav { position: sticky; top: 0; z-index: 20; backdrop-filter: blur(10px); background: rgba(7,11,19,0.6); border-bottom: 1px solid rgba(255,255,255,0.06); }
        .nav-in { max-width: 1140px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; padding: 14px 24px; }
        .brand { display: flex; align-items: center; gap: 10px; }
        .brand-mark { width: 34px; height: 34px; border-radius: 9px; background: linear-gradient(135deg,#0ea5e9,#0284c7); display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 16px rgba(14,165,233,0.4); }
        .brand-mark.small { width: 26px; height: 26px; border-radius: 7px; }
        .brand-name { font-weight: 800; font-size: 18px; letter-spacing: -0.02em; color: #f8fafc; }
        .nav-links { display: flex; align-items: center; gap: 22px; font-size: 14px; color: #94a3b8; }
        .nav-links a:hover { color: #f1f5f9; }
        .nav-ghost { color: #cbd5e1 !important; }
        .nav-cta { background: linear-gradient(135deg,#0ea5e9,#0284c7); color: #fff !important; padding: 8px 16px; border-radius: 9px; font-weight: 600; box-shadow: 0 4px 16px rgba(14,165,233,0.35); }
        .nav-cta:hover { opacity: 0.92; }
        @media (max-width: 680px) { .nav-links a:not(.nav-cta):not(.nav-ghost) { display: none; } }

        /* Hero */
        .hero { position: relative; z-index: 1; max-width: 820px; margin: 0 auto; text-align: center; padding: 72px 24px 20px; }
        .eyebrow { display: inline-flex; align-items: center; gap: 8px; font-size: 12.5px; font-weight: 600; letter-spacing: 0.03em; color: #7dd3fc; background: rgba(14,165,233,0.1); border: 1px solid rgba(14,165,233,0.25); padding: 6px 14px; border-radius: 30px; margin-bottom: 24px; }
        .live-dot { width: 7px; height: 7px; border-radius: 50%; background: #34d399; box-shadow: 0 0 0 0 rgba(52,211,153,0.6); animation: pulse 2s infinite; }
        @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(52,211,153,0.5);} 70% { box-shadow: 0 0 0 7px rgba(52,211,153,0);} 100% { box-shadow: 0 0 0 0 rgba(52,211,153,0);} }
        .hero-title { font-size: clamp(2.2rem, 6vw, 3.6rem); font-weight: 850; line-height: 1.08; letter-spacing: -0.035em; color: #f8fafc; margin: 0 0 20px; }
        .hero-sub { font-size: clamp(1rem,2.2vw,1.15rem); line-height: 1.6; color: #94a3b8; max-width: 660px; margin: 0 auto 32px; }
        .hero-sub strong { color: #e2e8f0; }
        .hero-cta { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; margin-bottom: 26px; }
        .hero-trust { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; font-size: 13px; color: #64748b; }
        .hero-trust .sep { color: #334155; }

        .btn-primary { display: inline-block; background: linear-gradient(135deg,#0ea5e9,#0284c7); color: #fff; font-weight: 700; font-size: 15px; padding: 13px 26px; border-radius: 11px; border: none; cursor: pointer; box-shadow: 0 8px 26px rgba(14,165,233,0.4); transition: transform 0.12s, box-shadow 0.15s; }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(14,165,233,0.5); }
        .btn-lg { font-size: 16px; padding: 15px 34px; }
        .btn-secondary { display: inline-block; background: rgba(255,255,255,0.05); color: #e2e8f0; font-weight: 600; font-size: 15px; padding: 13px 24px; border-radius: 11px; border: 1px solid rgba(255,255,255,0.12); cursor: pointer; transition: background 0.15s; }
        .btn-secondary:hover { background: rgba(255,255,255,0.09); }

        /* Demo */
        .demo { position: relative; z-index: 1; max-width: 720px; margin: 24px auto 0; padding: 0 24px; }
        .demo-card { border-radius: 20px; padding: 26px; box-shadow: 0 30px 80px rgba(0,0,0,0.5); }
        .demo-title { font-size: 1.15rem; font-weight: 700; color: #f1f5f9; margin: 0 0 6px; }
        .demo-desc { font-size: 0.875rem; color: #94a3b8; margin: 0 0 18px; line-height: 1.5; }
        .demo-desc strong { color: #f59e0b; }
        .demo-form { display: flex; gap: 10px; }
        .demo-inputwrap { flex: 1; position: relative; display: flex; align-items: center; }
        .demo-globe { position: absolute; left: 13px; font-size: 15px; opacity: 0.6; }
        .demo-input { width: 100%; background: rgba(0,0,0,0.35); border: 1px solid rgba(255,255,255,0.12); border-radius: 11px; padding: 13px 15px 13px 38px; font-size: 15px; color: #f1f5f9; outline: none; transition: border-color 0.15s, box-shadow 0.15s; box-sizing: border-box; }
        .demo-input::placeholder { color: #475569; }
        .demo-input:focus { border-color: #0ea5e9; box-shadow: 0 0 0 3px rgba(14,165,233,0.18); }
        .demo-btn { white-space: nowrap; }
        .demo-error { font-size: 13.5px; color: #fca5a5; background: rgba(248,113,113,0.1); border: 1px solid rgba(248,113,113,0.25); border-radius: 10px; padding: 10px 14px; margin: 14px 0 0; }
        .demo-loading { display: flex; align-items: center; gap: 10px; color: #94a3b8; font-size: 14px; margin-top: 16px; }
        .spinner { width: 17px; height: 17px; border: 2.5px solid rgba(255,255,255,0.15); border-top-color: #0ea5e9; border-radius: 50%; animation: spin 0.7s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Sources marquee */
        .sources { position: relative; z-index: 1; max-width: 1000px; margin: 70px auto 0; padding: 0 24px; text-align: center; }
        .sources-label { font-size: 13px; color: #64748b; letter-spacing: 0.04em; text-transform: uppercase; margin: 0 0 22px; }
        .marquee { position: relative; overflow: hidden; mask-image: linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent); }
        .marquee-track { display: flex; gap: 14px; width: max-content; animation: marquee 32s linear infinite; }
        .marquee:hover .marquee-track { animation-play-state: paused; }
        @keyframes marquee { to { transform: translateX(-50%); } }
        .logo-chip { display: flex; align-items: center; justify-content: center; width: 62px; height: 62px; border-radius: 14px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07); flex-shrink: 0; }

        /* Stats */
        .stats { position: relative; z-index: 1; max-width: 960px; margin: 72px auto 0; padding: 0 24px; display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 18px; }
        .stat { text-align: center; padding: 22px 12px; border-radius: 16px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); }
        .stat-n { font-size: 2.4rem; font-weight: 850; line-height: 1; letter-spacing: -0.03em; }
        .stat-l { font-size: 0.8125rem; color: #94a3b8; margin-top: 8px; }

        /* Sections */
        .section { position: relative; z-index: 1; max-width: 1080px; margin: 96px auto 0; padding: 0 24px; }
        .section-title { font-size: clamp(1.5rem, 3.4vw, 2.1rem); font-weight: 800; letter-spacing: -0.025em; color: #f8fafc; text-align: center; margin: 0 0 44px; }
        .section-title.left { text-align: left; margin-bottom: 18px; }
        .steps { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 18px; }
        .step { border-radius: 16px; padding: 28px 24px; }
        .step-n { display: inline-flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: 11px; color: #fff; font-weight: 800; font-size: 17px; margin-bottom: 16px; box-shadow: 0 6px 18px rgba(139,92,246,0.35); }
        .step-t { font-size: 1.1rem; font-weight: 700; color: #f1f5f9; margin: 0 0 8px; }
        .step-d { font-size: 0.9375rem; line-height: 1.55; color: #94a3b8; margin: 0; }

        .feat-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(290px, 1fr)); gap: 16px; }
        .feat { border-radius: 16px; padding: 24px; transition: transform 0.15s, border-color 0.15s; }
        .feat:hover { transform: translateY(-3px); border-color: rgba(14,165,233,0.35); }
        .feat-icon { font-size: 26px; display: block; margin-bottom: 12px; }
        .feat-t { font-size: 1.02rem; font-weight: 700; color: #f1f5f9; margin: 0 0 7px; }
        .feat-d { font-size: 0.9rem; line-height: 1.55; color: #94a3b8; margin: 0; }

        /* Preview */
        .preview { position: relative; z-index: 1; max-width: 1080px; margin: 96px auto 0; padding: 0 24px; display: grid; grid-template-columns: 1fr 1.1fr; gap: 40px; align-items: center; }
        @media (max-width: 860px) { .preview { grid-template-columns: 1fr; } }
        .preview-p { font-size: 1rem; line-height: 1.6; color: #94a3b8; margin: 0 0 24px; }
        .preview-window { border-radius: 16px; overflow: hidden; box-shadow: 0 30px 80px rgba(0,0,0,0.5); }
        .pw-bar { display: flex; gap: 7px; padding: 13px 16px; border-bottom: 1px solid rgba(255,255,255,0.07); background: rgba(255,255,255,0.02); }
        .pw-bar span { width: 11px; height: 11px; border-radius: 50%; background: rgba(255,255,255,0.15); }
        .pw-body { padding: 16px; display: flex; flex-direction: column; gap: 10px; }
        .pw-row { display: flex; align-items: center; gap: 12px; padding: 13px; border-radius: 12px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); }
        .pw-avatar { width: 36px; height: 36px; border-radius: 10px; color: #fff; font-weight: 700; font-size: 13px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .pw-line { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
        .pw-line b { font-size: 13px; color: #f1f5f9; font-weight: 600; }
        .pw-line i { font-size: 12px; color: #94a3b8; font-style: normal; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .pw-badge { font-size: 11px; font-weight: 700; color: #34d399; background: rgba(52,211,153,0.12); border: 1px solid rgba(52,211,153,0.3); padding: 3px 9px; border-radius: 20px; white-space: nowrap; flex-shrink: 0; }
        .pw-badge-live { color: #38bdf8; background: rgba(56,189,248,0.12); border-color: rgba(56,189,248,0.3); }

        /* CTA */
        .cta { position: relative; z-index: 1; max-width: 820px; margin: 100px auto 0; padding: 56px 24px; border-radius: 22px; text-align: center; box-shadow: 0 30px 80px rgba(0,0,0,0.4); }
        .cta-title { font-size: clamp(1.6rem,4vw,2.3rem); font-weight: 850; letter-spacing: -0.03em; color: #f8fafc; margin: 0 0 12px; }
        .cta-sub { font-size: 1.05rem; color: #94a3b8; margin: 0 0 28px; }

        /* Footer */
        .footer { position: relative; z-index: 1; max-width: 1080px; margin: 80px auto 0; padding: 32px 24px 48px; display: flex; align-items: center; gap: 16px; flex-wrap: wrap; border-top: 1px solid rgba(255,255,255,0.06); }
        .foot-muted { color: #64748b; font-size: 13px; flex: 1; }
        .foot-link { color: #94a3b8; font-size: 13px; }
        .foot-link:hover { color: #e2e8f0; }
      `}</style>
    </div>
  );
}

/* ── Scan report ──────────────────────────────────────────── */
function ScanReport({ result, isSample }: { result: ScanResult; isSample: boolean }) {
  const { analysis, score, gaps, faviconUrl, url } = result;
  const tone  = score >= 70 ? '#34d399' : score >= 40 ? '#fbbf24' : '#f87171';
  const label = score >= 70 ? 'Strong lead capture' : score >= 40 ? 'Room to grow' : 'Losing leads';
  let host = url; try { host = new URL(url).hostname.replace(/^www\./, ''); } catch { /* keep */ }

  const signals: Array<{ k: string; ok: boolean }> = [
    { k: 'Inventory search', ok: analysis.hasInventorySearch },
    { k: 'Lead / contact form', ok: analysis.hasContactForm },
    { k: 'Live chat', ok: analysis.hasChatWidget },
    { k: 'Financing page', ok: analysis.hasFinancingPage },
    { k: 'Phone listed', ok: Boolean(analysis.phone) },
    { k: 'Used inventory', ok: analysis.sellsUsedCars },
  ];

  return (
    <div className="rep">
      {isSample && <div className="rep-sample">Example analysis — try your own site above</div>}
      <div className="rep-head">
        <div className="rep-id">
          {faviconUrl && <img className="rep-fav" src={faviconUrl} alt="" width={30} height={30} />}
          <div>
            <div className="rep-name">{analysis.dealershipName ?? host}</div>
            <div className="rep-meta">
              {[analysis.city, analysis.state].filter(Boolean).join(', ') || host}
              {analysis.brands.length > 0 && <> · {analysis.brands.slice(0, 4).join(', ')}</>}
            </div>
          </div>
        </div>
        <div className="rep-score" style={{ color: tone }}>{score}<span>/100</span></div>
      </div>

      <div className="rep-bar"><span style={{ width: `${score}%`, background: tone }} /></div>
      <div className="rep-badge" style={{ color: tone, borderColor: tone }}>{label}</div>

      <div className="rep-sigs">
        {signals.map(s => (
          <div key={s.k} className={`sg ${s.ok ? 'on' : 'off'}`}>
            <span className="sg-i">{s.ok ? '✓' : '×'}</span> {s.k}
          </div>
        ))}
      </div>

      {gaps.length > 0 && (
        <div className="rep-gaps">
          <div className="rep-gaps-t">What ShiftAI closes for you</div>
          <ul>{gaps.map((g, i) => <li key={i}>{g}</li>)}</ul>
        </div>
      )}

      <style jsx>{`
        .rep { margin-top: 20px; padding: 20px; border-radius: 15px; background: rgba(0,0,0,0.25); border: 1px solid rgba(255,255,255,0.08); animation: rise 0.3s ease; }
        @keyframes rise { from { opacity: 0; transform: translateY(8px);} to { opacity: 1; transform: none; } }
        .rep-sample { font-size: 11px; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; color: #7dd3fc; margin-bottom: 14px; }
        .rep-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 14px; }
        .rep-id { display: flex; gap: 12px; align-items: center; min-width: 0; }
        .rep-fav { border-radius: 7px; flex-shrink: 0; background: #fff; }
        .rep-name { font-size: 1.05rem; font-weight: 700; color: #f1f5f9; }
        .rep-meta { font-size: 0.8125rem; color: #64748b; margin-top: 2px; }
        .rep-score { font-size: 2.1rem; font-weight: 850; line-height: 1; flex-shrink: 0; }
        .rep-score span { font-size: 0.8rem; color: #64748b; font-weight: 600; }
        .rep-bar { height: 7px; background: rgba(255,255,255,0.08); border-radius: 20px; margin: 16px 0 10px; overflow: hidden; }
        .rep-bar span { display: block; height: 100%; border-radius: 20px; transition: width 0.6s ease; }
        .rep-badge { display: inline-block; font-size: 12px; font-weight: 700; padding: 3px 11px; border: 1px solid; border-radius: 20px; margin-bottom: 18px; }
        .rep-sigs { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 8px; margin-bottom: 16px; }
        .sg { font-size: 13px; display: flex; align-items: center; gap: 8px; padding: 9px 12px; border-radius: 9px; }
        .sg-i { font-weight: 800; }
        .sg.on { background: rgba(52,211,153,0.08); color: #cbd5e1; }
        .sg.on .sg-i { color: #34d399; }
        .sg.off { background: rgba(248,113,113,0.07); color: #94a3b8; }
        .sg.off .sg-i { color: #f87171; }
        .rep-gaps { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 12px; padding: 15px 17px; }
        .rep-gaps-t { font-size: 12.5px; font-weight: 700; color: #cbd5e1; margin-bottom: 9px; }
        .rep-gaps ul { margin: 0; padding-left: 18px; }
        .rep-gaps li { font-size: 13px; line-height: 1.6; color: #94a3b8; margin-bottom: 6px; }
      `}</style>
    </div>
  );
}

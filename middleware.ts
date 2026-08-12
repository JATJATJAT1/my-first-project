import { NextRequest, NextResponse } from 'next/server';

// ── Maintenance mode ───────────────────────────────────────────────────────────
// While true, EVERY request (pages + API) gets a 503 maintenance page.
// Flip to false and redeploy to bring the site back.
const MAINTENANCE_MODE = true;

const MAINTENANCE_HTML = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>ShiftAI — Be right back</title>
<style>
  body { margin:0; min-height:100vh; display:flex; align-items:center; justify-content:center;
         background:#070b13; color:#e2e8f0; font-family:Inter,system-ui,sans-serif; text-align:center; }
  .box { padding:40px 24px; }
  .mark { width:56px; height:56px; border-radius:14px; margin:0 auto 20px;
          background:linear-gradient(135deg,#0ea5e9,#0284c7); display:flex; align-items:center; justify-content:center;
          box-shadow:0 8px 30px rgba(14,165,233,.4); }
  h1 { font-size:1.6rem; font-weight:800; letter-spacing:-.02em; color:#f8fafc; margin:0 0 10px; }
  p  { color:#94a3b8; font-size:1rem; line-height:1.6; margin:0; }
</style>
</head>
<body>
  <div class="box">
    <div class="mark">
      <svg width="28" height="28" viewBox="0 0 40 40" fill="none">
        <path d="M10 28 L20 12 L30 28" stroke="#fff" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="20" cy="12" r="2.6" fill="#fff"/>
      </svg>
    </div>
    <h1>We&rsquo;ll be right back.</h1>
    <p>ShiftAI is temporarily offline for maintenance.<br>Thanks for your patience.</p>
  </div>
</body>
</html>`;

// ── CORS ───────────────────────────────────────────────────────────────────────
const ALLOWED_ORIGINS = new Set([
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://shiftai.space',
  'http://localhost:3000',
]);

// ── In-process rate limiter (single-instance / dev) ────────────────────────────
// For multi-instance / Vercel production replace with Upstash Redis:
//   import { Ratelimit } from '@upstash/ratelimit'
//   import { Redis }     from '@upstash/redis'
const requestCounts = new Map<string, { count: number; reset: number }>();

function isRateLimited(ip: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = requestCounts.get(ip);

  if (!entry || now > entry.reset) {
    requestCounts.set(ip, { count: 1, reset: now + windowMs });
    return false;
  }
  entry.count++;
  return entry.count > limit;
}

// ── Route-specific limits ──────────────────────────────────────────────────────
const RATE_RULES: Array<{ pattern: RegExp; limit: number; windowMs: number }> = [
  { pattern: /^\/api\/auth\/login/,          limit: 10,  windowMs: 60_000  }, // 10/min
  { pattern: /^\/api\/auth\/reset-password/, limit: 5,   windowMs: 60_000  }, // 5/min
  { pattern: /^\/api\/admin\/seed/,          limit: 2,   windowMs: 60_000  }, // 2/min
  { pattern: /^\/api\//,                     limit: 120, windowMs: 60_000  }, // 120/min general
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const origin = req.headers.get('origin') ?? '';

  // ── Maintenance gate: everything is down ─────────────────────────────────────
  if (MAINTENANCE_MODE) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Service temporarily unavailable for maintenance.' },
        { status: 503, headers: { 'Retry-After': '3600' } },
      );
    }
    return new NextResponse(MAINTENANCE_HTML, {
      status: 503,
      headers: { 'Content-Type': 'text/html; charset=utf-8', 'Retry-After': '3600' },
    });
  }

  // ── CORS pre-flight ──────────────────────────────────────────────────────────
  if (req.method === 'OPTIONS') {
    const res = new NextResponse(null, { status: 204 });
    if (ALLOWED_ORIGINS.has(origin)) {
      res.headers.set('Access-Control-Allow-Origin',  origin);
      res.headers.set('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
      res.headers.set('Access-Control-Allow-Headers', 'Content-Type,Authorization');
      res.headers.set('Access-Control-Max-Age',       '86400');
      res.headers.set('Vary', 'Origin');
    }
    return res;
  }

  // ── CORS actual request ──────────────────────────────────────────────────────
  const res = NextResponse.next();
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    res.headers.set('Access-Control-Allow-Origin', origin);
    res.headers.set('Vary', 'Origin');
  }

  // ── Rate limiting (API routes only) ─────────────────────────────────────────
  if (pathname.startsWith('/api/')) {
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
      req.headers.get('x-real-ip') ??
      '127.0.0.1';

    const rule = RATE_RULES.find(r => r.pattern.test(pathname));
    if (rule && isRateLimited(ip, rule.limit, rule.windowMs)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
          status:  429,
          headers: {
            'Retry-After': String(Math.ceil(rule.windowMs / 1000)),
            'Content-Type': 'application/json',
          },
        },
      );
    }
  }

  return res;
}

export const config = {
  matcher: ['/api/:path*', '/((?!_next/static|_next/image|favicon.ico).*)'],
};

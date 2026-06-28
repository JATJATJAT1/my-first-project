import { NextRequest, NextResponse } from 'next/server';

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

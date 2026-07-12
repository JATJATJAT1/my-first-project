/** @type {import('next').NextConfig} */

// Resolve the Supabase host for the CSP. Never let a missing or malformed
// NEXT_PUBLIC_SUPABASE_URL (e.g. a leftover placeholder) crash the build —
// fall back to a wildcard host instead.
function resolveSupabaseHost() {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!raw) return '*.supabase.co';
  try {
    return new URL(raw).host;
  } catch {
    console.warn(`Invalid NEXT_PUBLIC_SUPABASE_URL ("${raw}"); using wildcard host in CSP.`);
    return '*.supabase.co';
  }
}

const SUPABASE_HOST = resolveSupabaseHost();

const securityHeaders = [
  // Prevent browsers from downgrading to HTTP — 2-year max age
  {
    key:   'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  // Block clickjacking
  { key: 'X-Frame-Options', value: 'DENY' },
  // Stop MIME-sniffing
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Minimal referrer info
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Disable unused browser features
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  // Content Security Policy — tightened for ShiftAI
  {
    key:   'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",   // unsafe-inline needed for Next.js inline scripts
      "style-src 'self' 'unsafe-inline'",    // needed for styled-jsx
      `connect-src 'self' https://${SUPABASE_HOST} wss://${SUPABASE_HOST}`,
      "img-src 'self' data: blob: https:",
      "font-src 'self'",
      "frame-ancestors 'none'",
      "form-action 'self'",
      "base-uri 'self'",
    ].join('; '),
  },
];

const nextConfig = {
  async headers() {
    return [
      {
        // Apply security headers to every route
        source:  '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};

module.exports = nextConfig;

/** @type {import('next').NextConfig} */

const SUPABASE_HOST = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).host
  : '*.supabase.co';

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
      "img-src 'self' data: blob:",
      "font-src 'self'",
      "frame-ancestors 'none'",
      "form-action 'self'",
      "base-uri 'self'",
    ].join('; '),
  },
];

const nextConfig = {
  // Restrict API request body size — prevents payload-flooding attacks
  api: {
    bodyParser: {
      sizeLimit: '16kb',
    },
  },

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

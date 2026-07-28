/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Prevent clickjacking
          { key: 'X-Frame-Options',           value: 'DENY' },
          // Prevent MIME-type sniffing
          { key: 'X-Content-Type-Options',    value: 'nosniff' },
          // Minimal referrer on cross-origin requests
          { key: 'Referrer-Policy',           value: 'strict-origin-when-cross-origin' },
          // Disable sensitive browser features
          { key: 'Permissions-Policy',        value: 'camera=(), microphone=(), geolocation=(), payment=()' },
          // Force HTTPS for 2 years (including subdomains)
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          // Block DNS prefetch
          { key: 'X-DNS-Prefetch-Control',    value: 'off' },
          // [M2] CSP in Report-Only mode — monitor violations for 2–4 weeks,
          //      then switch key to Content-Security-Policy to enforce.
          //      Add a /api/csp-report endpoint to log violations if needed.
          {
            key: 'Content-Security-Policy-Report-Only',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https://cdn.coachbasharalasali.com",
              "media-src 'self' https://cdn.coachbasharalasali.com https://pub-0e92b408a981462386b3b62d0c02177d.r2.dev https://*.r2.cloudflarestorage.com",
              "connect-src 'self' https://*.neon.tech https://*.vercel-storage.com",
              "font-src 'self' data:",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; '),
          },
        ],
      },
    ]
  },
}
module.exports = nextConfig

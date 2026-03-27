import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      // YouTube channel avatars
      { protocol: "https", hostname: "yt3.ggpht.com" },
      // YouTube video thumbnails (primary CDN)
      { protocol: "https", hostname: "i.ytimg.com" },
      // YouTube video thumbnails (alternate CDN)
      { protocol: "https", hostname: "i9.ytimg.com" },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Prevent clickjacking — disallow embedding in iframes
          { key: "X-Frame-Options", value: "DENY" },
          // Prevent MIME type sniffing
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Control referrer information sent to third parties
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Disable browser features not used by this app
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
          },
          // Force HTTPS (only active on HTTPS deployments like Vercel)
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          // Content Security Policy
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              // unsafe-inline required for PDF print window's inline script
              "script-src 'self' 'unsafe-inline'",
              // unsafe-inline required for Tailwind runtime + PDF inline styles
              "style-src 'self' 'unsafe-inline'",
              // YouTube CDN image domains (same as remotePatterns above) + data: for base64
              "img-src 'self' https://yt3.ggpht.com https://i.ytimg.com https://i9.ytimg.com data:",
              "font-src 'self'",
              "connect-src 'self'",
              // CSP-era replacement for X-Frame-Options
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;

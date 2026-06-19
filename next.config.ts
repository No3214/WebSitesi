import { withPayload } from "@payloadcms/next/withPayload";
import type { NextConfig } from "next";

// CSP — gradual tightening: default-src/style-src deliberately omitted.
// script-src: 'unsafe-inline' is required for the GTM/Meta Pixel inline
// bootstrap snippets; external script hosts are GTM (gtm.js), Meta
// (fbevents.js) and Cloudflare Turnstile (api.js).
// connect-src: PostHog ingest (eu.i.posthog.com), GA4 collect beacons
// (*.google-analytics.com incl. regional endpoints), GTM/gtag config fetches,
// Google Ads conversion beacons and Meta Pixel beacons.
// img-src: data:/blob:/https: keeps tracking pixels and external images working.
// frame-src stays intentionally narrow: OpenStreetMap for contact maps, GTM
// noscript iframe, and Cloudflare Turnstile. HMS booking opens in a new tab, not
// an iframe, so broad https/blob frame access is not needed.
const csp = [
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://connect.facebook.net https://challenges.cloudflare.com https://*.posthog.com https://app.hms.gen.tr",
  "connect-src 'self' https://*.posthog.com https://www.google-analytics.com https://*.google-analytics.com https://www.googletagmanager.com https://www.googleadservices.com https://googleads.g.doubleclick.net https://stats.g.doubleclick.net https://connect.facebook.net https://www.facebook.com https://challenges.cloudflare.com https://app.hms.gen.tr https://kozbeyli-konagi.hmshotel.net",
  "img-src 'self' data: blob: https:",
  "media-src 'self' blob:",
  "frame-src 'self' https://www.openstreetmap.org https://www.googletagmanager.com https://challenges.cloudflare.com",
  "frame-ancestors 'self'",
].join("; ");

const securityHeaders = [
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "Content-Security-Policy", value: csp },
];

const nextConfig: NextConfig = {
  outputFileTracingRoot: __dirname,
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [320, 640, 750, 1080, 1280, 1536],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default withPayload(nextConfig);

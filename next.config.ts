import { withPayload } from "@payloadcms/next/withPayload";
import type { NextConfig } from "next";

// CSP intentionally limited to frame controls only.
// script-src/style-src are deliberately omitted so GTM, Meta Pixel and PostHog
// keep working without a domain whitelist. "frame-src https: blob:" allows the
// HMS booking engine iframe (domain not yet known) and the
// www.openstreetmap.org embed without further config changes.
const csp = ["frame-src https: blob:", "frame-ancestors 'self'"].join("; ");

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
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
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

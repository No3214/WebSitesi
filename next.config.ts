import { withPayload } from "@payloadcms/next/withPayload";
import type { NextConfig } from "next";

const csp = [
  "default-src 'self'",
  "img-src 'self' data: https: blob: *.google-analytics.com *.googletagmanager.com *.facebook.com *.facebook.net images.unsplash.com app.hotelrunner.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "script-src 'self' 'unsafe-inline' https://app.hotelrunner.com https://challenges.cloudflare.com *.googletagmanager.com *.google-analytics.com connect.facebook.net",
  "connect-src 'self' https://app.hotelrunner.com https://challenges.cloudflare.com *.google-analytics.com *.analytics.google.com *.googletagmanager.com *.facebook.com *.facebook.net graph.facebook.com",
  "frame-src 'self' https://app.hotelrunner.com https://challenges.cloudflare.com *.facebook.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self' https://app.hotelrunner.com",
  "frame-ancestors 'self'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains; preload",
  },
  { key: "Content-Security-Policy", value: csp },
];

const nextConfig: NextConfig = {
  outputFileTracingRoot: __dirname,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "app.hotelrunner.com" },
      { protocol: "https", hostname: "*.googleusercontent.com" }
    ]
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
        headers: securityHeaders
      }
    ];
  }
};

export default withPayload(nextConfig);

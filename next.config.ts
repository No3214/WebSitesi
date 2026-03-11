import { withPayload } from "@payloadcms/next/withPayload";
import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "X-XSS-Protection", value: "1; mode=block" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains; preload"
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "img-src 'self' data: https: blob: *.google-analytics.com *.googletagmanager.com *.facebook.com *.facebook.net",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://app.hotelrunner.com *.googletagmanager.com *.google-analytics.com connect.facebook.net",
      "connect-src 'self' https://app.hotelrunner.com *.google-analytics.com *.analytics.google.com *.googletagmanager.com *.facebook.com *.facebook.net graph.facebook.com",
      "frame-src 'self' https://app.hotelrunner.com *.facebook.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self' https://app.hotelrunner.com",
      "frame-ancestors 'self'",
      "upgrade-insecure-requests"
    ].join("; ")
  }
];

const nextConfig: NextConfig = {
  outputFileTracingRoot: __dirname,
  images: {
    remotePatterns: []
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
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

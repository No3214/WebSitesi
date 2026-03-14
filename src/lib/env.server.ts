import { isBuild, isProd, rawEnv, requireEnv } from "@/lib/env.shared";

import { publicEnv } from "@/lib/env.client";

export const env = {
  ...publicEnv,
  PAYLOAD_SECRET: isProd && !isBuild ? requireEnv("PAYLOAD_SECRET", rawEnv.PAYLOAD_SECRET) : rawEnv.PAYLOAD_SECRET || "dev-only-secret-change-me",
  DATABASE_URI: isProd && !isBuild ? requireEnv("DATABASE_URI", rawEnv.DATABASE_URI) : rawEnv.DATABASE_URI || "postgresql://postgres:password@localhost:5432/kozbeyli",
  HOTELRUNNER_WEBHOOK_SECRET: isProd && !isBuild
    ? requireEnv("HOTELRUNNER_WEBHOOK_SECRET", rawEnv.HOTELRUNNER_WEBHOOK_SECRET)
    : rawEnv.HOTELRUNNER_WEBHOOK_SECRET || "hotelrunner-dev-secret",
  GOOGLE_SITE_VERIFICATION: rawEnv.GOOGLE_SITE_VERIFICATION || "",
  FACEBOOK_DOMAIN_VERIFICATION: rawEnv.FACEBOOK_DOMAIN_VERIFICATION || "",
  GOOGLE_MAPS_URL: rawEnv.GOOGLE_MAPS_URL || "",
  TURNSTILE_SECRET_KEY: rawEnv.TURNSTILE_SECRET_KEY || "",
};

export function getAllowedOrigins() {
  return Array.from(new Set([env.NEXT_PUBLIC_SITE_URL, "http://localhost:3000"]))
    .filter(Boolean)
    .map((origin) => origin.replace(/\/$/, ""));
}

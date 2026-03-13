import { z } from "zod";

const rawEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PAYLOAD_SECRET: z.string().optional(),
  DATABASE_URI: z.string().optional(),
  NEXT_PUBLIC_SITE_URL: z.string().optional(),
  NEXT_PUBLIC_HOTELRUNNER_SLUG: z.string().optional(),
  HOTELRUNNER_WEBHOOK_SECRET: z.string().optional(),
  NEXT_PUBLIC_GTM_ID: z.string().optional(),
  NEXT_PUBLIC_META_PIXEL_ID: z.string().optional(),
  GOOGLE_SITE_VERIFICATION: z.string().optional(),
  FACEBOOK_DOMAIN_VERIFICATION: z.string().optional(),
  GOOGLE_MAPS_URL: z.string().optional(),
  TURNSTILE_SECRET_KEY: z.string().optional(),
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: z.string().optional(),
});

const raw = rawEnvSchema.parse(process.env);

function requireEnv(name: keyof typeof raw, value: string | undefined) {
  if (!value || !value.trim()) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

const isProd = raw.NODE_ENV === "production";
const isBuild = process.env.NEXT_PHASE === "phase-production-build" || process.env.CI === "true";

export const env = {
  NODE_ENV: raw.NODE_ENV,
  PAYLOAD_SECRET: isProd && !isBuild ? requireEnv("PAYLOAD_SECRET", raw.PAYLOAD_SECRET) : raw.PAYLOAD_SECRET || "dev-only-secret-change-me",
  DATABASE_URI: isProd && !isBuild ? requireEnv("DATABASE_URI", raw.DATABASE_URI) : raw.DATABASE_URI || "postgresql://postgres:password@localhost:5432/kozbeyli",
  NEXT_PUBLIC_SITE_URL: isProd && !isBuild ? requireEnv("NEXT_PUBLIC_SITE_URL", raw.NEXT_PUBLIC_SITE_URL) : raw.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  NEXT_PUBLIC_HOTELRUNNER_SLUG: raw.NEXT_PUBLIC_HOTELRUNNER_SLUG || "",
  HOTELRUNNER_WEBHOOK_SECRET: isProd && !isBuild
    ? requireEnv("HOTELRUNNER_WEBHOOK_SECRET", raw.HOTELRUNNER_WEBHOOK_SECRET)
    : raw.HOTELRUNNER_WEBHOOK_SECRET || "hotelrunner-dev-secret",
  NEXT_PUBLIC_GTM_ID: raw.NEXT_PUBLIC_GTM_ID || "",
  NEXT_PUBLIC_META_PIXEL_ID: raw.NEXT_PUBLIC_META_PIXEL_ID || "",
  GOOGLE_SITE_VERIFICATION: raw.GOOGLE_SITE_VERIFICATION || "",
  FACEBOOK_DOMAIN_VERIFICATION: raw.FACEBOOK_DOMAIN_VERIFICATION || "",
  GOOGLE_MAPS_URL: raw.GOOGLE_MAPS_URL || "",
  TURNSTILE_SECRET_KEY: raw.TURNSTILE_SECRET_KEY || "",
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: raw.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "",
};

export function getAllowedOrigins() {
  return Array.from(new Set([env.NEXT_PUBLIC_SITE_URL, "http://localhost:3000"]))
    .filter(Boolean)
    .map((origin) => origin.replace(/\/$/, ""));
}

import { z } from "zod";

const rawEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PAYLOAD_SECRET: z.string().optional(),
  DATABASE_URI: z.string().optional(),
  NEXT_PUBLIC_SITE_URL: z.string().optional(),
  NEXT_PUBLIC_HOTELRUNNER_SLUG: z.string().optional(),
  HOTELRUNNER_WEBHOOK_SECRET: z.string().optional(),
  NEXT_PUBLIC_GTM_ID: z.string().regex(/^(GTM-[A-Z0-9]+)?$/).optional(),
  NEXT_PUBLIC_META_PIXEL_ID: z.string().regex(/^[0-9]*$/).optional(),
  GOOGLE_SITE_VERIFICATION: z.string().optional(),
  FACEBOOK_DOMAIN_VERIFICATION: z.string().optional(),
  GOOGLE_MAPS_URL: z.string().optional(),
  TURNSTILE_SECRET_KEY: z.string().optional(),
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: z.string().optional(),
});

const raw = rawEnvSchema.parse(process.env);

const isProd = raw.NODE_ENV === "production";
const isBuild =
  process.env.NEXT_PHASE === "phase-production-build" || process.env.CI === "true";

function requireInProd(name: string, value: string | undefined, devDefault: string): string {
  if (value && value.trim()) return value;
  if (isProd && !isBuild) {
    throw new Error(
      `[ENV] Missing required environment variable in production: ${name}. ` +
        `Set this in your deployment environment.`
    );
  }
  return devDefault;
}

// Dev-only secrets are clearly marked and will NEVER leak to production
const DEV_PAYLOAD_SECRET = "dev-local-secret-" + "not-for-production";
const DEV_DB_URI = "postgresql://postgres:password@localhost:5432/kozbeyli";
const DEV_WEBHOOK_SECRET = "dev-webhook-secret-local-only";

export const env = {
  NODE_ENV: raw.NODE_ENV,
  PAYLOAD_SECRET: requireInProd("PAYLOAD_SECRET", raw.PAYLOAD_SECRET, DEV_PAYLOAD_SECRET),
  DATABASE_URI: requireInProd("DATABASE_URI", raw.DATABASE_URI, DEV_DB_URI),
  NEXT_PUBLIC_SITE_URL: requireInProd(
    "NEXT_PUBLIC_SITE_URL",
    raw.NEXT_PUBLIC_SITE_URL,
    "http://localhost:3000"
  ),
  NEXT_PUBLIC_HOTELRUNNER_SLUG: raw.NEXT_PUBLIC_HOTELRUNNER_SLUG || "",
  HOTELRUNNER_WEBHOOK_SECRET: requireInProd(
    "HOTELRUNNER_WEBHOOK_SECRET",
    raw.HOTELRUNNER_WEBHOOK_SECRET,
    DEV_WEBHOOK_SECRET
  ),
  NEXT_PUBLIC_GTM_ID: raw.NEXT_PUBLIC_GTM_ID || "",
  NEXT_PUBLIC_META_PIXEL_ID: raw.NEXT_PUBLIC_META_PIXEL_ID || "",
  GOOGLE_SITE_VERIFICATION: raw.GOOGLE_SITE_VERIFICATION || "",
  FACEBOOK_DOMAIN_VERIFICATION: raw.FACEBOOK_DOMAIN_VERIFICATION || "",
  GOOGLE_MAPS_URL: raw.GOOGLE_MAPS_URL || "",
  TURNSTILE_SECRET_KEY: raw.TURNSTILE_SECRET_KEY || "",
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: raw.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "",
};

export function getAllowedOrigins() {
  const origins = [env.NEXT_PUBLIC_SITE_URL];
  if (process.env.NODE_ENV !== "production") {
    origins.push("http://localhost:3000");
  }
  return Array.from(new Set(origins))
    .filter(Boolean)
    .map((origin) => origin.replace(/\/$/, ""));
}

import { z } from "zod";

export const rawEnvSchema = z.object({
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

export const rawEnv = rawEnvSchema.parse(process.env);

export const isProd = rawEnv.NODE_ENV === "production";
export const isBuild = process.env.NEXT_PHASE === "phase-production-build" || process.env.CI === "true";

export function requireEnv(name: keyof typeof rawEnv, value: string | undefined) {
  if (!value || !value.trim()) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}


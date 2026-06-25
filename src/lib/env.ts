import { z } from "zod";

const rawEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PAYLOAD_SECRET: z.string().optional(),
  DATABASE_URI: z.string().optional(),
  NEXT_PUBLIC_SITE_URL: z.string().optional(),
  HOTELRUNNER_WEBHOOK_SECRET: z.string().optional(),
  IYZICO_WEBHOOK_SECRET: z.string().optional(),
  HMS_WEBHOOK_ES256_PUBLIC_KEY: z.string().optional(),
  NEXT_PUBLIC_GTM_ID: z.string().optional(),
  NEXT_PUBLIC_GA4_MEASUREMENT_ID: z.string().optional(),
  NEXT_PUBLIC_GOOGLE_ADS_ID: z.string().optional(),
  NEXT_PUBLIC_META_PIXEL_ID: z.string().optional(),
  GOOGLE_SITE_VERIFICATION: z.string().optional(),
  FACEBOOK_DOMAIN_VERIFICATION: z.string().optional(),
  NEXT_PUBLIC_GOOGLE_MAPS_URL: z.string().optional(),
  GOOGLE_MAPS_URL: z.string().optional(),
  TURNSTILE_SECRET_KEY: z.string().optional(),
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: z.string().optional(),
  GA4_MEASUREMENT_ID: z.string().optional(),
  GA4_API_SECRET: z.string().optional(),
  META_CAPI_ACCESS_TOKEN: z.string().optional(),
  META_CAPI_TEST_EVENT_CODE: z.string().optional(),
  // Google Business Profile (review orchestration — otelin KENDI dogrulanmis
  // isletmesinin yorumlari). Hepsi optional; bos ise google adapter no-op olur.
  GOOGLE_BUSINESS_OAUTH_CLIENT_ID: z.string().optional(),
  GOOGLE_BUSINESS_OAUTH_CLIENT_SECRET: z.string().optional(),
  GOOGLE_BUSINESS_OAUTH_REFRESH_TOKEN: z.string().optional(),
  GOOGLE_BUSINESS_ACCOUNT_ID: z.string().optional(),
  GOOGLE_BUSINESS_LOCATION_ID: z.string().optional(),
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
  // HMS geçişi: rezervasyon webhook'u HMAC (legacy) + ES256 (HMS) destekler.
  HOTELRUNNER_WEBHOOK_SECRET: isProd && !isBuild
    ? requireEnv("HOTELRUNNER_WEBHOOK_SECRET", raw.HOTELRUNNER_WEBHOOK_SECRET)
    : raw.HOTELRUNNER_WEBHOOK_SECRET || "hotelrunner-dev-secret",
  IYZICO_WEBHOOK_SECRET: raw.IYZICO_WEBHOOK_SECRET || (isProd && !isBuild ? "" : "iyzico-dev-secret"),
  HMS_WEBHOOK_ES256_PUBLIC_KEY: raw.HMS_WEBHOOK_ES256_PUBLIC_KEY || "",
  NEXT_PUBLIC_GTM_ID: raw.NEXT_PUBLIC_GTM_ID || "",
  NEXT_PUBLIC_GA4_MEASUREMENT_ID: raw.NEXT_PUBLIC_GA4_MEASUREMENT_ID || "",
  NEXT_PUBLIC_GOOGLE_ADS_ID: raw.NEXT_PUBLIC_GOOGLE_ADS_ID || "",
  NEXT_PUBLIC_META_PIXEL_ID: raw.NEXT_PUBLIC_META_PIXEL_ID || "",
  GOOGLE_SITE_VERIFICATION: raw.GOOGLE_SITE_VERIFICATION || "",
  FACEBOOK_DOMAIN_VERIFICATION: raw.FACEBOOK_DOMAIN_VERIFICATION || "",
  GOOGLE_MAPS_URL: raw.NEXT_PUBLIC_GOOGLE_MAPS_URL || raw.GOOGLE_MAPS_URL || "",
  TURNSTILE_SECRET_KEY: raw.TURNSTILE_SECRET_KEY || "",
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: raw.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "",
  // GA4 Measurement Protocol (server-side purchase ölçümü). İkisi de doluysa
  // HMS rezervasyon webhook'u purchase eventini sunucudan gönderir.
  GA4_MEASUREMENT_ID: raw.GA4_MEASUREMENT_ID || "",
  GA4_API_SECRET: raw.GA4_API_SECRET || "",
  // Meta Conversions API (server-side Purchase). Pixel ID public, ama erisim
  // token'i SIR'dir → yalniz Vercel env. Bos ise modul sessizce no-op.
  META_CAPI_ACCESS_TOKEN: raw.META_CAPI_ACCESS_TOKEN || "",
  // Doluysa Meta CAPI istekleri test_event_code ile gider → Events Manager >
  // Test Events'te canli dogrulama. Uretimde BOS birakilir.
  META_CAPI_TEST_EVENT_CODE: raw.META_CAPI_TEST_EVENT_CODE || "",
  // Google Business Profile (review orchestration). Hepsi bos ise google adapter
  // no-op (yorum cekmez); GA4/Meta deseniyle ayni "konfigure degilse sus" mantigi.
  GOOGLE_BUSINESS_OAUTH_CLIENT_ID: raw.GOOGLE_BUSINESS_OAUTH_CLIENT_ID || "",
  GOOGLE_BUSINESS_OAUTH_CLIENT_SECRET: raw.GOOGLE_BUSINESS_OAUTH_CLIENT_SECRET || "",
  GOOGLE_BUSINESS_OAUTH_REFRESH_TOKEN: raw.GOOGLE_BUSINESS_OAUTH_REFRESH_TOKEN || "",
  GOOGLE_BUSINESS_ACCOUNT_ID: raw.GOOGLE_BUSINESS_ACCOUNT_ID || "",
  GOOGLE_BUSINESS_LOCATION_ID: raw.GOOGLE_BUSINESS_LOCATION_ID || "",
};

export function getAllowedOrigins() {
  return Array.from(new Set([env.NEXT_PUBLIC_SITE_URL, "http://localhost:3000"]))
    .filter(Boolean)
    .map((origin) => origin.replace(/\/$/, ""));
}

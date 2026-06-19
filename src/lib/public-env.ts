export const publicEnv = {
  NEXT_PUBLIC_HMS_BOOKING_ENGINE_URL:
    process.env.NEXT_PUBLIC_HMS_BOOKING_ENGINE_URL?.trim() || "",
  // HMS "iFrame [TAM]" script yontemi (app.hms.gen.tr/.../kozbeyli-konagi.js).
  // Set edilirse iframe yerine inline widget script'i yuklenir.
  NEXT_PUBLIC_HMS_SCRIPT_URL:
    process.env.NEXT_PUBLIC_HMS_SCRIPT_URL?.trim() || "",
  NEXT_PUBLIC_GTM_ID: process.env.NEXT_PUBLIC_GTM_ID?.trim() || "",
  NEXT_PUBLIC_GA4_MEASUREMENT_ID: process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID?.trim() || "",
  NEXT_PUBLIC_GOOGLE_ADS_ID: process.env.NEXT_PUBLIC_GOOGLE_ADS_ID?.trim() || "",
  NEXT_PUBLIC_META_PIXEL_ID: process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim() || "",
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() || "",
  NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY?.trim() || "",
  NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST?.trim() || "https://eu.i.posthog.com",
};

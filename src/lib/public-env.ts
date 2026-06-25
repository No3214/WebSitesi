export const publicEnv = {
  NEXT_PUBLIC_HMS_BOOKING_ENGINE_URL:
    process.env.NEXT_PUBLIC_HMS_BOOKING_ENGINE_URL?.trim() || "",
  // HMS "iFrame [TAM]" script yontemi (app.hms.gen.tr/.../kozbeyli-konagi.js).
  // Set edilirse iframe yerine inline widget script'i yuklenir.
  NEXT_PUBLIC_HMS_SCRIPT_URL:
    process.env.NEXT_PUBLIC_HMS_SCRIPT_URL?.trim() || "",
  // Public reklam/olcum kimlikleri process.env'den okunur. Uretim degerleri
  // .env.production (repo'da, public ID'ler) veya Vercel env'den gelir; Vercel
  // env oncelikli. Sunucu sirlari (server-side secret'lar) ASLA burada tutulmaz.
  NEXT_PUBLIC_GTM_ID: process.env.NEXT_PUBLIC_GTM_ID?.trim() || "",
  NEXT_PUBLIC_GA4_MEASUREMENT_ID: process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID?.trim() || "",
  NEXT_PUBLIC_GOOGLE_ADS_ID: process.env.NEXT_PUBLIC_GOOGLE_ADS_ID?.trim() || "",
  NEXT_PUBLIC_META_PIXEL_ID: process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim() || "",
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() || "",
  // Review orchestration: Booking.com yorum METNI ancak yazili partner onayi varsa
  // "true" yapilir. Varsayilan "false" → Booking icin yalniz puan rozeti + link.
  NEXT_PUBLIC_BOOKING_PUBLIC_APPROVAL:
    process.env.NEXT_PUBLIC_BOOKING_PUBLIC_APPROVAL?.trim() || "false",
  NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY?.trim() || "",
  NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST?.trim() || "https://eu.i.posthog.com",
};

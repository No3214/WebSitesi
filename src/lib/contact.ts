/**
 * Tek doğru WhatsApp kaynağı.
 *
 * Numara `NEXT_PUBLIC_WHATSAPP_URL` env değişkeninden gelir; tanımlı değilse
 * resmi numaraya (905322342686) düşer. Hiçbir bileşen wa.me URL'sini
 * hardcode etmez — tüm bileşenler `WHATSAPP_BASE` veya `getWhatsAppHref`
 * üzerinden link üretir.
 */
export const WHATSAPP_BASE =
  process.env.NEXT_PUBLIC_WHATSAPP_URL || "https://wa.me/905322342686";

/**
 * Önceden doldurulmuş mesaj içeren WhatsApp linki üretir.
 * Mesaj ham (encode edilmemiş) metin olarak verilir; encoding burada yapılır.
 */
export function getWhatsAppHref(message: string): string {
  return `${WHATSAPP_BASE}?text=${encodeURIComponent(message)}`;
}

/** Tek doğru telefon kaynağı (schema.org ile aynı numara). */
export const PHONE_E164 = "+905322342686";
export const PHONE_DISPLAY = "+90 532 234 26 86";

export function getPhoneHref(): string {
  return `tel:${PHONE_E164}`;
}

/** Tek doğru harita kaynağı. */
export const MAPS_URL =
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_URL ||
  "https://www.google.com/maps/search/?api=1&query=Kozbeyli+Kona%C4%9F%C4%B1+Fo%C3%A7a+%C4%B0zmir";

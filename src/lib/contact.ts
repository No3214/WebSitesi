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

/** Public address display copy; schema.org keeps the official Turkish address. */
export const ADDRESS_TR = "Kozbeyli Köyü Küme Evler No:188, Foça / İzmir";
export const ADDRESS_EN = "Kozbeyli Village, No:188, Foça / Izmir";

/** Tek doğru harita kaynağı. */
export const MAPS_URL =
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_URL ||
  process.env.GOOGLE_MAPS_URL ||
  "https://www.google.com/maps/dir/?api=1&destination=38.713943%2C26.896018";

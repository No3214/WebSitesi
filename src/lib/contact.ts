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

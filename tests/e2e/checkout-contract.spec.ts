import { expect, test } from "@playwright/test";

/**
 * /api/checkout güvenlik kontratları (Audit F1/F13 regresyon ağı).
 * Hepsi DB'ye ulaşmadan kesilen yollar — lokal/CI'da DATABASE_URI gerektirmez.
 * Not: kart alanı kontratı = şemada cardNumber YOK; tahsilat Garanti Sanal POS'ta.
 */

const validBody = {
  bookingId: "KK-TEST-1",
  checkIn: "2026-07-01",
  checkOut: "2026-07-03",
  nights: 2,
  guests: 2,
  roomSlug: "standart-deniz-manzarali-oda",
  roomTitle: "Standart Deniz Manzaralı Oda",
  guestName: "Test Misafir",
  guestEmail: "test@example.com",
  guestPhone: "05551112233",
  scent: "Lavanta",
  pillow: "Orta",
  sound: "Doğa",
  light: "Loş",
  promoCode: "",
  totalPrice: 9000, // 2 gece x 4500 — sunucu hesabıyla eşleşir
};

test.describe("Checkout API kontratları", () => {
  test("Origin başlıksız POST fail-closed 403 döner (CSRF)", async ({ request, baseURL }) => {
    const res = await request.post(`${baseURL}/api/checkout`, {
      data: validBody,
      // Origin header'ı bilinçli olarak YOK
    });
    expect(res.status()).toBe(403);
  });

  test("Geçerli origin + bozuk gövde 400 döner (zod)", async ({ request, baseURL }) => {
    const res = await request.post(`${baseURL}/api/checkout`, {
      headers: { origin: baseURL! },
      data: { bookingId: "KK-X" }, // zorunlu alanlar eksik
    });
    expect(res.status()).toBe(400);
    const json = await res.json();
    expect(json.ok).toBe(false);
  });

  test("Fiyat oynaması 400 ile reddedilir (sunucu yeniden hesaplar)", async ({ request, baseURL }) => {
    const res = await request.post(`${baseURL}/api/checkout`, {
      headers: { origin: baseURL! },
      data: { ...validBody, totalPrice: 1 }, // client tamper simülasyonu
    });
    expect(res.status()).toBe(400);
    const json = await res.json();
    expect(String(json.message)).toContain("doğrulanamadı");
  });
});

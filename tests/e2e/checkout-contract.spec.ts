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
  consent: true,
};

function sameOriginHeaders(baseURL: string, ip: string) {
  return {
    origin: baseURL,
    "x-real-ip": ip,
  };
}

test.describe("Checkout API kontratları", () => {
  test("Origin başlıksız POST fail-closed 403 döner (CSRF)", async ({ request, baseURL }) => {
    const res = await request.post(`${baseURL}/api/checkout`, {
      headers: { "x-real-ip": "10.20.0.1" },
      data: validBody,
      // Origin header'ı bilinçli olarak YOK
    });
    expect(res.status()).toBe(403);
  });

  test("Geçerli origin + bozuk gövde 400 döner (zod)", async ({ request, baseURL }) => {
    const res = await request.post(`${baseURL}/api/checkout`, {
      headers: sameOriginHeaders(baseURL!, "10.20.0.2"),
      data: { bookingId: "KK-X" }, // zorunlu alanlar eksik
    });
    expect(res.status()).toBe(400);
    const json = await res.json();
    expect(json.ok).toBe(false);
  });

  test("Fiyat oynaması 400 ile reddedilir (sunucu yeniden hesaplar)", async ({ request, baseURL }) => {
    const res = await request.post(`${baseURL}/api/checkout`, {
      headers: sameOriginHeaders(baseURL!, "10.20.0.3"),
      data: { ...validBody, totalPrice: 1 }, // client tamper simülasyonu
    });
    expect(res.status()).toBe(400);
    const json = await res.json();
    expect(String(json.message)).toContain("doğrulanamadı");
  });

  test("KVKK onayı yoksa 400 ile reddedilir", async ({ request, baseURL }) => {
    const res = await request.post(`${baseURL}/api/checkout`, {
      headers: sameOriginHeaders(baseURL!, "10.20.0.4"),
      data: { ...validBody, consent: false },
    });
    expect(res.status()).toBe(400);
    const json = await res.json();
    expect(String(json.message)).toContain("KVKK");
  });

  test("KVKK onayı eksikse 400 ile reddedilir", async ({ request, baseURL }) => {
    const { consent: _consent, ...bodyWithoutConsent } = validBody;
    void _consent;

    const res = await request.post(`${baseURL}/api/checkout`, {
      headers: sameOriginHeaders(baseURL!, "10.20.0.5"),
      data: bodyWithoutConsent,
    });
    expect(res.status()).toBe(400);
  });

  test("Bilinmeyen oda slug'ı 400 ile reddedilir", async ({ request, baseURL }) => {
    const res = await request.post(`${baseURL}/api/checkout`, {
      headers: sameOriginHeaders(baseURL!, "10.20.0.6"),
      data: {
        ...validBody,
        roomSlug: "superior-fake-upgrade",
        totalPrice: 17000,
      },
    });

    expect(res.status()).toBe(400);
    const json = await res.json();
    expect(String(json.message)).toContain("Oda");
  });

  test("Client gece sayısını tarih aralığıyla oynatırsa 400 ile reddedilir", async ({ request, baseURL }) => {
    const res = await request.post(`${baseURL}/api/checkout`, {
      headers: sameOriginHeaders(baseURL!, "10.20.0.7"),
      data: {
        ...validBody,
        nights: 1,
        totalPrice: 4500,
      },
    });

    expect(res.status()).toBe(400);
    const json = await res.json();
    expect(String(json.message)).toContain("Gece");
  });

  test("Geçersiz tarih aralığı 400 ile reddedilir", async ({ request, baseURL }) => {
    const res = await request.post(`${baseURL}/api/checkout`, {
      headers: sameOriginHeaders(baseURL!, "10.20.0.8"),
      data: {
        ...validBody,
        checkOut: validBody.checkIn,
        nights: 1,
        totalPrice: 4500,
      },
    });

    expect(res.status()).toBe(400);
    const json = await res.json();
    expect(String(json.message)).toContain("tarihi");
  });
});

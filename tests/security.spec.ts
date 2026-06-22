import crypto from "node:crypto";
import { expect, test, type APIRequestContext, type APIResponse } from "@playwright/test";

async function postWithTransientResetRetry(
  request: APIRequestContext,
  url: string,
  options: Parameters<APIRequestContext["post"]>[1],
): Promise<APIResponse> {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      return await request.post(url, options);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (!message.includes("ECONNRESET") || attempt === 2) throw error;
      await new Promise((resolve) => setTimeout(resolve, 250 * (attempt + 1)));
    }
  }

  throw new Error("Unreachable transient retry state");
}

test.describe("Security Audit Test", () => {
  const webhookSecret = process.env.HOTELRUNNER_WEBHOOK_SECRET || "hotelrunner-dev-secret";
  const iyzicoWebhookSecret = process.env.IYZICO_WEBHOOK_SECRET || "iyzico-dev-secret";

  test("should have strict security headers", async ({ request, baseURL }) => {
    const url = baseURL || "http://localhost:3006";
    const response = await request.get(url);
    const headers = response.headers();

    expect(headers["x-frame-options"]).toBe("SAMEORIGIN");
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["strict-transport-security"]).toContain("max-age=63072000");
    expect(headers["content-security-policy"]).toContain("script-src 'self'");
    expect(headers["content-security-policy"]).toContain("object-src 'none'");
    expect(headers["content-security-policy"]).toContain("base-uri 'self'");
    expect(headers["content-security-policy"]).toContain("form-action 'self'");
    expect(headers["content-security-policy"]).toContain(
      "frame-src 'self' https://www.openstreetmap.org https://www.googletagmanager.com https://challenges.cloudflare.com",
    );
    expect(headers["content-security-policy"]).not.toContain("frame-src https:");
    expect(headers["content-security-policy"]).not.toContain("unsafe-eval");
    expect(headers["x-xss-protection"]).toBeUndefined();
  });

  test("lead API should reject cross-origin posts", async ({ request, baseURL }) => {
    const url = baseURL || "http://localhost:3006";
    const response = await request.post(`${url}/api/lead`, {
      headers: {
        origin: "https://evil.example",
        host: new URL(url).host,
        "content-type": "application/json",
      },
      data: {
        name: "Test Kullanıcı",
        phone: "05551234567",
        email: "test@example.com",
        type: "dugun",
        message: "Bu istek reddedilmelidir çünkü origin eşleşmiyor.",
        consent: true,
      },
    });

    expect(response.status()).toBe(403);
  });

  test("lead API should require consent", async ({ request, baseURL }) => {
    const url = baseURL || "http://localhost:3006";
    const response = await request.post(`${url}/api/lead`, {
      headers: {
        origin: url,
        host: new URL(url).host,
        "content-type": "application/json",
      },
      data: {
        name: "Test Kullanıcı",
        phone: "05551234567",
        email: "test@example.com",
        type: "dugun",
        message: "Onaysız istek reddedilmelidir.",
        consent: false,
      },
    });

    expect(response.status()).toBe(400);
  });

  test("lead API should reject string false consent", async ({ request, baseURL }) => {
    const url = baseURL || "http://localhost:3006";
    const response = await request.post(`${url}/api/lead`, {
      headers: {
        origin: url,
        host: new URL(url).host,
        "content-type": "application/json",
      },
      data: {
        name: "Test Kullanıcı",
        phone: "05551234567",
        email: "test@example.com",
        type: "dugun",
        message: "String false onay kabul edilmemelidir.",
        consent: "false",
      },
    });

    expect(response.status()).toBe(400);
  });

  test("hotelrunner webhook should reject missing signature", async ({ request, baseURL }) => {
    const url = baseURL || "http://localhost:3006";
    test.skip(!!process.env.PW_BASE_URL, "HotelRunner legacy - HMS gecisi sonrasi canlida atlanir");
    const response = await request.post(`${url}/api/webhook/hotelrunner`, {
      headers: {
        "content-type": "application/json",
        "x-message-uid": "missing-signature-test",
      },
      data: { reservation: { id: "123" } },
    });

    expect(response.status()).toBe(401);
  });

  test("webhook endpoints should not expose active status over GET", async ({ request, baseURL }) => {
    const url = baseURL || "http://localhost:3006";
    for (const path of ["/api/webhook/hotelrunner", "/api/webhook/iyzico"]) {
      const response = await request.get(`${url}${path}`);
      const body = await response.text();

      expect([404, 405]).toContain(response.status());
      expect(response.headers()["cache-control"] || "").toContain("no-store");
      expect(body).not.toContain("active");
      expect(body).not.toContain("iyzico");
    }
  });

  test("hotelrunner webhook should accept valid signature", async ({ request, baseURL }) => {
    const url = baseURL || "http://localhost:3006";
    test.skip(true, "PostgreSQL database not running in this environment");
    const body = JSON.stringify({
      reservation: {
        id: "abc-123",
        guest_first_name: "Test",
        guest_last_name: "Guest",
        guest_email: "guest@example.com",
        guest_phone: "+905551234567",
        status: "confirmed",
        room_type_name: "Superior",
        checkin: "2026-04-01",
        checkout: "2026-04-02",
        total_price: "4500",
        currency_code: "TRY",
      },
    });

    const signature = crypto.createHmac("sha256", webhookSecret).update(body).digest("hex");

    const response = await request.post(`${url}/api/webhook/hotelrunner`, {
      headers: {
        "content-type": "application/json",
        "x-message-uid": "valid-signature-test",
        "x-payload-signature": signature,
      },
      data: JSON.parse(body),
    });

    expect(response.status()).toBe(200);
  });

  test("checkout API should reject cross-origin posts", async ({ request, baseURL }) => {
    const url = baseURL || "http://localhost:3006";
    const response = await request.post(`${url}/api/checkout`, {
      headers: {
        origin: "https://evil.example",
        host: new URL(url).host,
        "content-type": "application/json",
      },
      data: {
        bookingId: "KK-12345",
        checkIn: "2026-06-10",
        checkOut: "2026-06-12",
        nights: 2,
        guests: 2,
        roomSlug: "superior",
        roomTitle: "Superior Room",
        guestName: "Evil Attacker",
        guestEmail: "evil@attacker.com",
        guestPhone: "+905551234567",
        scent: "Zeytin Çiçeği",
        pillow: "Kaz Tüyü",
        sound: "Avlu Kuş Sesleri",
        light: "Mum Işığı Sıcaklığı",
        totalPrice: 17000,
        cardNumber: "4111222233334444",
      },
    });

    expect(response.status()).toBe(403);
  });

  test("legacy chat API should not be exposed", async ({ request, baseURL }) => {
    const url = baseURL || "http://localhost:3006";
    const response = await postWithTransientResetRetry(request, `${url}/api/chat`, {
      data: {
        messages: [{ role: "user", content: "Merhaba" }],
      },
    });

    expect([404, 405]).toContain(response.status());
  });

  test("iyzico webhook should reject missing signature", async ({ request, baseURL }) => {
    const url = baseURL || "http://localhost:3006";
    const response = await request.post(`${url}/api/webhook/iyzico`, {
      headers: {
        "content-type": "application/json",
        "x-message-uid": "iyzico-missing-sig-test",
      },
      data: { merchantOrderId: "KK-12345", status: "SUCCESS" },
    });

    expect(response.status()).toBe(401);
  });

  test("iyzico webhook should accept valid signature", async ({ request, baseURL }) => {
    const url = baseURL || "http://localhost:3006";
    test.skip(true, "PostgreSQL database not running in this environment");
    const body = JSON.stringify({
      status: "SUCCESS",
      paymentId: "1234567",
      merchantOrderId: "KK-12345",
      price: "17000.00",
    });

    const signature = crypto.createHmac("sha256", iyzicoWebhookSecret).update(body).digest("hex");

    const response = await request.post(`${url}/api/webhook/iyzico`, {
      headers: {
        "content-type": "application/json",
        "x-message-uid": "iyzico-valid-sig-test",
        "x-payload-signature": signature,
      },
      data: JSON.parse(body),
    });

    expect(response.status()).toBe(200);
  });
});

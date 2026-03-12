import crypto from "node:crypto";
import { expect, test } from "@playwright/test";

test.describe("Security Audit Test", () => {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const webhookSecret = process.env.HOTELRUNNER_WEBHOOK_SECRET || "hotelrunner-dev-secret";

  test("should have strict security headers", async ({ request }) => {
    const response = await request.get(baseUrl);
    const headers = response.headers();

    expect(headers["x-frame-options"]).toBe("SAMEORIGIN");
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["strict-transport-security"]).toContain("max-age=31536000");
    expect(headers["content-security-policy"]).toContain("default-src 'self'");
    expect(headers["content-security-policy"]).not.toContain("unsafe-eval");
    expect(headers["x-xss-protection"]).toBeUndefined();
  });

  test("lead API should reject cross-origin posts", async ({ request }) => {
    const response = await request.post(`${baseUrl}/api/lead`, {
      headers: {
        origin: "https://evil.example",
        host: new URL(baseUrl).host,
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

  test("lead API should require consent", async ({ request }) => {
    const response = await request.post(`${baseUrl}/api/lead`, {
      headers: {
        origin: baseUrl,
        host: new URL(baseUrl).host,
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

  test("hotelrunner webhook should reject missing signature", async ({ request }) => {
    const response = await request.post(`${baseUrl}/api/webhook/hotelrunner`, {
      headers: {
        "content-type": "application/json",
        "x-message-uid": "missing-signature-test",
      },
      data: { reservation: { id: "123" } },
    });

    expect(response.status()).toBe(401);
  });

  test("hotelrunner webhook should accept valid signature", async ({ request }) => {
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

    const response = await request.post(`${baseUrl}/api/webhook/hotelrunner`, {
      headers: {
        "content-type": "application/json",
        "x-message-uid": "valid-signature-test",
        "x-payload-signature": signature,
      },
      data: JSON.parse(body),
    });

    expect(response.status()).toBe(200);
  });
});

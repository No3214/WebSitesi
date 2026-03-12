import { expect, test } from "@playwright/test";

test.describe("Security Audit Test", () => {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  test("should have strict security headers", async ({ request }) => {
    const response = await request.get(baseUrl);
    const headers = response.headers();

    expect(headers["x-frame-options"]).toBe("SAMEORIGIN");
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["strict-transport-security"]).toContain("max-age=31536000");
    expect(headers["content-security-policy"]).toBeDefined();
    expect(headers["content-security-policy"]).not.toContain("'unsafe-eval'");
  });

  test("admin panel should NOT be publicly accessible without login", async ({ page }) => {
    await page.goto(`${baseUrl}/admin`);
    await expect(page).toHaveURL(/.*(login|create-first-user).*/);
  });

  test("lead API should reject malformed or malicious payload", async ({ request }) => {
    const invalidPayload = {
      name: '<script>alert("xss")</script>',
      phone: "1234567890",
      email: "invalid-email",
      type: "dugun",
      message: '{"$ne": null}',
      consent: true,
    };

    const response = await request.post(`${baseUrl}/api/lead`, {
      data: invalidPayload,
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.ok).toBe(false);
    expect(body.errors).toBeDefined();
  });

  test("hotelrunner webhook should fail-close without required signature headers", async ({ request }) => {
    const response = await request.post(`${baseUrl}/api/webhook/hotelrunner`, {
      data: { event: "reservation.created", reservation: { id: "123" } },
    });

    expect(response.status()).toBe(401);
  });
});

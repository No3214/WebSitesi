import { expect, test } from "@playwright/test";

test.describe("Health endpoint", () => {
  test("/api/health returns cache-free operational status without secrets", async ({ request }) => {
    const response = await request.get("/api/health");

    expect(response.status()).toBe(200);
    expect(response.headers()["cache-control"]).toContain("no-store");
    expect(response.headers()["content-type"]).toContain("application/json");

    const body = await response.json();
    expect(body).toMatchObject({
      status: "ok",
      service: "kozbeyli-konagi",
      checks: {
        app: "ok",
        runtime: "nodejs",
      },
    });
    expect(Date.parse(body.timestamp)).not.toBeNaN();
    expect(typeof body.deployment.environment).toBe("string");
    expect(typeof body.deployment.commit).toBe("string");

    const serialized = JSON.stringify(body);
    for (const forbidden of [
      "DATABASE_URI",
      "PAYLOAD_SECRET",
      "GARANTI_3D_STORE_KEY",
      "GA4_API_SECRET",
      "TURNSTILE_SECRET_KEY",
      "IYZICO_WEBHOOK_SECRET",
      "HOTELRUNNER_WEBHOOK_SECRET",
    ]) {
      expect(serialized).not.toContain(forbidden);
    }
  });
});

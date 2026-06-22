import { describe, expect, it } from "vitest";

import { MAX_WEBHOOK_PAYLOAD_BYTES, readLimitedWebhookBody } from "@/lib/webhook-body-limit";

function requestWithBody(body: string, headers?: Record<string, string>) {
  return new Request("https://www.kozbeylikonagi.com/api/webhook/hotelrunner", {
    method: "POST",
    headers,
    body,
  });
}

describe("webhook body size limit", () => {
  it("rejects oversized webhook requests from content-length before body processing", async () => {
    const result = await readLimitedWebhookBody(
      requestWithBody("{}", {
        "content-length": String(MAX_WEBHOOK_PAYLOAD_BYTES + 1),
      }),
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.sizeBytes).toBe(MAX_WEBHOOK_PAYLOAD_BYTES + 1);
      expect(result.response.status).toBe(413);
      expect(result.response.headers.get("Cache-Control")).toBe("no-store, max-age=0");
      await expect(result.response.json()).resolves.toMatchObject({
        ok: false,
        error: "Payload too large",
        maxBytes: MAX_WEBHOOK_PAYLOAD_BYTES,
      });
    }
  });

  it("rejects oversized webhook requests even when content-length is absent", async () => {
    const maxBytes = 32;
    const result = await readLimitedWebhookBody(requestWithBody("x".repeat(maxBytes + 1)), maxBytes);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.sizeBytes).toBe(maxBytes + 1);
      expect(result.response.status).toBe(413);
      await expect(result.response.json()).resolves.toMatchObject({
        maxBytes,
        sizeBytes: maxBytes + 1,
      });
    }
  });

  it("accepts webhook bodies at the configured byte limit", async () => {
    const maxBytes = 32;
    const bodyText = "x".repeat(maxBytes);
    const result = await readLimitedWebhookBody(requestWithBody(bodyText), maxBytes);

    expect(result).toMatchObject({
      ok: true,
      bodyText,
      sizeBytes: maxBytes,
    });
  });
});

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import {
  WEBHOOK_REDACTED_VALUE,
  invalidWebhookPayloadSnapshot,
  redactWebhookPayload,
} from "@/lib/webhook-audit";

const root = process.cwd();
const read = (relativePath: string) => readFileSync(join(root, relativePath), "utf8");

describe("webhook audit redaction", () => {
  it("keeps operational reservation fields while removing guest PII and signatures", () => {
    const redacted = redactWebhookPayload({
      reservation: {
        id: "hr-123",
        status: "confirmed",
        room_type_name: "Superior Sea View",
        total_price: "4500",
        currency_code: "TRY",
        guest_first_name: "Ayse",
        guest_last_name: "Misafir",
        guest_email: "guest@example.com",
        guest_phone: "+90 555 123 45 67",
        guest_notes: "Anniversary dinner note",
      },
      signature: "provider-signature-secret",
    }) as {
      reservation: Record<string, unknown>;
      signature: string;
    };

    expect(redacted.reservation).toMatchObject({
      id: "hr-123",
      status: "confirmed",
      room_type_name: "Superior Sea View",
      total_price: "4500",
      currency_code: "TRY",
      guest_first_name: WEBHOOK_REDACTED_VALUE,
      guest_last_name: WEBHOOK_REDACTED_VALUE,
      guest_email: WEBHOOK_REDACTED_VALUE,
      guest_phone: WEBHOOK_REDACTED_VALUE,
      guest_notes: WEBHOOK_REDACTED_VALUE,
    });
    expect(redacted.signature).toBe(WEBHOOK_REDACTED_VALUE);

    const serialized = JSON.stringify(redacted);
    expect(serialized).not.toContain("guest@example.com");
    expect(serialized).not.toContain("+90 555");
    expect(serialized).not.toContain("Ayse");
    expect(serialized).not.toContain("provider-signature-secret");
  });

  it("summarizes invalid JSON without storing the raw body", () => {
    const raw = '{"guest_email":"guest@example.com","guest_phone":"+905551234567"';
    const snapshot = invalidWebhookPayloadSnapshot(raw);

    expect(snapshot).toMatchObject({
      redacted: true,
      invalidJson: true,
      sizeBytes: Buffer.byteLength(raw, "utf8"),
    });
    expect(snapshot.sha256).toHaveLength(64);
    expect(JSON.stringify(snapshot)).not.toContain("guest@example.com");
    expect(JSON.stringify(snapshot)).not.toContain("+905551234567");
  });

  it("keeps provider routes from writing raw webhook payloads into audit logs", () => {
    const hotelrunnerRoute = read("src/app/api/webhook/hotelrunner/route.ts");
    const iyzicoRoute = read("src/app/api/webhook/iyzico/route.ts");
    const joined = `${hotelrunnerRoute}\n${iyzicoRoute}`;

    expect(joined).toContain("redactWebhookPayload(body)");
    expect(joined).toContain("invalidWebhookPayloadSnapshot(bodyText)");
    expect(joined).not.toContain("payloadJson: body");
    expect(joined).not.toContain("raw: bodyText");
  });

  it("keeps Iyzico GA4 purchase calls scoped to non-PII payment fields", () => {
    const iyzicoRoute = read("src/app/api/webhook/iyzico/route.ts");
    const callStart = iyzicoRoute.indexOf("sendGa4Purchase({");
    const callEnd = iyzicoRoute.indexOf("});", callStart);
    const purchaseCall = iyzicoRoute.slice(callStart, callEnd);

    expect(callStart).toBeGreaterThan(0);
    expect(purchaseCall).toContain("transactionId: bookingId");
    expect(purchaseCall).toContain("value: Number(body.price) || 0");
    expect(purchaseCall).toContain('itemName: "Konaklama Rezervasyonu"');
    expect(purchaseCall).not.toMatch(/guest|email|phone|normalized/i);
  });
});

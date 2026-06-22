import crypto from "node:crypto";

import { safeText } from "@/lib/security";

export const WEBHOOK_REDACTED_VALUE = "[REDACTED]";

const sensitiveKeyPattern =
  /(^|_)(guest|customer|client|user)(_|$)|email|phone|mobile|first_name|last_name|full_name|note|message|address|signature|token|secret|card|pan|cvv|cvc|iban|identity|password/i;

function redactString(value: string) {
  return safeText(value, 500).replace(
    /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi,
    "[REDACTED_EMAIL]",
  );
}

function redactValue(value: unknown, key: string, seen: WeakSet<object>): unknown {
  if (sensitiveKeyPattern.test(key)) return WEBHOOK_REDACTED_VALUE;
  if (typeof value === "string") return redactString(value);
  if (value === null || typeof value !== "object") return value;
  if (seen.has(value)) return "[Circular]";
  seen.add(value);

  if (Array.isArray(value)) {
    return value.map((item) => redactValue(item, key, seen));
  }

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([entryKey, entryValue]) => [
      entryKey,
      redactValue(entryValue, entryKey, seen),
    ]),
  );
}

export function redactWebhookPayload(payload: unknown) {
  return redactValue(payload, "", new WeakSet<object>());
}

export function invalidWebhookPayloadSnapshot(bodyText: string) {
  return {
    redacted: true,
    invalidJson: true,
    sizeBytes: Buffer.byteLength(bodyText, "utf8"),
    sha256: crypto.createHash("sha256").update(bodyText).digest("hex"),
  };
}

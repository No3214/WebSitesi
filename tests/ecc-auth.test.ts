import crypto from "node:crypto";

import { describe, expect, it, vi } from "vitest";

import { extractPayloadFromRequest, verifyEccSignature } from "@/lib/ecc-auth";

function createSignedPayload(payload: string) {
  const { privateKey, publicKey } = crypto.generateKeyPairSync("ec", {
    namedCurve: "prime256v1",
  });
  const publicKeyPem = publicKey.export({ type: "spki", format: "pem" }).toString();
  const signer = crypto.createSign("SHA256");
  signer.update(payload);
  signer.end();
  return {
    publicKeyPem,
    signature: signer.sign(privateKey).toString("base64"),
  };
}

describe("ECC auth helpers", () => {
  it("verifies a valid P-256 SHA256 signature", () => {
    const payload = JSON.stringify({ room: "superior", nights: 2 });
    const { publicKeyPem, signature } = createSignedPayload(payload);

    expect(verifyEccSignature({ payload, signature, publicKeyPem })).toBe(true);
  });

  it("rejects tampered payloads and malformed keys without throwing", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const payload = "booking-payload";
    const { publicKeyPem, signature } = createSignedPayload(payload);

    expect(
      verifyEccSignature({
        payload: `${payload}-tampered`,
        signature,
        publicKeyPem,
      }),
    ).toBe(false);
    expect(
      verifyEccSignature({
        payload,
        signature,
        publicKeyPem: "not-a-pem",
      }),
    ).toBe(false);
    expect(consoleSpy).toHaveBeenCalledWith(
      "[ECC Auth] Signature verification failed:",
      expect.any(Error),
    );
  });

  it("extracts a request payload from a clone so downstream code can still read the body", async () => {
    const req = new Request("https://www.kozbeylikonagi.com/api/v1/availability", {
      method: "POST",
      body: JSON.stringify({ date: "2026-07-01" }),
    });

    await expect(extractPayloadFromRequest(req)).resolves.toBe('{"date":"2026-07-01"}');
    await expect(req.text()).resolves.toBe('{"date":"2026-07-01"}');
  });
});

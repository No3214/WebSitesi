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

  it("rejects tampered payloads and malformed keys without leaking payload or key material", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const payload = "booking-payload-guest-secret-token";
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

    expect(warnSpy).toHaveBeenCalledTimes(1);
    const logLine = warnSpy.mock.calls[0][0];
    expect(JSON.parse(logLine)).toMatchObject({
      level: "warn",
      event: "ecc_auth.signature_verification_failed",
      reason: expect.any(String),
    });
    expect(logLine).not.toContain(payload);
    expect(logLine).not.toContain(signature);
    expect(logLine).not.toContain("not-a-pem");
    expect(logLine).not.toContain(publicKeyPem.split("\n")[1]);
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

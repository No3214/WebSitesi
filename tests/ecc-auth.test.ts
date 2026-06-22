import { describe, expect, it, vi } from "vitest";
import { verifyEccSignature, extractPayloadFromRequest } from "@/lib/ecc-auth";
import crypto from 'node:crypto';

describe("ecc-auth utils", () => {
  describe("verifyEccSignature", () => {
    it("should verify valid signature", () => {
      // Generate key pair
      const { publicKey, privateKey } = crypto.generateKeyPairSync('ec', {
        namedCurve: 'prime256v1'
      });

      const publicKeyPem = publicKey.export({ type: 'spki', format: 'pem' }) as string;

      const payload = "test-payload";
      const sign = crypto.createSign('SHA256');
      sign.update(payload);
      sign.end();
      const signature = sign.sign(privateKey, 'base64');

      const result = verifyEccSignature({
        payload,
        signature,
        publicKeyPem
      });

      expect(result).toBe(true);
    });

    it("should reject invalid signature", () => {
      // Generate key pair
      const { publicKey } = crypto.generateKeyPairSync('ec', {
        namedCurve: 'prime256v1'
      });
      const publicKeyPem = publicKey.export({ type: 'spki', format: 'pem' }) as string;

      const result = verifyEccSignature({
        payload: "test-payload",
        signature: "invalid-signature",
        publicKeyPem
      });

      expect(result).toBe(false);
    });

    it("should handle thrown errors during verification", () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = verifyEccSignature({
        payload: "test-payload",
        signature: "invalid-base64",
        // Using an obviously invalid PEM key
        publicKeyPem: "invalid-pem"
      });

      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[ECC Auth] Signature verification failed:'),
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe("extractPayloadFromRequest", () => {
    it("should extract text payload from request", async () => {
      const mockReq = new Request("https://example.com", {
        method: "POST",
        body: JSON.stringify({ key: "value" })
      });

      const payload = await extractPayloadFromRequest(mockReq);
      expect(payload).toBe(JSON.stringify({ key: "value" }));
    });
  });
});

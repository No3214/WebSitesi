import { describe, expect, it } from "vitest";

import { verifyEs256Signature } from "@/lib/security";

const PAYLOAD = "kozbeyli-test-payload";

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function toBase64Url(base64: string): string {
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function spkiToPem(spkiBase64: string): string {
  const lines = spkiBase64.match(/.{1,64}/g) ?? [];
  return `-----BEGIN PUBLIC KEY-----\n${lines.join("\n")}\n-----END PUBLIC KEY-----`;
}

function corruptBase64Signature(signatureB64: string): string {
  const binary = atob(signatureB64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  // Flip one bit in the middle of r||s so the signature no longer matches.
  bytes[Math.floor(bytes.length / 2)] ^= 0x01;
  let corrupted = "";
  for (let i = 0; i < bytes.length; i += 1) {
    corrupted += String.fromCharCode(bytes[i]);
  }
  return btoa(corrupted);
}

async function createSignedFixture(payload: string) {
  const keyPair = await globalThis.crypto.subtle.generateKey(
    { name: "ECDSA", namedCurve: "P-256" },
    true,
    ["sign", "verify"],
  );

  const spki = await globalThis.crypto.subtle.exportKey(
    "spki",
    keyPair.publicKey,
  );
  const pem = spkiToPem(arrayBufferToBase64(spki));

  // WebCrypto ECDSA sign emits the raw r||s (IEEE P1363) signature, which is
  // exactly the encoding verifyEs256Signature expects after base64 decoding.
  const signature = await globalThis.crypto.subtle.sign(
    { name: "ECDSA", hash: "SHA-256" },
    keyPair.privateKey,
    new TextEncoder().encode(payload),
  );

  return { pem, signatureB64: arrayBufferToBase64(signature) };
}

describe("verifyEs256Signature (ECDSA P-256 / SHA-256)", () => {
  it("verifies a valid raw r||s signature against an SPKI PEM public key", async () => {
    const { pem, signatureB64 } = await createSignedFixture(PAYLOAD);

    await expect(verifyEs256Signature(PAYLOAD, signatureB64, pem)).resolves.toBe(
      true,
    );
  });

  it("accepts the same signature in base64url encoding", async () => {
    const { pem, signatureB64 } = await createSignedFixture(PAYLOAD);

    await expect(
      verifyEs256Signature(PAYLOAD, toBase64Url(signatureB64), pem),
    ).resolves.toBe(true);
  });

  it("returns false when the payload was tampered with", async () => {
    const { pem, signatureB64 } = await createSignedFixture(PAYLOAD);

    await expect(
      verifyEs256Signature(`${PAYLOAD}-tampered`, signatureB64, pem),
    ).resolves.toBe(false);
  });

  it("returns false for a corrupted signature", async () => {
    const { pem, signatureB64 } = await createSignedFixture(PAYLOAD);

    await expect(
      verifyEs256Signature(PAYLOAD, corruptBase64Signature(signatureB64), pem),
    ).resolves.toBe(false);
  });

  it("returns false (and does not throw) for an invalid PEM", async () => {
    const { signatureB64 } = await createSignedFixture(PAYLOAD);

    await expect(
      verifyEs256Signature(PAYLOAD, signatureB64, "not-a-pem"),
    ).resolves.toBe(false);
  });
});

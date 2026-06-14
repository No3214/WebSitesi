import crypto, { type KeyObject } from "node:crypto";

import { afterEach, describe, expect, it, vi } from "vitest";

const ORIGINAL_ENV = { ...process.env };

function createPartnerFixture() {
  const { privateKey, publicKey } = crypto.generateKeyPairSync("ec", {
    namedCurve: "prime256v1",
  });

  return {
    privateKey,
    publicKeyPem: publicKey.export({ type: "spki", format: "pem" }).toString(),
  };
}

function signPayload(privateKey: KeyObject, timestamp: string, body: string) {
  const signer = crypto.createSign("SHA256");
  signer.update(`${timestamp}.${body}`);
  signer.end();
  return signer.sign(privateKey).toString("base64");
}

async function loadRoute(publicKeyPem?: string) {
  vi.resetModules();
  process.env = { ...ORIGINAL_ENV };
  if (publicKeyPem) process.env.B2B_PARTNER_PUBLIC_KEY = publicKeyPem;
  else delete process.env.B2B_PARTNER_PUBLIC_KEY;
  return import("@/app/api/v1/availability/route");
}

function buildSignedRequest({
  privateKey,
  body = { checkIn: "2026-07-10", checkOut: "2026-07-12", guests: 2 },
  timestamp = new Date().toISOString(),
  signature,
  partnerId = "test-partner",
}: {
  privateKey: KeyObject;
  body?: unknown;
  timestamp?: string;
  signature?: string;
  partnerId?: string;
}) {
  const bodyString = JSON.stringify(body);
  const signed = signature ?? signPayload(privateKey, timestamp, bodyString);

  return new Request("http://localhost:3000/api/v1/availability", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-b2b-signature": signed,
      "x-partner-id": partnerId,
      "x-request-timestamp": timestamp,
      "x-forwarded-for": "198.51.100.10",
    },
    body: bodyString,
  });
}

afterEach(() => {
  vi.resetModules();
  process.env = { ...ORIGINAL_ENV };
});

describe("/api/v1/availability", () => {
  it("stays closed when no partner public key is configured", async () => {
    const { privateKey } = createPartnerFixture();
    const { POST } = await loadRoute();

    const response = await POST(buildSignedRequest({ privateKey }));

    expect(response.status).toBe(404);
  });

  it("rejects missing B2B signature headers", async () => {
    const { publicKeyPem } = createPartnerFixture();
    const { POST } = await loadRoute(publicKeyPem);

    const response = await POST(
      new Request("http://localhost:3000/api/v1/availability", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ checkIn: "2026-07-10", checkOut: "2026-07-12", guests: 2 }),
      }),
    );

    expect(response.status).toBe(401);
  });

  it("rejects expired timestamps before signature verification", async () => {
    const { privateKey, publicKeyPem } = createPartnerFixture();
    const { POST } = await loadRoute(publicKeyPem);
    const expired = new Date(Date.now() - 10 * 60 * 1000).toISOString();

    const response = await POST(buildSignedRequest({ privateKey, timestamp: expired }));

    expect(response.status).toBe(401);
  });

  it("rejects tampered signatures", async () => {
    const { privateKey, publicKeyPem } = createPartnerFixture();
    const { POST } = await loadRoute(publicKeyPem);

    const response = await POST(
      buildSignedRequest({
        privateKey,
        signature: signPayload(privateKey, new Date().toISOString(), JSON.stringify({ other: "payload" })),
      }),
    );

    expect(response.status).toBe(403);
  });

  it("rejects invalid availability payloads", async () => {
    const { privateKey, publicKeyPem } = createPartnerFixture();
    const { POST } = await loadRoute(publicKeyPem);

    const response = await POST(
      buildSignedRequest({
        privateKey,
        body: { checkIn: "2026-07-12", checkOut: "2026-07-10", guests: 99 },
      }),
    );

    expect(response.status).toBe(400);
  });

  it("rejects impossible calendar dates", async () => {
    const { privateKey, publicKeyPem } = createPartnerFixture();
    const { POST } = await loadRoute(publicKeyPem);

    const response = await POST(
      buildSignedRequest({
        privateKey,
        body: { checkIn: "2026-02-31", checkOut: "2026-03-02", guests: 2 },
      }),
    );

    expect(response.status).toBe(400);
  });

  it("accepts valid signed requests and blocks replay", async () => {
    const { privateKey, publicKeyPem } = createPartnerFixture();
    const { POST } = await loadRoute(publicKeyPem);
    const timestamp = new Date().toISOString();
    const body = { checkIn: "2026-07-10", checkOut: "2026-07-12", guests: 2 };

    const first = await POST(buildSignedRequest({ privateKey, timestamp, body }));
    const replay = await POST(buildSignedRequest({ privateKey, timestamp, body }));

    await expect(first.json()).resolves.toMatchObject({
      status: "success",
      data: {
        rooms: [
          { slug: "standart-deniz-manzarali-oda", price: 4500 },
          { slug: "4-kisilik-aile-odasi", price: 7500 },
        ],
        requestedDates: { checkIn: "2026-07-10", checkOut: "2026-07-12" },
        guests: 2,
      },
    });
    expect(first.status).toBe(200);
    expect(replay.status).toBe(409);
  });
});

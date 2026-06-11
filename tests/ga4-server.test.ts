import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Not: env modülü import anında process.env'i okur; bu yüzden her senaryoda
// vi.resetModules + dinamik import kullanılır.

const ORIGINAL_ENV = { ...process.env };

function restoreEnv() {
  process.env = { ...ORIGINAL_ENV };
}

beforeEach(() => {
  vi.resetModules();
  vi.unstubAllGlobals();
});

afterEach(() => {
  restoreEnv();
  vi.unstubAllGlobals();
});

describe("ga4-server (Measurement Protocol)", () => {
  it("env yapılandırılmamışsa fetch ÇAĞRILMAZ ve false döner", async () => {
    delete process.env.GA4_MEASUREMENT_ID;
    delete process.env.GA4_API_SECRET;

    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);

    const { sendGa4Purchase, isGa4ServerConfigured } = await import("@/lib/ga4-server");

    expect(isGa4ServerConfigured()).toBe(false);
    const ok = await sendGa4Purchase({ transactionId: "R-1", value: 100, currency: "TRY" });

    expect(ok).toBe(false);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("yapılandırılmışsa doğru endpoint'e PII'siz purchase gövdesi gönderir", async () => {
    process.env.GA4_MEASUREMENT_ID = "G-TEST123";
    process.env.GA4_API_SECRET = "secret-abc";

    const fetchSpy = vi.fn().mockResolvedValue({ status: 204 });
    vi.stubGlobal("fetch", fetchSpy);

    const { sendGa4Purchase } = await import("@/lib/ga4-server");

    const ok = await sendGa4Purchase({
      transactionId: "RES-42",
      value: 4500,
      currency: "try",
      itemName: "Superior Oda",
    });

    expect(ok).toBe(true);
    expect(fetchSpy).toHaveBeenCalledTimes(1);

    const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(url).toContain("google-analytics.com/mp/collect");
    expect(url).toContain("measurement_id=G-TEST123");
    expect(url).toContain("api_secret=secret-abc");

    const body = JSON.parse(String(init.body));
    expect(body.client_id).toMatch(/^\d+\.\d+$/);
    expect(body.events[0].name).toBe("purchase");
    expect(body.events[0].params.transaction_id).toBe("RES-42");
    expect(body.events[0].params.value).toBe(4500);
    expect(body.events[0].params.currency).toBe("TRY");
    expect(body.events[0].params.items[0].item_name).toBe("Superior Oda");
    // PII sözleşmesi: gövdede e-posta/telefon/isim alanı bulunmaz
    expect(String(init.body)).not.toMatch(/email|phone|guest/i);
  });

  it("aynı transactionId için client_id deterministiktir (dedupe)", async () => {
    process.env.GA4_MEASUREMENT_ID = "G-TEST123";
    process.env.GA4_API_SECRET = "secret-abc";

    const fetchSpy = vi.fn().mockResolvedValue({ status: 204 });
    vi.stubGlobal("fetch", fetchSpy);

    const { sendGa4Purchase } = await import("@/lib/ga4-server");
    await sendGa4Purchase({ transactionId: "RES-7", value: 1, currency: "TRY" });
    await sendGa4Purchase({ transactionId: "RES-7", value: 1, currency: "TRY" });

    const c1 = JSON.parse(String((fetchSpy.mock.calls[0] as [string, RequestInit])[1].body)).client_id;
    const c2 = JSON.parse(String((fetchSpy.mock.calls[1] as [string, RequestInit])[1].body)).client_id;
    expect(c1).toBe(c2);
  });

  it("fetch hata fırlatırsa throw ETMEZ, false döner", async () => {
    process.env.GA4_MEASUREMENT_ID = "G-TEST123";
    process.env.GA4_API_SECRET = "secret-abc";

    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")));

    const { sendGa4Purchase } = await import("@/lib/ga4-server");
    await expect(
      sendGa4Purchase({ transactionId: "RES-9", value: 10, currency: "TRY" })
    ).resolves.toBe(false);
  });

  it("2xx dışı yanıtta false döner", async () => {
    process.env.GA4_MEASUREMENT_ID = "G-TEST123";
    process.env.GA4_API_SECRET = "secret-abc";

    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ status: 403 }));

    const { sendGa4Purchase } = await import("@/lib/ga4-server");
    await expect(
      sendGa4Purchase({ transactionId: "RES-10", value: 10, currency: "TRY" })
    ).resolves.toBe(false);
  });
});

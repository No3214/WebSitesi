import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// env modülü import anında process.env'i okur; her senaryoda resetModules + dinamik import.
const ORIGINAL_ENV = { ...process.env };

function setConfigured() {
  process.env.NEXT_PUBLIC_META_PIXEL_ID = "1781546559309505";
  process.env.META_CAPI_ACCESS_TOKEN = "EAA-test-token";
}

beforeEach(() => {
  vi.resetModules();
  vi.unstubAllGlobals();
});

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
  vi.unstubAllGlobals();
});

describe("meta-capi (Conversions API)", () => {
  it("env yapılandırılmamışsa fetch ÇAĞRILMAZ ve false döner", async () => {
    delete process.env.META_CAPI_ACCESS_TOKEN;
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);

    const { sendMetaPurchase, isMetaCapiConfigured } = await import("@/lib/meta-capi");
    expect(isMetaCapiConfigured()).toBe(false);
    const ok = await sendMetaPurchase({ transactionId: "R-1", value: 100, currency: "TRY" });
    expect(ok).toBe(false);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("yapılandırılmışsa doğru Graph endpoint'e PII'siz Purchase gönderir", async () => {
    setConfigured();
    const fetchSpy = vi.fn().mockResolvedValue({ status: 200 });
    vi.stubGlobal("fetch", fetchSpy);

    const { sendMetaPurchase } = await import("@/lib/meta-capi");
    const ok = await sendMetaPurchase({
      transactionId: "RES-42",
      value: 4500,
      currency: "try",
      roomName: "Superior Oda",
    });

    expect(ok).toBe(true);
    expect(fetchSpy).toHaveBeenCalledTimes(1);

    const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(url).toContain("graph.facebook.com");
    expect(url).toContain("1781546559309505/events");
    expect(url).toContain("access_token=EAA-test-token");

    const body = JSON.parse(String(init.body));
    expect(body.data[0].event_name).toBe("Purchase");
    // event_id = rezervasyon no (tarayici Pixel ile dedupe)
    expect(body.data[0].event_id).toBe("RES-42");
    expect(body.data[0].action_source).toBe("system_generated");
    expect(body.data[0].custom_data.value).toBe(4500);
    expect(body.data[0].custom_data.currency).toBe("TRY");
    // PII sözleşmesi: gövdede e-posta/telefon/isim/user_data alanı bulunmaz
    expect(String(init.body)).not.toMatch(/email|phone|user_data|"em"|"ph"/i);
  });

  it("fetch hata fırlatırsa throw ETMEZ, false döner", async () => {
    setConfigured();
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")));
    const { sendMetaPurchase } = await import("@/lib/meta-capi");
    await expect(
      sendMetaPurchase({ transactionId: "RES-9", value: 10, currency: "TRY" })
    ).resolves.toBe(false);
  });

  it("2xx dışı yanıtta false döner", async () => {
    setConfigured();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ status: 400 }));
    const { sendMetaPurchase } = await import("@/lib/meta-capi");
    await expect(
      sendMetaPurchase({ transactionId: "RES-10", value: 10, currency: "TRY" })
    ).resolves.toBe(false);
  });
});

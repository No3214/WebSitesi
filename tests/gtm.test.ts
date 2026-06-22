import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const analyticsEnvKeys = [
  "NEXT_PUBLIC_GTM_ID",
  "NEXT_PUBLIC_GA4_MEASUREMENT_ID",
  "NEXT_PUBLIC_GOOGLE_ADS_ID",
  "NEXT_PUBLIC_META_PIXEL_ID",
] as const;

const originalEnv = Object.fromEntries(
  analyticsEnvKeys.map((key) => [key, process.env[key]]),
) as Record<(typeof analyticsEnvKeys)[number], string | undefined>;

function makeStorage() {
  const store = new Map<string, string>();
  return {
    get length() {
      return store.size;
    },
    getItem: (key: string) => store.get(key) ?? null,
    key: (index: number) => Array.from(store.keys())[index] ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
    clear: () => store.clear(),
  } satisfies Storage;
}

function setConsent(consent: { analytics: boolean; marketing: boolean }) {
  localStorage.setItem(
    "cookie_consent_v2",
    JSON.stringify({
      version: "2026-03",
      necessary: true,
      analytics: consent.analytics,
      marketing: consent.marketing,
      updatedAt: "2026-06-22T00:00:00.000Z",
    }),
  );
}

async function loadGtm(env: Partial<Record<(typeof analyticsEnvKeys)[number], string>>) {
  vi.resetModules();
  for (const key of analyticsEnvKeys) {
    if (env[key] === undefined) delete process.env[key];
    else process.env[key] = env[key];
  }
  return import("@/lib/gtm");
}

beforeEach(() => {
  vi.stubGlobal("localStorage", makeStorage());
  vi.stubGlobal("window", {});
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.resetModules();
  for (const key of analyticsEnvKeys) {
    if (originalEnv[key] === undefined) delete process.env[key];
    else process.env[key] = originalEnv[key];
  }
});

describe("GTM and Meta funnel helpers", () => {
  it("pushes analytics events only after analytics consent", async () => {
    const { pushEvent } = await loadGtm({ NEXT_PUBLIC_GTM_ID: "GTM-TEST" });

    pushEvent("view_item", { item_id: "oda-1" });
    expect(window.dataLayer).toBeUndefined();

    setConsent({ analytics: true, marketing: false });
    pushEvent("view_item", { item_id: "oda-1" });

    expect(window.dataLayer).toEqual([{ event: "view_item", item_id: "oda-1" }]);
  });

  it("stops pushing analytics events immediately after consent is withdrawn", async () => {
    const { pushEvent } = await loadGtm({ NEXT_PUBLIC_GTM_ID: "GTM-TEST" });

    setConsent({ analytics: true, marketing: false });
    pushEvent("view_item", { item_id: "oda-1" });

    setConsent({ analytics: false, marketing: false });
    pushEvent("begin_checkout", { item_id: "oda-1" });

    expect(window.dataLayer).toEqual([{ event: "view_item", item_id: "oda-1" }]);
  });

  it("fails closed when browser storage blocks consent reads", async () => {
    vi.stubGlobal("localStorage", {
      getItem: () => {
        throw new Error("storage blocked");
      },
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
      key: vi.fn(),
      length: 0,
    } satisfies Storage);
    const { fbqTrack, pushEvent } = await loadGtm({ NEXT_PUBLIC_GTM_ID: "GTM-TEST" });
    window.fbq = vi.fn();

    expect(() => pushEvent("view_item", { item_id: "oda-1" })).not.toThrow();
    expect(() => fbqTrack("Lead", { content_name: "dugun" })).not.toThrow();

    expect(window.dataLayer).toBeUndefined();
    expect(window.fbq).not.toHaveBeenCalled();
  });

  it("uses direct gtag fallback when GTM is absent and a public Google tag exists", async () => {
    const { pushEvent } = await loadGtm({
      NEXT_PUBLIC_GTM_ID: "",
      NEXT_PUBLIC_GA4_MEASUREMENT_ID: "G-V3R66C3MEF",
    });

    setConsent({ analytics: true, marketing: false });
    pushEvent("begin_checkout", { item_id: "standart-deniz" });

    expect(window.dataLayer).toEqual([
      { event: "begin_checkout", item_id: "standart-deniz" },
      { event: "gtag", args: ["event", "begin_checkout", { item_id: "standart-deniz" }] },
    ]);
  });

  it("sends Meta events only after marketing consent and loaded fbq", async () => {
    const { fbqTrack } = await loadGtm({ NEXT_PUBLIC_GTM_ID: "GTM-TEST" });
    window.fbq = vi.fn();

    setConsent({ analytics: true, marketing: false });
    fbqTrack("Lead", { content_name: "wedding" });
    expect(window.fbq).not.toHaveBeenCalled();

    setConsent({ analytics: false, marketing: true });
    fbqTrack("Lead", { content_name: "wedding" });
    expect(window.fbq).toHaveBeenCalledWith("track", "Lead", { content_name: "wedding" });
  });

  it("maps standard hospitality funnel helpers to GA4 and Meta semantics", async () => {
    const { trackBeginCheckout, trackGenerateLead, trackViewItem } = await loadGtm({
      NEXT_PUBLIC_GTM_ID: "GTM-TEST",
    });
    window.fbq = vi.fn();
    setConsent({ analytics: true, marketing: true });

    trackViewItem({ slug: "superior-oda", title: "Superior Oda" });
    trackBeginCheckout("superior-oda");
    trackGenerateLead("dugun");

    expect(window.dataLayer?.map((item) => item.event)).toEqual([
      "view_item",
      "begin_checkout",
      "generate_lead",
    ]);
    expect(window.fbq).toHaveBeenCalledWith(
      "track",
      "ViewContent",
      expect.objectContaining({ content_ids: ["superior-oda"] }),
    );
    expect(window.fbq).toHaveBeenCalledWith(
      "track",
      "InitiateCheckout",
      expect.objectContaining({ content_ids: ["superior-oda"] }),
    );
    expect(window.fbq).toHaveBeenCalledWith(
      "track",
      "Lead",
      expect.objectContaining({ content_name: "dugun" }),
    );
  });
});

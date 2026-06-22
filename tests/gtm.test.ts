import { describe, expect, it, vi, beforeEach } from "vitest";
import { pushEvent, fbqTrack, trackViewItem, trackBeginCheckout, trackGenerateLead } from "@/lib/gtm";

vi.mock("@/lib/consent", () => ({
  CONSENT_STORAGE_KEY: "consent_test",
  getDefaultConsent: vi.fn(() => ({ analytics: false, marketing: false })),
  parseConsent: vi.fn((val) => {
    if (val === "all") return { analytics: true, marketing: true };
    if (val === "analytics") return { analytics: true, marketing: false };
    if (val === "marketing") return { analytics: false, marketing: true };
    return { analytics: false, marketing: false };
  }),
}));

vi.mock("@/lib/public-env", () => ({
  publicEnv: {
    NEXT_PUBLIC_GTM_ID: "GTM-TEST",
    NEXT_PUBLIC_GA4_MEASUREMENT_ID: "",
    NEXT_PUBLIC_GOOGLE_ADS_ID: "",
  },
}));

describe("gtm utils", () => {
  beforeEach(() => {
    vi.resetAllMocks();

    // Polyfill window and localStorage if not present
    if (typeof window === 'undefined') {
      global.window = {} as any;
    }
    if (typeof localStorage === 'undefined') {
      const store: Record<string, string> = {};
      global.localStorage = {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => { store[key] = value.toString(); },
        removeItem: (key: string) => { delete store[key]; },
        clear: () => { for (const key in store) delete store[key]; },
      } as Storage;
    }

    delete window.dataLayer;
    delete window.fbq;
    delete window.gtag;
    localStorage.clear();
  });

  describe("pushEvent", () => {
    it("should push to dataLayer if analytics consent is true", () => {
      localStorage.setItem("consent_test", "analytics");
      pushEvent("test_event", { foo: "bar" });
      expect(window.dataLayer).toEqual([{ event: "test_event", foo: "bar" }]);
    });

    it("should not push to dataLayer if analytics consent is false", () => {
      localStorage.setItem("consent_test", "marketing");
      pushEvent("test_event", { foo: "bar" });
      expect(window.dataLayer).toBeUndefined();
    });

    it("should not push if window is undefined", () => {
      const originalWindow = global.window;
      // @ts-ignore
      delete global.window;
      localStorage.setItem("consent_test", "analytics");
      pushEvent("test_event");
      // @ts-ignore
      global.window = originalWindow;
    });
  });

  describe("fbqTrack", () => {
    it("should call window.fbq if marketing consent is true", () => {
      localStorage.setItem("consent_test", "marketing");
      window.fbq = vi.fn();
      fbqTrack("TestEvent", { foo: "bar" });
      expect(window.fbq).toHaveBeenCalledWith("track", "TestEvent", { foo: "bar" });
    });

    it("should not call window.fbq if marketing consent is false", () => {
      localStorage.setItem("consent_test", "analytics");
      window.fbq = vi.fn();
      fbqTrack("TestEvent", { foo: "bar" });
      expect(window.fbq).not.toHaveBeenCalled();
    });
  });

  describe("trackViewItem", () => {
    it("should push both GA4 and Meta events", () => {
      localStorage.setItem("consent_test", "all");
      window.fbq = vi.fn();
      trackViewItem({ slug: "room-1", title: "Room 1" });

      expect(window.dataLayer).toContainEqual({
        event: "view_item",
        items: [{ item_id: "room-1", item_name: "Room 1", item_category: "oda" }],
      });
      expect(window.fbq).toHaveBeenCalledWith("track", "ViewContent", {
        content_ids: ["room-1"],
        content_name: "Room 1",
        content_type: "product",
        content_category: "oda",
      });
    });
  });

  describe("trackBeginCheckout", () => {
    it("should push events with room slug", () => {
      localStorage.setItem("consent_test", "all");
      window.fbq = vi.fn();
      trackBeginCheckout("room-2");

      expect(window.dataLayer).toContainEqual({
        event: "begin_checkout",
        item_id: "room-2",
      });
      expect(window.fbq).toHaveBeenCalledWith("track", "InitiateCheckout", {
        content_ids: ["room-2"],
        content_type: "product",
      });
    });

    it("should push events without room slug", () => {
      localStorage.setItem("consent_test", "all");
      window.fbq = vi.fn();
      trackBeginCheckout();

      expect(window.dataLayer).toContainEqual({
        event: "begin_checkout",
      });
      expect(window.fbq).toHaveBeenCalledWith("track", "InitiateCheckout", {});
    });
  });

  describe("trackGenerateLead", () => {
    it("should push generate_lead and Lead events", () => {
      localStorage.setItem("consent_test", "all");
      window.fbq = vi.fn();
      trackGenerateLead("contact");

      expect(window.dataLayer).toContainEqual({
        event: "generate_lead",
        lead_type: "contact",
      });
      expect(window.fbq).toHaveBeenCalledWith("track", "Lead", {
        content_name: "contact",
        currency: "TRY",
        value: 0,
      });
    });
  });
});

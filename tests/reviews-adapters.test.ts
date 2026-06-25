import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const ORIGINAL_ENV = { ...process.env };

beforeEach(() => {
  vi.resetModules();
  vi.unstubAllGlobals();
});
afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
  vi.unstubAllGlobals();
});

describe("reviews adapters", () => {
  it("google adapter: creds yokken fetch ÇAĞRILMAZ, [] döner", async () => {
    for (const k of [
      "GOOGLE_BUSINESS_OAUTH_CLIENT_ID",
      "GOOGLE_BUSINESS_OAUTH_CLIENT_SECRET",
      "GOOGLE_BUSINESS_OAUTH_REFRESH_TOKEN",
      "GOOGLE_BUSINESS_ACCOUNT_ID",
      "GOOGLE_BUSINESS_LOCATION_ID",
    ]) {
      delete process.env[k];
    }
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    const { googleReviewsAdapter, isGoogleReviewsConfigured } = await import(
      "@/lib/reviews/adapters/google"
    );
    expect(isGoogleReviewsConfigured()).toBe(false);
    await expect(googleReviewsAdapter()).resolves.toEqual([]);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("manuel adapter: 10'luk puanı 5'e indirir, gövdeyi sanitize eder, yazarı maskeler", async () => {
    const { manualAdapter } = await import("@/lib/reviews/adapters/manual");
    const r = manualAdapter({
      sourceKey: "booking",
      rating: 9.2,
      scaleMax: 10,
      reviewBody: 'Çok iyi<script>x</script> https://spam.x/y',
      authorName: "Zeynep Aydın",
      datePublished: "2026-05-01",
    });
    expect(r.rating).toBe(4.6);
    expect(r.reviewBody).not.toContain("script");
    expect(r.reviewBody).not.toContain("http");
    expect(r.authorDisplay).toBe("Zeynep A.");
    expect(r.sourceKey).toBe("booking");
  });

  it("first-party adapter normalize eder; externalId korunur", async () => {
    const { firstPartyAdapter } = await import("@/lib/reviews/adapters/first-party");
    const r = firstPartyAdapter({ externalId: "fp-1", rating: 5, authorName: "Ali Veli" });
    expect(r.sourceKey).toBe("first-party");
    expect(r.externalId).toBe("fp-1");
    expect(r.authorDisplay).toBe("Ali V.");
  });

  it("applyDisplayPolicy: score-and-link/score-only reviewBody'yi düşürür, full-text korur", async () => {
    const { applyDisplayPolicy } = await import("@/lib/reviews/adapters");
    const base = {
      sourceKey: "booking",
      externalId: "b1",
      rating: 4.5,
      reviewBody: "gizli üçüncü-taraf metni",
      authorDisplay: "Can K.",
      datePublished: "2026-05-01",
    };
    expect(applyDisplayPolicy(base, "score-and-link").reviewBody).toBe("");
    expect(applyDisplayPolicy(base, "score-only").reviewBody).toBe("");
    expect(applyDisplayPolicy(base, "full-text").reviewBody).toBe("gizli üçüncü-taraf metni");
  });
});

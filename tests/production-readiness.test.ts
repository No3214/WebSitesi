import { describe, expect, it } from "vitest";

import { getRuntimeReadiness } from "../src/lib/production-readiness";

const readyEnv = {
  NODE_ENV: "production",
  NEXT_PUBLIC_SITE_URL: "https://kozbeylikonagi.com",
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: "0x4AA-real-site-key",
  TURNSTILE_SECRET_KEY: "turnstile-secret",
  UPSTASH_REDIS_REST_URL: "https://upstash.kozbeylikonagi.com",
  UPSTASH_REDIS_REST_TOKEN: "upstash-token",
  NEXT_PUBLIC_HMS_BOOKING_ENGINE_URL: "https://booking.kozbeylikonagi.com/search",
  GARANTI_POS_MODE: "production",
  GARANTI_MERCHANT_ID: "merchant",
  GARANTI_TERMINAL_ID: "terminal",
  GARANTI_PROVISION_USER: "provision",
  GARANTI_3D_STORE_KEY: "store-key",
  NEXT_PUBLIC_GTM_ID: "GTM-ABCDE",
  NEXT_PUBLIC_META_PIXEL_ID: "123456789",
  GA4_MEASUREMENT_ID: "G-ABCDE",
  GA4_API_SECRET: "ga4-secret",
  GOOGLE_SITE_VERIFICATION: "google-verification-token",
};

describe("runtime production readiness", () => {
  it("reports blocked commercial runtime gates without exposing env key names or values", () => {
    const result = getRuntimeReadiness({
      NODE_ENV: "production",
      NEXT_PUBLIC_SITE_URL: "http://localhost:3000",
      PAYLOAD_SECRET: "super-secret-value",
      TURNSTILE_SECRET_KEY: "turnstile-secret-value",
      GA4_API_SECRET: "ga4-secret-value",
    } as NodeJS.ProcessEnv);

    expect(result.ready).toBe(false);
    expect(result.status).toBe("blocked");
    expect(result.blockedGates).toContain("canonical_domain");
    expect(result.blockedGates).toContain("production_abuse_controls");
    expect(result.blockedGates).not.toContain("hms_booking_engine");

    const hmsCheck = result.checks.find((check) => check.id === "hms_booking_engine");
    const canonicalCheck = result.checks.find((check) => check.id === "canonical_domain");
    const abuseCheck = result.checks.find((check) => check.id === "production_abuse_controls");

    expect(canonicalCheck).toMatchObject({
      ready: false,
      configuredCount: 1,
      invalidCount: 1,
      missingCount: 0,
      fallbackApplied: false,
      configurationSource: "invalid",
    });
    expect(abuseCheck).toMatchObject({
      ready: false,
      configuredCount: 1,
      missingCount: 3,
      invalidCount: 0,
      fallbackApplied: false,
      configurationSource: "partial",
    });
    expect(hmsCheck).toMatchObject({
      ready: true,
      configuredCount: 1,
      missingCount: 0,
      fallbackApplied: true,
      configurationSource: "code_fallback",
    });

    const serialized = JSON.stringify(result);
    for (const forbidden of [
      "TURNSTILE_SECRET_KEY",
      "GA4_API_SECRET",
      "PAYLOAD_SECRET",
      "turnstile-secret-value",
      "ga4-secret-value",
      "super-secret-value",
    ]) {
      expect(serialized).not.toContain(forbidden);
    }
  });

  it("reports ready when all runtime launch env groups are meaningfully configured", () => {
    const result = getRuntimeReadiness(readyEnv as NodeJS.ProcessEnv);

    expect(result.ready).toBe(true);
    expect(result.status).toBe("ready");
    expect(result.blockedGates).toEqual([]);
    expect(result.configuredGates).toEqual([
      "canonical_domain",
      "production_abuse_controls",
      "hms_booking_engine",
      "garanti_pos",
      "analytics_purchase",
      "search_local_seo",
    ]);
  });

  it("blocks HMS when an explicit booking engine env value is invalid", () => {
    const result = getRuntimeReadiness({
      ...readyEnv,
      NEXT_PUBLIC_HMS_BOOKING_ENGINE_URL: "http://kozbeyli-invalid.invalid/search",
    } as NodeJS.ProcessEnv);

    const hmsCheck = result.checks.find((check) => check.id === "hms_booking_engine");

    expect(result.ready).toBe(false);
    expect(result.blockedGates).toContain("hms_booking_engine");
    expect(hmsCheck).toMatchObject({
      ready: false,
      configuredCount: 1,
      missingCount: 0,
      invalidCount: 1,
      fallbackApplied: false,
      configurationSource: "invalid",
    });
  });

  it("reports missing and placeholder runtime groups without exposing their key names", () => {
    const result = getRuntimeReadiness({
      NODE_ENV: "production",
      NEXT_PUBLIC_SITE_URL: "https://kozbeylikonagi.com",
      GARANTI_POS_MODE: "replace_with_real_mode",
    } as NodeJS.ProcessEnv);

    const posCheck = result.checks.find((check) => check.id === "garanti_pos");
    const analyticsCheck = result.checks.find((check) => check.id === "analytics_purchase");

    expect(posCheck).toMatchObject({
      ready: false,
      configuredCount: 0,
      missingCount: 4,
      placeholderCount: 1,
      configurationSource: "invalid",
    });
    expect(analyticsCheck).toMatchObject({
      ready: false,
      configuredCount: 0,
      missingCount: 4,
      placeholderCount: 0,
      configurationSource: "missing",
    });
  });
});

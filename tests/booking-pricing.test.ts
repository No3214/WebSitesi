import { describe, expect, it } from "vitest";

import { calculateBookingQuote, getBookingNights, getRoomNightlyRate } from "@/lib/booking-pricing";

describe("booking-pricing", () => {
  it("prices known rooms from the explicit catalog", () => {
    expect(getRoomNightlyRate("standart-deniz-manzarali-oda")).toBe(4500);
    expect(getRoomNightlyRate("uc-kisilik-oda")).toBe(6000);
    expect(getRoomNightlyRate("4-kisilik-aile-odasi-balkonlu")).toBe(7500);
    expect(getRoomNightlyRate("superior-2-kisilik-oda")).toBe(8500);
  });

  it("rejects unknown room slugs instead of substring pricing them", () => {
    expect(getRoomNightlyRate("superior-fake-upgrade")).toBeNull();
    expect(calculateBookingQuote("superior-fake-upgrade", "2026-07-01", "2026-07-03")).toEqual({
      ok: false,
      reason: "unknown-room",
    });
  });

  it("derives nights from a valid check-in/check-out range", () => {
    expect(getBookingNights("2026-07-01", "2026-07-03")).toBe(2);
    expect(calculateBookingQuote("standart-deniz-manzarali-oda", "2026-07-01", "2026-07-03")).toEqual({
      ok: true,
      roomSlug: "standart-deniz-manzarali-oda",
      nightlyRate: 4500,
      nights: 2,
      totalPrice: 9000,
    });
  });

  it("rejects invalid or reversed date ranges", () => {
    expect(getBookingNights("2026-07-01", "2026-07-01")).toBeNull();
    expect(getBookingNights("2026-07-03", "2026-07-01")).toBeNull();
    expect(getBookingNights("2026-02-31", "2026-03-02")).toBeNull();
  });

  it("rejects overly long stays that should become manual offers", () => {
    expect(calculateBookingQuote("standart-deniz-manzarali-oda", "2026-07-01", "2026-09-15")).toEqual({
      ok: false,
      reason: "too-many-nights",
    });
  });
});

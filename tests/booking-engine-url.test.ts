import { describe, expect, it } from "vitest";

import { getBookingEngineHref } from "@/lib/booking-engine-url";

describe("booking-engine-url", () => {
  it("rejects empty, invalid and non-https booking engine urls", () => {
    expect(getBookingEngineHref("")).toBe("");
    expect(getBookingEngineHref("not a url")).toBe("");
    expect(getBookingEngineHref("javascript:alert(1)")).toBe("");
    expect(getBookingEngineHref("http://example.com/booking")).toBe("");
  });

  it("adds website attribution to a clean https booking engine url", () => {
    expect(getBookingEngineHref("https://hotel.example.com/bv3/search")).toBe(
      "https://hotel.example.com/bv3/search?utm_source=website&utm_medium=booking_engine",
    );
  });

  it("preserves existing query params and appends the selected room slug", () => {
    expect(
      getBookingEngineHref("https://hotel.example.com/bv3/search?locale=tr", {
        roomSlug: "standart-deniz-manzarali-oda",
      }),
    ).toBe(
      "https://hotel.example.com/bv3/search?locale=tr&utm_source=website&utm_medium=booking_engine&room=standart-deniz-manzarali-oda",
    );
  });

  it("does not overwrite existing attribution values from the PMS vendor", () => {
    expect(
      getBookingEngineHref("https://hotel.example.com/bv3/search?utm_source=google&utm_medium=cpc"),
    ).toBe("https://hotel.example.com/bv3/search?utm_source=google&utm_medium=cpc");
  });
});

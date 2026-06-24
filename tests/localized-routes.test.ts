import { describe, expect, it } from "vitest";

import { getEnglishHref, getTurkishHref, localizedHref } from "@/lib/localized-routes";

describe("localized routes", () => {
  it("maps core Turkish public routes to English SEO aliases", () => {
    expect(getEnglishHref("/odalar")).toBe("/en/rooms");
    expect(getEnglishHref("/odalar/uc-kisilik-oda")).toBe("/en/rooms/uc-kisilik-oda");
    expect(getEnglishHref("/hikayemiz")).toBe("/en/our-story");
    expect(getEnglishHref("/gastronomi")).toBe("/en/dining");
    expect(getEnglishHref("/organizasyonlar#teklif")).toBe("/en/events#teklif");
    expect(getEnglishHref("/rezervasyon?oda=uc-kisilik-oda")).toBe(
      "/en/booking?oda=uc-kisilik-oda",
    );
    expect(getEnglishHref("/iletisim")).toBe("/en/contact");
    expect(getEnglishHref("/lokasyon")).toBe("/en/location");
  });

  it("normalizes legacy English Turkish-slug routes to canonical aliases", () => {
    expect(getEnglishHref("/en/odalar")).toBe("/en/rooms");
    expect(getEnglishHref("/en/odalar/uc-kisilik-oda")).toBe("/en/rooms/uc-kisilik-oda");
    expect(getEnglishHref("/en/hikayemiz")).toBe("/en/our-story");
    expect(getEnglishHref("/en/sss")).toBe("/en/faq");
  });

  it("maps canonical and legacy English routes back to Turkish paths", () => {
    expect(getTurkishHref("/en/rooms")).toBe("/odalar");
    expect(getTurkishHref("/en/rooms/uc-kisilik-oda")).toBe("/odalar/uc-kisilik-oda");
    expect(getTurkishHref("/en/odalar/uc-kisilik-oda")).toBe("/odalar/uc-kisilik-oda");
    expect(getTurkishHref("/en/contact")).toBe("/iletisim");
    expect(getTurkishHref("/en/booking?oda=uc-kisilik-oda")).toBe(
      "/rezervasyon?oda=uc-kisilik-oda",
    );
  });

  it("keeps external and Turkish links stable when localization is not requested", () => {
    expect(localizedHref("https://kozbeyli-konagi.hmshotel.net", true)).toBe(
      "https://kozbeyli-konagi.hmshotel.net",
    );
    expect(localizedHref("/odalar", false)).toBe("/odalar");
  });
});

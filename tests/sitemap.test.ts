import { describe, expect, it } from "vitest";

import sitemap from "../src/app/sitemap";
import { siteUrl } from "../src/lib/utils";

const BASE_URL = siteUrl;

describe("sitemap", () => {
  it("/rezervasyon ve /iletisim URL'lerini icerir", () => {
    const urls = sitemap().map((entry) => entry.url);

    expect(urls).toContain(`${BASE_URL}/rezervasyon`);
    expect(urls).toContain(`${BASE_URL}/iletisim`);
    expect(urls).toContain(`${BASE_URL}/lokasyon`);
  });

  it("ana sayfayi priority 1 ile listeler", () => {
    const home = sitemap().find((entry) => entry.url === BASE_URL);

    expect(home).toBeDefined();
    expect(home?.priority).toBe(1);
  });

  it("publish envanterindeki TR ve EN sayfalari listeler", () => {
    const urls = sitemap().map((entry) => entry.url);

    [
      "/deneyimler",
      "/deneyimler/kozbeyli-koyu-rehberi",
      "/deneyimler/foca-gezi-rehberi",
      "/deneyimler/ege-gastronomi-rotasi",
      "/teklifler",
      "/menu",
      "/misafir-rehberi",
      "/lokasyon",
      "/odeme",
      "/en",
      "/en/menu",
      "/en/guest-guide",
      "/en/location",
      "/en/events",
      "/en/offers",
    ].forEach((route) => {
      expect(urls).toContain(`${BASE_URL}${route}`);
    });
  });

  it("EN karsiligi olan sayfalarda alternates uretir", () => {
    const entries = sitemap();
    const enMenu = entries.find((entry) => entry.url === `${BASE_URL}/en/menu`);
    const trMenu = entries.find((entry) => entry.url === `${BASE_URL}/menu`);

    expect(enMenu?.alternates?.languages?.tr).toBe(`${BASE_URL}/menu`);
    expect(enMenu?.alternates?.languages?.en).toBe(`${BASE_URL}/en/menu`);
    expect(trMenu?.alternates?.languages?.en).toBe(`${BASE_URL}/en/menu`);
  });
});

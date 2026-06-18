import { describe, expect, it } from "vitest";

import sitemap from "../src/app/sitemap";

const BASE_URL = "https://www.kozbeylikonagi.com.tr";

describe("sitemap", () => {
  it("/rezervasyon ve /iletisim URL'lerini icerir", () => {
    const urls = sitemap().map((entry) => entry.url);

    expect(urls).toContain(`${BASE_URL}/rezervasyon`);
    expect(urls).toContain(`${BASE_URL}/iletisim`);
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
      "/odeme",
      "/en",
      "/en/menu",
      "/en/misafir-rehberi",
      "/en/organizasyonlar",
      "/en/teklifler",
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

import { describe, expect, it } from "vitest";

import sitemap from "../src/app/sitemap";

const BASE_URL = "https://www.kozbeylikonagi.com";

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
});

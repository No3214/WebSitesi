import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const root = process.cwd();
const read = (p: string) => fs.readFileSync(path.join(root, p), "utf8");

describe("dns-prefetch performans ipuclari", () => {
  it("layout, olcum/booking domainleri icin dns-prefetch verir (baglanti/veri yok)", () => {
    const layout = read("src/app/layout.tsx");
    for (const host of [
      "https://www.googletagmanager.com",
      "https://www.google-analytics.com",
      "https://connect.facebook.net",
      "https://app.hms.gen.tr",
    ]) {
      expect(layout).toContain(`rel="dns-prefetch" href="${host}"`);
    }
  });

  it("preconnect KULLANMAZ (consent oncesi baglanti acmamak icin yalniz dns-prefetch)", () => {
    const layout = read("src/app/layout.tsx");
    expect(layout).not.toContain('rel="preconnect"');
  });
});

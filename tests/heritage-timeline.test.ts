import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const root = process.cwd();
const read = (p: string) => fs.readFileSync(path.join(root, p), "utf8");

const COMPONENT = "src/components/heritage-timeline.tsx";
const HISTORY = "src/components/history-client.tsx";
const CSS = "src/app/globals.css";

describe("Heritage timeline kontrati", () => {
  it("history sayfasina bagli (TR/EN ayni bilesen, locale ile)", () => {
    const h = read(HISTORY);
    expect(h).toContain('import { HeritageTimeline } from "@/components/heritage-timeline"');
    expect(h).toContain("<HeritageTimeline locale={locale} />");
  });

  it("yalniz dogrulanmis tarih/olgular; uydurma yil yok", () => {
    const c = read(COMPONENT);
    // history-client ile ayni dogrulanmis capalar
    expect(c).toContain("1870");
    expect(c).toContain("1891");
    expect(c).toContain("2012");
    expect(c).toContain("Living Museum");
    // uydurma kesin yillar gelmesin (mevcut metinde olmayan tarihler)
    for (const bogus of ["1453", "1923", "1950", "1999", "2008", "2020"]) {
      expect(c.includes(bogus), `uydurma tarih: ${bogus}`).toBe(false);
    }
  });

  it("nokta (dot) FadeIn DISINDA render edilir (transform absolute konumu bozmasin)", () => {
    const c = read(COMPONENT);
    const dotIdx = c.indexOf("heritage-timeline-dot");
    const fadeIdx = c.indexOf("<FadeIn>");
    expect(dotIdx).toBeGreaterThan(0);
    expect(fadeIdx).toBeGreaterThan(0);
    // dot, FadeIn acilisindan ONCE gelmeli (li'nin dogrudan cocugu)
    expect(dotIdx).toBeLessThan(fadeIdx);
  });

  it("scroll-hijack YOK (ScrollTrigger/pin/scrub kullanmaz)", () => {
    const c = read(COMPONENT);
    for (const bad of ["ScrollTrigger", "pin:", "scrub", "gsap"]) {
      expect(c.includes(bad), `yasak scroll-hijack: ${bad}`).toBe(false);
    }
  });

  it("hairline omurga + marka noktalari CSS'te", () => {
    const css = read(CSS);
    expect(css).toContain(".heritage-timeline::before");
    expect(css).toContain(".heritage-timeline-dot");
    expect(css).toContain("196, 162, 101"); // antik altin
  });
});

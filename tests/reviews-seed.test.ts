import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const root = process.cwd();
const read = (p: string) => fs.readFileSync(path.join(root, p), "utf8");

describe("reviews seed + README", () => {
  it("seed üç kaynak tipini (api/manual/first-party) içerir, pending baslatir", () => {
    const seed = read("scripts/seed-reviews.ts");
    expect(seed).toContain('type: "api"');
    expect(seed).toContain('type: "manual"');
    expect(seed).toContain('type: "first-party"');
    expect(seed).toContain('status: "pending"');
    // ornek etiketli (gercek-disi marka iddiasi yok)
    expect(seed).toContain("Örnek");
  });

  it("README zorunlu operasyon başlıklarını içerir", () => {
    const readme = read("docs/reviews-orchestration-README.md");
    for (const heading of [
      "DB migration",
      "Moderasyon akışı",
      "Google senkronu",
      "BOOKING_PUBLIC_APPROVAL",
      "self-serving",
      "KVKK",
    ]) {
      expect(readme, heading).toContain(heading);
    }
  });
});

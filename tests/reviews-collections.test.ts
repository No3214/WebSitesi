import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const root = process.cwd();
const read = (p: string) => fs.readFileSync(path.join(root, p), "utf8");

describe("review Payload collections", () => {
  it("4 collection dosyasi dogru slug'larla mevcut", () => {
    const map: Record<string, string> = {
      "payload/collections/ReviewSources.ts": 'slug: "review-sources"',
      "payload/collections/ReviewItems.ts": 'slug: "review-items"',
      "payload/collections/ReviewPublicationRules.ts": 'slug: "review-publication-rules"',
      "payload/collections/ReviewModerationEvents.ts": 'slug: "review-moderation-events"',
    };
    for (const [file, slug] of Object.entries(map)) {
      expect(read(file), file).toContain(slug);
    }
  });

  it("payload.config.ts dort collection'i import edip kaydeder", () => {
    const cfg = read("payload.config.ts");
    for (const name of [
      "ReviewSources",
      "ReviewItems",
      "ReviewPublicationRules",
      "ReviewModerationEvents",
    ]) {
      expect(cfg).toContain(name);
    }
  });

  it("review-items beforeChange sanitize+mask, afterChange revalidateTag('reviews')", () => {
    const items = read("payload/collections/ReviewItems.ts");
    expect(items).toContain("sanitizeReviewBody");
    expect(items).toContain("maskAuthor");
    expect(items).toContain('revalidateTag("reviews")');
    expect(items).toContain("beforeChange");
    expect(items).toContain("afterChange");
  });

  it("review-items public read yalniz published doner (staff degilse)", () => {
    const items = read("payload/collections/ReviewItems.ts");
    expect(items).toContain('status: { equals: "published" }');
    // moderation events ve sources public read'e published filtresi/sinir koyar
    const mod = read("payload/collections/ReviewModerationEvents.ts");
    expect(mod).toContain("isStaff");
  });

  it("rating 1-5 ile sinirli ve relationship'ler dogru hedefler", () => {
    const items = read("payload/collections/ReviewItems.ts");
    expect(items).toContain("min: 1");
    expect(items).toContain("max: 5");
    expect(items).toContain('relationTo: "review-sources"');
  });
});

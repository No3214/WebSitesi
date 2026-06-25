import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const root = process.cwd();
const read = (p: string) => fs.readFileSync(path.join(root, p), "utf8");

describe("reviews public/admin API route handlers", () => {
  it("5 route + cron route mevcut", () => {
    for (const f of [
      "src/app/api/review-summary/route.ts",
      "src/app/api/review-cards/route.ts",
      "src/app/api/review-refresh/[source]/route.ts",
      "src/app/api/review-moderation/[id]/route.ts",
      "src/app/api/review-health/route.ts",
      "src/app/api/cron/sync-google/route.ts",
    ]) {
      expect(fs.existsSync(path.join(root, f)), f).toBe(true);
    }
  });

  it("public uclar yalniz published okur ve 'reviews' tag'i ile cache'lenir", () => {
    const summary = read("src/app/api/review-summary/route.ts");
    const cards = read("src/app/api/review-cards/route.ts");
    for (const src of [summary, cards]) {
      expect(src).toContain('tags: ["reviews"]');
    }
    // store yalniz published doner
    const store = read("src/lib/reviews/store.ts");
    expect(store).toContain('status: { equals: "published" }');
    // displayPolicy uygulanir → score-and-link reviewBody dusurur
    expect(store).toContain("applyDisplayPolicy");
  });

  it("refresh/moderation/health/cron auth korumalı (fail-closed) ve console kullanmaz", () => {
    const refresh = read("src/app/api/review-refresh/[source]/route.ts");
    const mod = read("src/app/api/review-moderation/[id]/route.ts");
    const health = read("src/app/api/review-health/route.ts");
    const cron = read("src/app/api/cron/sync-google/route.ts");
    for (const src of [refresh, mod, health]) {
      expect(src).toContain("isAuthorizedBearer");
      expect(src).toContain("REVIEWS_ADMIN_TOKEN");
      expect(src).toContain('status: 401');
    }
    expect(cron).toContain("CRON_SECRET");
    expect(cron).toContain('status: 401');
    for (const src of [refresh, mod, health, cron]) {
      expect(src).toContain("logEvent");
      expect(src.includes("console.")).toBe(false);
    }
  });

  it("refresh yalniz google'i otomatik kabul eder; moderation event audit yazar", () => {
    const refresh = read("src/app/api/review-refresh/[source]/route.ts");
    expect(refresh).toContain('source !== "google"');
    expect(refresh).toContain("upsertReviews");
    const mod = read("src/app/api/review-moderation/[id]/route.ts");
    expect(mod).toContain("review-moderation-events");
    expect(mod).toContain('revalidateTag("reviews")');
  });

  it("upsert yeni kayitlari pending baslatir (otomatik yayin yok)", () => {
    const store = read("src/lib/reviews/store.ts");
    expect(store).toContain('status: "pending"');
    expect(store).toContain("externalId");
  });

  it("vercel.json gece google cron'unu tanimlar", () => {
    const vercel = read("vercel.json");
    expect(vercel).toContain("/api/cron/sync-google");
    expect(vercel).toContain('"schedule"');
  });
});

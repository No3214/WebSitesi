import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const root = process.cwd();
const read = (p: string) => fs.readFileSync(path.join(root, p), "utf8");

describe("reviews env/config plumbing", () => {
  it("public-env'e Booking onay flag'i eklenir (default false, NEXT_PUBLIC_)", () => {
    const pub = read("src/lib/public-env.ts");
    expect(pub).toContain("NEXT_PUBLIC_BOOKING_PUBLIC_APPROVAL");
    expect(pub).toContain('|| "false"');
    // public-env yalniz NEXT_PUBLIC_ anahtarlari referansli olmali (mevcut kontrat)
    const keys = Array.from(pub.matchAll(/process\.env\.([A-Z0-9_]+)/g)).map((m) => m[1]);
    expect(keys.every((k) => k.startsWith("NEXT_PUBLIC_"))).toBe(true);
  });

  it("env.ts (server) Google Business alanlarini icerir, public-env'e sir sizmaz", () => {
    const env = read("src/lib/env.ts");
    for (const key of [
      "GOOGLE_BUSINESS_OAUTH_CLIENT_ID",
      "GOOGLE_BUSINESS_OAUTH_CLIENT_SECRET",
      "GOOGLE_BUSINESS_OAUTH_REFRESH_TOKEN",
      "GOOGLE_BUSINESS_ACCOUNT_ID",
      "GOOGLE_BUSINESS_LOCATION_ID",
    ]) {
      expect(env).toContain(key);
    }
    const pub = read("src/lib/public-env.ts");
    expect(pub).not.toContain("OAUTH_CLIENT_SECRET");
    expect(pub).not.toContain("REFRESH_TOKEN");
  });

  it(".env.example yeni anahtarlari dokumante eder", () => {
    const ex = read(".env.example");
    expect(ex).toContain("GOOGLE_BUSINESS_OAUTH_CLIENT_ID=");
    expect(ex).toContain("NEXT_PUBLIC_BOOKING_PUBLIC_APPROVAL=false");
  });
});

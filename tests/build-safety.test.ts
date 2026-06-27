import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const root = process.cwd();

/**
 * REGRESYON KİLİDİ — deploy sırasında yıkıcı şema push'u olmamalı.
 *
 * Eskiden vercel.json buildCommand her build'de `scripts/db-push.ts` (Payload
 * drizzle `push`) çalıştırıyordu. Push, mevcut payload tablolarını DROP/RECREATE
 * ederek hem el ile uygulanan RLS'i sıfırlıyor hem de tablo verisini (admin
 * hesabı dahil) wipe etme riski taşıyordu. Bu testler o adımın geri gelmesini
 * ve db-push'un guard'sız kalmasını önler.
 */
describe("build safety: no destructive schema push on deploy", () => {
  it("vercel.json buildCommand does NOT run db-push", () => {
    const vercel = JSON.parse(fs.readFileSync(path.join(root, "vercel.json"), "utf8"));
    expect(String(vercel.buildCommand ?? "")).not.toMatch(/db-push/);
  });

  it("db-push.ts refuses to run unless ALLOW_DB_PUSH=1 is set, before booting Payload", () => {
    const src = fs.readFileSync(path.join(root, "scripts/db-push.ts"), "utf8");
    expect(src).toMatch(/ALLOW_DB_PUSH/);
    expect(src).toMatch(/!==\s*["']1["']/);
    // the guard must come BEFORE any Payload boot (getPayload), so an accidental
    // run exits before touching the schema.
    const guardIdx = src.indexOf("ALLOW_DB_PUSH");
    const bootIdx = src.indexOf("getPayload");
    expect(guardIdx).toBeGreaterThanOrEqual(0);
    expect(bootIdx).toBeGreaterThan(guardIdx);
  });
});

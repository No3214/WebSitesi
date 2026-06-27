import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { Users } from "../payload/collections/Users";

const root = process.cwd();
const payloadDir = path.join(root, "src/app/(payload)");

/**
 * REGRESYON KİLİDİ — Payload route klasör adlandırma konvansiyonu.
 *
 * @payloadcms/next REST handler `params.slug`, admin RootPage `params.segments`
 * okur. Klasörler yanlış adlandırılırsa (örn. [...payload] / [[...payload]]) bu
 * değerler undefined kalır ve bundle `awaitedParams.slug.map(...)` ile HER /api/[...]
 * isteğinde "Cannot read properties of undefined (reading 'map')" -> 500 verir;
 * admin login/create-first-user çalışmaz. Bu test o hatanın geri gelmesini önler.
 */
describe("payload route folder convention (regression lock)", () => {
  it("API catch-all folder is [...slug] with a route.ts", () => {
    expect(fs.existsSync(path.join(payloadDir, "api/[...slug]/route.ts"))).toBe(true);
  });

  it("admin optional catch-all folder is [[...segments]] with a page.tsx", () => {
    expect(fs.existsSync(path.join(payloadDir, "admin/[[...segments]]/page.tsx"))).toBe(true);
  });

  it("does NOT contain the broken [...payload] / [[...payload]] folders", () => {
    expect(fs.existsSync(path.join(payloadDir, "api/[...payload]"))).toBe(false);
    expect(fs.existsSync(path.join(payloadDir, "admin/[[...payload]]"))).toBe(false);
  });

  it("API route.ts types the param as `slug` (not `payload`) and re-exports Payload REST handlers", () => {
    const src = fs.readFileSync(path.join(payloadDir, "api/[...slug]/route.ts"), "utf8");
    expect(src).toMatch(/slug:\s*string\[\]/);
    expect(src).not.toMatch(/payload:\s*string\[\]/);
    expect(src).toMatch(/@payloadcms\/next\/routes/);
    expect(src).toMatch(/REST_GET/);
  });

  it("admin page.tsx types the param as `segments` (not `payload`)", () => {
    const src = fs.readFileSync(path.join(payloadDir, "admin/[[...segments]]/page.tsx"), "utf8");
    expect(src).toMatch(/segments:\s*string\[\]/);
    expect(src).not.toMatch(/payload:\s*string\[\]/);
  });
});

/**
 * GÜVENLİK KİLİDİ — tek yönetici hesabı politikası (Users.beforeValidate).
 * Sahibi tek tam-yetkili admin; ikinci/başka hesap oluşturulamaz.
 */
describe("single-admin policy (Users.beforeValidate)", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const hook = (Users.hooks?.beforeValidate as any[])[0] as (args: any) => Promise<any>;

  const makeReq = (totalDocs: number) => ({
    payload: { count: async () => ({ totalDocs }) },
  });

  it("forces role=admin for the very first user (0 existing)", async () => {
    const data = await hook({
      req: makeReq(0),
      operation: "create",
      data: { email: "owner@kozbeylikonagi.com" },
    });
    expect(data.role).toBe("admin");
  });

  it("blocks creating a second account when a user already exists", async () => {
    await expect(
      hook({ req: makeReq(1), operation: "create", data: { email: "intruder@x.com" } }),
    ).rejects.toThrow(/Tek yönetici hesabı politikası/);
  });

  it("does not interfere with non-create operations", async () => {
    const data = await hook({
      req: makeReq(1),
      operation: "update",
      data: { name: "Yunuscan" },
    });
    expect(data).toEqual({ name: "Yunuscan" });
  });
});

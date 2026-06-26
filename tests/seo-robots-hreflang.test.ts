import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import robots from "@/app/robots";
import { altLanguages, altLanguagesEn } from "@/lib/metadata";

const root = process.cwd();
const read = (p: string) => fs.readFileSync(path.join(root, p), "utf8");

describe("SEO: robots AI botları + hreflang helper", () => {
  it("robots isimli AI botlarını allow eder; admin/api disallow; sitemap bildirir", () => {
    const r = robots();
    const rules = Array.isArray(r.rules) ? r.rules : [r.rules];
    const uas = rules.flatMap((x) => (Array.isArray(x.userAgent) ? x.userAgent : [x.userAgent]));
    for (const bot of [
      "OAI-SearchBot", "GPTBot", "ClaudeBot", "Claude-SearchBot",
      "PerplexityBot", "Google-Extended", "Bingbot",
    ]) {
      expect(uas).toContain(bot);
    }
    for (const rule of rules) {
      expect(rule.disallow).toContain("/admin");
      expect(rule.disallow).toContain("/api");
    }
    expect(String(r.sitemap)).toContain("/sitemap.xml");
  });

  it("altLanguages canonical + tr/en/x-default döner", () => {
    const a = altLanguages("/odalar", "/en/rooms");
    expect(a.canonical).toBe("/odalar");
    expect(a.languages.tr).toBe("/odalar");
    expect(a.languages.en).toBe("/en/rooms");
    expect(a.languages["x-default"]).toBe("/odalar");
  });

  it("altLanguagesEn EN-self canonical + aynı dil setini döner (reciprocal)", () => {
    const a = altLanguagesEn("/odalar", "/en/rooms");
    expect(a.canonical).toBe("/en/rooms");
    expect(a.languages.tr).toBe("/odalar");
    expect(a.languages.en).toBe("/en/rooms");
    expect(a.languages["x-default"]).toBe("/odalar");
  });

  it("ana sayfa hreflang DÜŞMESİN: page.tsx altLanguages kullanır (yalın canonical değil)", () => {
    const page = read("src/app/page.tsx");
    expect(page).toContain('altLanguages("/", "/en")');
  });
});

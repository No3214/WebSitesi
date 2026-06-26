import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const root = process.cwd();
const read = (p: string) => fs.readFileSync(path.join(root, p), "utf8");
const exists = (p: string) => fs.existsSync(path.join(root, p));

describe("App Router shell state'leri (error/loading/not-found)", () => {
  it("global-error root layout hatalarını yakalar: client + kendi <html lang> + reset", () => {
    expect(exists("src/app/global-error.tsx")).toBe(true);
    const src = read("src/app/global-error.tsx");
    // Root layout bypass edildiği için kendi <html>/<body>'sini taşımalı
    expect(src).toContain("'use client'");
    expect(src).toContain("<html");
    expect(src).toContain('lang="tr"');
    expect(src).toContain("<body");
    // reset() ile yeniden deneme aksiyonu olmalı
    expect(src).toContain("reset");
    // Harici CSS'e güvenmemeli (layout bypass) → kritik stiller inline
    expect(src).toContain("backgroundColor");
  });

  it("loading route fallback'i erişilebilir: role=status + aria-busy + sr-only", () => {
    expect(exists("src/app/loading.tsx")).toBe(true);
    const src = read("src/app/loading.tsx");
    expect(src).toContain('role="status"');
    expect(src).toContain('aria-busy="true"');
    expect(src).toContain("aria-live");
    expect(src).toContain("sr-only");
  });

  it("error.tsx ve not-found.tsx korunur (regresyon guard'ı)", () => {
    expect(exists("src/app/error.tsx")).toBe(true);
    expect(exists("src/app/not-found.tsx")).toBe(true);
    const err = read("src/app/error.tsx");
    expect(err).toContain("'use client'");
    expect(err).toContain("reset");
  });
});

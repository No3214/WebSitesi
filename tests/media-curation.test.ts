import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { mediaManifest } from "../src/data/media-manifest";

const root = process.cwd();

function read(relPath: string) {
  return fs.readFileSync(path.join(root, relPath), "utf8");
}

function publicPathOf(assetPath: string) {
  // "/videos/hero.mp4" -> "public/videos/hero.mp4"
  return path.join(root, "public", assetPath.replace(/^\//, ""));
}

describe("media curation contract", () => {
  it("her manifest asseti public/ altinda mevcut ve bos degil", () => {
    for (const asset of mediaManifest) {
      const fp = publicPathOf(asset.path);
      expect(fs.existsSync(fp), `eksik asset: ${asset.path}`).toBe(true);
      expect(fs.statSync(fp).size, `bos asset: ${asset.path}`).toBeGreaterThan(0);
    }
  });

  it("sha256 verilen assetlerin butunlugu korunuyor", () => {
    for (const asset of mediaManifest) {
      if (!asset.sha256) continue;
      const buf = fs.readFileSync(publicPathOf(asset.path));
      const hash = crypto.createHash("sha256").update(buf).digest("hex");
      expect(hash, `hash uyusmazligi: ${asset.path}`).toBe(asset.sha256);
    }
  });

  it("ana sayfa hero onayli montaj hero.mp4'u kullanir (hero-property superseded)", () => {
    const homeHero = read("src/components/home/home-hero.tsx");
    expect(homeHero).toContain('HERO_VIDEO_SRC = "/videos/hero.mp4"');
    expect(homeHero).not.toContain("hero-property.mp4");
  });

  it("/organizasyonlar OG ve Twitter gorseli onayli butik-dugun assetidir", () => {
    const page = read("src/app/organizasyonlar/page.tsx");
    expect(page).toContain("/images/organizasyonlar/butik-dugun.jpg");
    // Misafir/cift yuzu riski tasiyabilen dugun-2 sosyal kart olarak kullanilmaz.
    expect(page).not.toContain("/images/organizasyonlar/dugun/dugun-2.jpg");
  });

  it("organizasyon kartlari onayli urun-yuzu assetlerini referanslar", () => {
    const client = read("src/components/organizations-client.tsx");
    for (const p of [
      "/images/organizasyonlar/butik-dugun.jpg",
      "/images/organizasyonlar/kurumsal-offsite.jpg",
      "/images/organizasyonlar/teras-davet.jpg",
      "/videos/kahvalti-poster.jpg",
    ]) {
      expect(client, `organizasyon karti eksik: ${p}`).toContain(p);
    }
  });

  it("galeri Google Drive profesyonel cekim karelerini icerir", () => {
    const gallery = read("src/data/gallery.ts");
    for (const p of [
      "/images/galeri/tas-cephe.jpg",
      "/images/galeri/aksam-sofrasi.jpg",
      "/images/galeri/konagin-yuzu.jpg",
      "/images/galeri/tas-firin-pide.jpg",
    ]) {
      expect(gallery, `galeri karesi eksik: ${p}`).toContain(p);
    }
  });
});

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
    expect(homeHero).toContain('HERO_MOBILE_VIDEO_SRC = "/videos/hero-mobile.mp4"');
    expect(homeHero).toContain('window.matchMedia("(max-width: 767px)")');
    expect(homeHero).toContain("data-desktop-src={HERO_VIDEO_SRC}");
    expect(homeHero).toContain("data-mobile-src={HERO_MOBILE_VIDEO_SRC}");
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

  it("organizasyon galerisi isim veya izin riski tasiyan dugun detaylarini kullanmaz", () => {
    const client = read("src/components/organizations-client.tsx");
    for (const p of [
      "/images/organizasyonlar/dugun/dugun-1.jpg",
      "/images/organizasyonlar/dugun/dugun-2.jpg",
    ]) {
      expect(client, `isim/izin riski tasiyan dugun gorseli kullanilmamali: ${p}`).not.toContain(p);
    }
  });

  it("organizasyon galerisi onayli mekan ve detay gorselleriyle acilir", () => {
    const client = read("src/components/organizations-client.tsx");
    for (const p of [
      "/images/organizasyonlar/teras-davet.jpg",
      "/images/organizasyonlar/butik-dugun.jpg",
      "/images/organizasyonlar/dugun/dugun-4.jpg",
      "/images/organizasyonlar/dugun/dugun-3.jpg",
    ]) {
      expect(client, `organizasyon galerisi eksik: ${p}`).toContain(p);
    }
  });

  it("organizasyon belgeleri sadece public ve fiyat/iban icermeyen secili dosyalara baglanir", () => {
    const client = read("src/components/organizations-client.tsx");
    const approvedDocs = [
      "/documents/events/kozbeyli-organizasyon-bilgi-formu.pdf",
      "/documents/events/kozbeyli-dugun-nisan-sunum-1.pdf",
      "/documents/events/kozbeyli-dugun-nisan-sunum-2.pdf",
    ];

    for (const doc of approvedDocs) {
      expect(client, `organizasyon belge linki eksik: ${doc}`).toContain(doc);
      const fp = publicPathOf(doc);
      expect(fs.existsSync(fp), `eksik public belge: ${doc}`).toBe(true);
      expect(fs.statSync(fp).size, `bos public belge: ${doc}`).toBeGreaterThan(20_000);
    }

    for (const blocked of [
      "Kozbeyli_Standart_Paket_Teklif.pdf",
      "Kozbeyli_VIP_Paket_Teklif.pdf",
      "KOZBEYLİ KONAĞI ATIŞTIRMALIK Menu.docx",
      "Kozbeyli Konağı Düğün  Ana Yemek Menu.docx",
      "WhatsApp Image 2026-02-24",
      "TR86",
      "TR72",
      "IBAN",
    ]) {
      expect(client, `riskli belge veya banka verisi yayinlanmamali: ${blocked}`).not.toContain(blocked);
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

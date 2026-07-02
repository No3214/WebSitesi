import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { rooms } from "@/data/rooms";

const root = process.cwd();

function read(relPath: string) {
  return fs.readFileSync(path.join(root, relPath), "utf8");
}

describe("oda tanitim videosu (yalniz gercek oda fotograflarindan)", () => {
  it("video tanimlanan her odanin mp4 dosyasi public'te mevcut ve makul boyutta", () => {
    const withVideo = rooms.filter((r) => r.video);
    expect(withVideo.length, "en az bir odada video olmali").toBeGreaterThan(0);
    for (const room of withVideo) {
      expect(room.video, room.slug).toMatch(/^\/videos\/rooms\/.+\.mp4$/);
      const fp = path.join(root, "public", room.video!.replace(/^\//, ""));
      expect(fs.existsSync(fp), `eksik oda videosu: ${room.video}`).toBe(true);
      const size = fs.statSync(fp).size;
      expect(size, `bos video: ${room.video}`).toBeGreaterThan(50_000);
      // web bütçesi: oda tanitim videosu makul kalsin (< 6 MB)
      expect(size, `cok buyuk video: ${room.video}`).toBeLessThan(6_000_000);
    }
  });

  it("video poster-first + erisilebilir olarak render edilir", () => {
    const src = read("src/components/room-detail-client.tsx");
    expect(src).toContain("room.video &&");
    expect(src).toContain('className="room-intro-video"');
    expect(src).toContain("poster={room.images[0]}");
    expect(src).toContain('preload="metadata"');
    expect(src).toContain("playsInline");
    expect(src).toContain("aria-label={`${room.title} — ${copy.introVideo}`}");
    // OWNER KARARI (2026-07-02): video tussuz otomatik oynar. `autoPlay`
    // attribute'u YINE de kullanilmaz -- oynatmayi IntersectionObserver
    // gorunumde tetikler (ilk viewport'ta ag istegi yok, LCP korunur).
    expect(src).not.toContain("autoPlay");
    expect(src).toContain("useAutoplayInView");
  });

  it("owner karari: gorunur kontrol tusu yok; duraklatma tik/klavye ile", () => {
    const src = read("src/components/room-detail-client.tsx");
    // Native controls kaldirildi (tus olmasin) -- sessiz dongulu tanitim.
    expect(src).not.toMatch(/\scontrols\b/);
    expect(src).toContain("loop");
    // WCAG 2.2.2 pause mekanizmasi gorunur buton olmadan saglanir:
    expect(src).toContain("introVideo.togglePlayback");
    expect(src).toContain('e.key === "Enter" || e.key === " "');
  });

  it("autoplay guard'lari paylasilan hook'ta: reduced-motion + Data Saver + in-view", () => {
    const hook = read("src/lib/use-autoplay-video.ts");
    expect(hook).toContain("prefers-reduced-motion");
    expect(hook).toContain("saveData");
    expect(hook).toContain("IntersectionObserver");
    expect(hook).toContain("video.pause()");
  });

  it("uretim scripti repoda (yeniden uretilebilirlik)", () => {
    expect(fs.existsSync(path.join(root, "scripts/make-room-video.sh"))).toBe(true);
  });
});

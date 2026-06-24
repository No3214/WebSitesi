import { describe, expect, it } from "vitest";

import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

type HeroMediaModule = {
  HERO_MEDIA_EXPECTATION: {
    videoPath: string;
    sha256: string;
    width: number;
    height: number;
    activeVideoAssets: Array<{ id: string; videoPath: string }>;
  };
  inspectMp4Structure: (buffer: Buffer) => {
    firstBoxType?: string;
    hasFtyp: boolean;
    hasMoov: boolean;
    hasMdat: boolean;
    moovBeforeMdat: boolean;
  };
  parseMp4Metadata: (buffer: Buffer) => {
    width?: number;
    height?: number;
    durationSec?: number;
    bitrateBps?: number;
    sizeBytes: number;
  };
  auditHeroMedia: () => {
    status: "PASS" | "FAIL";
    sha256: string | null;
    metadata: {
      width?: number;
      height?: number;
    } | null;
    activeVideoMetadata: Record<string, { width?: number; height?: number }>;
    structures: Record<string, { firstBoxType?: string; moovBeforeMdat: boolean }>;
    failures: unknown[];
    checks: Array<{ id: string }>;
  };
  formatHeroMediaAudit: (result: ReturnType<HeroMediaModule["auditHeroMedia"]>) => string;
};

async function loadHeroMediaModule() {
  return (await import(pathToFileURL(path.join(process.cwd(), "scripts/hero-media-audit.mjs")).href)) as HeroMediaModule;
}

describe("hero media audit", () => {
  it("parses the approved opening video metadata without external ffmpeg tooling", async () => {
    const { HERO_MEDIA_EXPECTATION, inspectMp4Structure, parseMp4Metadata } = await loadHeroMediaModule();
    const video = fs.readFileSync(path.join(process.cwd(), HERO_MEDIA_EXPECTATION.videoPath));
    const metadata = parseMp4Metadata(video);
    const structure = inspectMp4Structure(video);

    expect(metadata).toMatchObject({
      width: 1280,
      height: 2276,
      sizeBytes: 6_692_089,
    });
    expect(metadata.durationSec).toBeGreaterThanOrEqual(15.7);
    expect(metadata.durationSec).toBeLessThanOrEqual(15.9);
    expect(metadata.bitrateBps).toBeGreaterThanOrEqual(3_000_000);
    expect(structure).toMatchObject({
      firstBoxType: "ftyp",
      hasFtyp: true,
      hasMoov: true,
      hasMdat: true,
      moovBeforeMdat: true,
    });
  });

  it("keeps active public food/history videos mobile-progressive playable", async () => {
    const { HERO_MEDIA_EXPECTATION, auditHeroMedia } = await loadHeroMediaModule();
    const result = auditHeroMedia();

    for (const asset of HERO_MEDIA_EXPECTATION.activeVideoAssets) {
      expect(result.activeVideoMetadata[asset.videoPath], `${asset.videoPath} metadata`).toMatchObject({
        width: 720,
        height: 1280,
      });
      expect(result.structures[asset.videoPath], `${asset.videoPath} structure`).toMatchObject({
        firstBoxType: "ftyp",
        moovBeforeMdat: true,
      });
      expect(result.checks.map((check) => check.id)).toEqual(
        expect.arrayContaining([
          `active_video_${asset.id}_mp4_boxes`,
          `active_video_${asset.id}_mp4_fast_start`,
          `active_video_${asset.id}_poster`,
        ]),
      );
    }
  });

  it("keeps the opening video quality and provenance gate green", async () => {
    const { HERO_MEDIA_EXPECTATION, auditHeroMedia } = await loadHeroMediaModule();
    const result = auditHeroMedia();

    expect(result.status).toBe("PASS");
    expect(result.failures).toEqual([]);
    expect(result.sha256).toBe(HERO_MEDIA_EXPECTATION.sha256);
    expect(result.metadata).toMatchObject({
      width: HERO_MEDIA_EXPECTATION.width,
      height: HERO_MEDIA_EXPECTATION.height,
    });
    expect(result.checks.map((check) => check.id)).toEqual(
      expect.arrayContaining([
        "hero_video_hash",
        "hero_video_mp4_fast_start",
        "hero_video_dimensions",
        "hero_video_duration",
        "hero_video_bitrate",
        "hero_component_source",
        "hero_autoplay_contract",
        "hero_playwright_contract",
      ]),
    );
  });

  it("formats an operator-readable report for release logs", async () => {
    const { HERO_MEDIA_EXPECTATION, auditHeroMedia, formatHeroMediaAudit } = await loadHeroMediaModule();
    const formatted = formatHeroMediaAudit(auditHeroMedia());

    expect(formatted).toContain("Kozbeyli Konagi hero media audit");
    expect(formatted).toContain("RESULT PASS");
    expect(formatted).toContain("1280x2276");
    expect(formatted).toContain("hero_video_bitrate");
    expect(formatted).toContain(HERO_MEDIA_EXPECTATION.sha256);
  });
});

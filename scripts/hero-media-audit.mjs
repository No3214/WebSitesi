import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = process.cwd();

export const HERO_MEDIA_EXPECTATION = {
  videoPath: "public/videos/hero.mp4",
  publicVideoPath: "/videos/hero.mp4",
  mobileVideoPath: "public/videos/hero-mobile.mp4",
  publicMobileVideoPath: "/videos/hero-mobile.mp4",
  posterPaths: [
    "public/images/hero-video-poster-640.webp",
    "public/images/hero-video-poster-960.webp",
    "public/images/hero-video-poster-1280.webp",
    "public/images/hero-video-poster-1440.webp",
  ],
  sha256: "62bb0b9fc0c71912913d763d1446a768e0718f4f9da689e76c4fe41d6f8b371e",
  mobileSha256: "578dbf601366ce4ab1d0b92536b7f1afa579b9c3aac564001595d6da985f435c",
  width: 1280,
  height: 2276,
  mobileWidth: 720,
  mobileHeight: 1280,
  minDurationSec: 15.7,
  maxDurationSec: 15.9,
  minBitrateBps: 3_000_000,
  minSizeBytes: 6_000_000,
  minMobileBitrateBps: 1_000_000,
  maxMobileSizeBytes: 3_600_000,
  minPosterSizeBytes: 35_000,
  activeVideoAssets: [
    {
      id: "kahvalti",
      label: "Homepage and gastronomy breakfast video",
      videoPath: "public/videos/kahvalti.mp4",
      posterPath: "public/videos/kahvalti-poster.jpg",
      minSizeBytes: 3_500_000,
      minPosterSizeBytes: 35_000,
      minDurationSec: 20,
      minBitrateBps: 1_000_000,
      width: 720,
      height: 1280,
    },
    {
      id: "mihlama",
      label: "Homepage and gastronomy mihlama video",
      videoPath: "public/videos/mihlama.mp4",
      posterPath: "public/videos/mihlama-poster.jpg",
      minSizeBytes: 1_000_000,
      minPosterSizeBytes: 35_000,
      minDurationSec: 8,
      minBitrateBps: 850_000,
      width: 720,
      height: 1280,
    },
    {
      id: "chef",
      label: "Gastronomy chef video",
      videoPath: "public/videos/chef.mp4",
      posterPath: "public/videos/chef-poster.jpg",
      minSizeBytes: 1_500_000,
      minPosterSizeBytes: 35_000,
      minDurationSec: 6,
      minBitrateBps: 1_000_000,
      width: 720,
      height: 1280,
    },
    {
      id: "sunset",
      label: "History sunset video",
      videoPath: "public/videos/sunset.mp4",
      posterPath: "public/videos/sunset-poster.jpg",
      minSizeBytes: 900_000,
      minPosterSizeBytes: 20_000,
      minDurationSec: 7,
      minBitrateBps: 700_000,
      width: 720,
      height: 1280,
    },
  ],
};

function exists(relPath, baseDir = root) {
  return fs.existsSync(path.join(baseDir, relPath));
}

function read(relPath, baseDir = root) {
  return fs.readFileSync(path.join(baseDir, relPath));
}

function readText(relPath, baseDir = root) {
  return fs.readFileSync(path.join(baseDir, relPath), "utf8");
}

function hashFile(relPath, baseDir = root) {
  return crypto.createHash("sha256").update(read(relPath, baseDir)).digest("hex");
}

function readUInt64BE(buffer, offset) {
  const value = buffer.readBigUInt64BE(offset);
  if (value > BigInt(Number.MAX_SAFE_INTEGER)) {
    throw new Error(`MP4 box size is too large to inspect safely at offset ${offset}`);
  }
  return Number(value);
}

function* boxes(buffer, start, end) {
  let offset = start;

  while (offset + 8 <= end) {
    let size = buffer.readUInt32BE(offset);
    const type = buffer.toString("ascii", offset + 4, offset + 8);
    let headerSize = 8;

    if (size === 1) {
      if (offset + 16 > end) throw new Error(`Invalid extended MP4 box header for ${type}`);
      size = readUInt64BE(buffer, offset + 8);
      headerSize = 16;
    } else if (size === 0) {
      size = end - offset;
    }

    if (size < headerSize || offset + size > end) {
      throw new Error(`Invalid MP4 box ${type} at offset ${offset}`);
    }

    yield {
      type,
      start: offset,
      end: offset + size,
      payloadStart: offset + headerSize,
      payloadEnd: offset + size,
    };

    offset += size;
  }
}

function parseMvhd(buffer, box) {
  const version = buffer[box.payloadStart];

  if (version === 0) {
    const timescale = buffer.readUInt32BE(box.payloadStart + 12);
    const duration = buffer.readUInt32BE(box.payloadStart + 16);
    return timescale > 0 ? duration / timescale : undefined;
  }

  if (version === 1) {
    const timescale = buffer.readUInt32BE(box.payloadStart + 20);
    const duration = readUInt64BE(buffer, box.payloadStart + 24);
    return timescale > 0 ? duration / timescale : undefined;
  }

  return undefined;
}

function parseTkhd(buffer, box) {
  if (box.payloadEnd - box.payloadStart < 8) return undefined;

  return {
    width: Math.round(buffer.readUInt32BE(box.payloadEnd - 8) / 65536),
    height: Math.round(buffer.readUInt32BE(box.payloadEnd - 4) / 65536),
  };
}

function parseHdlr(buffer, box) {
  if (box.payloadEnd - box.payloadStart < 12) return undefined;
  return buffer.toString("ascii", box.payloadStart + 8, box.payloadStart + 12);
}

function parseTrack(buffer, trakBox) {
  let dimensions;
  let handler;

  for (const child of boxes(buffer, trakBox.payloadStart, trakBox.payloadEnd)) {
    if (child.type === "tkhd") {
      dimensions = parseTkhd(buffer, child);
    }

    if (child.type === "mdia") {
      for (const mdiaChild of boxes(buffer, child.payloadStart, child.payloadEnd)) {
        if (mdiaChild.type === "hdlr") handler = parseHdlr(buffer, mdiaChild);
      }
    }
  }

  return handler === "vide" ? dimensions : undefined;
}

export function inspectMp4Structure(buffer) {
  const topLevelBoxes = [...boxes(buffer, 0, buffer.length)].map((box) => ({
    type: box.type,
    start: box.start,
    end: box.end,
    size: box.end - box.start,
  }));
  const ftyp = topLevelBoxes.find((box) => box.type === "ftyp");
  const moov = topLevelBoxes.find((box) => box.type === "moov");
  const mdat = topLevelBoxes.find((box) => box.type === "mdat");

  return {
    topLevelBoxes,
    hasFtyp: Boolean(ftyp),
    hasMoov: Boolean(moov),
    hasMdat: Boolean(mdat),
    ftypStart: ftyp?.start,
    moovStart: moov?.start,
    mdatStart: mdat?.start,
    moovBeforeMdat: Boolean(moov && mdat && moov.start < mdat.start),
    firstBoxType: topLevelBoxes[0]?.type,
  };
}

export function parseMp4Metadata(buffer) {
  let durationSec;
  let dimensions;

  for (const box of boxes(buffer, 0, buffer.length)) {
    if (box.type !== "moov") continue;

    for (const child of boxes(buffer, box.payloadStart, box.payloadEnd)) {
      if (child.type === "mvhd") {
        durationSec = parseMvhd(buffer, child);
      }

      if (child.type === "trak") {
        dimensions = parseTrack(buffer, child) || dimensions;
      }
    }
  }

  const bitrateBps = durationSec ? Math.round((buffer.length * 8) / durationSec) : undefined;

  return {
    sizeBytes: buffer.length,
    width: dimensions?.width,
    height: dimensions?.height,
    durationSec,
    bitrateBps,
  };
}

function checkMp4PlaybackStructure(checks, id, label, buffer) {
  const structure = inspectMp4Structure(buffer);

  check(
    checks,
    `${id}_mp4_boxes`,
    `${label} has required MP4 ftyp/moov/mdat boxes`,
    structure.hasFtyp && structure.hasMoov && structure.hasMdat,
    structure.topLevelBoxes.map((box) => `${box.type}@${box.start}`).join(", "),
  );
  check(
    checks,
    `${id}_mp4_fast_start`,
    `${label} keeps moov before mdat for mobile/progressive playback`,
    structure.firstBoxType === "ftyp" && structure.moovBeforeMdat,
    structure.topLevelBoxes.map((box) => `${box.type}@${box.start}`).join(", "),
  );

  return structure;
}

function check(checks, id, label, pass, detail) {
  checks.push({
    id,
    label,
    status: pass ? "PASS" : "FAIL",
    detail,
  });
}

export function auditHeroMedia(options = {}) {
  const baseDir = options.root || root;
  const expected = options.expected || HERO_MEDIA_EXPECTATION;
  const checks = [];
  let metadata = null;
  let mobileMetadata = null;
  let hash = null;
  let mobileHash = null;
  const structures = {};
  const activeVideoMetadata = {};

  const videoExists = exists(expected.videoPath, baseDir);
  check(checks, "hero_video_file", "Hero video file is present", videoExists, expected.videoPath);

  if (videoExists) {
    const video = read(expected.videoPath, baseDir);
    metadata = parseMp4Metadata(video);
    structures[expected.videoPath] = checkMp4PlaybackStructure(
      checks,
      "hero_video",
      "Hero video",
      video,
    );
    hash = crypto.createHash("sha256").update(video).digest("hex");

    check(
      checks,
      "hero_video_hash",
      "Hero video matches the approved media manifest hash",
      hash === expected.sha256,
      hash ? `${hash.slice(0, 12)}...` : "missing hash",
    );
    check(
      checks,
      "hero_video_size",
      "Hero video keeps the premium source size",
      metadata.sizeBytes >= expected.minSizeBytes,
      `${metadata.sizeBytes} bytes`,
    );
    check(
      checks,
      "hero_video_dimensions",
      "Hero video keeps the approved vertical cinematic resolution",
      metadata.width === expected.width && metadata.height === expected.height,
      `${metadata.width || "?"}x${metadata.height || "?"}`,
    );
    check(
      checks,
      "hero_video_duration",
      "Hero video keeps the approved 15.78s cinematic loop length",
      Boolean(metadata.durationSec && metadata.durationSec >= expected.minDurationSec && metadata.durationSec <= expected.maxDurationSec),
      metadata.durationSec ? `${metadata.durationSec.toFixed(3)}s` : "duration unavailable",
    );
    check(
      checks,
      "hero_video_bitrate",
      "Hero video bitrate stays above the visible quality floor",
      Boolean(metadata.bitrateBps && metadata.bitrateBps >= expected.minBitrateBps),
      metadata.bitrateBps ? `${metadata.bitrateBps} bps` : "bitrate unavailable",
    );
  }

  const mobileVideoExists = exists(expected.mobileVideoPath, baseDir);
  check(checks, "hero_mobile_video_file", "Hero mobile video derivative is present", mobileVideoExists, expected.mobileVideoPath);

  if (mobileVideoExists) {
    const mobileVideo = read(expected.mobileVideoPath, baseDir);
    mobileMetadata = parseMp4Metadata(mobileVideo);
    structures[expected.mobileVideoPath] = checkMp4PlaybackStructure(
      checks,
      "hero_mobile_video",
      "Hero mobile video",
      mobileVideo,
    );
    mobileHash = crypto.createHash("sha256").update(mobileVideo).digest("hex");

    check(
      checks,
      "hero_mobile_video_hash",
      "Hero mobile derivative matches the approved media manifest hash",
      mobileHash === expected.mobileSha256,
      mobileHash ? `${mobileHash.slice(0, 12)}...` : "missing hash",
    );
    check(
      checks,
      "hero_mobile_video_size",
      "Hero mobile derivative stays within the mobile performance budget",
      mobileMetadata.sizeBytes <= expected.maxMobileSizeBytes,
      `${mobileMetadata.sizeBytes} bytes`,
    );
    check(
      checks,
      "hero_mobile_video_dimensions",
      "Hero mobile derivative keeps the approved mobile vertical resolution",
      mobileMetadata.width === expected.mobileWidth && mobileMetadata.height === expected.mobileHeight,
      `${mobileMetadata.width || "?"}x${mobileMetadata.height || "?"}`,
    );
    check(
      checks,
      "hero_mobile_video_duration",
      "Hero mobile derivative keeps the approved 15.78s cinematic loop length",
      Boolean(mobileMetadata.durationSec && mobileMetadata.durationSec >= expected.minDurationSec && mobileMetadata.durationSec <= expected.maxDurationSec),
      mobileMetadata.durationSec ? `${mobileMetadata.durationSec.toFixed(3)}s` : "duration unavailable",
    );
    check(
      checks,
      "hero_mobile_video_bitrate",
      "Hero mobile derivative stays above the mobile visible quality floor",
      Boolean(mobileMetadata.bitrateBps && mobileMetadata.bitrateBps >= expected.minMobileBitrateBps),
      mobileMetadata.bitrateBps ? `${mobileMetadata.bitrateBps} bps` : "bitrate unavailable",
    );
  }

  for (const asset of expected.activeVideoAssets || []) {
    const videoExists = exists(asset.videoPath, baseDir);
    check(
      checks,
      `active_video_${asset.id}_file`,
      `${asset.label} file is present`,
      videoExists,
      asset.videoPath,
    );

    if (videoExists) {
      const video = read(asset.videoPath, baseDir);
      const assetMetadata = parseMp4Metadata(video);
      activeVideoMetadata[asset.videoPath] = assetMetadata;
      structures[asset.videoPath] = checkMp4PlaybackStructure(
        checks,
        `active_video_${asset.id}`,
        asset.label,
        video,
      );
      check(
        checks,
        `active_video_${asset.id}_size`,
        `${asset.label} keeps enough source data for visible playback`,
        assetMetadata.sizeBytes >= asset.minSizeBytes,
        `${assetMetadata.sizeBytes} bytes`,
      );
      check(
        checks,
        `active_video_${asset.id}_dimensions`,
        `${asset.label} keeps the approved vertical video dimensions`,
        assetMetadata.width === asset.width && assetMetadata.height === asset.height,
        `${assetMetadata.width || "?"}x${assetMetadata.height || "?"}`,
      );
      check(
        checks,
        `active_video_${asset.id}_duration`,
        `${asset.label} keeps the approved clip length floor`,
        Boolean(assetMetadata.durationSec && assetMetadata.durationSec >= asset.minDurationSec),
        assetMetadata.durationSec ? `${assetMetadata.durationSec.toFixed(3)}s` : "duration unavailable",
      );
      check(
        checks,
        `active_video_${asset.id}_bitrate`,
        `${asset.label} keeps the visible quality bitrate floor`,
        Boolean(assetMetadata.bitrateBps && assetMetadata.bitrateBps >= asset.minBitrateBps),
        assetMetadata.bitrateBps ? `${assetMetadata.bitrateBps} bps` : "bitrate unavailable",
      );
    }

    const posterExists = exists(asset.posterPath, baseDir);
    const posterSize = posterExists ? fs.statSync(path.join(baseDir, asset.posterPath)).size : 0;
    check(
      checks,
      `active_video_${asset.id}_poster`,
      `${asset.label} poster is present`,
      posterExists && posterSize >= asset.minPosterSizeBytes,
      posterExists ? `${posterSize} bytes` : "missing",
    );
  }

  for (const posterPath of expected.posterPaths) {
    const posterExists = exists(posterPath, baseDir);
    const size = posterExists ? fs.statSync(path.join(baseDir, posterPath)).size : 0;
    check(
      checks,
      `poster_${path.basename(posterPath).replace(/[^a-z0-9]/gi, "_").toLowerCase()}`,
      `Hero poster derivative is present: ${posterPath}`,
      posterExists && size >= expected.minPosterSizeBytes,
      posterExists ? `${size} bytes` : "missing",
    );
  }

  const homeHero = exists("src/components/home/home-hero.tsx", baseDir)
    ? readText("src/components/home/home-hero.tsx", baseDir)
    : "";
  const heroSpec = exists("tests/e2e/hero-video.spec.ts", baseDir)
    ? readText("tests/e2e/hero-video.spec.ts", baseDir)
    : "";

  check(
    checks,
    "hero_component_source",
    "Homepage hero uses the approved opening video assets",
    homeHero.includes(`HERO_VIDEO_SRC = "${expected.publicVideoPath}"`) &&
      homeHero.includes(`HERO_MOBILE_VIDEO_SRC = "${expected.publicMobileVideoPath}"`) &&
      homeHero.includes('window.matchMedia("(max-width: 767px)")') &&
      homeHero.includes("data-desktop-src={HERO_VIDEO_SRC}") &&
      homeHero.includes("data-mobile-src={HERO_MOBILE_VIDEO_SRC}") &&
      !homeHero.includes("hero-property.mp4"),
    `${expected.publicMobileVideoPath} + ${expected.publicVideoPath}`,
  );
  check(
    checks,
    "hero_autoplay_contract",
    "Homepage hero keeps mobile-safe muted autoplay attributes",
    ["autoPlay", "muted", "playsInline", 'preload="auto"', 'data-testid="hero-video-toggle"'].every((token) =>
      homeHero.includes(token),
    ),
    "autoPlay + muted + playsInline + preload + visible toggle",
  );
  check(
    checks,
    "hero_playwright_contract",
    "Playwright covers desktop/mobile playback and visual quality",
    heroSpec.includes("expectHeroVideoPlaying") &&
      heroSpec.includes("expectHeroVideoQuality") &&
      heroSpec.includes("mobile also loads") &&
      heroSpec.includes(`width: ${expected.width}`) &&
      heroSpec.includes(`height: ${expected.height}`),
    "tests/e2e/hero-video.spec.ts",
  );

  const failures = checks.filter((item) => item.status === "FAIL");

  return {
    status: failures.length === 0 ? "PASS" : "FAIL",
    expected,
    metadata,
    mobileMetadata,
    activeVideoMetadata,
    structures,
    sha256: hash,
    mobileSha256: mobileHash,
    checks,
    failures,
  };
}

export function formatHeroMediaAudit(result) {
  const lines = [
    "Kozbeyli Konagi hero media audit",
    `RESULT ${result.status}`,
    `Video: ${result.expected.videoPath}`,
  ];

  if (result.metadata) {
    lines.push(
      `Metadata: ${result.metadata.width}x${result.metadata.height}, ${result.metadata.durationSec?.toFixed(3)}s, ${result.metadata.bitrateBps} bps, ${result.metadata.sizeBytes} bytes`,
    );
  }

  if (result.mobileMetadata) {
    lines.push(
      `Mobile metadata: ${result.mobileMetadata.width}x${result.mobileMetadata.height}, ${result.mobileMetadata.durationSec?.toFixed(3)}s, ${result.mobileMetadata.bitrateBps} bps, ${result.mobileMetadata.sizeBytes} bytes`,
    );
  }

  if (result.sha256) lines.push(`SHA-256: ${result.sha256}`);
  if (result.mobileSha256) lines.push(`Mobile SHA-256: ${result.mobileSha256}`);
  lines.push("");

  for (const item of result.checks) {
    lines.push(`${item.status} ${item.id}: ${item.detail}`);
  }

  return lines.join("\n");
}

function main() {
  const result = auditHeroMedia();

  if (process.argv.includes("--json")) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(formatHeroMediaAudit(result));
  }

  const strict = process.argv.includes("--strict");
  if (result.status !== "PASS" || (strict && result.failures.length > 0)) {
    process.exitCode = 1;
  }
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : "";
if (invokedPath && invokedPath === fileURLToPath(import.meta.url)) {
  main();
}

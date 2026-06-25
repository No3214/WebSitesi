// Oda tanitim videolari — YALNIZ her odanin kendi gercek fotograflarindan,
// sifir hallusinasyon. "Videografik" his: her fotoda yavas yon-tutarli PUSH-IN
// (zoompan Ken Burns) + kareler arasi YONLU gecis (smoothleft/right/up).
//
// IKI ASAMA (tek-komut zoompan'da frame-patlamasi/sure bug'i oldugu icin):
//  1) Her foto -> dogru-sureli (DUR sn) tekil push-in klip
//  2) Klipleri xfade yonlu gecislerle birlestir + web-optimize encode
//
// Calistir: node scripts/make-rooms.mjs   (Windows ffmpeg gerekir)
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const ROOT = process.cwd();
const IMG = path.join(ROOT, "public", "images", "odalar");
const OUT = path.join(ROOT, "public", "videos", "rooms");
fs.mkdirSync(OUT, { recursive: true });

const MAP = {
  "standart-bahce-manzarali-oda": "standart-bahce-manzarali-oda",
  "standart-deniz-manzarali-oda": "standart-deniz-manzarali-oda",
  "uc-kisilik-oda": "3-kisilik-oda",
  "4-kisilik-aile-odasi": "aile-odasi-4-kisilik",
  "4-kisilik-aile-odasi-balkonlu": "balkonlu-aile-odasi-4-kisilik",
  "superior-2-kisilik-oda": "superior-oda-deniz-manzarali",
  "superior-3-kisilik-oda": "superior-3-kisilik-oda-deniz-manzarali",
};

const DUR = 3.8, XF = 0.7, FPS = 25, W = 1280, H = 720, OW = 1920, OH = 1080;
const FR = Math.round(DUR * FPS);
const ZE = "min(zoom+0.0009,1.10)";
const XPAN = ["iw/2-(iw/zoom/2)", "(iw-iw/zoom)*0.06", "(iw-iw/zoom)*0.94", "iw/2-(iw/zoom/2)"];
const YPAN = ["ih/2-(ih/zoom/2)", "(ih-ih/zoom)*0.06", "ih/2-(ih/zoom/2)", "(ih-ih/zoom)*0.94"];
const TRANS = ["smoothleft", "smoothright", "smoothup", "slideleft"];

const natSort = (a, b) =>
  a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });

function run(args) {
  return spawnSync("ffmpeg", args, { stdio: "ignore" });
}

// 1. asama: tek foto -> DUR sn push-in klip (dogru sure: -loop sonsuz + -t cikti)
function makeClip(img, idx, tmp) {
  const xp = XPAN[idx % 4], yp = YPAN[idx % 4];
  const clip = path.join(tmp, `c${idx}.mp4`);
  const vf =
    `scale=${OW}:${OH}:force_original_aspect_ratio=increase,crop=${OW}:${OH},` +
    `zoompan=z='${ZE}':x='${xp}':y='${yp}':d=${FR}:s=${W}x${H}:fps=${FPS},` +
    `setsar=1,format=yuv420p`;
  const r = run([
    "-y", "-loop", "1", "-i", img,
    "-vf", vf, "-t", String(DUR), "-an",
    "-c:v", "libx264", "-preset", "veryfast", "-crf", "18", clip,
  ]);
  return r.status === 0 && fs.existsSync(clip) ? clip : null;
}

// 2. asama: klipleri yonlu xfade ile birlestir + web encode
function joinClips(clips, out) {
  const inputs = [];
  clips.forEach((c) => inputs.push("-i", c));
  let filt = "", last = "[0:v]", total = DUR;
  for (let i = 1; i < clips.length; i++) {
    const off = (total - XF).toFixed(3);
    const tr = TRANS[(i - 1) % 4];
    filt += `${last}[${i}:v]xfade=transition=${tr}:duration=${XF}:offset=${off}[x${i}];`;
    last = `[x${i}]`;
    total = total + DUR - XF;
  }
  filt = filt.replace(/;$/, "");
  const args = ["-y", ...inputs];
  if (clips.length > 1) args.push("-filter_complex", filt, "-map", last);
  else args.push("-map", "0:v");
  args.push(
    "-an", "-c:v", "libx264", "-preset", "veryfast",
    "-b:v", "1200k", "-maxrate", "1500k", "-bufsize", "3000k",
    "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-r", String(FPS), out,
  );
  return run(args);
}

let ok = 0, fail = 0;
for (const [slug, folder] of Object.entries(MAP)) {
  const dir = path.join(IMG, folder);
  if (!fs.existsSync(dir)) { console.log(`SKIP ${slug} (yok)`); fail++; continue; }
  const imgs = fs.readdirSync(dir)
    .filter((f) => /\.(jpe?g)$/i.test(f)).sort(natSort)
    .map((f) => path.join(dir, f));
  if (imgs.length < 2) { console.log(`SKIP ${slug} (<2 foto)`); fail++; continue; }
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), `rv-${slug}-`));
  const t0 = Date.now();
  const clips = [];
  let clipFail = false;
  imgs.forEach((img, i) => {
    const c = makeClip(img, i, tmp);
    if (c) clips.push(c); else clipFail = true;
  });
  const out = path.join(OUT, `${slug}.mp4`);
  const r = clips.length >= 2 ? joinClips(clips, out) : { status: 1 };
  fs.rmSync(tmp, { recursive: true, force: true });
  if (!clipFail && r.status === 0 && fs.existsSync(out)) {
    const kb = Math.round(fs.statSync(out).size / 1024);
    console.log(`OK ${slug} (${imgs.length} foto, ${kb}KB, ${((Date.now() - t0) / 1000).toFixed(1)}s)`);
    ok++;
  } else {
    console.log(`FAIL ${slug} (clipFail=${clipFail} status=${r.status})`);
    fail++;
  }
}
console.log(`\nBITTI: ${ok} ok, ${fail} fail`);

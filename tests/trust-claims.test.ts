import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const root = process.cwd();

function read(relPath: string) {
  return fs.readFileSync(path.join(root, relPath), "utf8");
}

// Sahibin dogruladigi gercek olanaklar disindaki marka/donanim ve kanitsiz
// prestij iddialari kamuya acik yuzeylerde yer almamalidir. Bkz:
// docs/media-placement-audit.md ve src/app/llms.txt/route.ts (owner-verified).
// Bu kontrat, ileride bu iddialarin sessizce geri donmesini engeller.
const FORBIDDEN_CLAIMS = [
  "Bose",
  "Nespresso",
  "L'Occitane",
  "Loccitane",
  "Netflix",
  "Smart TV",
  "yerden ısıtma",
  "TripAdvisor",
  "Michelin",
];

// Kamuya acik icerik kaynaklari (UI'da render edilen metin/veri).
const PUBLIC_CONTENT_FILES = [
  "src/data/rooms.ts",
  "src/app/llms.txt/route.ts",
  "public/llms.txt",
  "src/components/organizations-client.tsx",
];

describe("trust & claims guard", () => {
  it("kamuya acik icerik dogrulanmamis marka/donanim iddiasi icermez", () => {
    for (const file of PUBLIC_CONTENT_FILES) {
      const full = path.join(root, file);
      if (!fs.existsSync(full)) continue;
      const content = read(file);
      for (const claim of FORBIDDEN_CLAIMS) {
        expect(
          content.includes(claim),
          `${file} icinde dogrulanmamis iddia bulundu: "${claim}"`,
        ).toBe(false);
      }
    }
  });

  it("oda olanaklari yalniz dogrulanmis jenerik terimlerle ifade edilir", () => {
    const rooms = read("src/data/rooms.ts");
    // Marka adi yerine jenerik karsiliklar kullanilmali.
    expect(rooms).not.toContain("Nespresso Makinesi");
    expect(rooms).not.toContain("Bose Ses Sistemi");
    // Gercek olanaklar korunmali (en az birer referans).
    expect(rooms).toContain("Klima");
    expect(rooms).toMatch(/Televizyon|LCD TV/);
  });
});

import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const checkedRoots = ["src", "public", "docs", "brand"];
const ignoredDirectories = new Set(["node_modules", ".next", "test-results"]);
const heritageAgePatterns = [
  /200\s*yıllık\s+bir\s+hikaye/i,
  /200-year-old\s+story/i,
  /200\s*year\s+old\s+story/i,
  /\b(?:180|200)\s*yıllık\s+tescilli\s+(?:bir\s+)?taş\s+yapı/i,
];
const turkishPublicCopyFiles = [
  "src/dictionaries/tr.json",
  "src/app/iletisim/page.tsx",
  "src/app/teklifler/page.tsx",
  "src/app/rezervasyon/page.tsx",
  "src/app/misafir-rehberi/page.tsx",
  "src/app/sss/page.tsx",
  "src/app/api/swarm/route.ts",
];
const turkishConciergePatterns = [
  /Dijital\s*K[aâ]hya/i,
  /Doğrudan\s+Concierge/i,
  /WhatsApp\s+Concierge/i,
  /WhatsApp\s+concierge/i,
  /concierge\s+ekib/i,
  /concierge\s+ile/i,
  /concierge\s+akış/i,
  /concierge\s+onay/i,
];

function listTextFiles(dir: string): string[] {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((entry) => {
      if (ignoredDirectories.has(entry.name)) return [];
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) return listTextFiles(fullPath);
      if (!/\.(ts|tsx|js|jsx|json|md|txt)$/i.test(entry.name)) return [];
      return fullPath;
    });
}

describe("heritage copy consistency", () => {
  it("does not describe the Kozbeyli heritage story as 200 years old", () => {
    const offenders = checkedRoots
      .flatMap((root) => listTextFiles(path.join(process.cwd(), root)))
      .flatMap((file) => {
        const content = fs.readFileSync(file, "utf8");
        return heritageAgePatterns.some((pattern) => pattern.test(content))
          ? [path.relative(process.cwd(), file)]
          : [];
      });

    expect(offenders).toEqual([]);
  });

  it("keeps the brand knowledge base aligned with the 500-year registered stone heritage claim", () => {
    const about = fs.readFileSync(path.join(process.cwd(), "brand/knowledge_base/optimized_about.md"), "utf8");

    expect(about).toContain("500 yıllık tescilli taş mimari");
    expect(about).not.toMatch(/\b180\s*yıllık\s+tescilli/i);
  });

  it("keeps Turkish public copy free of digital concierge wording", () => {
    const offenders = turkishPublicCopyFiles.flatMap((file) => {
      const content = fs.readFileSync(path.join(process.cwd(), file), "utf8");
      return turkishConciergePatterns.some((pattern) => pattern.test(content)) ? [file] : [];
    });

    expect(offenders).toEqual([]);
  });

  it("uses Turkish reservation support labels on mixed locale booking surfaces", () => {
    const dictionary = fs.readFileSync(path.join(process.cwd(), "src/lib/dictionary.ts"), "utf8");
    const bookingEmbed = fs.readFileSync(path.join(process.cwd(), "src/components/hms-booking-embed.tsx"), "utf8");

    expect(dictionary).toContain("bestPrice: 'Doğrudan Rezervasyon'");
    expect(dictionary).not.toContain("bestPrice: 'Doğrudan Concierge'");
    expect(bookingEmbed).toContain('locale === "tr" ? "WhatsApp Destek"');
    expect(bookingEmbed).not.toContain("Hızlı Destek & Teyit için WhatsApp Concierge");
  });
});

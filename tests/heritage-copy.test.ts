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
});

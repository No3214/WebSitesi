import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const checkedRoots = ["src", "public", "docs"];
const ignoredDirectories = new Set(["node_modules", ".next", "test-results"]);
const heritageAgePatterns = [
  /200\s*yıllık\s+bir\s+hikaye/i,
  /200-year-old\s+story/i,
  /200\s*year\s+old\s+story/i,
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
});

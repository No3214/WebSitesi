import fs from "node:fs";
import path from "node:path";

interface AdPerformance {
  id: string;
  headline: string;
  description: string;
  ctr: number;
  conversions: number;
}

function inputPathFromArgs(args: string[]) {
  const index = args.indexOf("--input");
  return index >= 0 ? args[index + 1] : "";
}

function isAdPerformance(value: unknown): value is AdPerformance {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;

  return (
    typeof item.id === "string" &&
    typeof item.headline === "string" &&
    typeof item.description === "string" &&
    typeof item.ctr === "number" &&
    Number.isFinite(item.ctr) &&
    typeof item.conversions === "number" &&
    Number.isFinite(item.conversions)
  );
}

function readAdPerformanceFile(inputPath: string): AdPerformance[] {
  const absolutePath = path.resolve(process.cwd(), inputPath);
  const parsed = JSON.parse(fs.readFileSync(absolutePath, "utf8")) as unknown;

  if (!Array.isArray(parsed) || !parsed.every(isAdPerformance)) {
    throw new Error(
      "Input must be a JSON array of { id, headline, description, ctr, conversions } records.",
    );
  }

  return parsed;
}

function optimizeInput(data: AdPerformance[]) {
  const thresholdCtr = 1.5;
  const recommendations = data
    .filter((ad) => ad.ctr < thresholdCtr)
    .map((ad) => ({
      id: ad.id,
      currentHeadline: ad.headline,
      reason: `CTR ${ad.ctr}% is below ${thresholdCtr}%. Human review is required before publishing.`,
      proposedHeadline: "Kozbeyli'de Küratörlü Ege Deneyimi",
      proposedDescription:
        "Tarihi taş dokuda Ege misafirperverliği ve Antakya mutfağını keşfedin.",
      mediaPolicy: "copy-only-review",
    }));

  return {
    status: recommendations.length > 0 ? "review_required" : "no_action",
    thresholdCtr,
    generatedAssets: [],
    recommendations,
  };
}

const inputPath = inputPathFromArgs(process.argv.slice(2));

if (!inputPath) {
  console.log(
    JSON.stringify(
      {
        status: "dry-run-only",
        generatedAssets: [],
        writesPerformed: 0,
        instructions:
          "Provide --input path/to/ad-performance.json to produce copy recommendations. This script never renders video or publishes ads.",
      },
      null,
      2,
    ),
  );
  process.exit(0);
}

try {
  const report = optimizeInput(readAdPerformanceFile(inputPath));
  console.log(JSON.stringify({ ...report, writesPerformed: 0 }, null, 2));
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}

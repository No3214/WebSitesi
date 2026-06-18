import fs from "node:fs";
import path from "node:path";

const sourceFiles = [
  {
    id: "heritage",
    path: "src/app/hikayemiz/page.tsx",
    requiredSignals: ["Kozbeyli", "19. yüzyıl", "beş asırlık"],
  },
  {
    id: "gastronomy",
    path: "src/app/gastronomi/page.tsx",
    requiredSignals: ["Antakya", "Dibek", "Ege"],
  },
  {
    id: "events",
    path: "src/components/organizations-client.tsx",
    requiredSignals: ["düğün", "organizasyon", "teklif"],
  },
];

function fileContains(relPath: string, signal: string) {
  const absolutePath = path.join(process.cwd(), relPath);
  if (!fs.existsSync(absolutePath)) return false;
  return fs.readFileSync(absolutePath, "utf8").toLowerCase().includes(signal.toLowerCase());
}

const checks = sourceFiles.map((source) => {
  const missingSignals = source.requiredSignals.filter((signal) => !fileContains(source.path, signal));

  return {
    id: source.id,
    sourcePath: source.path,
    status: missingSignals.length === 0 ? "covered" : "needs-editorial-review",
    missingSignals,
  };
});

const nextEditorialBacklog = checks
  .filter((check) => check.status !== "covered")
  .map((check) => ({
    sourcePath: check.sourcePath,
    missingSignals: check.missingSignals,
    action: "Review the existing page copy against real hotel evidence before editing.",
  }));

console.log(
  JSON.stringify(
    {
      status: nextEditorialBacklog.length === 0 ? "covered" : "needs-editorial-review",
      writesPerformed: 0,
      generatedContentInserted: false,
      checks,
      nextEditorialBacklog,
      note: "Evidence-based GEO scan only. No files are written and no generated claims are inserted.",
    },
    null,
    2,
  ),
);

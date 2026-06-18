import fs from "node:fs";
import path from "node:path";

type Topic = {
  keyword: string;
  intent: string;
  files: string[];
};

const root = process.cwd();
const topics: Topic[] = [
  {
    keyword: "Foça butik otel",
    intent: "direct booking discovery",
    files: ["src/lib/metadata.ts", "src/app/odalar/page.tsx", "src/app/rezervasyon/page.tsx"],
  },
  {
    keyword: "Kozbeyli kahvaltı",
    intent: "restaurant and local experience demand",
    files: ["src/lib/metadata.ts", "src/app/gastronomi/page.tsx", "src/app/menu/page.tsx"],
  },
  {
    keyword: "Antakya mutfağı İzmir",
    intent: "culinary differentiation",
    files: ["src/lib/metadata.ts", "src/app/gastronomi/page.tsx", "src/app/menu/page.tsx"],
  },
  {
    keyword: "tarihi taş konak",
    intent: "heritage stay positioning",
    files: ["src/lib/metadata.ts", "src/app/hikayemiz/page.tsx"],
  },
  {
    keyword: "Foça düğün mekanı",
    intent: "event planner acquisition",
    files: ["src/app/organizasyonlar/page.tsx", "src/components/organizations-client.tsx"],
  },
];

function normalize(value: string) {
  return value
    .toLocaleLowerCase("tr")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

function readIfExists(relPath: string) {
  const fullPath = path.join(root, relPath);
  return fs.existsSync(fullPath) ? fs.readFileSync(fullPath, "utf8") : "";
}

function evaluateTopic(topic: Topic) {
  const needle = normalize(topic.keyword);
  const evidence = topic.files
    .map((file) => ({ file, matched: normalize(readIfExists(file)).includes(needle) }))
    .filter((item) => item.matched);

  return {
    ...topic,
    status: evidence.length > 0 ? "covered" : "gap",
    evidence,
  };
}

function main() {
  const results = topics.map(evaluateTopic);
  const gaps = results.filter((item) => item.status === "gap");

  console.log(
    JSON.stringify(
      {
        timestamp: new Date().toISOString(),
        status: gaps.length === 0 ? "covered" : "needs-editorial-review",
        note: "Evidence-based content gap scan only. No content is published and no generated claims are inserted.",
        topics: results,
        nextEditorialBacklog: gaps.map((gap) => ({
          keyword: gap.keyword,
          intent: gap.intent,
          suggestedAction: "Review existing page copy and add verified, brand-approved content if the topic is commercially important.",
        })),
      },
      null,
      2,
    ),
  );

  if (gaps.length > 0 && process.argv.includes("--strict")) process.exit(1);
}

main();

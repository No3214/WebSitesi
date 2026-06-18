import fs from "node:fs";
import path from "node:path";

type CheckResult = {
  id: string;
  status: "pass" | "fail";
  evidence: string;
};

const root = process.cwd();

function read(relPath: string) {
  return fs.readFileSync(path.join(root, relPath), "utf8");
}

function fileContains(relPath: string, pattern: string | RegExp) {
  const content = read(relPath);
  return typeof pattern === "string" ? content.includes(pattern) : pattern.test(content);
}

function check(id: string, passed: boolean, evidence: string): CheckResult {
  return {
    id,
    status: passed ? "pass" : "fail",
    evidence,
  };
}

function runAudit() {
  const checks = [
    check(
      "metadata-base",
      fileContains("src/lib/metadata.ts", "metadataBase: new URL(env.NEXT_PUBLIC_SITE_URL)"),
      "Default metadata uses NEXT_PUBLIC_SITE_URL through the env helper.",
    ),
    check(
      "hotel-keywords",
      ["foça butik otel", "kozbeyli konağı", "antakya mutfağı izmir"].every((keyword) =>
        fileContains("src/lib/metadata.ts", keyword),
      ),
      "Core Turkish hospitality keywords are present in default metadata.",
    ),
    check(
      "open-graph-image",
      fileContains("src/lib/metadata.ts", "openGraph") && fileContains("src/lib/metadata.ts", "/images/hero.jpg"),
      "Open Graph metadata includes a real approved hero image.",
    ),
    check(
      "hreflang-sitemap",
      fileContains("src/app/sitemap.ts", "alternates") && fileContains("src/app/sitemap.ts", "EN_ROUTES"),
      "Sitemap publishes TR/EN alternates for indexed public routes.",
    ),
    check(
      "robots-indexing",
      fileContains("src/app/robots.ts", "sitemap") && fileContains("src/app/robots.ts", "allow"),
      "robots.ts points crawlers to the sitemap and allows public indexing.",
    ),
    check(
      "llms-context",
      fs.existsSync(path.join(root, "src/app/llms.txt/route.ts")),
      "llms.txt route exists for AI/search context.",
    ),
  ];
  const failures = checks.filter((item) => item.status === "fail");

  return {
    timestamp: new Date().toISOString(),
    status: failures.length === 0 ? "pass" : "fail",
    checks,
    failures,
  };
}

function main() {
  if (!process.argv.includes("--run")) {
    console.log(
      JSON.stringify(
        {
          info: "Static SEO audit ready. Use --run to validate metadata, sitemap, robots and AI context files.",
          commands: ["--run"],
        },
        null,
        2,
      ),
    );
    return;
  }

  const result = runAudit();
  console.log(JSON.stringify(result, null, 2));
  if (result.status !== "pass") process.exit(1);
}

main();

import fs from "node:fs";
import path from "node:path";

export function resolveSafeReportOutputPath(outputPath, { cwd = process.cwd() } = {}) {
  const root = path.resolve(cwd);
  const resolved = path.resolve(root, outputPath);
  const relative = path.relative(root, resolved);

  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error("Output path must stay inside the project directory.");
  }

  const blockedSegments = new Set([".git", ".vercel", "node_modules", ".next"]);
  if (relative.split(path.sep).some((segment) => blockedSegments.has(segment.toLowerCase()))) {
    throw new Error("Output path must not target generated, dependency or VCS directories.");
  }

  if (path.basename(resolved).toLowerCase().startsWith(".env")) {
    throw new Error("Output path must not look like an environment file.");
  }

  return resolved;
}

export function writeSafeReportOutput(outputPath, body, { cwd = process.cwd() } = {}) {
  const resolved = resolveSafeReportOutputPath(outputPath, { cwd });

  fs.mkdirSync(path.dirname(resolved), { recursive: true });
  fs.writeFileSync(resolved, `${body}\n`, "utf8");

  return resolved;
}

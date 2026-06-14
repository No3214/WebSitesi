import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const nextDir = path.resolve(root, ".next");
const relative = path.relative(root, nextDir);

if (relative.startsWith("..") || path.isAbsolute(relative)) {
  throw new Error(`Refusing to clean outside project root: ${nextDir}`);
}

try {
  fs.rmSync(nextDir, {
    force: true,
    maxRetries: 3,
    recursive: true,
    retryDelay: 250,
  });
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  throw new Error(
    `Unable to clean ${nextDir}. Stop any local next start/dev process and retry. ${message}`,
  );
}

import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

function sleep(ms) {
  const buffer = new SharedArrayBuffer(4);
  const view = new Int32Array(buffer);
  Atomics.wait(view, 0, 0, ms);
}

function assertInsideRoot(root, target) {
  const relative = path.relative(root, target);

  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error(`Refusing to clean outside project root: ${target}`);
  }
}

function formatError(error) {
  return error instanceof Error ? error.message : String(error);
}

export function removePath(target, { retries = 8, retryDelay = 300 } = {}) {
  let lastError;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      fs.rmSync(target, {
        force: true,
        maxRetries: 1,
        recursive: true,
        retryDelay,
      });
      return;
    } catch (error) {
      lastError = error;
      if (attempt < retries) sleep(retryDelay * (attempt + 1));
    }
  }

  throw lastError;
}

function cleanStaleBuildDirs(root, logger, removePathFn) {
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    if (!entry.isDirectory() || !entry.name.startsWith(".next-stale-")) continue;

    const staleDir = path.resolve(root, entry.name);
    assertInsideRoot(root, staleDir);

    try {
      removePathFn(staleDir);
    } catch (error) {
      logger.warn(`WARN Could not remove stale Next.js build dir ${staleDir}: ${formatError(error)}`);
    }
  }
}

export function cleanNextBuild({
  root = process.cwd(),
  logger = console,
  now = Date.now,
  removePathFn = removePath,
  renameSync = fs.renameSync,
  existsSync = fs.existsSync,
} = {}) {
  const nextDir = path.resolve(root, ".next");
  assertInsideRoot(root, nextDir);
  cleanStaleBuildDirs(root, logger, removePathFn);

  if (!existsSync(nextDir)) return;

  try {
    removePathFn(nextDir);
    return;
  } catch (primaryError) {
    const staleDir = path.resolve(root, `.next-stale-${now()}`);
    assertInsideRoot(root, staleDir);

    try {
      renameSync(nextDir, staleDir);
      logger.warn(`WARN Moved locked .next build output to ${staleDir}; continuing with a clean build.`);
      try {
        removePathFn(staleDir);
      } catch (staleError) {
        logger.warn(`WARN Could not remove renamed stale build dir ${staleDir}: ${formatError(staleError)}`);
      }
      return;
    } catch (renameError) {
      throw new Error(
        [
          `Unable to clean ${nextDir}.`,
          "Stop any local next start/dev process and retry.",
          `Initial remove failed: ${formatError(primaryError)}.`,
          `Stale rename failed: ${formatError(renameError)}.`,
        ].join(" "),
      );
    }
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] || "").href) {
  cleanNextBuild();
}

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { afterEach, describe, expect, it } from "vitest";

const root = process.cwd();
const tmpDirs: string[] = [];

type CleanNextBuildModule = {
  cleanNextBuild: (args?: {
    root?: string;
    logger?: { warn: (message: string) => void };
    now?: () => number;
    removePathFn?: (target: string) => void;
    renameSync?: (from: string, to: string) => void;
    existsSync?: (target: string) => boolean;
  }) => void;
};

async function loadCleanModule() {
  return (await import(
    pathToFileURL(path.join(root, "scripts/clean-next-build.mjs")).href
  )) as CleanNextBuildModule;
}

function makeTmpDir() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "clean-next-build-"));
  tmpDirs.push(dir);
  return dir;
}

afterEach(() => {
  for (const dir of tmpDirs.splice(0)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

describe("clean-next-build", () => {
  it("removes the current .next build output", async () => {
    const { cleanNextBuild } = await loadCleanModule();
    const baseDir = makeTmpDir();
    const nextDir = path.join(baseDir, ".next");
    fs.mkdirSync(nextDir, { recursive: true });
    fs.writeFileSync(path.join(nextDir, "BUILD_ID"), "stale");

    cleanNextBuild({ root: baseDir, logger: { warn: () => undefined } });

    expect(fs.existsSync(nextDir)).toBe(false);
  });

  it("renames locked .next output so the next build can continue", async () => {
    const { cleanNextBuild } = await loadCleanModule();
    const baseDir = makeTmpDir();
    const nextDir = path.join(baseDir, ".next");
    const staleDir = path.join(baseDir, ".next-stale-12345");
    const calls: string[] = [];
    const warnings: string[] = [];
    let renamed: { from: string; to: string } | undefined;

    cleanNextBuild({
      root: baseDir,
      now: () => 12345,
      logger: { warn: (message) => warnings.push(message) },
      existsSync: (target) => target === nextDir,
      removePathFn: (target) => {
        calls.push(target);
        if (target === nextDir) throw new Error("EPERM: locked .next");
      },
      renameSync: (from, to) => {
        renamed = { from, to };
      },
    });

    expect(renamed).toEqual({ from: nextDir, to: staleDir });
    expect(calls).toEqual([nextDir, staleDir]);
    expect(warnings.join("\n")).toContain("Moved locked .next build output");
  });

  it("cleans stale renamed build directories on later runs", async () => {
    const { cleanNextBuild } = await loadCleanModule();
    const baseDir = makeTmpDir();
    const staleDir = path.join(baseDir, ".next-stale-old");
    fs.mkdirSync(staleDir, { recursive: true });
    fs.writeFileSync(path.join(staleDir, "BUILD_ID"), "old");

    cleanNextBuild({ root: baseDir, logger: { warn: () => undefined } });

    expect(fs.existsSync(staleDir)).toBe(false);
  });
});

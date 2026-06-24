import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { afterEach, describe, expect, it } from "vitest";

const root = process.cwd();
const tmpDirs: string[] = [];

type CodexToolingModule = {
  evaluateCodexToolingReadiness: (options?: {
    rootDir?: string;
    env?: Record<string, string | undefined>;
  }) => {
    decision: string;
    checks: Array<{ id: string; status: string; detail: string }>;
    failures: Array<{ id: string; status: string; detail: string }>;
  };
  parseTomlSections: (text: string) => Record<string, Record<string, unknown>>;
};

async function loadCodexTooling() {
  return (await import(
    pathToFileURL(path.join(root, "scripts/codex-tooling-readiness.mjs")).href
  )) as CodexToolingModule;
}

function makeTmpDir() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "kozbeyli-codex-tooling-"));
  tmpDirs.push(dir);
  return dir;
}

function writeFile(rootDir: string, relPath: string, content: string) {
  const target = path.join(rootDir, relPath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content);
}

function writeMinimalProject(rootDir: string, config: string) {
  writeFile(rootDir, ".codex/config.toml", config);
  writeFile(rootDir, "docs/codex/design-brief.md", "# Design\n");
  writeFile(rootDir, "docs/codex/site-audit.md", "# Audit\n");
  writeFile(rootDir, "docs/codex/web-guidelines-review.md", "# Review\n");
  writeFile(
    rootDir,
    "docs/codex/tooling-report.md",
    "# Tooling\n\nMotion+ uses `npx motion-ai` with `MOTION_TOKEN`.\n",
  );
  writeFile(
    rootDir,
    "AGENTS.md",
    "### Project Tooling\n.codex/config.toml\nMOTION_TOKEN\nAI-generated output\n",
  );
  writeFile(
    rootDir,
    "package.json",
    JSON.stringify({
      scripts: {
        "codex:tooling": "node scripts/codex-tooling-readiness.mjs",
        "codex:tooling:json": "node scripts/codex-tooling-readiness.mjs --json",
      },
    }),
  );
}

afterEach(() => {
  for (const dir of tmpDirs.splice(0)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

describe("Codex tooling readiness", () => {
  it("passes the current project tooling contract", async () => {
    const tooling = await loadCodexTooling();
    const result = tooling.evaluateCodexToolingReadiness({
      rootDir: root,
      env: { ...process.env, MOTION_TOKEN: undefined },
    });

    expect(result.decision).toBe("PASS");
    expect(result.failures).toEqual([]);
    expect(result.checks.map((check) => check.id)).toContain("motion_not_live_mcp");
  });

  it("parses project MCP server sections with hyphenated names", async () => {
    const tooling = await loadCodexTooling();
    const sections = tooling.parseTomlSections(`
[mcp_servers.chrome-devtools]
enabled = true
args = ["/c", "npx", "-y", "chrome-devtools-mcp@latest"]
`);

    expect(sections["mcp_servers.chrome-devtools"]).toMatchObject({
      enabled: true,
      args: ["/c", "npx", "-y", "chrome-devtools-mcp@latest"],
    });
  });

  it("fails if Motion AI Kit is configured as a live MCP server", async () => {
    const tooling = await loadCodexTooling();
    const dir = makeTmpDir();

    writeMinimalProject(
      dir,
      `
[mcp_servers.shadcn]
command = "cmd"
args = ["/c", "npx", "-y", "shadcn@latest", "mcp"]
enabled = true
required = false

[mcp_servers.chrome-devtools]
command = "cmd"
args = ["/c", "npx", "-y", "chrome-devtools-mcp@latest", "--no-usage-statistics", "--isolated", "--redact-network-headers"]
enabled = true
required = false

[mcp_servers.magic]
command = "cmd"
args = ["/c", "npx", "-y", "@21st-dev/magic@latest"]
enabled = false
required = false

[mcp_servers.motion-ai]
command = "cmd"
args = ["/c", "npx", "-y", "motion-ai"]
enabled = true
required = false
`,
    );

    const result = tooling.evaluateCodexToolingReadiness({ rootDir: dir, env: {} });

    expect(result.decision).toBe("FAIL");
    expect(result.failures.map((failure) => failure.id)).toContain("motion_not_live_mcp");
  });

  it("requires Chrome DevTools MCP privacy guardrails", async () => {
    const tooling = await loadCodexTooling();
    const dir = makeTmpDir();

    writeMinimalProject(
      dir,
      `
[mcp_servers.shadcn]
command = "cmd"
args = ["/c", "npx", "-y", "shadcn@latest", "mcp"]
enabled = true
required = false

[mcp_servers.chrome-devtools]
command = "cmd"
args = ["/c", "npx", "-y", "chrome-devtools-mcp@latest"]
enabled = true
required = false

[mcp_servers.magic]
command = "cmd"
args = ["/c", "npx", "-y", "@21st-dev/magic@latest"]
enabled = false
required = false
`,
    );

    const result = tooling.evaluateCodexToolingReadiness({ rootDir: dir, env: {} });
    const chromeFailure = result.failures.find((failure) => failure.id === "mcp_chrome-devtools");

    expect(chromeFailure?.detail).toContain("--no-usage-statistics");
    expect(chromeFailure?.detail).toContain("--redact-network-headers");
  });
});

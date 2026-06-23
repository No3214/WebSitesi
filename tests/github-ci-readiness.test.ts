import path from "node:path";
import { pathToFileURL } from "node:url";

import { describe, expect, it } from "vitest";

type CiModule = {
  evaluateGithubCiReadiness: (input: Record<string, unknown>) => {
    decision: string;
    blockers: string[];
    failedJobs: Array<Record<string, unknown>>;
    annotations: Array<Record<string, unknown>>;
    jobs: Array<Record<string, unknown>>;
    remediation: string[];
  };
  parseGithubRepoFromRemote: (remoteUrl: string) => string;
};

async function loadCiModule() {
  return (await import(
    pathToFileURL(path.join(process.cwd(), "scripts/github-ci-readiness.mjs")).href
  )) as CiModule;
}

const successRun = {
  databaseId: 100,
  status: "completed",
  conclusion: "success",
  headSha: "abc123",
  workflowName: "CI",
  url: "https://github.com/No3214/WebSitesi/actions/runs/100",
};

const qualityJob = {
  id: 200,
  name: "Lint · Unit · Build · Launch Smoke · Publish Verify",
  status: "completed",
  conclusion: "success",
  steps: [{ name: "Checkout" }],
  runner_name: "GitHub Actions 1",
};

describe("github ci readiness", () => {
  it("passes when the latest GitHub Actions run passed", async () => {
    const { evaluateGithubCiReadiness } = await loadCiModule();

    const result = evaluateGithubCiReadiness({
      repo: "No3214/WebSitesi",
      branch: "main",
      run: successRun,
      jobs: [qualityJob],
      annotationsByJobId: {},
    });

    expect(result.decision).toBe("GITHUB CI PASS");
    expect(result.blockers).toEqual([]);
    expect(result.remediation).toEqual([]);
    expect(result.jobs[0]?.stepsAvailable).toBe(true);
  });

  it("identifies GitHub billing and spending-limit account blockers", async () => {
    const { evaluateGithubCiReadiness } = await loadCiModule();

    const result = evaluateGithubCiReadiness({
      repo: "No3214/WebSitesi",
      branch: "main",
      run: { ...successRun, conclusion: "failure" },
      jobs: [{ ...qualityJob, conclusion: "failure", steps: [], runner_name: "" }],
      annotationsByJobId: {
        "200": [
          {
            path: ".github",
            start_line: 1,
            annotation_level: "failure",
            message:
              "The job was not started because recent account payments have failed or your spending limit needs to be increased. Please check the 'Billing & plans' section in your settings",
          },
        ],
      },
    });

    expect(result.decision).toBe("GITHUB CI ACCOUNT BLOCKED");
    expect(result.blockers.join("\n")).toContain("billing/spending limit blocked CI");
    expect(result.remediation.join("\n")).toContain("Billing and plans");
    expect(result.remediation.join("\n")).toContain("npm run github:ci:strict");
    expect(result.annotations[0]?.path).toBe(".github");
  });

  it("reports failed jobs that never started workflow steps", async () => {
    const { evaluateGithubCiReadiness } = await loadCiModule();

    const result = evaluateGithubCiReadiness({
      repo: "No3214/WebSitesi",
      branch: "main",
      run: { ...successRun, conclusion: "failure" },
      jobs: [{ ...qualityJob, conclusion: "failure", steps: [], runner_name: "" }],
      annotationsByJobId: {},
    });

    expect(result.decision).toBe("GITHUB CI FAILED");
    expect(result.failedJobs).toHaveLength(1);
    expect(result.blockers.join("\n")).toContain("failed before any workflow steps ran");
    expect(result.blockers.join("\n")).toContain("did not receive a runner assignment");
    expect(result.remediation.join("\n")).toContain("account/runner startup blocker");
  });

  it("keeps queued and in-progress runs distinct from failures", async () => {
    const { evaluateGithubCiReadiness } = await loadCiModule();

    const result = evaluateGithubCiReadiness({
      repo: "No3214/WebSitesi",
      branch: "main",
      run: { ...successRun, status: "in_progress", conclusion: "" },
      jobs: [{ ...qualityJob, conclusion: "" }],
      annotationsByJobId: {},
    });

    expect(result.decision).toBe("GITHUB CI PENDING");
    expect(result.blockers).toEqual([]);
    expect(result.remediation).toEqual([]);
  });

  it("reports inventory unavailability without pretending CI passed", async () => {
    const { evaluateGithubCiReadiness } = await loadCiModule();

    const result = evaluateGithubCiReadiness({
      available: false,
      repo: "No3214/WebSitesi",
      errors: ["gh: command not found"],
    });

    expect(result.decision).toBe("GITHUB CI INVENTORY UNAVAILABLE");
    expect(result.blockers.join("\n")).toContain("GitHub CLI inventory is unavailable");
    expect(result.remediation.join("\n")).toContain("gh auth login");
  });

  it("parses GitHub repository names from common remote URLs", async () => {
    const { parseGithubRepoFromRemote } = await loadCiModule();

    expect(parseGithubRepoFromRemote("https://github.com/No3214/WebSitesi.git")).toBe("No3214/WebSitesi");
    expect(parseGithubRepoFromRemote("git@github.com:No3214/WebSitesi.git")).toBe("No3214/WebSitesi");
    expect(parseGithubRepoFromRemote("https://example.com/No3214/WebSitesi.git")).toBe("");
  });
});

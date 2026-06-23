import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";

const DEFAULT_REPO = "No3214/WebSitesi";
const DEFAULT_BRANCH = "main";
const BILLING_BLOCKER_PATTERN =
  /recent account payments have failed|spending limit needs to be increased|Billing & plans/i;
const PENDING_STATUSES = new Set(["queued", "in_progress", "waiting", "requested", "pending"]);
const FAILED_CONCLUSIONS = new Set(["failure", "timed_out", "cancelled", "action_required", "startup_failure"]);
const BILLING_REMEDIATIONS = [
  "Open GitHub Settings > Billing and plans for the account or organization that owns this repository.",
  "Resolve failed payments or increase the GitHub Actions spending limit, then rerun the failed workflow.",
  "After a new run completes, run npm run github:ci:strict to confirm CI is green.",
];
const STARTUP_REMEDIATIONS = [
  "Inspect the GitHub Actions run summary for account, runner or hosted-capacity messages.",
  "If no workflow steps ran, resolve the account/runner startup blocker before debugging repository code.",
  "After GitHub starts assigning a runner, rerun npm run github:ci:strict and the local release gates.",
];

function argValue(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] || "" : "";
}

export function parseGithubRepoFromRemote(remoteUrl = "") {
  const value = remoteUrl.trim();
  const httpsMatch = value.match(/github\.com[:/]+([^/\s]+)\/([^/\s]+?)(?:\.git)?$/i);
  if (!httpsMatch) return "";
  return `${httpsMatch[1]}/${httpsMatch[2].replace(/\.git$/i, "")}`;
}

function getDefaultRepo() {
  if (process.env.GITHUB_REPOSITORY) return process.env.GITHUB_REPOSITORY;

  try {
    const remote = execFileSync("git", ["remote", "get-url", "origin"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
    return parseGithubRepoFromRemote(remote) || DEFAULT_REPO;
  } catch {
    return DEFAULT_REPO;
  }
}

function runGh(args) {
  return execFileSync("gh", args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    env: {
      ...process.env,
      GH_PAGER: "",
      NO_COLOR: "1",
    },
  });
}

function runGhJson(args) {
  return JSON.parse(runGh(args));
}

function normalizeRunFromApi(payload) {
  return {
    databaseId: payload.id,
    status: payload.status || "",
    conclusion: payload.conclusion || "",
    headSha: payload.head_sha || "",
    displayTitle: payload.display_title || payload.name || "",
    workflowName: payload.name || payload.workflow_name || "",
    event: payload.event || "",
    createdAt: payload.created_at || "",
    updatedAt: payload.updated_at || "",
    url: payload.html_url || "",
  };
}

function latestRunFromList(repo, branch) {
  const runs = runGhJson([
    "run",
    "list",
    "--repo",
    repo,
    "--branch",
    branch,
    "--limit",
    "1",
    "--json",
    "databaseId,status,conclusion,headSha,displayTitle,workflowName,event,createdAt,updatedAt,url",
  ]);

  return Array.isArray(runs) ? runs[0] || null : null;
}

function runFromId(repo, runId) {
  return normalizeRunFromApi(runGhJson(["api", `repos/${repo}/actions/runs/${runId}`]));
}

function jobsForRun(repo, runId) {
  const payload = runGhJson(["api", `repos/${repo}/actions/runs/${runId}/jobs`]);
  return Array.isArray(payload.jobs) ? payload.jobs : [];
}

function annotationsForCheckRun(repo, checkRunId) {
  try {
    const payload = runGhJson(["api", `repos/${repo}/check-runs/${checkRunId}/annotations`]);
    return Array.isArray(payload) ? payload : [];
  } catch {
    return [];
  }
}

export function collectGithubCiReadiness({
  repo = getDefaultRepo(),
  branch = DEFAULT_BRANCH,
  runId = "",
} = {}) {
  try {
    const run = runId ? runFromId(repo, runId) : latestRunFromList(repo, branch);

    if (!run) {
      return evaluateGithubCiReadiness({
        available: true,
        repo,
        branch,
        run: null,
        jobs: [],
        annotationsByJobId: {},
      });
    }

    const selectedRunId = String(run.databaseId || runId);
    const jobs = jobsForRun(repo, selectedRunId);
    const annotationsByJobId = Object.fromEntries(
      jobs
        .filter((job) => job.conclusion === "failure" || !Array.isArray(job.steps) || job.steps.length === 0)
        .map((job) => [String(job.id), annotationsForCheckRun(repo, job.id)]),
    );

    return evaluateGithubCiReadiness({
      available: true,
      repo,
      branch,
      run,
      jobs,
      annotationsByJobId,
    });
  } catch (error) {
    return evaluateGithubCiReadiness({
      available: false,
      repo,
      branch,
      run: null,
      jobs: [],
      annotationsByJobId: {},
      errors: [error instanceof Error ? error.message : String(error)],
    });
  }
}

function annotationSummary(annotation) {
  return {
    path: annotation.path || "",
    startLine: annotation.start_line || null,
    level: annotation.annotation_level || "",
    message: annotation.message || "",
  };
}

export function evaluateGithubCiReadiness({
  available = true,
  repo = DEFAULT_REPO,
  branch = DEFAULT_BRANCH,
  run = null,
  jobs = [],
  annotationsByJobId = {},
  errors = [],
} = {}) {
  if (!available) {
    return {
      decision: "GITHUB CI INVENTORY UNAVAILABLE",
      scope: "github-actions-read-only-run-and-check-annotations",
      repo,
      branch,
      runId: "",
      status: "",
      conclusion: "",
      headSha: "",
      workflowName: "",
      runUrl: "",
      jobs: [],
      failedJobs: [],
      annotations: [],
      blockers: [
        "GitHub CLI inventory is unavailable; install/authenticate gh and run npm run github:ci.",
      ],
      remediation: [
        "Install/authenticate the GitHub CLI with gh auth login, then rerun npm run github:ci.",
      ],
      errors,
    };
  }

  if (!run) {
    return {
      decision: "GITHUB CI INVENTORY EMPTY",
      scope: "github-actions-read-only-run-and-check-annotations",
      repo,
      branch,
      runId: "",
      status: "",
      conclusion: "",
      headSha: "",
      workflowName: "",
      runUrl: "",
      jobs: [],
      failedJobs: [],
      annotations: [],
      blockers: [`No GitHub Actions runs were found for ${repo}@${branch}.`],
      remediation: ["Push a commit or manually start the CI workflow, then rerun npm run github:ci."],
      errors,
    };
  }

  const normalizedJobs = jobs.map((job) => {
    const annotations = annotationsByJobId[String(job.id)] || [];
    return {
      id: job.id,
      name: job.name || "",
      status: job.status || "",
      conclusion: job.conclusion || "",
      stepsAvailable: Array.isArray(job.steps) && job.steps.length > 0,
      stepCount: Array.isArray(job.steps) ? job.steps.length : 0,
      runnerAssigned: Boolean(job.runner_name || job.runner_id),
      runnerName: job.runner_name || "",
      annotations: annotations.map(annotationSummary),
    };
  });

  const failedJobs = normalizedJobs.filter((job) => FAILED_CONCLUSIONS.has(job.conclusion));
  const annotations = normalizedJobs.flatMap((job) =>
    job.annotations.map((annotation) => ({ jobId: job.id, jobName: job.name, ...annotation })),
  );
  const billingAnnotations = annotations.filter((annotation) =>
    BILLING_BLOCKER_PATTERN.test(annotation.message),
  );
  const emptyStepFailures = failedJobs.filter((job) => !job.stepsAvailable);
  const noRunnerFailures = failedJobs.filter((job) => !job.runnerAssigned);

  let decision = "GITHUB CI FAILED";
  const blockers = [];
  const remediation = [];

  if (PENDING_STATUSES.has(run.status)) {
    decision = "GITHUB CI PENDING";
  } else if (run.conclusion === "success") {
    decision = "GITHUB CI PASS";
  } else if (billingAnnotations.length > 0) {
    decision = "GITHUB CI ACCOUNT BLOCKED";
    blockers.push(
      ...new Set(
        billingAnnotations.map(
          (annotation) =>
            `GitHub account billing/spending limit blocked CI: ${annotation.message}`,
        ),
      ),
    );
    remediation.push(...BILLING_REMEDIATIONS);
  } else if (run.conclusion && FAILED_CONCLUSIONS.has(run.conclusion)) {
    blockers.push(`GitHub Actions run concluded ${run.conclusion}.`);
  }

  if (decision === "GITHUB CI FAILED") {
    for (const job of emptyStepFailures) {
      blockers.push(`${job.name || job.id} failed before any workflow steps ran.`);
    }
    for (const job of noRunnerFailures) {
      blockers.push(`${job.name || job.id} did not receive a runner assignment.`);
    }
    for (const annotation of annotations) {
      blockers.push(`${annotation.jobName || annotation.jobId}: ${annotation.message}`);
    }

    if (emptyStepFailures.length > 0 || noRunnerFailures.length > 0) {
      remediation.push(...STARTUP_REMEDIATIONS);
    }
  }

  return {
    decision,
    scope: "github-actions-read-only-run-and-check-annotations",
    repo,
    branch,
    runId: String(run.databaseId || ""),
    status: run.status || "",
    conclusion: run.conclusion || "",
    headSha: run.headSha || "",
    workflowName: run.workflowName || "",
    runUrl: run.url || "",
    jobs: normalizedJobs,
    failedJobs,
    annotations,
    blockers: [...new Set(blockers)],
    remediation: [...new Set(remediation)],
    errors,
  };
}

export function formatGithubCiReadiness(result) {
  const lines = [
    "Kozbeyli Konagi GitHub Actions CI readiness",
    `Decision: ${result.decision}`,
    `Scope: ${result.scope}`,
    `Repository: ${result.repo}`,
    `Branch: ${result.branch}`,
    `Run: ${result.runId || "n/a"} ${result.runUrl || ""}`.trim(),
    `Workflow: ${result.workflowName || "n/a"}`,
    `Status: ${result.status || "n/a"}; conclusion: ${result.conclusion || "n/a"}`,
    `Head SHA: ${result.headSha || "n/a"}`,
    "",
    "Jobs:",
  ];

  if (result.jobs.length === 0) {
    lines.push("- no jobs available");
  }

  for (const job of result.jobs) {
    lines.push(
      `${job.conclusion === "success" ? "PASS" : job.conclusion === "skipped" ? "SKIP" : "CHECK"} ${job.name || job.id}: status=${job.status || "n/a"} conclusion=${job.conclusion || "n/a"} steps=${job.stepCount} runner=${job.runnerAssigned ? job.runnerName || "assigned" : "none"}`,
    );
    for (const annotation of job.annotations) {
      lines.push(`  annotation: ${annotation.message}`);
    }
  }

  if (result.blockers.length > 0) {
    lines.push("");
    lines.push("Blockers:");
    result.blockers.forEach((blocker) => lines.push(`- ${blocker}`));
  }

  if (result.remediation.length > 0) {
    lines.push("");
    lines.push("Remediation:");
    result.remediation.forEach((item) => lines.push(`- ${item}`));
  }

  if (result.errors.length > 0) {
    lines.push("");
    lines.push("Errors:");
    result.errors.forEach((error) => lines.push(`- ${error}`));
  }

  return lines.join("\n");
}

function main() {
  const strict = process.argv.includes("--strict");
  const json = process.argv.includes("--json");
  const repo = argValue("--repo") || getDefaultRepo();
  const branch = argValue("--branch") || DEFAULT_BRANCH;
  const runId = argValue("--run");
  const result = collectGithubCiReadiness({ repo, branch, runId });

  console.log(json ? JSON.stringify(result, null, 2) : formatGithubCiReadiness(result));
  process.exitCode = strict && result.decision !== "GITHUB CI PASS" ? 1 : 0;
}

if (import.meta.url === pathToFileURL(process.argv[1] || "").href) {
  main();
}

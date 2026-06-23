# GitHub Actions CI Readiness

Last updated: 2026-06-19

This project treats GitHub Actions as a release signal, but the CI runner can fail before project code starts. The `github:ci` gate records that state without mutating GitHub, rerunning jobs, or reading secrets.

## Commands

```powershell
npm run github:ci
npm run github:ci:json
npm run github:ci:strict
```

- `github:ci` prints a human-readable diagnosis.
- `github:ci:json` prints machine-readable run, job, annotation and remediation data.
- `github:ci:strict` exits non-zero unless the selected GitHub Actions run passed.
- By default, the gate compares the latest run's `headSha` with the current local
  `git rev-parse HEAD`. Use `--expected-head-sha <sha>` when checking a specific
  commit from an external release dashboard.

If the latest workflow passed on an older commit, the gate returns
`GITHUB CI STALE` instead of treating the older green run as release evidence.

## Current Known External Blocker

The latest CI failures for `No3214/WebSitesi` start no workflow steps and receive no runner. GitHub check-run annotations report:

```text
The job was not started because recent account payments have failed or your spending limit needs to be increased. Please check the 'Billing & plans' section in your settings
```

This is an account billing or spending-limit blocker, not a repository build failure.
The JSON output includes a `remediation` array so dashboards and handoff notes can
separate "what happened" from "what the account owner must do next" without
parsing free-form blocker text.

## Recovery

1. Account owner opens GitHub Settings -> Billing & plans.
2. Fix failed payment or increase Actions spending limit.
3. Rerun the failed `CI` workflow for the latest `main` commit.
4. Run `npm run github:ci:strict`.
5. Keep local gates green while the account blocker is being resolved:

```powershell
npm run lint
npm run typecheck
npm run test:unit
npm run build
```

## Safety Boundary

The gate is read-only. It uses `gh run list` and `gh api` to inspect run/job/check-run annotations. It does not rerun workflows, change repository settings, change billing, deploy, or print secrets.

# Vercel Operations Runbook

This project is linked to Vercel as `kozbeyli-konagi`. Keep deployment and
domain operations evidence-based; do not mark the commercial launch gate ready
until the commands below prove the live state.

## Local prerequisite check

Run:

```bash
npm run vercel:ops
npm run vercel:env
npm run launch:cutover
```

Expected local decision before final cutover is usually `PASS_WITH_WARNINGS`:
the project link, authenticated Vercel CLI session and repo contracts can pass
while canonical domain evidence still needs action.

`launch:cutover` converts the current 100/100 commercial blockers into an
operator checklist with owner, timing, missing env keys, redacted evidence files,
commands and KPI/review loop. Use the JSON form for handoff dashboards:

```bash
npm run vercel:env:json
npm run launch:cutover:json
```

For the canonical-domain gate, `launch:cutover:json` also emits
`dnsTargetNote` and `dnsTargetRecords`. Use those machine-readable records as
the operator handoff source: apex hosts use Vercel A records, while `www` /
subdomains use the project-specific Vercel CNAME shown in Project Settings or
`vercel domains inspect`.

`vercel:env` reads only production environment variable names from `vercel env
ls`. It never prints values. Use it to distinguish local `.env.local` readiness
from the real Vercel Production inventory before marking any launch gate ready.

When an operator needs to prove that configured production env names also have
non-empty values, prefer Vercel's no-disk `env run` path so secrets are passed
only as process environment variables:

```bash
npm run vercel:env:values
npm run vercel:env:values:strict
```

The wrapper calls `vercel env run` with argument-array execution from an
isolated temporary `.vercel` workspace, so the command works reliably from
PowerShell, cmd and Bash and local `.env` / `.env.local` files cannot mask the
real Production values. The report validates required value shapes without
printing secret values. If `env run` is unavailable, use a temporary snapshot
outside the repository and delete it immediately after the check:

```bash
vercel env pull %TEMP%\kozbeyli-vercel-production.env --environment=production
npm run vercel:env -- --env-file %TEMP%\kozbeyli-vercel-production.env
del %TEMP%\kozbeyli-vercel-production.env
```

The repository also ignores common production snapshot filenames as a guardrail,
but operators should still avoid pulling secrets into the repo root. If deletion
fails, overwrite the temp file with an empty file before retrying deletion.

For individual strict gates that need production env values, use the same
no-disk pattern so an empty Vercel value cannot be hidden by local `.env` files:

```bash
npm run vercel:commercial:verify
npm run vercel:supabase:verify
npm run vercel:abuse:verify
npm run vercel:hms:verify
npm run vercel:garanti:verify
npm run vercel:analytics:verify
npm run vercel:search:verify
```

`vercel:commercial:verify` runs every no-disk commercial Vercel gate and keeps
going after failures, so operators get one complete blocker report instead of
only the first failing env/evidence lane. Use the individual commands for
focused rechecks after fixing a provider or env group.

For a strict handoff gate, run:

```bash
npm run vercel:ops:strict
```

Strict mode fails on warnings. It should only pass when:

- the global Vercel CLI is installed with `npm i -g vercel`;
- one-off `npx vercel` execution is not treated as an installed, persistent
  operator CLI;
- `vercel whoami` confirms an authenticated operator session for env, deploy
  and log operations;
- `.vercel/project.json` points at `kozbeyli-konagi`;
- domain/env scripts are present;
- canonical domain evidence is marked `ready`.
- `npm run vercel:env:values:strict` shows every production env requirement for
  the commercial launch gates is either present in Vercel Production with a
  non-empty value or covered by an approved code fallback.

## Cutover operating model

- Operational goal: move from the current commercial launch score to 100/100
  without confusing code readiness with external proof.
- Owner and timing: each blocked gate in `npm run launch:cutover` names the
  accountable operator and the point in the launch sequence.
- Guest-facing script/copy: keep public booking language conservative until HMS
  and payment evidence are ready; WhatsApp fallback remains the guest-safe path.
- KPI and review loop: each gate must pass its listed verification command and
  keep redacted evidence under `docs/evidence/` before the launch score is raised.

## Canonical domain proof

After DNS and Vercel domain settings are corrected, run:

```bash
npm run domain:verify:strict
npm run launch:smoke:live
```

The domain verifier must show all of the following before evidence is marked
ready:

- no HTTPS-to-HTTP first-hop redirect on either canonical origin;
- both `/api/health` responses return `service: "kozbeyli-konagi"` and the
  current deployment commit;
- both canonical homepages expose the approved opening hero video,
  `/videos/hero.mp4`;
- the Vercel preview remains healthy while the canonical hosts are switched.

`npm run launch:smoke:live` runs the browser smoke suite against
`https://www.kozbeylikonagi.com`. Use `npm run launch:smoke:preview` only when
the Vercel preview host needs a separate check.

Only then update `docs/evidence/canonical-domain.md` from `pending` to `ready`.

## Agentic Vercel operations

Global Vercel CLI is required for reliable agentic operations:

```bash
npm i -g vercel
vercel login
vercel whoami
vercel env ls
npm run vercel:env:values
npm run vercel:env:values:strict
vercel env pull
vercel deploy
vercel logs
```

Do not store secrets in this repository. Use Vercel environment variables and
redacted evidence files under `docs/evidence/`.

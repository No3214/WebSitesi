# Vercel Operations Runbook

This project is linked to Vercel as `kozbeyli-konagi`. Keep deployment and
domain operations evidence-based; do not mark the commercial launch gate ready
until the commands below prove the live state.

## Local prerequisite check

Run:

```bash
npm run vercel:ops
npm run launch:cutover
```

Expected local decision before final cutover is usually `PASS_WITH_WARNINGS`:
the project link and repo contracts can pass while the global Vercel CLI or
canonical domain evidence still needs action.

`launch:cutover` converts the current 100/100 commercial blockers into an
operator checklist with owner, timing, missing env keys, redacted evidence files,
commands and KPI/review loop. Use the JSON form for handoff dashboards:

```bash
npm run launch:cutover:json
```

For a strict handoff gate, run:

```bash
npm run vercel:ops:strict
```

Strict mode fails on warnings. It should only pass when:

- the global Vercel CLI is installed with `npm i -g vercel`;
- `.vercel/project.json` points at `kozbeyli-konagi`;
- domain/env scripts are present;
- canonical domain evidence is marked `ready`.

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

Only then update `docs/evidence/canonical-domain.md` from `pending` to `ready`.

## Agentic Vercel operations

Global Vercel CLI is required for reliable agentic operations:

```bash
npm i -g vercel
vercel login
vercel env pull
vercel deploy
vercel logs
```

Do not store secrets in this repository. Use Vercel environment variables and
redacted evidence files under `docs/evidence/`.

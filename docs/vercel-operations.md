# Vercel Operations Runbook

This project is linked to Vercel as `kozbeyli-konagi`. Keep deployment and
domain operations evidence-based; do not mark the commercial launch gate ready
until the commands below prove the live state.

## Local prerequisite check

Run:

```bash
npm run vercel:ops
```

Expected local decision before final cutover is usually `PASS_WITH_WARNINGS`:
the project link and repo contracts can pass while the global Vercel CLI or
canonical domain evidence still needs action.

For a strict handoff gate, run:

```bash
npm run vercel:ops:strict
```

Strict mode fails on warnings. It should only pass when:

- the global Vercel CLI is installed with `npm i -g vercel`;
- `.vercel/project.json` points at `kozbeyli-konagi`;
- domain/env scripts are present;
- canonical domain evidence is marked `ready`.

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

# Commercial Launch Evidence

This folder is the evidence inbox for the 100/100 commercial go-live gate.

Do not add secrets, database URLs, JWT/access tokens, card data, bank account
details, customer PII, private contracts, or raw payment credentials. Keep
screenshots, PDFs, raw logs, private dashboard URLs and source artifacts in the
source systems. Store only redacted source-system IDs, approval notes and test
summaries here. Guest email addresses and phone numbers must stay in the source
systems; only redacted guest/contact references belong in these evidence files.
Public Kozbeyli Konağı contact channels are allowlisted for context.

`npm run launch:audit` checks these files together with the relevant production
environment variables. `npm run launch:audit:json` returns the same result as
machine-readable JSON for CI, dashboards and agent review. `npm run
launch:audit:live` adds the canonical production `/api/health` runtime lane.
`npm run launch:audit:live:strict` intentionally fails until live production
runtime and all required evidence are ready. `npm run launch:audit:strict` is
kept for local env snapshots.

`npm run evidence:handoff` converts the blocked launch gates into a human
operator checklist with the evidence file, owner, timing, safe source reference
rules, missing environment key names and verification commands. `npm run
evidence:handoff:json` emits the same handoff as machine-readable JSON.
`npm run evidence:handoff:live` adds canonical production `/api/health` runtime
context to the same checklist, so operators can see which gates are production
configured but still missing redacted proof.
When a gate is missing Vercel production environment variables, the handoff also
prints `envSetup` with the exact env names, the Vercel Dashboard path
(`Vercel Dashboard > kozbeyli-konagi > Settings > Environment Variables`) and
the optional CLI fallback (`npm i -g vercel`, `vercel login`, `vercel whoami`).
Use the Dashboard path when Vercel CLI is unavailable. Never paste secret values
or screenshots containing values into these evidence files.

`npm run evidence:templates` prints copy-ready `status: pending` evidence
templates for the currently blocked gates. Use `npm run evidence:templates:json`
for dashboard or agent workflows. Use `npm run evidence:templates -- --all` to
print reference templates for every commercial launch gate, or `npm run
evidence:templates -- --gate hms_booking_engine` for one gate.
`npm run evidence:templates:live` adds the same production runtime context to
the generated templates. Runtime context is diagnostic only; it never replaces
source-system references and does not make a pending evidence file ready.
For local handoff artifacts that do not enter git, use:

```bash
npm run evidence:templates:live:write
npm run evidence:templates:live:write:json
```

Both commands write to `.codex-artifacts/` and reject paths outside the project,
dependency/build folders, VCS folders and `.env*` filenames.

Ready evidence must include redacted source-system references, such as ticket
IDs, dashboard reference IDs, approval note IDs, or UAT run IDs. Use uppercase
opaque IDs like `OPS-1234`, `UAT-5678` or `VERCEL:ENV-20260623`. Do not paste
raw dashboard URLs, local file paths, screenshot/PDF filenames, raw contracts,
credentials, database connection strings, access tokens, card data, bank account
numbers, bank account holder names, customer PII, or private guest data into
this repository.

The IDs above are format examples only. A `ready` file must use real, current
source-system references from your own provider/operator records. The launch
audit rejects a ready file that simply copies `OPS-1234`, `UAT-5678` or
`VERCEL:ENV-20260623` from this README or a generated template.

The launch audit rejects `ready` evidence that has no `date: YYYY-MM-DD`, has a
future date, is more than 45 days old, has no named `owner`, or uses placeholder
source references such as `pending`, `todo`, `tbd`, `none`, `draft` or
`<redacted-source-ids>`, or uses the exact template examples above. It also
rejects ready evidence whose `source_refs` contain raw URLs, local file paths,
attachment filenames, screenshot/PDF/log references or free-form text instead
of redacted source-system IDs.

Each `ready` file must also mention the gate-specific proof topics in the table
below. Generic statements such as "validated in the source system" are not
enough to clear a commercial launch gate.

## Required Evidence Files

| File | Required proof |
| --- | --- |
| `docs/evidence/canonical-domain.md` | Canonical `kozbeylikonagi.com` and `www` health endpoint proof, current Vercel commit match, DNS cutover note. |
| `docs/evidence/production-database.md` | Payload CMS managed Postgres env proof, strong Payload secret, backup/restore policy, restricted dashboard access, redacted persistence UAT. |
| `docs/evidence/production-abuse-controls.md` | Production Turnstile lead-form proof plus Upstash shared rate-limit/replay backend proof. |
| `docs/evidence/hms-booking-engine.md` | Approved HMS handoff URL, new-tab redirect decision, successful booking UAT, cancellation/refund note, stock sync note. |
| `docs/evidence/garanti-pos.md` | Garanti Sanal POS test environment, successful 3DS sandbox payment, failed payment case, callback verification, refund/cancel note. |
| `docs/evidence/analytics-purchase.md` | Production GTM or direct GA4/Google Ads tag, Meta ID, consent mode validation, server-side purchase/booking_complete proof. |
| `docs/evidence/search-local-seo.md` | Search Console ownership, submitted sitemap, Google Business Profile, Hotel Center/free booking links, Apple Business Connect if used. |
| `docs/evidence/legal-dpa.md` | Vendor DPA review, KVKK/yurtdisi aktarim approval, cookie/vendor inventory approval, cancellation/payment terms legal sign-off. |

## File Format

Use this minimal structure:

```md
# Evidence: <gate name>

status: ready
date: YYYY-MM-DD
owner: <person/team>
source_refs: OPS-1234, UAT-5678, VERCEL:ENV-20260623

## Summary

## Proof

## Residual Risk
```

# Commercial Launch Evidence

This folder is the evidence inbox for the 100/100 commercial go-live gate.

Do not add secrets, database URLs, JWT/access tokens, card data, customer PII,
private contracts, or raw payment credentials. Store redacted screenshots,
ticket IDs, approval notes, test summaries, and links to the source systems.
Guest email addresses and phone numbers must stay in the source systems; only
redacted guest/contact references belong in these evidence files. Public
Kozbeyli Konağı contact channels are allowlisted for context.

`npm run launch:audit` checks these files together with the relevant production
environment variables. `npm run launch:audit:json` returns the same result as
machine-readable JSON for CI, dashboards and agent review. `npm run
launch:audit:strict` intentionally fails until all evidence is present and no
gate is blocked.

`npm run evidence:handoff` converts the blocked launch gates into a human
operator checklist with the evidence file, owner, timing, safe source reference
rules, missing environment key names and verification commands. `npm run
evidence:handoff:json` emits the same handoff as machine-readable JSON.

`npm run evidence:templates` prints copy-ready `status: pending` evidence
templates for the currently blocked gates. Use `npm run evidence:templates:json`
for dashboard or agent workflows. Use `npm run evidence:templates -- --all` to
print reference templates for every commercial launch gate, or `npm run
evidence:templates -- --gate hms_booking_engine` for one gate.

Ready evidence must include redacted source-system references, such as ticket
IDs, dashboard permalink IDs, approval note IDs, or UAT run IDs. Do not paste
raw contracts, credentials, database connection strings, access tokens, card
data, customer PII, or private guest data into this repository.

The launch audit rejects `ready` evidence that has no `date: YYYY-MM-DD`, no
named `owner`, or placeholder source references such as `pending`, `todo`,
`tbd`, `none`, `draft` or `<redacted-source-ids>`.

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
source_refs: <ticket-id>, <dashboard-link-id>, <uat-run-id>

## Summary

## Proof

## Residual Risk
```

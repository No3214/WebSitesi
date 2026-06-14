# Commercial Launch Evidence

This folder is the evidence inbox for the 100/100 commercial go-live gate.

Do not add secrets, card data, customer PII, private contracts, or raw payment
credentials. Store redacted screenshots, ticket IDs, approval notes, test
summaries, and links to the source systems.

`npm run launch:audit` checks these files together with the relevant production
environment variables. `npm run launch:audit:json` returns the same result as
machine-readable JSON for CI, dashboards and agent review. `npm run
launch:audit:strict` intentionally fails until all evidence is present and no
gate is blocked.

## Required Evidence Files

| File | Required proof |
| --- | --- |
| `docs/evidence/hms-booking-engine.md` | Live HMS booking engine URL, embed/redirect decision, successful booking UAT, cancellation/refund note, stock sync note. |
| `docs/evidence/garanti-pos.md` | Garanti Sanal POS test environment, successful 3DS sandbox payment, failed payment case, callback verification, refund/cancel note. |
| `docs/evidence/analytics-purchase.md` | Production GTM, GA4, Meta IDs, consent mode validation, server-side purchase/booking_complete proof. |
| `docs/evidence/search-local-seo.md` | Search Console ownership, submitted sitemap, Google Business Profile, Hotel Center/free booking links, Apple Business Connect if used. |
| `docs/evidence/legal-dpa.md` | Vendor DPA review, KVKK/yurtdisi aktarim approval, cookie/vendor inventory approval, cancellation/payment terms legal sign-off. |

## File Format

Use this minimal structure:

```md
# Evidence: <gate name>

status: ready
date: YYYY-MM-DD
owner: <person/team>

## Summary

## Proof

## Residual Risk
```

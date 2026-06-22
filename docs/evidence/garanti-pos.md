# Evidence: Garanti Sanal POS

status: pending
date: 2026-06-18
owner: finance-ops

## Summary

Garanti Sanal POS credentials and payment proof are not stored in the
repository. The launch gate remains blocked until production/sandbox values are
configured in Vercel and the payment callback flow is verified with redacted
evidence.

## Required Proof

- `GARANTI_POS_MODE`, `GARANTI_MERCHANT_ID`, `GARANTI_TERMINAL_ID`,
  `GARANTI_PROVISION_USER`, and `GARANTI_3D_STORE_KEY` are configured in the
  correct Vercel environment.
- One successful 3D Secure sandbox payment is recorded with redacted proof.
- One failed/declined payment path is recorded with the expected user-facing
  result.
- Callback/webhook verification is confirmed without exposing secrets.
- Refund/cancel handling is documented with the finance owner and operational
  process.

## Validation Commands

- `npm run garanti:verify`
- `npm run garanti:verify:json`
- `npm run garanti:verify:strict` after credentials and proof are complete
- `npm run launch:audit:json`
- `npm run launch:audit:strict` after credentials and proof are complete

## Residual Risk

Do not paste raw credentials, card numbers, bank account details, customer PII,
or full bank portal screenshots into this file. Use redacted screenshots,
ticket IDs, and concise test summaries.

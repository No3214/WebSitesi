# Evidence: Legal, DPA And Vendor Approval

status: pending
date: 2026-06-18
owner: management

## Summary

Legal and vendor approval evidence is required before full commercial launch.
This file should contain only redacted approval notes and source-system
references, not private contracts or guest data.

## Required Proof

- Vendor DPA or equivalent data-processing review is approved for analytics,
  booking, payment, CRM, hosting, and email/communication vendors.
- KVKK and cross-border transfer considerations are reviewed for the production
  vendor set.
- Cookie and tracking vendor inventory is approved against the live consent
  behavior.
- Cancellation, payment, refund, and event proposal terms are approved for
  public use.
- Final approval owner and date are recorded.

## Validation Commands

- `npm run launch:audit:json`
- `npm run launch:audit:strict` after approval proof is complete

## Residual Risk

Do not include raw contracts, ID documents, guest PII, payment data, or private
legal correspondence. Use redacted excerpts, ticket IDs, and approval summaries.

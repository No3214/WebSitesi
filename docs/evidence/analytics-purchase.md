# Evidence: Analytics Purchase Tracking

status: pending
date: 2026-06-18
owner: growth-ops

## Summary

Production analytics identifiers and purchase/booking completion validation are
not yet proven. The site must not be marked commercially ready until tracking
works with consent behavior and server-side booking events validated.

Owner-provided public IDs captured on 2026-06-19:

- GA4 Measurement ID: `G-V3R66C3MEF`
- Meta Pixel / Dataset ID: `1781546559309505`
- Google Ads tag ID: `AW-800024713`
- GTM candidates still need source-system confirmation: `GTM-KCG6B4MJ` and
  `GTM-MSL2FLF5`; do not configure both.

Do not use `274214371` as a site tag. It was identified as Google Ads URL
context, not a web tag ID.

## Required Proof

- `NEXT_PUBLIC_META_PIXEL_ID`, `GA4_MEASUREMENT_ID`, and `GA4_API_SECRET` are
  configured in the production deployment.
- Either the correct `NEXT_PUBLIC_GTM_ID` is configured after source-system
  confirmation, or the direct Google tag fallback is configured with
  `NEXT_PUBLIC_GA4_MEASUREMENT_ID` and `NEXT_PUBLIC_GOOGLE_ADS_ID`.
- Consent mode is verified: analytics and marketing tags do not fire before the
  relevant consent choice.
- A successful booking or booking-complete test sends the intended GA4
  Measurement Protocol event.
- Meta Pixel production event visibility is confirmed with redacted Event
  Manager proof.
- Test traffic is labeled or filtered so launch validation does not pollute
  reporting.

## Validation Commands

- `npm run analytics:verify`
- `npm run analytics:verify:strict` after production IDs and proof are complete
- `npm run launch:smoke:live`
- `npm run launch:audit:json`
- `npm run launch:audit:strict` after production IDs and proof are complete

## Residual Risk

Do not mark this file ready with only local browser console proof. The gate
requires production IDs and source-system validation from GTM/GA4/Meta.

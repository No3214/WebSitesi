# Evidence: HMS Booking Engine

status: pending
date: 2026-06-18
owner: reservations-ops

## Summary

The site code supports a new-tab HMS booking engine handoff, but the full
commercial launch gate is not ready until the live HMS URL and booking UAT are
validated in production.

## Required Proof

- `NEXT_PUBLIC_HMS_BOOKING_ENGINE_URL` is configured in Vercel production and
  starts with `https://`.
- The `/rezervasyon` and `/en/rezervasyon` CTAs open the approved HMS booking
  engine in a new tab, not a cramped iframe.
- A real UAT booking flow has been completed with redacted screenshots or a
  source-system ticket ID.
- Cancellation, refund, and modification handling has been confirmed with the
  reservation team.
- Room/rate availability sync ownership is documented, including who fixes
  stale stock before public launch.

## Validation Commands

- `npm run launch:smoke:live`
- `npm run launch:audit:json`
- `npm run launch:audit:strict` after Vercel env and proof are complete

## Residual Risk

Do not change this status to `ready` based only on a visible button or local
fallback URL. The gate requires live HMS configuration plus successful booking
UAT evidence.

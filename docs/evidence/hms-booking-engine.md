# Evidence: HMS Booking Engine

status: pending
date: 2026-06-19
owner: reservations-ops

## Summary

The site code supports a new-tab HMS booking engine handoff to the official
`kozbeyli-konagi.hmshotel.net` booking engine. The full commercial launch gate
is still not ready until a live booking UAT is validated in production.

## Required Proof

- The public booking URL resolves to the approved HTTPS HMS engine. If
  `NEXT_PUBLIC_HMS_BOOKING_ENGINE_URL` is set, it must also be HTTPS; otherwise
  the code fallback must remain the approved HMS URL.
- The public booking target host is `kozbeyli-konagi.hmshotel.net`; another
  hotel, HotelRunner, or generic booking URL is not acceptable even if it uses
  HTTPS.
- The `/rezervasyon` and `/en/rezervasyon` CTAs open the approved HMS booking
  engine in a new tab, not a cramped iframe.
- A real UAT booking flow has been completed with redacted screenshots or a
  source-system ticket ID.
- Cancellation, refund, and modification handling has been confirmed with the
  reservation team.
- Room/rate availability sync ownership is documented, including who fixes
  stale stock before public launch.

## Validation Commands

- `npm run hms:verify:strict`
- `npm run launch:smoke:live`
- `npm run launch:audit:json`
- `npm run launch:audit:strict` after Vercel env and proof are complete

## Residual Risk

Do not change this status to `ready` based only on a visible button, public
fallback URL, or health-check configuration. The gate requires successful
booking UAT evidence.

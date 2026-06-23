# Reservation HMS Handoff Council Review

Date: 2026-06-19
Scope: Header, hero, mobile action bar, room-list, room-detail, FAQ and `/rezervasyon` handoff to the official HMS booking engine.

## Consensus

Use the official HMS engine as the primary guest-facing booking destination:

`https://kozbeyli-konagi.hmshotel.net/?utm_source=website&utm_medium=booking_engine`

The site should keep the local `/rezervasyon` page as a branded support and context page, but the top-right reservation CTA and primary booking buttons should open the official HMS screen in a new tab. Do not iframe the booking engine unless HMS provides a supported widget/script and it passes mobile usability testing.

## Role Review

- Architect: A single `OFFICIAL_HMS_BOOKING_ENGINE_URL` fallback keeps the booking target centralized while still allowing `NEXT_PUBLIC_HMS_BOOKING_ENGINE_URL` to override it in production. Primary CTA components must call the same helper, not hardcode localized `/rezervasyon` routes.
- Security / Privacy: The external link opens with `target="_blank"` and `rel="noopener noreferrer"`. No guest data, payment details or secrets are passed from the site.
- Product / Hospitality: Button copy is shortened to "Rezervasyon" / "Booking" so the flow feels direct and premium rather than explanatory.
- Ops / Performance: New-tab handoff avoids cramped embedded calendars on mobile and avoids adding third-party script cost to the initial page load.
- Red Team: The full commercial launch gate remains evidence-based. A reachable HMS URL is not the same as completed booking UAT, payment UAT or legal approval. Wrong-property URLs such as another hotel or generic HotelRunner link must be rejected.
- Implementer: Keep the change small, add contract tests for the URL helper, header, mobile, room-detail, HMS target verifier and `/rezervasyon` flow, then verify with build and Playwright.

## Verification Plan

- `npx vitest run --project unit tests/booking-engine-url.test.ts tests/production-contracts.test.ts`
- `npm run vercel:hms:verify`
- `npx tsc --noEmit`
- `npm run lint`
- `npm run build`
- `npx playwright test tests/e2e/site-smoke.spec.ts --reporter=line`
- `npm run release:verify`

## Rollback Plan

Revert the commit and restore primary CTA links to localized `/rezervasyon` routes. The local reservation support page and WhatsApp fallback remain available.

## Remaining Manual Evidence

Before marking the HMS commercial launch gate ready, operations still need a redacted UAT record showing date selection, guest count, room selection, booking confirmation behavior, cancellation/refund notes and vendor ownership of the HMS URL.

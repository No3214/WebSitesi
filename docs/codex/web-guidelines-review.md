# Web Guidelines Review

Date: 2026-06-24

## Product Story

Guest discovers the property, validates real media and location, compares rooms or restaurant/event offer, then uses a direct call, location, WhatsApp, or HMS booking CTA.

## Verification Lens

Browser -> public route -> media/CTA -> external booking or contact handoff.

## Current Alignment

- Public routes and live domain are covered by release gates.
- Opening hero video presence is checked in live HTML by `domain:verify:json`.
- Mobile CTAs are treated as core conversion elements.
- Legal, booking, analytics, and provider readiness are separated from design polish.
- Light theme direction is now the documented default for public content pages.

## Risks To Keep Watching

- Video can be present in HTML but fail autoplay on specific mobile browsers because of browser policy, codec, or low-power/data settings. Keep poster imagery strong and use Playwright plus real-device checks when changing media.
- English localization can regress through shared metadata. Keep contract tests around room capacity, location labels, and CTA labels.
- External review suggestions must be filtered for evidence. Do not add unverifiable ratings, awards, or policies.
- Any shadcn/Magic/Motion output must be reviewed against the Kozbeyli brand and media provenance rules before use.

## Recommended Gate Order

1. `npm run lint`
2. `npm run typecheck`
3. `npm run test:unit`
4. `npm run build`
5. `npm run launch:smoke`
6. `npm run test:stress`
7. `npm run domain:verify:json`
8. `npm run readiness:summary:json`

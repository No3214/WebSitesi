# Evidence: Search And Local SEO

status: pending
date: 2026-06-18
owner: growth-ops

## Summary

Search Console ownership, local profile verification, and hotel-specific search
surfaces need source-system proof before full public launch.

## Required Proof

- `GOOGLE_SITE_VERIFICATION` is configured for the canonical production domain.
- Google Search Console ownership is verified for `kozbeylikonagi.com`.
- The production sitemap is submitted and accepted.
- Google Business Profile ownership and primary business details are verified.
- Google Hotel Center or free booking links are reviewed if used for hotel
  distribution.
- Apple Business Connect is reviewed if the business uses Apple Maps local
  discovery.

## Validation Commands

- `npm run search:verify`
- `npm run search:verify:strict` after Search Console, local profile and hotel
  discovery proof is complete
- `npm run domain:verify`
- `npm run launch:audit:json`
- `npm run launch:audit:strict` after search/local proof is complete

## Residual Risk

Do not mark this file ready while the canonical domain still serves the old
landing page. Search proof must reference the final production domain.

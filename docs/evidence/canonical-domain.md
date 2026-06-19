# Evidence: Canonical Domain

status: pending
date: 2026-06-19
owner: launch-qa

## Summary

Canonical domain validation is not ready yet. The Vercel preview deployment at
`https://kozbeyli-konagi.vercel.app` serves the current application and
`/api/health`, but `https://kozbeylikonagi.com` and
`https://www.kozbeylikonagi.com` do not currently serve the same Next.js
application health endpoint. The apex domain also performs an insecure first
hop redirect from HTTPS to `http://www.kozbeylikonagi.com/...`, so the canonical
cutover must correct both the target deployment and the redirect chain.

## Proof

Use `npm run domain:verify` to reproduce the check. The gate requires both
canonical origins to return `/api/health` JSON with
`service: "kozbeyli-konagi"` and a deployment commit matching the current
production commit. It also requires the canonical homepage HTML to expose the
approved opening hero video asset, `/videos/hero.mp4`, so a stale landing page
or static placeholder cannot pass as production-ready. Until both checks pass,
the canonical domain is not considered production-ready even if the Vercel
preview URL is healthy.

As of 2026-06-19, `npm run domain:verify:json` reports these concrete blockers:

- `https://kozbeylikonagi.com` first redirects to insecure HTTP before reaching
  `www`.
- `https://www.kozbeylikonagi.com/api/health` returns the old/non-app surface
  instead of `service: "kozbeyli-konagi"`.
- Both canonical homepages still render the stale landing page and do not expose
  `/videos/hero.mp4`.

## Residual Risk

DNS/Cloudflare/Vercel domain configuration must be corrected outside the code
repository. The first redirect hop must remain HTTPS, both canonical origins
must serve the current Vercel app, and `npm run domain:verify:strict` should
pass before the evidence status is changed to `ready`.

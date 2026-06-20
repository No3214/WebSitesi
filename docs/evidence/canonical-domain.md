# Evidence: Canonical Domain

status: pending
date: 2026-06-20
owner: launch-qa

## Summary

Canonical domain validation is not ready yet. The Vercel production deployment
at `https://kozbeyli-konagi.vercel.app` serves the current application and
`/api/health`, but `https://kozbeylikonagi.com` and
`https://www.kozbeylikonagi.com` still resolve to the old Joomla/HotelRunner
surface instead of the current Next.js application. The apex domain also
performs an insecure first hop redirect from HTTPS to
`http://www.kozbeylikonagi.com/...`, so the canonical cutover must correct both
the DNS/host target and the redirect chain.

The public-domain gate also monitors the active Turkish ccTLD brand surfaces.
Those domains must not remain on a split legacy menu/site after the canonical
launch, because guests can still reach them from search results or old links.

## Proof

Use `npm run domain:verify` to reproduce the check. The gate requires both
canonical origins to return `/api/health` JSON with
`service: "kozbeyli-konagi"` and a deployment commit matching the current
production commit. It also requires the canonical homepage HTML to expose the
approved opening hero video asset, `/videos/hero.mp4`, so a stale landing page
or static placeholder cannot pass as production-ready. Until both checks pass,
the canonical domain is not considered production-ready even if the Vercel
preview URL is healthy.

The verifier also checks NS/MX records. If the local system DNS resolver is
unavailable, it falls back to DNS-over-HTTPS and reports the source used for NS
and MX results. DNS warnings do not make a stale web deployment ready; the
health endpoint, current commit, secure redirect chain and hero video checks
remain the launch blockers.

As of 2026-06-20, `npm run domain:verify:json` reports these concrete blockers:

- `https://kozbeylikonagi.com` first redirects to insecure HTTP before reaching
  `www`.
- Both canonical origins serve legacy host signatures:
  `legacy Joomla/Seagull template` and
  `legacy HotelRunner hosted landing surface`.
- `https://www.kozbeylikonagi.com/api/health` returns legacy HTML/404 instead
  of `service: "kozbeyli-konagi"` JSON.
- Both canonical homepages still render the stale landing page and do not
  expose `/videos/hero.mp4`.
- The verifier now checks the `.com.tr` brand origins as separate public
  surfaces, requiring the same `/api/health`, current commit, secure redirect
  and opening hero video proof before full public-domain launch is considered
  ready.
- The Turkish ccTLD brand origins currently return HTML for `/api/health`
  instead of the expected `service: "kozbeyli-konagi"` JSON, and their
  homepages do not expose the approved `/videos/hero.mp4` opening shell.
- DNS NS/MX can be verified through DNS-over-HTTPS, so the remaining blocker is
  web serving/redirect cutover, not missing nameserver or mail records.
- The verifier now separates registrar ownership from live DNS authority. A
  domain may be registered at Isimtescil while live DNS is delegated to
  Cloudflare nameservers; in that state, Isimtescil DNS-zone edits do not affect
  public traffic until nameservers are moved.
- The current Vercel cutover target records are reported in the verifier output.
  For this project, `vercel domains inspect` currently expects `A 76.76.21.21`
  for apex and `www` hosts. Re-run the inspect command before DNS edits because
  Vercel can return project-specific A/CNAME values. The Turkish ccTLD brand
  origins must also serve the current app or securely redirect to the chosen
  canonical app. Existing MX/TXT/SPF/DKIM/DMARC records must be preserved when
  changing the authoritative DNS provider.

## Residual Risk

DNS/Cloudflare/Vercel domain configuration must be corrected outside the code
repository. The first redirect hop must remain HTTPS, both canonical origins
must serve the current Vercel app, and `npm run domain:verify:strict` should
pass before the evidence status is changed to `ready`.

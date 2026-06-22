# Evidence: Canonical Domain

status: ready
date: 2026-06-22
owner: launch-qa
source_refs: npm run domain:verify 2026-06-22; Vercel project kozbeyli-konagi; Isimtescil DNS update 2026-06-22

## Summary

The production web target for this project is `kozbeylikonagi.com` and
`www.kozbeylikonagi.com`. The Turkish `.com.tr` property is not part of this
launch gate and must not block the `www.kozbeylikonagi.com` deployment.

The canonical `.com` validation is live for the current Vercel application:
`https://kozbeylikonagi.com` redirects over HTTPS to
`https://www.kozbeylikonagi.com`, and both canonical origins return
`/api/health` JSON with `service: "kozbeyli-konagi"` at the deployment commit reported by
`npm run domain:verify`. Both homepages expose the approved opening hero video,
`/videos/hero.mp4`, and no legacy host signatures are detected on the `.com`
origins.

## Proof

Run `npm run domain:verify` to reproduce the check. The gate requires the Vercel
preview, the apex `.com` origin and the `www` origin to return current
application health and to expose the approved opening hero video shell.

Verified production signals:

- `https://kozbeylikonagi.com` returns a secure redirect to
  `https://www.kozbeylikonagi.com/`; no HTTPS-to-HTTP first hop remains.
- `https://kozbeylikonagi.com/api/health` and
  `https://www.kozbeylikonagi.com/api/health` return
  `service: "kozbeyli-konagi"` and the current production deployment commit.
- Both `.com` homepages expose `/videos/hero.mp4`.
- The verifier keeps `legacy Joomla/Seagull template` and
  `legacy HotelRunner hosted landing surface` detection so stale routing cannot
  pass as production-ready.
- DNS diagnostics preserve existing mail continuity checks for
  `mx.kozbeylikonagi.com` and separate DNS shape warnings from web-origin
  readiness. A verified web origin is the primary launch proof.
- Isimtescil `Host Name (DNS) Yönetimi` was updated to
  `NS1.VERCEL-DNS.COM,NS2.VERCEL-DNS.COM`; Vercel DNS contains the observed
  mail-continuity records and the Vercel web targets.

The `.com.tr` site may have a separate owner, DNS path or hosting history. It is
out of scope for this launch gate unless the operator explicitly adds it to
`BRAND_DOMAIN_ORIGINS` for a future migration.

## Residual Risk

Keep `npm run domain:verify:strict` in the release checklist so regressions in
health, opening video exposure, redirect security or legacy host signatures are
caught before public announcements. If the authoritative DNS provider is changed
again, preserve MX/TXT/SPF/DKIM/DMARC records and re-run the verifier before
editing the evidence status.

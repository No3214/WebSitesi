# Evidence: Canonical Domain

status: pending
date: 2026-06-22
owner: launch-qa

## Summary

Canonical `.com` validation is now live for the current Vercel application:
`https://kozbeylikonagi.com` redirects over HTTPS to
`https://www.kozbeylikonagi.com`, and both canonical origins return
`/api/health` JSON with `service: "kozbeyli-konagi"` at the deployment commit
reported by `npm run domain:verify:json`. Both homepages expose the approved
opening hero video, `/videos/hero.mp4`, and no legacy host signatures are
detected on the `.com` origins.

Full public-domain validation is not ready yet because the active Turkish ccTLD
brand surfaces, `https://kozbeylikonagi.com.tr` and
`https://www.kozbeylikonagi.com.tr`, still return HTML for `/api/health` and do
not expose `/videos/hero.mp4`. Those domains must serve the current Vercel app
or securely redirect to the chosen canonical `.com` origin before the public
domain gate can be marked ready.

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

As of 2026-06-22, `npm run domain:verify:json` reports this concrete state:

- `https://kozbeylikonagi.com` returns a secure 308 redirect to
  `https://www.kozbeylikonagi.com/`; no HTTPS-to-HTTP first hop remains.
- `https://kozbeylikonagi.com/api/health` and
  `https://www.kozbeylikonagi.com/api/health` return
  `service: "kozbeyli-konagi"` and the current production deployment commit.
- Both `.com` homepages expose `/videos/hero.mp4`, so the approved opening
  video shell is present on the canonical public domain.
- The `.com.tr` brand origins currently return HTML for `/api/health` instead
  of the expected `service: "kozbeyli-konagi"` JSON, and their homepages do not
  expose the approved `/videos/hero.mp4` opening shell.
- Earlier pre-cutover measurements detected `legacy Joomla/Seagull template`
  and `legacy HotelRunner hosted landing surface` on the `.com` origins. That
  historical risk is retained here because the verifier must keep detecting
  stale host regressions, but the current `.com` measurement is now clean.
- DNS NS/MX can be verified through DNS-over-HTTPS. When the `.com` nameservers
  resolve to Vercel DNS and the HTTPS origin is verified, the verifier accepts
  Vercel-managed A/CNAME flattening instead of requiring one fixed public IP
  shape. The `.com.tr` web surface remains the real domain blocker.
- The verifier checks the `.com.tr` brand origins as separate public surfaces,
  requiring the same `/api/health`, current commit, secure redirect and opening
  hero video proof before full public-domain launch is considered ready.
- The verifier now separates registrar ownership from live DNS authority. A
  domain may be registered at Isimtescil while public resolvers still return
  stale or external DNS delegation; in that state, the operator must verify the
  active Isimtescil nameservers and Vercel Domains state before making changes.
- The verifier reports `.com` and `.com.tr` DNS zones separately because the
  canonical and Turkish ccTLD domains may have different delegation or redirect
  states. Verify each domain independently during cutover.
- The current Vercel cutover target records are reported in the verifier output.
  Vercel DNS uses `A 76.76.21.21` for apex hosts and CNAME records for `www` /
  subdomains. Re-run `vercel domains inspect` or check Project Settings before
  DNS edits because Vercel can return project-specific CNAME values. The Turkish
  ccTLD brand origins must also serve the current app or securely redirect to
  the chosen canonical app. Existing MX/TXT/SPF/DKIM/DMARC records must be
  preserved when changing the authoritative DNS provider.
- If public recursive DNS still shows an external DNS/CDN layer, treat that as
  resolver or delegation evidence only. The operator should rely on the
  registrar/Vercel domain state plus `/api/health` returning
  `service: "kozbeyli-konagi"` at the current commit and the homepage exposing
  `/videos/hero.mp4`.
- Current Vercel proof on 2026-06-22: project `kozbeyli-konagi`
  (`prj_lM3tFqaJ5DIv9JaYTUobdTBQlXC8`) is linked to
  `kozbeylikonagi.com` and `www.kozbeylikonagi.com`, and the Vercel preview
  plus both `.com` origins serve `service: "kozbeyli-konagi"` with deployment
  commit reported by `npm run domain:verify:json`.
- Current public DNS authority on 2026-06-22: recursive DNS can still report
  external/stale nameserver delegation after the Isimtescil change, so
  resolver disagreement is treated as propagation evidence, not as an instruction
  to use an unrelated DNS account. The `.com.tr` brand zone must be changed or
  securely redirected through the authoritative provider that controls that
  ccTLD.
- Vercel Project Settings currently presents the manual setup as
  `CNAME @ dacb3ec12ca81d22.vercel-dns-017.com`, while
  `vercel domains inspect` also reports the older compatible apex fallback
  `A kozbeylikonagi.com 76.76.21.21`. Use the value shown in Project Settings
  at action time and verify with `/api/health`; do not mark the gate ready
  from DNS shape alone.
- Vercel DNS has been preloaded with the observed mail-continuity records for
  a possible nameserver move: `MX mx.kozbeylikonagi.com`, `A mx`,
  `A mail`, `A webmail`, `A autodiscover` to `78.142.208.142`, the SPF TXT
  record, `_dmarc` TXT, and `default._domainkey` DKIM TXT. Re-check these
  before changing nameservers because mail records are external operational
  state.
- Isimtescil cutover action on 2026-06-22: in `Host Name (DNS) Yönetimi`, the
  domain was updated to `NS1.VERCEL-DNS.COM,NS2.VERCEL-DNS.COM`. The panel reported:
  `Girmiş olduğunuz kayıtlar veritabanımıza kaydedildi. Dns kayıtlarınız
  kaydedici firmada güncellendi.`
- Isimtescil also created a reusable custom DNS set:
  `1328792, ns1.vercel-dns.com, ns2.vercel-dns.com`.
- Direct checks against `ns1.vercel-dns.com` after the Isimtescil update showed
  Vercel DNS is ready for the nameserver delegation: `NS ns1/ns2.vercel-dns.com`,
  `MX mx.kozbeylikonagi.com`, `A mx.kozbeylikonagi.com 78.142.208.142`,
  the SPF TXT record, and `A www.kozbeylikonagi.com` Vercel web targets.
- Public recursive DNS can still return stale external delegation after the
  panel change, while the `.com` web origins already pass `/api/health`, secure
  redirect-chain and `/videos/hero.mp4` checks. Keep status `pending` until
  the `.com.tr` brand origins also pass or securely redirect, and until public
  DNS propagation is no longer ambiguous.
- `npm run domain:verify` now marks live DNS rows with `managedDnsNote` when
  Vercel DNS is authoritative and the corresponding HTTPS origin is already
  serving the current deployment. External resolver mismatches remain warnings
  only when the origin or DNS authority is not proven.

## Residual Risk

Vercel/registrar domain configuration for `.com.tr` must be corrected outside
the code repository. The `.com` first redirect hop must remain HTTPS, all public
brand origins must serve the current Vercel app or securely redirect to it, and
`npm run domain:verify:strict` should pass before the evidence status is changed
to `ready`.

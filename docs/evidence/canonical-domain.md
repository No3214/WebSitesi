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
- DNS NS/MX can be verified through DNS-over-HTTPS. Current public A/CNAME
  warnings for the `.com` origins show Cloudflare anycast/proxy-shaped records,
  but the live `/api/health` and hero-video proof confirms the `.com` web
  surface is serving the current Vercel app. The `.com.tr` web surface remains
  the real domain blocker.
- The verifier checks the `.com.tr` brand origins as separate public surfaces,
  requiring the same `/api/health`, current commit, secure redirect and opening
  hero video proof before full public-domain launch is considered ready.
- The verifier now separates registrar ownership from live DNS authority. A
  domain may be registered at Isimtescil while live DNS is delegated to
  Cloudflare nameservers; in that state, Isimtescil DNS-zone edits do not affect
  public traffic until nameservers are moved.
- The verifier reports `.com` and `.com.tr` DNS zones separately because the
  canonical and Turkish ccTLD domains may be delegated to different Cloudflare
  nameserver pairs. Edit each authoritative zone separately during cutover.
- The current Vercel cutover target records are reported in the verifier output.
  Vercel DNS uses `A 76.76.21.21` for apex hosts and CNAME records for `www` /
  subdomains. Re-run `vercel domains inspect` or check Project Settings before
  DNS edits because Vercel can return project-specific CNAME values. The Turkish
  ccTLD brand origins must also serve the current app or securely redirect to
  the chosen canonical app. Existing MX/TXT/SPF/DKIM/DMARC records must be
  preserved when changing the authoritative DNS provider.
- If Cloudflare proxy is enabled, public A lookups can show Cloudflare anycast
  IPs instead of the Vercel target. The operator should use DNS-only mode for
  first cutover verification, or keep proxy enabled only after `/api/health`
  returns `service: "kozbeyli-konagi"` at the current commit and the homepage
  exposes `/videos/hero.mp4`.
- Current Vercel proof on 2026-06-22: project `kozbeyli-konagi`
  (`prj_lM3tFqaJ5DIv9JaYTUobdTBQlXC8`) is linked to
  `kozbeylikonagi.com` and `www.kozbeylikonagi.com`, and the Vercel preview
  plus both `.com` origins serve `service: "kozbeyli-konagi"` with deployment
  commit reported by `npm run domain:verify:json`.
- Current public DNS authority on 2026-06-22: recursive DNS still reports
  `.com` Cloudflare
  nameservers `anastasia.ns.cloudflare.com` and `theo.ns.cloudflare.com`, so
  the Isimtescil nameserver update may still be propagating. The `.com.tr`
  brand zone reports `lucy.ns.cloudflare.com` and `memphis.ns.cloudflare.com`
  and must be changed or redirected through the authoritative provider that
  controls that ccTLD.
- Vercel Project Settings currently presents the Cloudflare manual setup as
  `CNAME @ dacb3ec12ca81d22.vercel-dns-017.com` with proxy disabled, while
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
- The Cloudflare API account available to this agent currently lists no zones,
  so API-based DNS cutover cannot be completed from this session. The operator
  must use the Cloudflare account that owns the zone or complete the
  nameserver change in Isimtescil after confirming mail continuity.
- Isimtescil cutover action on 2026-06-22: in `Host Name (DNS) Yönetimi`, the
  domain was updated from `THEO.NS.CLOUDFLARE.COM,ANASTASIA.NS.CLOUDFLARE.COM`
  to `NS1.VERCEL-DNS.COM,NS2.VERCEL-DNS.COM`. The panel reported:
  `Girmiş olduğunuz kayıtlar veritabanımıza kaydedildi. Dns kayıtlarınız
  kaydedici firmada güncellendi.`
- Isimtescil also created a reusable custom DNS set:
  `1328792, ns1.vercel-dns.com, ns2.vercel-dns.com`.
- Direct checks against `ns1.vercel-dns.com` after the Isimtescil update showed
  Vercel DNS is ready for the nameserver delegation: `NS ns1/ns2.vercel-dns.com`,
  `MX mx.kozbeylikonagi.com`, `A mx.kozbeylikonagi.com 78.142.208.142`,
  the SPF TXT record, and `A www.kozbeylikonagi.com` Vercel web targets.
- Public recursive DNS still returns Cloudflare delegation after the panel
  change, while the `.com` web origins already pass `/api/health`, secure
  redirect-chain and `/videos/hero.mp4` checks. Keep status `pending` until
  the `.com.tr` brand origins also pass or securely redirect, and until public
  DNS propagation is no longer ambiguous.

## Residual Risk

DNS/Cloudflare/Vercel domain configuration for `.com.tr` must be corrected
outside the code repository. The `.com` first redirect hop must remain HTTPS,
all public brand origins must serve the current Vercel app or securely redirect
to it, and `npm run domain:verify:strict` should pass before the evidence status
is changed to `ready`.

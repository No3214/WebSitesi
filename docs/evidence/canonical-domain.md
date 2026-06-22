# Evidence: Canonical Domain

status: pending
date: 2026-06-22
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

As of 2026-06-22, `npm run domain:verify:json` reports these concrete blockers:

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
  at `https://kozbeyli-konagi.vercel.app` serves `service:
  "kozbeyli-konagi"` with the deployment commit reported by
  `npm run domain:verify:json`.
- Current DNS authority on 2026-06-22: `.com` still uses Cloudflare
  nameservers `anastasia.ns.cloudflare.com` and `theo.ns.cloudflare.com`, so
  Isimtescil DNS-zone edits alone will not change public traffic while that
  delegation remains. Either edit the actual Cloudflare zone or move the
  nameservers after preserving mail records.
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
- Public recursive DNS and `vercel domains inspect` still returned the old
  Cloudflare delegation immediately after the panel change. Keep status
  `pending` until public NS delegation, `/api/health`, secure redirect chain
  and `/videos/hero.mp4` all pass from public DNS.

## Residual Risk

DNS/Cloudflare/Vercel domain configuration must be corrected outside the code
repository. The first redirect hop must remain HTTPS, both canonical origins
must serve the current Vercel app, and `npm run domain:verify:strict` should
pass before the evidence status is changed to `ready`.

# Instagram Integration Readiness

Date: 2026-06-24

Current state:

- Public footer and floating contact actions link to the official Instagram profile.
- The site does not currently render a live Instagram feed, live Reels grid, or official oEmbed card list.
- Instagram screenshots or PDF captures must not be presented as live social content or real video.

## Required Before Live Instagram Content

One of these must be provided and verified:

1. Official Instagram Graph API / Basic Display integration with approved account access and a server-side token storage plan.
2. A curated list of approved public Instagram post or Reel URLs for official embeds.

## Guardrails

- Do not hardcode private access tokens in source code or public env vars.
- Do not scrape Instagram HTML as a production dependency.
- Do not use screenshots as if they were playable Reels.
- Do not add generated food, room, wedding or guest media as a substitute for actual Kozbeyli content.

## Current Recommendation

Keep the profile links live, but defer the embedded feed until official access or approved post URLs are available. This preserves brand trust and avoids a brittle, policy-sensitive integration.

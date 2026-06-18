---
status: pending
owner: operations
last_checked: 2026-06-18
---

# Production Abuse Controls Evidence

Required before full commercial launch:

- `NEXT_PUBLIC_TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY` are real
  production Cloudflare Turnstile keys, validated on the live lead form.
- `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are configured for
  the production deployment, so rate-limit and replay checks are shared across
  serverless instances instead of falling back to local memory.
- Evidence should include one successful human lead submission, one blocked
  missing/invalid Turnstile token request, and confirmation that
  `rateLimitBackend()` reports `upstash` in production.

Current status: pending. The code supports these controls, but live production
environment values and validation proof have not been supplied yet.

## Residual Risk

Do not mark this file ready with local in-memory rate-limit behavior or test
Turnstile keys. The gate requires production Turnstile keys, shared Upstash
state, and live request evidence from the deployed site.

# Codex Council Protocol

Last updated: 2026-06-13

This repo uses a lightweight council model for production-impacting work. The
goal is not to outsource decisions to random tools; it is to force independent
review perspectives before changes that affect trust, revenue, privacy, or
publish readiness.

## When To Run Council

Run council review for:

- Architecture, CMS schema, auth, booking, payment, webhook, analytics, privacy,
  SEO, media provenance, or large refactor changes.
- Any change that can affect reservation flow, lead capture, legal compliance,
  or public brand trust.
- Any user request that asks for "production ready", "god tier", "100%", ECC,
  swarm, multi-agent review, or publish approval.

## Roles

- Architect: system design, dependency boundaries, maintainability, rollback.
- Security / Privacy: auth, CSRF, rate limits, PII, payment, consent, secrets.
- Product / Hospitality: premium guest expectation, conversion, content truth.
- Ops / Performance: build, monitoring, deployment, recovery, cost.
- Red Team: hidden assumptions, failure modes, hallucinated content or media.
- Implementer: smallest complete change, tests, and release notes.

## Output Format

Every council decision should produce:

- Consensus
- Disagreements
- Hidden risks
- Recommended decision
- Implementation plan
- Verification plan
- Rollback plan
- Open questions

## Proxima Evaluation

`Zen4-bit/Proxima` was reviewed at commit
`0aa6914b878f38ceb7d278403496db49505a6fcf`.

Useful ideas:

- Multi-provider fan-out and comparison.
- CLI-style `debate`, `security_audit`, `verify`, and `write_tests` workflows.
- Localhost gateway concept for controlled personal experimentation.

Decision:

- Do not add Proxima as a production dependency for this hotel website.
- Do not install it into this repo's `package.json`.
- Do not run it continuously for project work without explicit approval.

Reasons:

- License is personal, non-commercial only.
- It operates through browser sessions/cookies and an Electron app, which is not
  appropriate for private hotel, guest, payment, or unpublished business data.
- It is a separate local AI gateway, not a Next.js/Payload website runtime need.

Allowed use:

- Optional personal research outside this repo, using non-sensitive prompts.
- Inspiration for council command naming and multi-perspective review structure.

Disallowed use:

- Passing guest data, secrets, booking payloads, business documents, or
  unpublished hotel media into Proxima.
- Shipping Proxima code, SDKs, or MCP configuration as part of the website.

## Practical Workflow

1. Use Codex native subagents or separate read-only review passes first.
2. Patch the smallest complete implementation slice.
3. Run lint, typecheck, unit tests, build, Playwright publish tests, monkey tests,
   and dependency audit as appropriate.
4. Record media provenance and production blockers in docs.
5. Commit and push only after the tested tree is clean enough to publish.

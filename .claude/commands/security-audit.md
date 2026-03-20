# Security Audit Command

Run a comprehensive security audit on the Kozbeyli Konağı codebase.

## Steps to perform:

### Step 1: Secret Scan
Search the entire codebase for hardcoded API keys, tokens, passwords, and secrets.
Patterns to check:
- AWS keys (AKIA...)
- Stripe/OpenAI keys (sk-...)
- Anthropic keys (sk-ant-...)
- GitHub tokens (ghp_/gho_)
- Slack tokens (xoxb-/xoxp-)
- Hardcoded password/secret assignments
- Any string that looks like a base64-encoded key > 20 chars in source files

### Step 2: CSP Header Review
Read `next.config.ts` and verify:
- All CSP directives are present and correctly configured
- No overly permissive sources (e.g., `*`, `unsafe-eval`)
- All allowed domains are legitimate and necessary
- `frame-ancestors` restricts embedding

### Step 3: Environment Variable Audit
Check all `.env.example` or `.env.local.example` files:
- Ensure no real values are present (only placeholders)
- Verify all required env vars are documented
- Check that sensitive vars are not logged anywhere in code

### Step 4: Dependency Vulnerability Check
Run `npm audit` and report:
- Critical vulnerabilities
- High vulnerabilities
- Recommended fixes

### Step 5: TypeScript Strict Mode Verification
Verify:
- `strict: true` in tsconfig.json
- No `any` types in production code
- No `@ts-ignore` without justification
- `ignoreBuildErrors: false` in next.config.ts
- `ignoreDuringBuilds: false` in next.config.ts

### Step 6: API Route Security Review
For each file in `src/app/api/`:
- Check for input validation (Zod schemas preferred)
- Verify authentication checks where needed
- Ensure no raw SQL/NoSQL queries
- Check error handling (no stack traces leaked)
- Verify Turnstile/CSRF protection on mutation endpoints

### Step 7: Authentication & Authorization Review
Check Payload CMS configuration:
- Admin access controls
- Collection-level access controls
- Field-level access controls where sensitive
- Rate limiting on login endpoints

## Output Format
Present findings as:
- 🔴 CRITICAL — Must fix immediately (secrets exposed, auth bypass)
- 🟠 HIGH — Should fix soon (missing validation, weak CSP)
- 🟡 MEDIUM — Recommended improvement (missing types, no rate limit)
- 🟢 INFO — Good practice already in place

End with a summary score: X/10 security rating with specific action items.

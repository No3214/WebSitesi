# Security & Quality Guard for Kozbeyli Konağı

## Purpose
This skill enforces security best practices and code quality standards on EVERY task.
It prevents common vulnerabilities that arise from rapid AI-assisted development ("vibe coding").

## MANDATORY RULES — Apply to ALL tasks

### 1. SECRET PROTECTION
- **NEVER** hardcode API keys, passwords, tokens, or secrets in source code
- **NEVER** commit `.env`, `.env.local`, `.env.*.local` files
- All secrets MUST go through `process.env.VARIABLE_NAME`
- If you see a hardcoded secret, IMMEDIATELY replace it with an env variable and warn the user
- Known project secrets to protect: `AI_API_KEY`, `PAYLOAD_SECRET`, `DATABASE_URI`, `TURNSTILE_SECRET_KEY`, `POSTHOG_API_KEY`

### 2. INPUT VALIDATION & SANITIZATION
- **ALL** user input from forms, URL params, and API requests MUST be validated
- Use Zod schemas for all API route input validation
- Never trust client-side validation alone — always validate server-side
- Sanitize any user input before rendering or database insertion
- For Payload CMS collections: use `validate` functions on fields that accept user input

### 3. XSS PREVENTION
- **NEVER** use `dangerouslySetInnerHTML` with user-provided data
- If `dangerouslySetInnerHTML` is absolutely necessary (e.g., CMS rich text), sanitize with DOMPurify first
- All dynamic content rendered in JSX is auto-escaped by React — do NOT bypass this
- CSP headers in `next.config.ts` are critical — do NOT weaken them without explicit approval
- Never add `'unsafe-eval'` to CSP script-src

### 4. AUTHENTICATION & AUTHORIZATION
- Payload admin panel (`/admin`) access must require authentication
- API routes that modify data must verify authentication
- Never expose internal IDs or sensitive data in client-side responses
- Use `depth: 0` in Payload queries when full relation data isn't needed (prevents data leakage)

### 5. SQL/NoSQL INJECTION PREVENTION
- Always use Payload CMS query API (parameterized) — never raw database queries
- If raw queries are ever needed, use parameterized queries exclusively
- Never concatenate user input into query strings

### 6. TypeScript STRICT MODE
- **NEVER** use `any` type — use `unknown` and narrow with type guards
- **NEVER** use `@ts-ignore` or `@ts-expect-error` without a detailed comment explaining why
- `typescript.ignoreBuildErrors` in next.config.ts MUST remain `false`
- `eslint.ignoreDuringBuilds` MUST remain `false`
- All new functions must have explicit return types

### 7. DEPENDENCY SAFETY
- Never install packages without checking:
  - Is it actively maintained? (last publish < 6 months)
  - Does it have known vulnerabilities? (check npm audit)
  - Is it from a trusted publisher?
- After installing any package, run `npm audit` and report findings
- Never use `--force` or `--legacy-peer-deps` without explaining why

### 8. API ROUTE SECURITY
- All public API routes must implement rate limiting
- Turnstile verification must happen server-side (not just client-side)
- API responses must not leak stack traces or internal paths in production
- Use appropriate HTTP methods (GET for reads, POST for mutations)

### 9. FILE UPLOAD SECURITY
- Validate file types server-side (never trust client `Content-Type`)
- Enforce maximum file size limits
- Store uploads outside the web root or use signed URLs
- Scan filenames for path traversal (`../`)

### 10. SECURITY HEADERS — DO NOT WEAKEN
The following headers in `next.config.ts` are critical:
```
X-Frame-Options: SAMEORIGIN
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
Content-Security-Policy: [current policy]
```
- **NEVER** remove or weaken these headers
- Adding new CSP domains requires explicit user approval
- Document WHY a new CSP source is needed

### 11. ERROR HANDLING
- Never expose stack traces or internal error details to clients in production
- Log errors server-side with context but sanitize sensitive data from logs
- Use custom error pages (404, 500) that don't reveal system information
- Catch and handle all async errors — no unhandled promise rejections

### 12. ENVIRONMENT-SPECIFIC RULES
- `NODE_ENV` must be `production` in deployed environments
- Debug/development tools must be disabled in production builds
- Source maps should NOT be publicly accessible in production

## BEFORE EVERY COMMIT — Checklist
1. ✅ No hardcoded secrets in code
2. ✅ No `.env` files staged
3. ✅ All user inputs validated server-side
4. ✅ No `any` types introduced
5. ✅ No `dangerouslySetInnerHTML` with unsanitized data
6. ✅ CSP headers unchanged (or change approved)
7. ✅ TypeScript compiles without errors
8. ✅ ESLint passes without errors
9. ✅ No new npm packages without audit check

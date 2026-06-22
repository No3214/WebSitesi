## 2024-06-22 - Prevent XSS in JSON-LD Injection
**Vulnerability:** XSS vulnerability when embedding JSON-LD within `<script type="application/ld+json">` tags using raw `JSON.stringify` inside `dangerouslySetInnerHTML`. An attacker could exploit this by embedding `</script><script>alert(1)</script>` in user-controlled schema properties.
**Learning:** Next.js applications frequently use `dangerouslySetInnerHTML` for JSON-LD. Raw `JSON.stringify` does not escape HTML characters, making it unsafe for script injection.
**Prevention:** Always use the `sanitizeJsonLd` utility from `@/lib/security` which replaces `<, >, &` with their Unicode equivalents (`\u003c`, `\u003e`, `\u0026`) instead of `JSON.stringify` when embedding JSON-LD schema objects.

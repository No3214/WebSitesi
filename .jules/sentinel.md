## 2024-06-22 - Prevent JSON-LD XSS via dangerouslySetInnerHTML
**Vulnerability:** XSS vulnerability in `<script type="application/ld+json">` tags rendering JSON-LD using `JSON.stringify` inside `dangerouslySetInnerHTML`.
**Learning:** `JSON.stringify` does not escape characters like `<`, `>`, `&`, or `'`. An attacker can inject a payload like `</script><script>alert(1)</script>` into data fields that end up in the schema, which breaks out of the original script block and executes arbitrary JavaScript in the context of the page.
**Prevention:** Always use `sanitizeJsonLd` (defined in `@/lib/security.ts`) to escape these characters when injecting JSON-LD into the DOM, instead of plain `JSON.stringify`.

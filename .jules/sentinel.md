## 2024-06-26 - Prevent XSS in JSON-LD injection
**Vulnerability:** XSS vulnerability through unsafe JSON-LD injection.
**Learning:** `JSON.stringify` does not escape characters like `<`, `>`, `&`, or `'` which makes injecting JSON directly into a script tag using `dangerouslySetInnerHTML` vulnerable to XSS.
**Prevention:** Always use a utility function like `sanitizeJsonLd` to escape dangerous characters when injecting JSON-LD.

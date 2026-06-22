## 2026-06-21 - JSON-LD XSS Vulnerability
**Vulnerability:** XSS vulnerability in dangerouslySetInnerHTML when injecting JSON-LD
**Learning:** React dangerouslySetInnerHTML needs string sanitization when parsing JSON, otherwise `</script><script>alert()</script>` logic could be injected in a user controlled field (like the slug). `JSON.stringify` does not sanitize against XSS.
**Prevention:** Always use `sanitizeJsonLd` to stringify JSON-LD data.

## 2025-05-18 - XSS in JSON-LD
**Vulnerability:** JSON-LD data was injected directly via JSON.stringify into dangerouslySetInnerHTML, leading to potential Cross-Site Scripting (XSS).
**Learning:** React dangerouslySetInnerHTML is exactly what it sounds like. We must sanitize JSON strings to prevent `<script>` injection.
**Prevention:** Always use a custom sanitizeJsonLd function that replaces "<" with "\\u003c" to safely inject JSON into script tags.

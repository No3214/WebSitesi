## 2024-06-20 - [CRITICAL/HIGH] Fix XSS vulnerability in JSON-LD injection
**Vulnerability:** XSS (Cross-Site Scripting) potential from unsanitized `JSON.stringify` used in `dangerouslySetInnerHTML` for `<script type="application/ld+json">`.
**Learning:** React/Next.js components used raw `JSON.stringify()` for structured data, which allows an attacker to break out of the `<script>` tag using characters like `<`, `>`, and `&` if user input is reflected in the JSON structure.
**Prevention:** Always use the dedicated `sanitizeJsonLd` utility function (which escapes `<` to `\u003c`, `>` to `\u003e`, and `&` to `\u0026`) when injecting JSON-LD data into `<script>` tags via `dangerouslySetInnerHTML`.

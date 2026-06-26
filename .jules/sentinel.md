## 2026-06-25 - Prevent XSS in JSON-LD Scripts
**Vulnerability:** XSS vulnerability through `dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}` injection of JSON-LD scripts in multiple pages and layouts.
**Learning:** JSON-LD data inside `<script type="application/ld+json">` is susceptible to XSS if the data stringifies any unescaped user or external input with HTML tags. Direct `.replace()` calls on potentially undefined data may result in runtime errors.
**Prevention:** Use a dedicated utility `sanitizeJsonLd` to first handle `undefined` checks (e.g. `JSON.stringify(data) || '{}'`) and explicitly replace `<` with `\u003c` in serialized JSON strings to neutralize injected script tags prior to rendering.

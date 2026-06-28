## 2026-06-28 - JSON-LD serialization vulnerability prevention
**Vulnerability:** DoS risk (unhandled TypeError) when attempting to replace characters on an `undefined` value during JSON-LD serialization.
**Learning:** `JSON.stringify` can return `undefined`, causing chained methods like `.replace` to throw. Pure modules like `src/lib/json-ld.ts` must maintain isolation and cannot be arbitrarily merged into utility modules (e.g., `src/lib/security.ts`) as architectural tests actively enforce their boundary.
**Prevention:** Implement safe fallbacks (e.g. `(JSON.stringify(data) || '{}')`) at the root of pure serialization functions without compromising module isolation boundaries.

# External Agent Tooling Audit

Date: 2026-06-24

Scope: user-requested repositories cloned read-only under `.codex-artifacts/external-repo-audit/` and evaluated for Kozbeyli Konagi Web-main use.

## Summary

| Repository | Audited SHA | License | Decision | Applied to this repo |
| --- | --- | --- | --- | --- |
| `zhaoxuya520/reverse-skill` | `fe2e2def5ec21dbda9d84f69c1ef8b20d53fc269` | MIT | Do not install as a live skill for this hotel site. Use only the defensive supply-chain checklist ideas. | Existing `npm run security:audit` and supply-chain review discipline retained; no reverse/pentest automation installed. |
| `calesthio/OpenMontage` | `a5b5b12142a42145528b508685408e7edea7167b` | AGPL-3.0 | Do not vendor code or install dependencies into the site. Use media-review principles only. | `DESIGN.md` now requires real probe/review before production media claims. |
| `google-labs-code/design.md` | `2a19f5dd97ab887971b417ebdf1e7e8fda0c7f79` | Apache-2.0 | Safe to use as a design-system documentation format without adding runtime dependency. | Added repo-local `DESIGN.md` with Kozbeyli brand tokens and public-content guardrails. |
| `kunchenguid/no-mistakes` | `0e075737b0d55c3e8479b07991a7fd221c1264d1` | MIT | Do not install the git proxy gate in this working tree without a separate operator decision. Use the review-gate concept only. | Current native gates remain: lint, typecheck, unit, Playwright, build, readiness scripts. |

## Security Notes

- `reverse-skill` includes offensive reverse-engineering, EDR-bypass, exploit and pentest routing content plus bootstrap scripts that can install tools, start services and delete/recreate tool directories. It is not appropriate as an always-on site-development skill.
- `OpenMontage` is an AGPL-3.0 project with Python, Remotion and provider-key workflows. Vendoring code into this commercial website would create license and dependency surface concerns. Its useful rule is process-level: user-supplied media must be technically reviewed before creative planning depends on it.
- `design.md` is documentation/tooling, not a runtime dependency. The Windows-safe CLI form is `npx -p @google/design.md designmd lint DESIGN.md`.
- `no-mistakes` places a local gate in front of git remotes and can drive PR/push automation. That may be useful later, but it changes release operations and should not be silently installed while production domain work is active.

## Operational Decision

No external repository was executed as an installer. No new API key, token, MCP server, git proxy, daemon, media provider, or reverse-engineering tool was configured.

The safe outcome is to keep Kozbeyli production work inside existing repository gates and add only the durable, low-risk artifact from the audit: `DESIGN.md`.
